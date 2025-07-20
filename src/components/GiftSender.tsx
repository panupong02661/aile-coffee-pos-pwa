import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Send, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  tier: string;
  points: number;
}

const GiftSender = () => {
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [giftType, setGiftType] = useState('');
  const [giftValue, setGiftValue] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftDescription, setGiftDescription] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const giftTypes = [
    { value: 'reward', label: 'ของรางวัล' },
    { value: 'promotion', label: 'โปรโมชั่น' },
    { value: 'special_reward', label: 'ของรางวัลพิเศษ' },
    { value: 'menu_item', label: 'เมนูอาหาร' },
    { value: 'discount', label: 'ส่วนลด' },
    { value: 'coupon', label: 'คูปอง' }
  ];

  const searchCustomers = async () => {
    if (!searchTerm.trim()) return;

    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error searching customers:', error);
      toast.error('เกิดข้อผิดพลาดในการค้นหาลูกค้า');
    }
  };

  const addCustomer = (customer: Customer) => {
    if (!selectedCustomers.find(c => c.id === customer.id)) {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  const removeCustomer = (customerId: string) => {
    setSelectedCustomers(selectedCustomers.filter(c => c.id !== customerId));
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const sendGifts = async () => {
    if (!giftType || !giftName || selectedCustomers.length === 0) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsLoading(true);

    try {
      const giftsToSend = selectedCustomers.map(customer => ({
        customer_id: customer.id,
        gift_id: generateUUID(),
        gift_type: giftType,
        gift_name: giftName,
        gift_description: giftDescription,
        gift_value: giftValue ? parseFloat(giftValue) : 0,
        message: message,
        sent_by: 'admin',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      }));

      const { error } = await supabase
        .from('customer_gifts')
        .insert(giftsToSend);

      if (error) throw error;

      toast.success(`ส่งของขวัญสำเร็จให้ ${selectedCustomers.length} คน`);
      
      // Reset form
      setSelectedCustomers([]);
      setGiftType('');
      setGiftValue('');
      setGiftName('');
      setGiftDescription('');
      setMessage('');
      setCustomers([]);
      setSearchTerm('');

    } catch (error) {
      console.error('Error sending gifts:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งของขวัญ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            ส่งของขวัญให้ลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">เลือกลูกค้า</Label>
            <div className="flex gap-2">
              <Input
                placeholder="ค้นหาด้วยชื่อหรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCustomers()}
              />
              <Button onClick={searchCustomers} variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Search Results */}
            {customers.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">ผลการค้นหา:</h4>
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => addCustomer(customer)}
                    >
                      <div>
                        <span className="font-medium">{customer.full_name}</span>
                        <span className="text-sm text-gray-500 ml-2">({customer.phone})</span>
                        <span className={`text-xs px-2 py-1 rounded ml-2 ${
                          customer.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                          customer.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.tier}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">เพิ่ม</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Customers */}
            {selectedCustomers.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  ลูกค้าที่เลือก ({selectedCustomers.length} คน):
                </h4>
                <div className="space-y-2">
                  {selectedCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded"
                    >
                      <div>
                        <span className="font-medium">{customer.full_name}</span>
                        <span className="text-sm text-gray-500 ml-2">({customer.phone})</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCustomer(customer.id)}
                      >
                        ลบ
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gift Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="giftType">ประเภทของขวัญ</Label>
              <Select value={giftType} onValueChange={setGiftType}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทของขวัญ" />
                </SelectTrigger>
                <SelectContent>
                  {giftTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="giftValue">มูลค่าของขวัญ (บาท)</Label>
              <Input
                id="giftValue"
                type="number"
                placeholder="0"
                value={giftValue}
                onChange={(e) => setGiftValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="giftName">ชื่อของขวัญ</Label>
              <Input
                id="giftName"
                placeholder="เช่น ส่วนลด 50 บาท"
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="giftDescription">รายละเอียดของขวัญ</Label>
              <Input
                id="giftDescription"
                placeholder="รายละเอียดเพิ่มเติม"
                value={giftDescription}
                onChange={(e) => setGiftDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">ข้อความถึงลูกค้า (ไม่บังคับ)</Label>
            <Textarea
              id="message"
              placeholder="ข้อความที่ต้องการส่งถึงลูกค้า..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={sendGifts}
            disabled={isLoading || selectedCustomers.length === 0}
            className="w-full"
          >
            <Gift className="w-4 h-4 mr-2" />
            {isLoading ? 'กำลังส่ง...' : `ส่งของขวัญ (${selectedCustomers.length} คน)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftSender;
