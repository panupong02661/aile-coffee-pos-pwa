
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
      
      // ค้นหาโค้ดในฐานข้อมูล
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

      console.log('ผลการค้นหาโค้ด:', { gifts, error: queryError });

      if (queryError) {
        console.error('ข้อผิดพลาดในการค้นหา:', queryError);
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: `เกิดข้อผิดพลาดในการตรวจสอบ: ${queryError.message}`, 
          variant: 'destructive' 
        });
        return;
      }

      if (!gifts || gifts.length === 0) {
        console.log('ไม่พบโค้ดในระบบ');
        toast({ 
          title: 'ไม่พบโค้ด', 
          description: 'ไม่พบโค้ดนี้ในระบบ กรุณาตรวจสอบอีกครั้ง', 
          variant: 'destructive' 
        });
        return;
      }

      // ใช้โค้ดตัวแรกที่พบ
      const gift = gifts[0] as CustomerGiftWithMenuItem;
      console.log('พบโค้ด:', { 
        id: gift.id, 
        gift_code: gift.gift_code, 
        is_used: gift.is_used, 
        used_at: gift.used_at, 
        expires_at: gift.expires_at 
      });

      // เงื่อนไขง่าย ๆ: ถ้ามี used_at แสดงว่าชำระเงินแล้ว ห้ามใช้
      if (gift.used_at) {
        console.log('โค้ดถูกใช้งานและชำระเงินแล้ว:', gift.used_at);
        toast({ 
          title: 'โค้ดถูกใช้แล้ว', 
          description: 'โค้ดนี้ถูกใช้งานและชำระเงินแล้ว ไม่สามารถใช้ซ้ำได้', 
          variant: 'destructive' 
        });
        return;
      }

      // ตรวจสอบวันหมดอายุ
      if (gift.expires_at) {
        const expiryDate = new Date(gift.expires_at);
        const currentDate = new Date();
        
        if (expiryDate < currentDate) {
          console.log('โค้ดหมดอายุแล้ว:', { expires_at: gift.expires_at, current: currentDate.toISOString() });
          toast({ 
            title: 'โค้ดหมดอายุ', 
            description: 'โค้ดนี้หมดอายุแล้ว', 
            variant: 'destructive' 
          });
          return;
        }
      }

      // โค้ดใช้งานได้ - นำไปใช้งาน
      console.log('โค้ดพร้อมใช้งาน:', gift);
      onApplyCode(gift);

      // แสดงข้อความสำเร็จ
      let successMessage = '';
      
      if (gift.gift_type === 'menu_item') {
        const menuItemName = gift.menu_items?.name || gift.gift_name;
        successMessage = `เพิ่มเมนู ${menuItemName} ลงในตะกร้าแล้ว (ฟรี)`;
      } else if (gift.gift_type === 'promotion') {
        successMessage = `ใช้โปรโมชั่น ${gift.gift_name} แล้ว (ส่วนลด ${gift.gift_value}฿)`;
      } else {
        successMessage = `ใช้โค้ด ${gift.gift_name} แล้ว`;
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
              placeholder="กรอกโค้ด เช่น ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono text-center text-lg"
            />
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>เงื่อนไขการใช้งานโค้ด:</strong></p>
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
