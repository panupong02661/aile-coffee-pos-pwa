
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
      console.log('Checking code:', upperCode);
      
      // First, check if the code exists at all
      const { data: allCodes, error: checkError } = await supabase
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
        .eq('gift_code', upperCode);

      console.log('All codes with this code:', allCodes);

      if (checkError) {
        console.error('Database error:', checkError);
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: `เกิดข้อผิดพลาดในการตรวจสอบ: ${checkError.message}`, 
          variant: 'destructive' 
        });
        return;
      }

      if (!allCodes || allCodes.length === 0) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่พบโค้ดนี้ในระบบ', variant: 'destructive' });
        return;
      }

      // Check if any of the codes are available (not used)
      const availableGift = allCodes.find(gift => !gift.is_used);
      
      if (!availableGift) {
        toast({ title: 'ข้อผิดพลาด', description: 'โค้ดนี้ถูกใช้งานแล้ว', variant: 'destructive' });
        return;
      }

      const gift = availableGift as CustomerGiftWithMenuItem;
      console.log('Found available gift:', gift);

      // Check if code is expired
      if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
        toast({ title: 'ข้อผิดพลาด', description: 'โค้ดนี้หมดอายุแล้ว', variant: 'destructive' });
        return;
      }

      // Apply the code but don't mark as used yet - this will be done when payment is completed
      onApplyCode(gift);

      let successMessage = '';
      if (gift.gift_type === 'menu_item') {
        const menuItemName = gift.menu_items?.name || gift.gift_name;
        successMessage = `เพิ่มเมนู ${menuItemName} ลงในตะกร้าแล้ว`;
      } else if (gift.gift_type === 'promotion') {
        successMessage = `ใช้โปรโมชั่น ${gift.gift_name} แล้ว (ส่วนลด ${gift.gift_value}฿)`;
      } else {
        successMessage = `ใช้โค้ด ${gift.gift_name} แล้ว`;
      }

      toast({ 
        title: 'สำเร็จ', 
        description: successMessage
      });

      setCode('');
      onClose();
    } catch (error) {
      console.error('Error applying code:', error);
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
