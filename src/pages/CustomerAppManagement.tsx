import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  type?: 'menu_item' | 'promotion';
  points_required?: number;
  discount_value?: number;
}

const CustomerAppManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
    loadRewards();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, phone_number, email')
        .order('full_name');

      if (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลลูกค้าได้",
          variant: "destructive"
        });
      } else {
        setCustomers(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching customers:', error);
      toast({
        title: "ข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า",
        variant: "destructive"
      });
    }
  };

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('id, name, description, type, points_required, discount_value')
        .order('name');

      if (error) {
        console.error('Error fetching rewards:', error);
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลของรางวัลได้",
          variant: "destructive"
        });
      } else {
        setRewards(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching rewards:', error);
      toast({
        title: "ข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการโหลดข้อมูลของรางวัล",
        variant: "destructive"
      });
    }
  };

  const handleSendGift = async () => {
    if (!selectedCustomer || !selectedReward) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเลือกลูกค้าและของขวัญ",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🎁 เริ่มส่งของขวัญ:', {
        customer: selectedCustomer.full_name,
        reward: selectedReward.name,
        type: selectedReward.type || 'menu_item'
      });

      // สร้างโค้ดของขวัญแบบสุ่ม 6 หลัก
      const giftCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log('🔢 สร้างโค้ด:', giftCode);

      // กำหนดวันหมดอายุ (30 วันจากวันนี้)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // เตรียมข้อมูลของขวัญตามประเภท
      let giftData: any = {
        customer_id: selectedCustomer.id,
        gift_code: giftCode,
        gift_name: selectedReward.name,
        gift_description: giftMessage || `ของขวัญจาก ${selectedReward.name}`,
        message: giftMessage,
        expires_at: expiresAt.toISOString(),
        sent_by: 'admin',
        is_used: false,
        used_at: null
      };

      // กำหนดประเภทและค่าของขวัญ
      if (selectedReward.type === 'promotion') {
        // สำหรับโปรโมชั่นส่วนลด
        giftData.gift_type = 'promotion';
        giftData.gift_id = selectedReward.id;
        giftData.gift_value = Number(selectedReward.discount_value) || 0;
        console.log('📊 โปรโมชั่นส่วนลด:', giftData.gift_value, 'บาท');
      } else {
        // สำหรับเมนูอาหาร (ค่าเริ่มต้น)
        giftData.gift_type = 'menu_item';
        giftData.gift_id = selectedReward.id;
        giftData.gift_value = Number(selectedReward.points_required) || 0;
        console.log('🍽️ เมนูอาหาร, คะแนนที่ต้องใช้:', giftData.gift_value);
      }

      console.log('💾 ข้อมูลที่จะบันทึก:', giftData);

      // บันทึกลงฐานข้อมูล
      const { data: newGift, error } = await supabase
        .from('customer_gifts')
        .insert(giftData)
        .select()
        .single();

      if (error) {
        console.error('❌ ข้อผิดพลาดในการบันทึก:', error);
        throw new Error(`ไม่สามารถบันทึกของขวัญได้: ${error.message}`);
      }

      console.log('✅ บันทึกของขวัญสำเร็จ:', newGift);

      toast({
        title: "ส่งของขวัญสำเร็จ",
        description: `ส่ง ${selectedReward.name} ให้ ${selectedCustomer.full_name} แล้ว (โค้ด: ${giftCode})`,
      });

      // รีเซ็ตฟอร์ม
      setSelectedCustomer(null);
      setSelectedReward(null);
      setGiftMessage('');
      
      // รีเฟรชข้อมูล
      await loadCustomers();
      await loadRewards();

    } catch (error: any) {
      console.error('❌ เกิดข้อผิดพลาดในการส่งของขวัญ:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || 'ไม่สามารถส่งของขวัญได้',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>จัดการของขวัญสำหรับลูกค้า</CardTitle>
          <CardDescription>ส่งของขวัญและโปรโมชั่นให้กับลูกค้า</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">เลือกลูกค้า</Label>
              <Select onValueChange={(value) => {
                const customer = customers.find(c => c.id === value);
                setSelectedCustomer(customer || null);
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกลูกค้า" defaultValue={selectedCustomer?.id} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reward">เลือกของขวัญ</Label>
              <Select onValueChange={(value) => {
                const reward = rewards.find(r => r.id === value);
                setSelectedReward(reward || null);
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกของขวัญ" defaultValue={selectedReward?.id} />
                </SelectTrigger>
                <SelectContent>
                  {rewards.map((reward) => (
                    <SelectItem key={reward.id} value={reward.id}>{reward.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">ข้อความ (ไม่บังคับ)</Label>
            <Input
              id="message"
              type="text"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="ใส่ข้อความเพิ่มเติม"
            />
          </div>

          <Button onClick={handleSendGift} disabled={isLoading} className="w-full">
            {isLoading ? 'กำลังส่ง...' : 'ส่งของขวัญ'}
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      <div>
        <h2>ข้อมูลลูกค้า</h2>
        {customers.length === 0 ? (
          <p>ไม่มีข้อมูลลูกค้า</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <div key={customer.id} className="border rounded-md p-4">
                <h3>{customer.full_name}</h3>
                <p>เบอร์โทร: {customer.phone_number}</p>
                {customer.email && <p>อีเมล: {customer.email}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div>
        <h2>ข้อมูลของขวัญ</h2>
        {rewards.length === 0 ? (
          <p>ไม่มีข้อมูลของขวัญ</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="border rounded-md p-4">
                <h3>{reward.name}</h3>
                <p>{reward.description}</p>
                <p>ประเภท: {reward.type}</p>
                {reward.points_required && <p>แต้มที่ต้องใช้: {reward.points_required}</p>}
                {reward.discount_value && <p>มูลค่าส่วนลด: {reward.discount_value}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAppManagement;
