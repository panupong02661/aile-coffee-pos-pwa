
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import QRCodePromptPay from '@/components/QRCodePromptPay';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Settings, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const QRCodePromptPayPage = () => {
  const DEFAULT_PHONE = '0812345678'; // เบอร์ PromptPay เริ่มต้น
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedPhoneNumbers, setSavedPhoneNumbers] = useState<string[]>(() => {
    const saved = localStorage.getItem('promptpay-phone-numbers');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [selectedPhone, setSelectedPhone] = useState(DEFAULT_PHONE);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const { toast } = useToast();
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const savePhoneNumber = () => {
    const trimmed = newPhoneNumber.trim();
    if (trimmed && !savedPhoneNumbers.includes(trimmed)) {
      const updated = [...savedPhoneNumbers, trimmed];
      setSavedPhoneNumbers(updated);
      localStorage.setItem('promptpay-phone-numbers', JSON.stringify(updated));
      setNewPhoneNumber('');
      // บันทึกขึ้นฐานข้อมูลทันทีโดยไม่ต้องกด "เลือก"
      setActivePhone(trimmed);
    }
  };

  const setActivePhone = async (phone: string) => {
    try {
      setSelectedPhone(phone);
      const { data: existing, error } = await supabase
        .from('shop_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (existing?.id) {
        const { error: uerr } = await supabase
          .from('shop_settings')
          .update({ phone })
          .eq('id', existing.id);
        if (uerr) throw uerr;
      } else {
        const { error: ierr } = await supabase
          .from('shop_settings')
          .insert({ phone });
        if (ierr) throw ierr;
      }

      toast({ title: 'บันทึกหมายเลขสำเร็จ', description: `อัปเดตเบอร์ PromptPay เป็น ${phone}` });
    } catch (e) {
      console.error('Error saving PromptPay phone:', e);
      toast({ title: 'บันทึกไม่สำเร็จ', description: 'ไม่สามารถอัปเดตหมายเลข PromptPay', variant: 'destructive' });
    }
  };

  const removePhoneNumber = (phone: string) => {
    const updated = savedPhoneNumbers.filter(p => p !== phone);
    setSavedPhoneNumbers(updated);
    localStorage.setItem('promptpay-phone-numbers', JSON.stringify(updated));
    if (selectedPhone === phone) {
      setSelectedPhone('');
    }
  };

  // โหลดเบอร์จาก shop_settings ผ่าน Edge Function เมื่อเริ่มต้น (ปลอด RLS)
  useEffect(() => {
    const loadPhone = async () => {
      try {
        const res = await fetch('https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/get-promptpay-phone');
        if (!res.ok) throw new Error(`Edge function HTTP ${res.status}`);
        const json = await res.json();
        if (json?.phone) {
          console.log('📱 Loaded PromptPay phone (edge):', json.phone);
          // ใช้เบอร์จากฐานข้อมูลถ้าเป็นเบอร์มือถือ (08x หรือ 09x)
          const digits = json.phone.replace(/\D/g, '');
          if (digits.length === 10 && (digits.startsWith('08') || digits.startsWith('09'))) {
            setSelectedPhone(json.phone);
          } else {
            console.log('⚠️ Phone from DB is not mobile, using default:', DEFAULT_PHONE);
            setSelectedPhone(DEFAULT_PHONE);
          }
        } else {
          console.log('⚠️ No phone number returned, using default:', DEFAULT_PHONE);
          setSelectedPhone(DEFAULT_PHONE);
        }
      } catch (err) {
        console.error('Error loading PromptPay phone via edge:', err);
        console.log('Using default phone:', DEFAULT_PHONE);
        setSelectedPhone(DEFAULT_PHONE);
      }
    };
    loadPhone();
  }, []);
  return (
    <div className="h-screen bg-cream-50 flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="flex-shrink-0 bg-cream-50 p-4 pb-0">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            page="qr-promptpay"
          />
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <QrCode className="w-8 h-8 text-coffee-600" />
              <div>
                <h1 className="text-2xl font-bold text-coffee-800">QR Code PromptPay</h1>
                <p className="text-coffee-600">สร้าง QR Code สำหรับรับเงินผ่าน PromptPay</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Settings Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-coffee-800">
                    <Settings className="w-5 h-5" />
                    ตั้งค่าหมายเลขโทรศัพท์
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-phone">เพิ่มหมายเลขใหม่</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-phone"
                        type="tel"
                        placeholder="081-234-5678"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={savePhoneNumber}
                        disabled={!newPhoneNumber.trim()}
                        className="bg-coffee-600 hover:bg-coffee-700"
                      >
                        บันทึก
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>หมายเลขที่บันทึกไว้</Label>
                    {savedPhoneNumbers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">ยังไม่มีหมายเลขที่บันทึกไว้</p>
                    ) : (
                      <div className="space-y-2">
                        {savedPhoneNumbers.map((phone, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{phone}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActivePhone(phone)}
                                className="text-xs"
                              >
                                เลือก
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePhoneNumber(phone)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                ลบ
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">จำนวนเงินเริ่มต้น</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customAmount || ''}
                      onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-coffee-800">
                    <QrCode className="w-5 h-5" />
                    QR Code PromptPay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">หมายเลขโทรศัพท์:</span> {selectedPhone}
                    </p>
                    {selectedPhone === DEFAULT_PHONE && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ กำลังใช้เบอร์เริ่มต้น - กรุณาเพิ่มเบอร์ของคุณและกด "บันทึก" เพื่ออัปเดตในระบบ
                      </p>
                    )}
                  </div>
                  <QRCodePromptPay 
                    key={selectedPhone}
                    defaultPhoneNumber={selectedPhone}
                    amount={customAmount}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePromptPayPage;
