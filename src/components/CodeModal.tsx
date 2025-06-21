
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
      // Check if code exists and is valid
      const { data: gift, error } = await supabase
        .from('customer_gifts')
        .select('*')
        .eq('gift_code', code.toUpperCase())
        .eq('is_used', true) // Code should be used (activated) but not applied to order yet
        .maybeSingle();

      if (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการตรวจสอบโค้ด', variant: 'destructive' });
        return;
      }

      if (!gift) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่พบโค้ดนี้หรือโค้ดไม่ถูกต้อง', variant: 'destructive' });
        return;
      }

      // Check if code is expired
      if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
        toast({ title: 'ข้อผิดพลาด', description: 'โค้ดนี้หมดอายุแล้ว', variant: 'destructive' });
        return;
      }

      // Apply the code
      onApplyCode(gift);
      
      // Mark as applied (you might want to add an 'applied_to_order' field)
      await supabase
        .from('customer_gifts')
        .update({ applied_at: new Date().toISOString() })
        .eq('id', gift.id);

      setCode('');
      onClose();
    } catch (error) {
      console.error('Error applying code:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการใช้โค้ด', variant: 'destructive' });
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
