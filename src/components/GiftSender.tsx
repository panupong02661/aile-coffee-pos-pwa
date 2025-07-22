import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Gift, Send, Users, Search, Filter, Crown, Star, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  tier: string;
  points: number;
  total_spent: number;
  birth_date?: string;
  gender?: string;
  user_id?: string;
}

interface Reward {
  id: string;
  name: string;
  points_required?: number;
  expires_at?: string;
}

interface Promotion {
  id: string;
  title: string;
  discount_value: number;
  discount_type: string;
  end_date: string;
}

const GiftSender = () => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [giftType, setGiftType] = useState('');
  const [selectedReward, setSelectedReward] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftValue, setGiftValue] = useState('');
  const [giftDescription, setGiftDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [message, setMessage] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const giftTypes = [
    { value: 'reward', label: 'ของรางวัล' },
    { value: 'promotion', label: 'โปรโมชั่น' },
    { value: 'special_reward', label: 'ของรางวัลพิเศษ' },
    { value: 'menu_item', label: 'เมนูอาหาร' },
    { value: 'discount', label: 'ส่วนลด' },
    { value: 'coupon', label: 'คูปอง' }
  ];

  const tierOptions = [
    { value: 'all', label: 'ทุกระดับ' },
    { value: 'bronze', label: 'บรอนซ์' },
    { value: 'silver', label: 'เงิน' },
    { value: 'gold', label: 'ทอง' },
    { value: 'platinum', label: 'แพลทินัม' }
  ];

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchAllCustomers();
    fetchRewards();
    fetchPromotions();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [allCustomers, searchTerm, tierFilter]);

  const fetchAllCustomers = async () => {
    try {
      console.log('Fetching customers from customer_profiles table...');
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched customers data:', data);
      console.log('Number of customers:', data?.length || 0);
      
      if (data && data.length > 0) {
        setAllCustomers(data);
        toast.success(`พบข้อมูลลูกค้า ${data.length} คน`);
      } else {
        console.log('No customer data found');
        toast.info('ไม่พบข้อมูลลูกค้าในระบบ');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า: ' + (error as Error).message);
    }
  };

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      console.log('Fetched rewards:', data);
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('limited_promotions')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());

      if (error) throw error;
      
      const mappedPromotions = (data || []).map(promo => ({
        id: promo.id,
        title: promo.title || 'ไม่มีชื่อ',
        discount_value: promo.discount_value,
        discount_type: promo.discount_type || 'percentage',
        end_date: promo.end_date
      }));
      
      console.log('Fetched promotions:', mappedPromotions);
      setPromotions(mappedPromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const filterCustomers = () => {
    let filtered = allCustomers;
    console.log('Filtering customers, total:', allCustomers.length);

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
      console.log('After search filter:', filtered.length);
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(customer => customer.tier === tierFilter);
      console.log('After tier filter:', filtered.length);
    }

    setFilteredCustomers(filtered);
  };

  const toggleCustomerSelection = (customer: Customer) => {
    setSelectedCustomers(prev => {
      const isSelected = prev.find(c => c.id === customer.id);
      if (isSelected) {
        return prev.filter(c => c.id !== customer.id);
      } else {
        return [...prev, customer];
      }
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'gold': return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'silver': return <Star className="w-4 h-4 text-gray-600" />;
      default: return <Users className="w-4 h-4 text-orange-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const handleGiftTypeChange = (type: string) => {
    setGiftType(type);
    setSelectedReward('');
    setSelectedPromotion('');
    setGiftName('');
    setGiftValue('');
    setGiftDescription('');
    setExpiryDate('');
  };

  const handleRewardSelection = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      setSelectedReward(rewardId);
      setGiftName(reward.name);
      setGiftValue(reward.points_required?.toString() || '');
      if (reward.expires_at) {
        setExpiryDate(new Date(reward.expires_at).toISOString().split('T')[0]);
      }
    }
  };

  const handlePromotionSelection = (promotionId: string) => {
    const promotion = promotions.find(p => p.id === promotionId);
    if (promotion) {
      setSelectedPromotion(promotionId);
      setGiftName(promotion.title);
      setGiftValue(promotion.discount_value.toString());
      setGiftDescription(`ส่วนลด ${promotion.discount_value}${promotion.discount_type === 'percentage' ? '%' : ' บาท'}`);
      setExpiryDate(new Date(promotion.end_date).toISOString().split('T')[0]);
    }
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
      toast.error('กรุณากรอกข้อมูลและเลือกลูกค้าให้ครบถ้วน');
      return;
    }

    setIsLoading(true);

    try {
      const expireDate = expiryDate ? new Date(expiryDate).toISOString() : 
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const giftsToSend = selectedCustomers.map(customer => ({
        customer_id: customer.id,
        gift_id: generateUUID(),
        gift_type: giftType,
        gift_name: giftName,
        gift_description: giftDescription,
        gift_value: giftValue ? parseFloat(giftValue) : 0,
        message: message,
        sent_by: 'admin',
        expires_at: expireDate,
      }));

      const { error } = await supabase
        .from('customer_gifts')
        .insert(giftsToSend);

      if (error) throw error;

      toast.success(`ส่งของขวัญสำเร็จให้ ${selectedCustomers.length} คน`);
      
      setSelectedCustomers([]);
      setGiftType('');
      setSelectedReward('');
      setSelectedPromotion('');
      setGiftValue('');
      setGiftName('');
      setGiftDescription('');
      setExpiryDate('');
      setMessage('');

    } catch (error) {
      console.error('Error sending gifts:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งของขวัญ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            เลือกลูกค้า ({selectedCustomers.length} คน)
          </CardTitle>
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tierOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={fetchAllCustomers} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              รีเฟรชข้อมูลลูกค้า
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {filteredCustomers.map((customer) => {
              const isSelected = selectedCustomers.find(c => c.id === customer.id);
              return (
                <div
                  key={customer.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleCustomerSelection(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTierIcon(customer.tier)}
                      <div>
                        <div className="font-medium">{customer.full_name}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTierColor(customer.tier)}>
                        {customer.tier}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {customer.points?.toLocaleString() || 0} แต้ม
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {allCustomers.length === 0 ? 'ไม่พบข้อมูลลูกค้าในระบบ กรุณากดรีเฟรชข้อมูลลูกค้า' : 'ไม่พบลูกค้าที่ตรงกับเงื่อนไข'}
            </div>
          )}

          {allCustomers.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              แสดงข้อมูลลูกค้า {filteredCustomers.length} จาก {allCustomers.length} คน
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            เลือกของขวัญ
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="giftType">ประเภทของขวัญ</Label>
            <Select value={giftType} onValueChange={handleGiftTypeChange}>
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

          {giftType === 'reward' && (
            <div className="space-y-2">
              <Label>ของรางวัล</Label>
              <Select value={selectedReward} onValueChange={handleRewardSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกของรางวัล" />
                </SelectTrigger>
                <SelectContent>
                  {rewards.map((reward) => (
                    <SelectItem key={reward.id} value={reward.id}>
                      {reward.name} ({reward.points_required} แต้ม)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {giftType === 'promotion' && (
            <div className="space-y-2">
              <Label>โปรโมชั่น</Label>
              <Select value={selectedPromotion} onValueChange={handlePromotionSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโปรโมชั่น" />
                </SelectTrigger>
                <SelectContent>
                  {promotions.map((promotion) => (
                    <SelectItem key={promotion.id} value={promotion.id}>
                      {promotion.title} (ลด {promotion.discount_value}{promotion.discount_type === 'percentage' ? '%' : ' บาท'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="giftName">ชื่อของขวัญ</Label>
              <Input
                id="giftName"
                placeholder="ชื่อของขวัญ"
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="giftValue">มูลค่า/แต้ม</Label>
              <Input
                id="giftValue"
                type="number"
                placeholder="0"
                value={giftValue}
                onChange={(e) => setGiftValue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="giftDescription">รายละเอียด</Label>
            <Input
              id="giftDescription"
              placeholder="รายละเอียดของขวัญ"
              value={giftDescription}
              onChange={(e) => setGiftDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">วันหมดอายุ (ไม่บังคับ)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
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
            disabled={isLoading || selectedCustomers.length === 0 || !giftType || !giftName}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'กำลังส่ง...' : `ส่งของขวัญ (${selectedCustomers.length} คน)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftSender;
