import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CustomerProfile {
  id: string;
  full_name: string;
  phone: string;
  tier: string;
  total_spent?: number;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

const GiftSender = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedGiftType, setSelectedGiftType] = useState('promotion');
  const [selectedGiftId, setSelectedGiftId] = useState('');

  // ดึงข้อมูลลูกค้าทั้งหมดจากระบบ
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('ไม่สามารถโหลดข้อมูลลูกค้าได้');
    }
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('special_promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('ไม่สามารถโหลดข้อมูลโปรโมชั่นได้');
    }
  };

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('ไม่สามารถโหลดข้อมูลของรางวัลได้');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('ไม่สามารถโหลดข้อมูลเมนูได้');
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchPromotions();
    fetchRewards();
    fetchMenuItems();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const searchTerm = customerSearch.toLowerCase();
    const fullName = customer.full_name.toLowerCase();
    const phone = customer.phone;

    const matchesSearch = fullName.includes(searchTerm) || phone.includes(searchTerm);
    const matchesTier = tierFilter === 'all' || customer.tier === tierFilter;

    return matchesSearch && matchesTier;
  });

  const handleSendGift = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('กรุณาเลือกลูกค้าอย่างน้อย 1 คน');
      return;
    }

    if (!selectedGiftId) {
      toast.error('กรุณาเลือกของขวัญที่ต้องการส่ง');
      return;
    }

    try {
      // Logic to send the gift to selected customers
      // This is a placeholder, replace with your actual implementation
      toast.success(`ส่งของขวัญไปยังลูกค้า ${selectedCustomers.length} คน`);
    } catch (error) {
      console.error('Error sending gift:', error);
      toast.error('ไม่สามารถส่งของขวัญได้');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          ส่งของขวัญให้ลูกค้า
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ฝั่งซ้าย - เลือกลูกค้า */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">เลือกลูกค้า</h3>
            
            {/* ค้นหาลูกค้า */}
            <div className="space-y-2">
              <Label htmlFor="customer-search">ค้นหาลูกค้า</Label>
              <Input
                id="customer-search"
                placeholder="ค้นหาด้วยชื่อหรือเบอร์โทร..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>

            {/* กรองตามระดับ */}
            <div className="space-y-2">
              <Label htmlFor="tier-filter">กรองตามระดับสมาชิก</Label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกระดับสมาชิก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="bronze">สมาชิกทองแดง</SelectItem>
                  <SelectItem value="silver">สมาชิกเงิน</SelectItem>
                  <SelectItem value="gold">สมาชิกทอง</SelectItem>
                  <SelectItem value="platinum">สมาชิกแพลตินัม</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* รายการลูกค้า */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <Label>รายการลูกค้าทั้งหมด ({filteredCustomers.length} คน)</Label>
              <div className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedCustomers(prev => 
                      prev.includes(customer.id)
                        ? prev.filter(id => id !== customer.id)
                        : [...prev, customer.id]
                    )}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomers.includes(customer.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{customer.full_name}</p>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          customer.tier === 'platinum' ? 'default' :
                          customer.tier === 'gold' ? 'secondary' :
                          customer.tier === 'silver' ? 'outline' : 'secondary'
                        }>
                          {customer.tier === 'bronze' && 'ทองแดง'}
                          {customer.tier === 'silver' && 'เงิน'}
                          {customer.tier === 'gold' && 'ทอง'}
                          {customer.tier === 'platinum' && 'แพลตินัม'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          ยอดซื้อ: ฿{customer.total_spent?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCustomers.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  เลือกแล้ว {selectedCustomers.length} คน
                </p>
              </div>
            )}
          </div>

          {/* ฝั่งขวา - เลือกของขวัญ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">เลือกของขวัญ</h3>

            {/* ประเภทของขวัญ */}
            <div className="space-y-2">
              <Label>ประเภทของขวัญ</Label>
              <div className="flex gap-4">
                <Button
                  variant={selectedGiftType === 'promotion' ? 'default' : 'outline'}
                  onClick={() => setSelectedGiftType('promotion')}
                >
                  โปรโมชั่น
                </Button>
                <Button
                  variant={selectedGiftType === 'reward' ? 'default' : 'outline'}
                  onClick={() => setSelectedGiftType('reward')}
                >
                  ของรางวัล
                </Button>
                <Button
                  variant={selectedGiftType === 'menu_item' ? 'default' : 'outline'}
                  onClick={() => setSelectedGiftType('menu_item')}
                >
                  เมนู
                </Button>
              </div>
            </div>

            {/* รายการของขวัญ */}
            <div className="space-y-2">
              <Label>เลือกของขวัญ</Label>
              <Select value={selectedGiftId} onValueChange={setSelectedGiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกของขวัญ" />
                </SelectTrigger>
                <SelectContent>
                  {selectedGiftType === 'promotion' &&
                    promotions.map((promotion) => (
                      <SelectItem key={promotion.id} value={promotion.id}>
                        {promotion.name}
                      </SelectItem>
                    ))}
                  {selectedGiftType === 'reward' &&
                    rewards.map((reward) => (
                      <SelectItem key={reward.id} value={reward.id}>
                        {reward.name}
                      </SelectItem>
                    ))}
                  {selectedGiftType === 'menu_item' &&
                    menuItems.map((menuItem) => (
                      <SelectItem key={menuItem.id} value={menuItem.id}>
                        {menuItem.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* แสดงตัวอย่างของขวัญ */}
            {selectedGiftId && (
              <div className="p-4 border rounded-lg">
                {selectedGiftType === 'promotion' && (
                  <>
                    <h4 className="font-medium">โปรโมชั่น</h4>
                    <p>{promotions.find(p => p.id === selectedGiftId)?.name}</p>
                  </>
                )}
                {selectedGiftType === 'reward' && (
                  <>
                    <h4 className="font-medium">ของรางวัล</h4>
                    <p>{rewards.find(r => r.id === selectedGiftId)?.name}</p>
                  </>
                )}
                 {selectedGiftType === 'menu_item' && (
                  <>
                    <h4 className="font-medium">เมนู</h4>
                    <p>{menuItems.find(r => r.id === selectedGiftId)?.name}</p>
                  </>
                )}
              </div>
            )}

            {/* ปุ่มส่งของขวัญ */}
            <Button onClick={handleSendGift} className="w-full">
              <Gift className="w-4 h-4 mr-2" />
              ส่งของขวัญ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GiftSender;
