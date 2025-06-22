
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
      console.log('Checking code:', code.toUpperCase());
      
      // Check if code exists and is valid
      const { data, error } = await supabase
        .from('customer_gifts')
        .select('*')
        .eq('gift_code', code.toUpperCase())
        .eq('is_used', false);

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: `เกิดข้อผิดพลาด: ${error.message}`, 
          variant: 'destructive' 
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่พบโค้ดนี้หรือโค้ดถูกใช้แล้ว', variant: 'destructive' });
        return;
      }

      const gift = data[0];
      console.log('Found gift:', gift);

      // Check if code is expired
      if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
        toast({ title: 'ข้อผิดพลาด', description: 'โค้ดนี้หมดอายุแล้ว', variant: 'destructive' });
        return;
      }

      // If it's a menu item gift, fetch the menu item details separately
      if (gift.gift_type === 'menu_item' && gift.gift_id) {
        const { data: menuItemData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', gift.gift_id)
          .single();

        if (menuError) {
          console.error('Menu item fetch error:', menuError);
        } else if (menuItemData) {
          gift.menu_items = menuItemData;
        }
      }

      // Apply the code based on gift type
      onApplyCode(gift);
      
      // Mark as used
      const { error: updateError } = await supabase
        .from('customer_gifts')
        .update({ 
          is_used: true,
          used_at: new Date().toISOString() 
        })
        .eq('id', gift.id);

      if (updateError) {
        console.error('Update error:', updateError);
        // Still show success but log the error
      }

      let successMessage = '';
      if (gift.gift_type === 'menu_item') {
        successMessage = `เพิ่มเมนู ${gift.gift_name} ลงในตะกร้าแล้ว`;
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
