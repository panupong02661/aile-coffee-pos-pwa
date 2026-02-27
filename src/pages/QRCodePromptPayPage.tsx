import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRCodePromptPay from '@/components/QRCodePromptPay';
import QRCodeBankAccount from '@/components/QRCodeBankAccount';
import QRCodeNationalId from '@/components/QRCodeNationalId';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Settings, QrCode, Phone, Building2, IdCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { THAI_BANKS } from '@/utils/promptpay';

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
  const [activeTab, setActiveTab] = useState<'phone' | 'account' | 'nationalid'>('phone');
  
  // Bank account state
  const [savedAccounts, setSavedAccounts] = useState<Array<{account: string, bankCode: string}>>(() => {
    const saved = localStorage.getItem('promptpay-bank-accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newBankCode, setNewBankCode] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<{account: string, bankCode: string} | null>(null);
  
  // National ID state
  const [savedNationalIds, setSavedNationalIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('promptpay-national-ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNationalId, setNewNationalId] = useState('');
  const [selectedNationalId, setSelectedNationalId] = useState('');
  
  const { toast } = useToast();
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const savePhoneNumber = () => {
    const trimmed = newPhoneNumber.trim();
    if (trimmed) {
      // Keep only ONE number locally and in DB
      const updated = [trimmed];
      setSavedPhoneNumbers(updated);
      localStorage.setItem('promptpay-phone-numbers', JSON.stringify(updated));
      setNewPhoneNumber('');
      // Save to database immediately
      setActivePhone(trimmed);
    }
  };

  const setActivePhone = async (phone: string) => {
    try {
      setSelectedPhone(phone);
      
      // Call edge function to update phone
      const res = await fetch('https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/update-promptpay-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'อัปเดตเบอร์ไม่สำเร็จ');
      }

      console.log('✅ PromptPay phone updated:', json);
      toast({ 
        title: 'บันทึกหมายเลขสำเร็จ', 
        description: `อัปเดตเบอร์ PromptPay เป็น ${phone}` 
      });
    } catch (e) {
      console.error('Error saving PromptPay phone:', e);
      toast({ 
        title: 'บันทึกไม่สำเร็จ', 
        description: e.message || 'ไม่สามารถอัปเดตหมายเลข PromptPay', 
        variant: 'destructive' 
      });
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

  // Bank account functions
  const saveBankAccount = () => {
    const trimmedAccount = newAccountNumber.trim().replace(/\D/g, '');
    if (trimmedAccount && newBankCode) {
      const newEntry = { account: trimmedAccount, bankCode: newBankCode };
      const updated = [newEntry]; // Keep only one account
      setSavedAccounts(updated);
      localStorage.setItem('promptpay-bank-accounts', JSON.stringify(updated));
      setNewAccountNumber('');
      setNewBankCode('');
      setSelectedAccount(newEntry);
      toast({ 
        title: 'บันทึกเลขบัญชีสำเร็จ', 
        description: `บันทึกเลขบัญชี ${trimmedAccount}` 
      });
    }
  };

  const selectBankAccount = (entry: {account: string, bankCode: string}) => {
    setSelectedAccount(entry);
  };

  const removeBankAccount = (account: string) => {
    const updated = savedAccounts.filter(a => a.account !== account);
    setSavedAccounts(updated);
    localStorage.setItem('promptpay-bank-accounts', JSON.stringify(updated));
    if (selectedAccount?.account === account) {
      setSelectedAccount(null);
    }
  };

  // National ID functions
  const formatNationalIdInput = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 1) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
    if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
  };

  const saveNationalId = () => {
    const cleaned = newNationalId.replace(/\D/g, '');
    if (cleaned.length === 13) {
      const formatted = formatNationalIdInput(cleaned);
      const updated = [formatted];
      setSavedNationalIds(updated);
      localStorage.setItem('promptpay-national-ids', JSON.stringify(updated));
      setNewNationalId('');
      setSelectedNationalId(formatted);
      toast({ 
        title: 'บันทึกเลขบัตรประชาชนสำเร็จ', 
        description: `บันทึกเลขบัตรประชาชน ${formatted}` 
      });
    }
  };

  const removeNationalId = (id: string) => {
    const updated = savedNationalIds.filter(i => i !== id);
    setSavedNationalIds(updated);
    localStorage.setItem('promptpay-national-ids', JSON.stringify(updated));
    if (selectedNationalId === id) {
      setSelectedNationalId('');
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
            setSavedPhoneNumbers([json.phone]); // keep single saved number
            localStorage.setItem('promptpay-phone-numbers', JSON.stringify([json.phone]));
          } else {
            console.log('⚠️ Phone from DB is not mobile, using default:', DEFAULT_PHONE);
            setSelectedPhone(DEFAULT_PHONE);
            setSavedPhoneNumbers([DEFAULT_PHONE]);
            localStorage.setItem('promptpay-phone-numbers', JSON.stringify([DEFAULT_PHONE]));
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

    // Load saved bank account
    if (savedAccounts.length > 0) {
      setSelectedAccount(savedAccounts[0]);
    }

    // Load saved national ID
    if (savedNationalIds.length > 0) {
      setSelectedNationalId(savedNationalIds[0]);
    }
  }, []);
  return (
    <div className="h-screen bg-cream-50 flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
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

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'phone' | 'account' | 'nationalid')} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">เบอร์โทรศัพท์</span>
                  <span className="sm:hidden">เบอร์</span>
                </TabsTrigger>
                <TabsTrigger value="nationalid" className="flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  <span className="hidden sm:inline">บัตรประชาชน</span>
                  <span className="sm:hidden">บัตร ปชช.</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">เลขบัญชี</span>
                  <span className="sm:hidden">บัญชี</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phone">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Phone Settings Panel */}
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
                        <Label htmlFor="custom-amount-phone">จำนวนเงินเริ่มต้น</Label>
                        <Input
                          id="custom-amount-phone"
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

                  {/* QR Code Display - Phone */}
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
              </TabsContent>

              <TabsContent value="account">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Bank Account Settings Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-coffee-800">
                        <Building2 className="w-5 h-5" />
                        ตั้งค่าเลขบัญชีธนาคาร
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank-select">เลือกธนาคาร</Label>
                        <Select value={newBankCode} onValueChange={setNewBankCode}>
                          <SelectTrigger id="bank-select">
                            <SelectValue placeholder="เลือกธนาคาร" />
                          </SelectTrigger>
                          <SelectContent>
                            {THAI_BANKS.map((bank) => (
                              <SelectItem key={bank.code} value={bank.code}>
                                {bank.name} ({bank.shortName})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-account">เลขบัญชีธนาคาร</Label>
                        <div className="flex gap-2">
                          <Input
                            id="new-account"
                            type="text"
                            placeholder="xxx-x-xxxxx-x"
                            value={newAccountNumber}
                            onChange={(e) => setNewAccountNumber(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={saveBankAccount}
                            disabled={!newAccountNumber.trim() || !newBankCode}
                            className="bg-coffee-600 hover:bg-coffee-700"
                          >
                            บันทึก
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">เลขบัญชี 10-15 หลัก</p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label>บัญชีที่บันทึกไว้</Label>
                        {savedAccounts.length === 0 ? (
                          <p className="text-sm text-muted-foreground">ยังไม่มีบัญชีที่บันทึกไว้</p>
                        ) : (
                          <div className="space-y-2">
                            {savedAccounts.map((entry, index) => {
                              const bank = THAI_BANKS.find(b => b.code === entry.bankCode);
                              return (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="text-sm font-medium">{entry.account}</span>
                                    {bank && (
                                      <span className="text-xs text-gray-500 ml-2">({bank.shortName})</span>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => selectBankAccount(entry)}
                                      className={`text-xs ${selectedAccount?.account === entry.account ? 'bg-coffee-100' : ''}`}
                                    >
                                      เลือก
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeBankAccount(entry.account)}
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      ลบ
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="custom-amount-account">จำนวนเงินเริ่มต้น</Label>
                        <Input
                          id="custom-amount-account"
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

                  {/* QR Code Display - Bank Account */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-coffee-800">
                        <QrCode className="w-5 h-5" />
                        QR Code PromptPay (เลขบัญชี)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedAccount ? (
                        <>
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">เลขบัญชี:</span> {selectedAccount.account}
                            </p>
                            {(() => {
                              const bank = THAI_BANKS.find(b => b.code === selectedAccount.bankCode);
                              return bank && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">ธนาคาร:</span> {bank.name}
                                </p>
                              );
                            })()}
                          </div>
                          <QRCodeBankAccount 
                            key={`${selectedAccount.account}-${selectedAccount.bankCode}`}
                            defaultAccountNumber={selectedAccount.account}
                            defaultBankCode={selectedAccount.bankCode}
                            amount={customAmount}
                            compact
                          />
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>กรุณาเพิ่มเลขบัญชีธนาคารก่อน</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="nationalid">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* National ID Settings Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-coffee-800">
                        <IdCard className="w-5 h-5" />
                        ตั้งค่าเลขบัตรประชาชน
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-national-id">เลขบัตรประชาชน 13 หลัก</Label>
                        <div className="flex gap-2">
                          <Input
                            id="new-national-id"
                            type="text"
                            placeholder="x-xxxx-xxxxx-xx-x"
                            value={newNationalId}
                            onChange={(e) => setNewNationalId(formatNationalIdInput(e.target.value))}
                            className="flex-1 font-mono"
                            maxLength={17}
                          />
                          <Button 
                            onClick={saveNationalId}
                            disabled={newNationalId.replace(/\D/g, '').length !== 13}
                            className="bg-coffee-600 hover:bg-coffee-700"
                          >
                            บันทึก
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          เลขบัตรประชาชน 13 หลักที่ลงทะเบียน PromptPay
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label>เลขบัตรที่บันทึกไว้</Label>
                        {savedNationalIds.length === 0 ? (
                          <p className="text-sm text-muted-foreground">ยังไม่มีเลขบัตรที่บันทึกไว้</p>
                        ) : (
                          <div className="space-y-2">
                            {savedNationalIds.map((id, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm font-mono">{id}</span>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedNationalId(id)}
                                    className={`text-xs ${selectedNationalId === id ? 'bg-coffee-100' : ''}`}
                                  >
                                    เลือก
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeNationalId(id)}
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
                        <Label htmlFor="custom-amount-nationalid">จำนวนเงินเริ่มต้น</Label>
                        <Input
                          id="custom-amount-nationalid"
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

                  {/* QR Code Display - National ID */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-coffee-800">
                        <QrCode className="w-5 h-5" />
                        QR Code PromptPay (บัตรประชาชน)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedNationalId ? (
                        <>
                          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">เลขบัตรประชาชน:</span>{' '}
                              <span className="font-mono">{selectedNationalId}</span>
                            </p>
                          </div>
                          <QRCodeNationalId 
                            key={selectedNationalId}
                            defaultNationalId={selectedNationalId.replace(/\D/g, '')}
                            amount={customAmount}
                            compact
                          />
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <IdCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>กรุณาเพิ่มเลขบัตรประชาชนก่อน</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePromptPayPage;
