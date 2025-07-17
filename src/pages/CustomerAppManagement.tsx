
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Gift, 
  Tag, 
  Send, 
  Search, 
  Filter,
  Crown,
  Award,
  Star,
  Plus,
  Trash2,
  Edit,
  Calendar,
  ShoppingBag,
  Zap,
  Cake
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLimitedRewards, useCreateLimitedReward } from '@/hooks/useLimitedRewards';

interface Customer {
  id: string;
  name: string;
  phone: string;
  tier: string;
  points: number;
  total_spent: number;
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  is_active: boolean;
}

interface Promotion {
  id: string;
  name: string;
  description?: string;
  discount_value: number;
  discount_type?: string;
  type: string;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
}

const CustomerAppManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('send-gifts');
  const [selectedReward, setSelectedReward] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [giftType, setGiftType] = useState<'reward' | 'promotion' | 'menu_item'>('reward');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Limited Rewards states
  const [limitedRewardName, setLimitedRewardName] = useState('');
  const [limitedRewardDescription, setLimitedRewardDescription] = useState('');
  const [limitedRewardType, setLimitedRewardType] = useState<'discount' | 'free_item'>('discount');
  const [limitedDiscountType, setLimitedDiscountType] = useState<'percent' | 'amount'>('percent');
  const [limitedDiscountValue, setLimitedDiscountValue] = useState(0);
  const [limitedMaxClaims, setLimitedMaxClaims] = useState(100);
  const [limitedStartDate, setLimitedStartDate] = useState('');
  const [limitedEndDate, setLimitedEndDate] = useState('');
  const [limitedRewardCode, setLimitedRewardCode] = useState('');

  // Birthday Rewards states
  const [birthdayRewardType, setBirthdayRewardType] = useState<'discount' | 'free_item'>('discount');
  const [birthdayDiscountType, setBirthdayDiscountType] = useState<'percent' | 'amount'>('percent');
  const [birthdayDiscountValue, setBirthdayDiscountValue] = useState(0);
  const [birthdayTargetMonth, setBirthdayTargetMonth] = useState(1);
  const [birthdayDescription, setBirthdayDescription] = useState('');

  const { data: limitedRewards } = useLimitedRewards();
  const { mutate: createLimitedReward } = useCreateLimitedReward();

  // Load data
  useEffect(() => {
    loadCustomers();
    loadRewards();
    loadPromotions();
    loadMenuItems();
  }, []);

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลลูกค้าได้', variant: 'destructive' });
      return;
    }
    setCustomers(data || []);
  };

  const loadRewards = async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_required');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลของรางวัลได้', variant: 'destructive' });
      return;
    }
    setRewards(data || []);
  };

  const loadPromotions = async () => {
    const { data, error } = await supabase
      .from('promotions')
      .select('id, name, description, discount_value, type, is_active')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลโปรโมชั่นได้', variant: 'destructive' });
      return;
    }
    
    const mappedPromotions: Promotion[] = (data || []).map(promo => ({
      ...promo,
      discount_type: promo.type === 'percentage' ? 'percentage' : 'amount'
    }));
    
    setPromotions(mappedPromotions);
  };

  const loadMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, description, price, is_available')
      .eq('is_available', true)
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลเมนูได้', variant: 'destructive' });
      return;
    }
    setMenuItems(data || []);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'gold': return <Award className="w-4 h-4 text-yellow-600" />;
      case 'silver': return <Star className="w-4 h-4 text-gray-600" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesTier = tierFilter === 'all' || customer.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const getCurrentGiftData = () => {
    if (giftType === 'reward' && selectedReward) {
      const reward = rewards.find(r => r.id === selectedReward);
      return reward ? {
        id: reward.id,
        name: reward.name,
        description: reward.description,
        value: reward.points_required
      } : null;
    } else if (giftType === 'promotion' && selectedPromotion) {
      const promotion = promotions.find(p => p.id === selectedPromotion);
      return promotion ? {
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        value: promotion.discount_value
      } : null;
    } else if (giftType === 'menu_item' && selectedMenuItem) {
      const menuItem = menuItems.find(m => m.id === selectedMenuItem);
      return menuItem ? {
        id: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        value: menuItem.price
      } : null;
    }
    return null;
  };

  const handleSendGift = async () => {
    if (selectedCustomers.length === 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกลูกค้าที่ต้องการส่งของขวัญ', variant: 'destructive' });
      return;
    }

    const giftData = getCurrentGiftData();
    if (!giftData) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกของขวัญที่ต้องการส่ง', variant: 'destructive' });
      return;
    }

    if (expirationDate && new Date(expirationDate) <= new Date()) {
      toast({ title: 'ข้อผิดพลาด', description: 'วันหมดอายุต้องเป็นวันในอนาคต', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      // Generate unique codes for each gift
      const giftsToInsert = await Promise.all(selectedCustomers.map(async (customerId) => {
        let giftCode = '';
        let isUnique = false;
        
        // Generate unique 6-character code
        while (!isUnique) {
          giftCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          
          // Check if code already exists
          const { data: existingGift } = await supabase
            .from('customer_gifts')
            .select('id')
            .eq('gift_code', giftCode)
            .single();
            
          if (!existingGift) {
            isUnique = true;
          }
        }

        return {
          customer_id: customerId,
          gift_type: giftType,
          gift_id: giftData.id,
          gift_name: giftData.name,
          gift_description: giftData.description || '',
          gift_value: giftData.value,
          expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
          message: giftMessage || null,
          sent_by: 'admin',
          gift_code: giftCode,
          is_used: false
        };
      }));

      const { error } = await supabase
        .from('customer_gifts')
        .insert(giftsToInsert);

      if (error) {
        console.error('Error sending gifts:', error);
        toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการส่งของขวัญ', variant: 'destructive' });
        return;
      }

      toast({ 
        title: 'สำเร็จ', 
        description: `ส่งของขวัญให้ลูกค้า ${selectedCustomers.length} คนเรียบร้อยแล้ว พร้อมโค้ดใช้งาน` 
      });
      
      // Reset form
      setSelectedCustomers([]);
      setSelectedReward('');
      setSelectedPromotion('');
      setSelectedMenuItem('');
      setGiftMessage('');
      setExpirationDate('');
      setGiftType('reward');
      
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({ title: 'ข้อผิดพลาด', description: `เกิดข้อผิดพลาดในการส่งของขวัญ: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLimitedReward = async () => {
    if (!limitedRewardName || !limitedStartDate || !limitedEndDate) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    if (new Date(limitedStartDate) >= new Date(limitedEndDate)) {
      toast({ title: 'ข้อผิดพลาด', description: 'วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด', variant: 'destructive' });
      return;
    }

    createLimitedReward({
      name: limitedRewardName,
      description: limitedRewardDescription,
      reward_type: limitedRewardType,
      discount_type: limitedDiscountType,
      discount_value: limitedDiscountValue,
      max_claims: limitedMaxClaims,
      start_date: new Date(limitedStartDate).toISOString(),
      end_date: new Date(limitedEndDate).toISOString(),
      reward_code: limitedRewardCode || null,
      target_month: null, // Add target_month as null for regular limited rewards
      is_active: true
    });

    // Reset form
    setLimitedRewardName('');
    setLimitedRewardDescription('');
    setLimitedDiscountValue(0);
    setLimitedMaxClaims(100);
    setLimitedStartDate('');
    setLimitedEndDate('');
    setLimitedRewardCode('');
  };

  const handleCreateBirthdayReward = async () => {
    if (!birthdayDescription) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกคำอธิบาย', variant: 'destructive' });
      return;
    }

    const startOfMonth = new Date(new Date().getFullYear(), birthdayTargetMonth - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), birthdayTargetMonth, 0, 23, 59, 59);

    createLimitedReward({
      name: `ของรางวัลวันเกิด เดือน ${birthdayTargetMonth}`,
      description: birthdayDescription,
      reward_type: birthdayRewardType,
      discount_type: birthdayDiscountType,
      discount_value: birthdayDiscountValue,
      max_claims: 1000, // High limit for birthday rewards
      start_date: startOfMonth.toISOString(),
      end_date: endOfMonth.toISOString(),
      target_month: birthdayTargetMonth,
      reward_code: null, // Add reward_code as null for birthday rewards
      is_active: true
    });

    // Reset form
    setBirthdayDescription('');
    setBirthdayDiscountValue(0);
  };

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการแอปลูกค้า</h1>
        <p className="text-gray-600 mt-1">ส่งของขวัญ สร้างของรางวัลพิเศษ และจัดการของรางวัลวันเกิด</p>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send-gifts" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              ส่งของขวัญ
            </TabsTrigger>
            <TabsTrigger value="limited-rewards" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              ของรางวัลพิเศษ
            </TabsTrigger>
            <TabsTrigger value="birthday-rewards" className="flex items-center gap-2">
              <Cake className="w-4 h-4" />
              ของรางวัลวันเกิด
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send-gifts">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Selection */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      เลือกลูกค้า ({selectedCustomers.length} คน)
                    </CardTitle>
                    
                    {/* Search and Filter */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={tierFilter} onValueChange={setTierFilter}>
                        <SelectTrigger className="w-40">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทุกระดับ</SelectItem>
                          <SelectItem value="platinum">แพลทินัม</SelectItem>
                          <SelectItem value="gold">ทอง</SelectItem>
                          <SelectItem value="silver">เงิน</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleSelectAll}
                      className="w-fit"
                    >
                      {selectedCustomers.length === filteredCustomers.length ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedCustomers.includes(customer.id)
                              ? 'bg-blue-50 border-blue-300'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleCustomerSelect(customer.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getTierIcon(customer.tier)}
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-gray-600">{customer.phone}</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getTierBadgeColor(customer.tier)}>
                                {customer.tier}
                              </Badge>
                              <div className="text-sm text-gray-600 mt-1">
                                {customer.points.toLocaleString()} แต้ม
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gift Selection */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      เลือกของขวัญ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Gift Type Selection */}
                    <div>
                      <Label>ประเภทของขวัญ</Label>
                      <Select value={giftType} onValueChange={(value: 'reward' | 'promotion' | 'menu_item') => {
                        setGiftType(value);
                        setSelectedReward('');
                        setSelectedPromotion('');
                        setSelectedMenuItem('');
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reward">
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4" />
                              ของรางวัล
                            </div>
                          </SelectItem>
                          <SelectItem value="promotion">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              โปรโมชั่น
                            </div>
                          </SelectItem>
                          <SelectItem value="menu_item">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4" />
                              เมนูอาหาร
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Gift Selection based on type */}
                    {giftType === 'reward' && (
                      <div>
                        <Label>ของรางวัล</Label>
                        <Select value={selectedReward} onValueChange={setSelectedReward}>
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
                      <div>
                        <Label>โปรโมชั่น</Label>
                        <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกโปรโมชั่น" />
                          </SelectTrigger>
                          <SelectContent>
                            {promotions.map((promotion) => (
                              <SelectItem key={promotion.id} value={promotion.id}>
                                {promotion.name} ({promotion.discount_value}
                                {promotion.discount_type === 'percentage' ? '%' : '฿'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {giftType === 'menu_item' && (
                      <div>
                        <Label>เมนูอาหาร</Label>
                        <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกเมนูอาหาร" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.price}฿)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Separator />

                    {/* Expiration Date */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        วันหมดอายุ (ไม่บังคับ)
                      </Label>
                      <Input
                        type="datetime-local"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>

                    <Separator />

                    {/* Message */}
                    <div>
                      <Label>ข้อความแนบ (ไม่บังคับ)</Label>
                      <Textarea
                        placeholder="ข้อความที่ต้องการส่งไปพร้อมของขวัญ..."
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Send Button */}
                    <Button 
                      onClick={handleSendGift}
                      disabled={isLoading || selectedCustomers.length === 0 || !getCurrentGiftData()}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isLoading ? 'กำลังส่ง...' : 'ส่งของขวัญ'}
                    </Button>

                    {/* Summary */}
                    {selectedCustomers.length > 0 && getCurrentGiftData() && (
                      <div className="bg-blue-50 p-3 rounded-lg text-sm">
                        <div className="font-medium text-blue-800">สรุป:</div>
                        <div className="text-blue-700">
                          • ลูกค้าที่เลือก: {selectedCustomers.length} คน<br/>
                          • ประเภท: {giftType === 'reward' ? 'ของรางวัล' : giftType === 'promotion' ? 'โปรโมชั่น' : 'เมนูอาหาร'}<br/>
                          • ชื่อ: {getCurrentGiftData()?.name}<br/>
                          {expirationDate && <span>• หมดอายุ: {new Date(expirationDate).toLocaleDateString('th-TH')}</span>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="limited-rewards">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Limited Reward Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    สร้างของรางวัลพิเศษใหม่
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>ชื่อรางวัล *</Label>
                    <Input
                      placeholder="เช่น ส่วนลด 20% พิเศษ"
                      value={limitedRewardName}
                      onChange={(e) => setLimitedRewardName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ประเภทรางวัล</Label>
                      <Select value={limitedRewardType} onValueChange={(value: 'discount' | 'free_item') => setLimitedRewardType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">ส่วนลด</SelectItem>
                          <SelectItem value="free_item">ของฟรี</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>ประเภทส่วนลด</Label>
                      <Select value={limitedDiscountType} onValueChange={(value: 'percent' | 'amount') => setLimitedDiscountType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">เปอร์เซ็นต์ (%)</SelectItem>
                          <SelectItem value="amount">จำนวนเงิน (บาท)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>มูลค่า</Label>
                      <Input
                        type="number"
                        value={limitedDiscountValue}
                        onChange={(e) => setLimitedDiscountValue(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>จำนวนสิทธิ์ทั้งหมด</Label>
                      <Input
                        type="number"
                        value={limitedMaxClaims}
                        onChange={(e) => setLimitedMaxClaims(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>วันเริ่ม *</Label>
                      <Input
                        type="datetime-local"
                        value={limitedStartDate}
                        onChange={(e) => setLimitedStartDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>วันสิ้นสุด *</Label>
                      <Input
                        type="datetime-local"
                        value={limitedEndDate}
                        onChange={(e) => setLimitedEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>คำอธิบาย</Label>
                    <Textarea
                      placeholder="อธิบายเงื่อนไขและรายละเอียดของรางวัล..."
                      value={limitedRewardDescription}
                      onChange={(e) => setLimitedRewardDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>รหัสคูปอง (ถ้ามี)</Label>
                    <Input
                      placeholder="เช่น SPECIAL20"
                      value={limitedRewardCode}
                      onChange={(e) => setLimitedRewardCode(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateLimitedReward}
                    className="w-full"
                    disabled={!limitedRewardName || !limitedStartDate || !limitedEndDate}
                  >
                    สร้างรางวัล
                  </Button>
                </CardContent>
              </Card>

              {/* Limited Rewards List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    รายการของรางวัลพิเศษ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {limitedRewards?.map((reward) => (
                      <div key={reward.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{reward.name}</h3>
                          <Badge variant={reward.is_active ? "default" : "secondary"}>
                            {reward.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {reward.discount_value}
                            {reward.discount_type === 'percent' ? '%' : '฿'}
                          </span>
                          <span className="text-gray-500">
                            {reward.current_claims || 0}/{reward.max_claims} ใช้แล้ว
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(reward.start_date).toLocaleDateString('th-TH')} - {new Date(reward.end_date).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    ))}
                    {(!limitedRewards || limitedRewards.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>ยังไม่มีของรางวัลพิเศษ</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="birthday-rewards">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cake className="w-5 h-5" />
                    เลือกของรางวัล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>ประเภทของรางวัล</Label>
                    <Select value={birthdayRewardType} onValueChange={(value: 'discount' | 'free_item') => setBirthdayRewardType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            ของรางวัล
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>ของรางวัล</Label>
                    <Input
                      placeholder="เลือกของรางวัล"
                      value="เค้กของรางวัล"
                      readOnly
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      วันหมดอายุ (ไม่บังคับ)
                    </Label>
                    <Input
                      type="date"
                      defaultValue="2024-12-31"
                    />
                  </div>

                  <div>
                    <Label>ข้อความแนบ (ไม่บังคับ)</Label>
                    <Textarea
                      placeholder="ข้อความที่ต้องการกำหนดสำหรับของรางวัลของขวัญ..."
                      value={birthdayDescription}
                      onChange={(e) => setBirthdayDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateBirthdayReward}
                    className="w-full"
                    disabled={!birthdayDescription}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    ส่งของรางวัล
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerAppManagement;
