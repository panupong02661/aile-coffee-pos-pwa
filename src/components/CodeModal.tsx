
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { QrCode, Gift, Tag, ShoppingBag, Percent } from 'lucide-react';
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

  const handleApply = async () => {
    if (!code.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกโค้ดของขวัญ",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 กำลังตรวจสอบโค้ด:', code.toUpperCase());

      const { data: gift, error } = await supabase
        .from('customer_gifts')
        .select('*')
        .eq('gift_code', code.toUpperCase())
        .single();

      if (error || !gift) {
        console.error('❌ ไม่พบโค้ด:', error);
        toast({
          title: "ไม่พบโค้ด",
          description: "ไม่พบโค้ดของขวัญนี้ในระบบ",
          variant: "destructive"
        });
        return;
      }

      console.log('📦 ข้อมูลโค้ด:', gift);

      // ตรวจสอบวันหมดอายุ
      if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
        console.warn('⏰ โค้ดหมดอายุ:', gift.expires_at);
        toast({
          title: "โค้ดหมดอายุ",
          description: "โค้ดของขวัญนี้หมดอายุแล้ว",
          variant: "destructive"
        });
        return;
      }

      // ตรวจสอบสถานะการใช้งาน - ใช้เฉพาะ is_used และ used_at ที่บันทึกจริงในฐานข้อมูล
      // เมื่อมีการ apply โค้ดก่อนชำระเงิน จะไม่ถือว่าใช้งานจริงจนกว่าจะชำระเงินเสร็จ
      const isActuallyUsed = gift.is_used === true && gift.used_at !== null;
      
      if (isActuallyUsed) {
        console.warn('🚫 โค้ดถูกใช้แล้ว:', {
          is_used: gift.is_used,
          used_at: gift.used_at
        });
        toast({
          title: "โค้ดถูกใช้แล้ว",
          description: "โค้ดของขวัญนี้ถูกใช้งานแล้ว",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ โค้ดพร้อมใช้งาน');

      // จัดการประเภทของขวัญต่างๆ
      if (gift.gift_type === 'promotion') {
        console.log('📊 ประมวลผลโปรโมชั่นส่วนลด:', gift.gift_value);
        
        const giftData = {
          id: gift.id,
          type: 'promotion',
          name: gift.gift_name,
          description: gift.gift_description,
          discount_value: Number(gift.gift_value) || 0,
          discount_type: 'amount', // ใช้ส่วนลดแบบจำนวนเงิน
          code: gift.gift_code,
          customer_gift_id: gift.id
        };

        console.log('🎁 ข้อมูลโปรโมชั่นที่จะส่ง:', giftData);
        onApplyCode(giftData);
        
      } else if (gift.gift_type === 'menu_item') {
        console.log('🍽️ ประมวลผลเมนูฟรี');
        
        // ดึงข้อมูลเมนูจากฐานข้อมูล
        const { data: menuItem, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', gift.gift_id)
          .single();

        if (menuError || !menuItem) {
          console.error('❌ ไม่พบข้อมูลเมนู:', menuError);
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่พบข้อมูลเมนูที่เกี่ยวข้อง",
            variant: "destructive"
          });
          return;
        }

        const giftData = {
          id: gift.id,
          type: 'menu_item',
          name: gift.gift_name,
          description: gift.gift_description,
          menu_item: menuItem,
          code: gift.gift_code,
          customer_gift_id: gift.id
        };

        console.log('🎁 ข้อมูลเมนูฟรีที่จะส่ง:', giftData);
        onApplyCode(giftData);
        
      } else {
        console.log('🎯 ประมวลผลของขวัญประเภทอื่น');
        
        const giftData = {
          id: gift.id,
          type: gift.gift_type,
          name: gift.gift_name,
          description: gift.gift_description,
          value: Number(gift.gift_value) || 0,
          code: gift.gift_code,
          customer_gift_id: gift.id
        };

        console.log('🎁 ข้อมูลของขวัญที่จะส่ง:', giftData);
        onApplyCode(giftData);
      }

      toast({
        title: "ใช้โค้ดสำเร็จ",
        description: `ใช้โค้ด ${gift.gift_name} แล้ว`,
      });

      setCode('');
      onClose();

    } catch (error: any) {
      console.error('❌ เกิดข้อผิดพลาดในการใช้โค้ด:', error);
      toast({
        title: "ข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการใช้โค้ด",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGiftTypeIcon = (type: string) => {
    switch (type) {
      case 'reward': return <Gift className="w-4 h-4" />;
      case 'promotion': return <Percent className="w-4 h-4" />;
      case 'menu_item': return <ShoppingBag className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getGiftTypeBadge = (type: string) => {
    switch (type) {
      case 'reward': return <Badge className="bg-purple-100 text-purple-800">ของรางวัล</Badge>;
      case 'promotion': return <Badge className="bg-orange-100 text-orange-800">โปรโมชั่น</Badge>;
      case 'menu_item': return <Badge className="bg-green-100 text-green-800">เมนูอาหาร</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">อื่นๆ</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            ใช้โค้ดของขวัญ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="gift-code">โค้ดของขวัญ</Label>
            <Input
              id="gift-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="กรอกโค้ดของขวัญ"
              className="text-center font-mono text-lg"
              maxLength={6}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-700">
              <div className="font-medium mb-1">วิธีใช้โค้ดของขวัญ:</div>
              <ul className="space-y-1 text-xs">
                <li>• โค้ดของรางวัล: ได้รับของรางวัลตามที่กำหนด</li>
                <li>• โค้ดโปรโมชั่น: ได้รับส่วนลดตามจำนวนที่กำหนด</li>
                <li>• โค้ดเมนูอาหาร: ได้รับเมนูฟรีตามที่กำหนด</li>
                <li>• โค้ดจะถูกใช้งานเมื่อชำระเงินเรียบร้อยแล้ว</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              ยกเลิก
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={isLoading || !code.trim()}
              className="flex-1"
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
