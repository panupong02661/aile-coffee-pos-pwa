
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCode: (giftData: any) => void;
}

interface CustomerGiftWithMenuItem {
  id: string;
  customer_id: string;
  gift_type: string;
  gift_id: string;
  gift_name: string;
  gift_description?: string;
  gift_value: number;
  expires_at?: string;
  is_used: boolean;
  used_at?: string;
  gift_code?: string;
  message?: string;
  created_at: string;
  updated_at: string;
  sent_by?: string;
  menu_items?: {
    id: string;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    category_id?: string;
    is_available: boolean;
  };
}

const CodeModal = ({ isOpen, onClose, onApplyCode }: CodeModalProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleApplyCode = async () => {
    if (!code.trim()) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกโค้ด', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const upperCode = code.toUpperCase().trim();
      console.log('กำลังตรวจสอบโค้ด:', upperCode);
      
      let foundGift = null;

      // ตรวจสอบในตาราง limited_promotions ก่อน
      console.log('ตรวจสอบใน limited_promotions...');
      const { data: promotions, error: promoError } = await supabase
        .from('limited_promotions')
        .select('*')
        .eq('promo_code', upperCode)
        .eq('is_active', true);

      console.log('ผลการค้นหาในโปรโมชั่นพิเศษ:', { promotions, error: promoError });

      if (promotions && promotions.length > 0) {
        const promotion = promotions[0];
        
        // ตรวจสอบว่าโปรโมชั่นยังใช้ได้อยู่หรือไม่
        const currentDate = new Date();
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);
        
        if (currentDate < startDate || currentDate > endDate) {
          console.log('โปรโมชั่นหมดอายุ:', { start: promotion.start_date, end: promotion.end_date, current: currentDate.toISOString() });
          toast({ 
            title: 'โปรโมชั่นหมดอายุ', 
            description: 'โปรโมชั่นนี้หมดอายุแล้วหรือยังไม่เริ่ม', 
            variant: 'destructive' 
          });
          return;
        }

        // ตรวจสอบว่าโปรโมชั่นเต็มแล้วหรือยัง
        if (promotion.current_claims >= promotion.max_claims) {
          toast({ 
            title: 'โปรโมชั่นเต็มแล้ว', 
            description: 'โปรโมชั่นนี้ถูกใช้ครบจำนวนแล้ว', 
            variant: 'destructive' 
          });
          return;
        }

        // สร้าง gift object จากโปรโมชั่น
        foundGift = {
          id: promotion.id,
          customer_id: '',
          gift_type: 'promotion',
          gift_id: promotion.id,
          gift_name: promotion.title,
          gift_description: promotion.description,
          gift_value: promotion.discount_value,
          expires_at: promotion.end_date,
          is_used: false,
          used_at: null,
          gift_code: promotion.promo_code,
          message: `โปรโมชั่นพิเศษ: ${promotion.description}`,
          created_at: promotion.created_at,
          updated_at: promotion.updated_at,
          sent_by: 'promotion_system',
          discount_type: promotion.discount_type
        } as CustomerGiftWithMenuItem;

        console.log('พบโปรโมชั่นพิเศษ:', foundGift);
      }

      // ถ้าไม่พบในโปรโมชั่นพิเศษ ให้ตรวจสอบใน customer_gifts
      if (!foundGift) {
        console.log('ตรวจสอบใน customer_gifts...');
        const { data: gifts, error: queryError } = await supabase
          .from('customer_gifts')
          .select(`
            *,
            menu_items (
              id,
              name,
              price,
              description,
              image_url,
              category_id,
              is_available
            )
          `)
          .eq('gift_code', upperCode)
          .order('created_at', { ascending: false });

        console.log('ผลการค้นหาโค้ดในของขวัญ:', { gifts, error: queryError });

        if (gifts && gifts.length > 0) {
          foundGift = gifts[0] as CustomerGiftWithMenuItem;
          
          // ตรวจสอบว่าใช้แล้วหรือยัง
          if (foundGift.used_at) {
            console.log('โค้ดถูกใช้งานแล้ว:', foundGift.used_at);
            toast({ 
              title: 'โค้ดถูกใช้แล้ว', 
              description: 'โค้ดนี้ถูกใช้งานและชำระเงินแล้ว ไม่สามารถใช้ซ้ำได้', 
              variant: 'destructive' 
            });
            return;
          }

          // ตรวจสอบหมดอายุ
          if (foundGift.expires_at) {
            const expiryDate = new Date(foundGift.expires_at);
            const currentDate = new Date();
            
            if (expiryDate < currentDate) {
              console.log('โค้ดหมดอายุแล้ว:', { expires_at: foundGift.expires_at, current: currentDate.toISOString() });
              toast({ 
                title: 'โค้ดหมดอายุ', 
                description: 'โค้ดนี้หมดอายุแล้ว', 
                variant: 'destructive' 
              });
              return;
            }
          }
        }
      }

      if (!foundGift) {
        console.log('ไม่พบโค้ดในระบบ');
        toast({ 
          title: 'ไม่พบโค้ด', 
          description: 'ไม่พบโค้ดนี้ในระบบ กรุณาตรวจสอบอีกครั้ง', 
          variant: 'destructive' 
        });
        return;
      }

      // Code is valid - apply it
      console.log('โค้ดพร้อมใช้งาน:', foundGift);
      onApplyCode(foundGift);

      // Show success message
      let successMessage = '';
      
      if (foundGift.gift_type === 'menu_item') {
        const menuItemName = foundGift.menu_items?.name || foundGift.gift_name;
        successMessage = `เพิ่มเมนู ${menuItemName} ลงในตะกร้าแล้ว (ฟรี)`;
      } else if (foundGift.gift_type === 'promotion') {
        const discountType = foundGift.discount_type === 'percentage' ? '%' : '฿';
        successMessage = `ใช้โค้ด ${foundGift.gift_name} แล้ว (ส่วนลด ${foundGift.gift_value}${discountType})`;
      } else {
        successMessage = `ใช้โค้ด ${foundGift.gift_name} แล้ว`;
      }

      toast({ 
        title: 'ใช้โค้ดสำเร็จ', 
        description: successMessage
      });

      setCode('');
      onClose();
    } catch (error) {
      console.error('ข้อผิดพลาดที่ไม่คาดคิด:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: `เกิดข้อผิดพลาดในการใช้โค้ด: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            ใส่โค้ดโปรโมชั่น
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">โค้ด 6 หลัก</Label>
            <Input
              id="code"
              placeholder="กรอกโค้ด เช่น SAVE30"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
              className="font-mono text-center text-lg"
            />
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>เงื่อนไขการใช้งานโค้ด:</strong></p>
            <p>• รองรับโค้ดจากโปรโมชั่นพิเศษและของรางวัลวันเกิด</p>
            <p>• โค้ดสามารถใช้ได้หลายครั้งก่อนชำระเงิน</p>
            <p>• เมื่อชำระเงินแล้ว โค้ดจะถูกใช้งานจริงและไม่สามารถใช้ซ้ำได้</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleApplyCode}
              disabled={isLoading || !code.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'กำลังตรวจสอบ...' : 'ใช้โค้ด'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodeModal;
