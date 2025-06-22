
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gift, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerGift {
  id: string;
  gift_type: string;
  gift_name: string;
  gift_description?: string;
  gift_value: number;
  expires_at?: string;
  is_used: boolean;
  used_at?: string;
  gift_code?: string;
}

const CustomerMobileApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gifts, setGifts] = useState<CustomerGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Mock customer ID - in real app this would come from authentication
  const customerId = 'mock-customer-id';

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_gifts')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_used', false) // Only show unused gifts
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gifts:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลของขวัญได้',
          variant: 'destructive'
        });
      } else {
        setGifts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateGiftCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleUseGift = async (gift: CustomerGift) => {
    try {
      const giftCode = generateGiftCode();
      
      const { error } = await supabase
        .from('customer_gifts')
        .update({ 
          gift_code: giftCode,
          used_at: new Date().toISOString()
        })
        .eq('id', gift.id);

      if (error) {
        console.error('Error updating gift:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถสร้างโค้ดได้',
          variant: 'destructive'
        });
        return;
      }

      // Update the local state to show the code
      setGifts(prev => prev.map(g => 
        g.id === gift.id 
          ? { ...g, gift_code: giftCode, used_at: new Date().toISOString() }
          : g
      ));

      toast({
        title: 'สำเร็จ',
        description: 'สร้างโค้ดเรียบร้อยแล้ว'
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการสร้างโค้ด',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: 'คัดลอกแล้ว',
        description: 'คัดลอกโค้ดไปยังคลิปบอร์ดแล้ว'
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถคัดลอกโค้ดได้',
        variant: 'destructive'
      });
    }
  };

  const getGiftIcon = (giftType: string) => {
    return <Gift className="w-6 h-6 text-purple-600" />;
  };

  const getGiftColor = (giftType: string) => {
    switch (giftType) {
      case 'menu_item':
        return 'bg-green-100 border-green-200';
      case 'promotion':
        return 'bg-purple-100 border-purple-200';
      case 'reward':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">ของขวัญที่ได้รับ</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {gifts.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">ยังไม่มีของขวัญ</p>
            <p className="text-gray-400 text-sm mt-2">ของขวัญจะปรากฏที่นี่เมื่อคุณได้รับ</p>
          </div>
        ) : (
          gifts.map((gift) => (
            <Card key={gift.id} className={`${getGiftColor(gift.gift_type)} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  {getGiftIcon(gift.gift_type)}
                  <div>
                    <div className="font-semibold text-gray-800">{gift.gift_name}</div>
                    <div className="text-sm text-gray-600 font-normal">
                      {gift.gift_type === 'menu_item' && `กาแฟฟรี มูลค่า: ${gift.gift_value}฿`}
                      {gift.gift_type === 'promotion' && `ส่วนลด มูลค่า: ${gift.gift_value}฿`}
                      {gift.gift_type === 'reward' && `ของรางวัล มูลค่า: ${gift.gift_value}฿`}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                {gift.gift_description && (
                  <p className="text-gray-600 text-sm mb-4">{gift.gift_description}</p>
                )}
                
                {gift.expires_at && (
                  <p className="text-xs text-gray-500 mb-4">
                    หมดอายุ: {new Date(gift.expires_at).toLocaleDateString('th-TH')}
                  </p>
                )}

                {/* Show code if gift is used but not yet marked as used in database */}
                {gift.gift_code && gift.used_at ? (
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">โค้ด:</p>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-2 rounded-lg font-mono text-lg font-bold tracking-wider text-gray-800">
                          {gift.gift_code}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(gift.gift_code!)}
                          className="flex items-center gap-1"
                        >
                          {copiedCode === gift.gift_code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copiedCode === gift.gift_code ? 'คัดลอกแล้ว' : 'คัดลอก'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        ใช้งั่วงนิ: {new Date(gift.used_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleUseGift(gift)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    ใช้งาน
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerMobileApp;
