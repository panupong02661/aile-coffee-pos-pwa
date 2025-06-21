
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const CustomerAppManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('send-gifts');
  const [selectedReward, setSelectedReward] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    loadCustomers();
    loadRewards();
    loadPromotions();
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
    
    // Map the data to match our interface
    const mappedPromotions: Promotion[] = (data || []).map(promo => ({
      ...promo,
      discount_type: promo.type === 'percentage' ? 'percentage' : 'amount'
    }));
    
    setPromotions(mappedPromotions);
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

  const handleSendGift = async () => {
    if (selectedCustomers.length === 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกลูกค้าที่ต้องการส่งของขวัญ', variant: 'destructive' });
      return;
    }

    if (!selectedReward && !selectedPromotion) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกของขวัญหรือโปรโมชั่น', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      // จำลองการส่งของขวัญ (ในระบบจริงจะต้องมีตารางสำหรับเก็บข้อมูลการส่งของขวัญ)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({ 
        title: 'สำเร็จ', 
        description: `ส่งของขวัญให้ลูกค้า ${selectedCustomers.length} คนเรียบร้อยแล้ว` 
      });
      
      // Reset form
      setSelectedCustomers([]);
      setSelectedReward('');
      setSelectedPromotion('');
      setGiftMessage('');
      
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการส่งของขวัญ', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการแอปลูกค้า</h1>
        <p className="text-gray-600 mt-1">ส่งของขวัญและโปรโมชั่นให้ลูกค้า</p>
      </div>

      <div className="p-6">
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
                {/* Rewards Section */}
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

                <Separator />

                {/* Promotions Section */}
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
                  disabled={isLoading || selectedCustomers.length === 0 || (!selectedReward && !selectedPromotion)}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'กำลังส่ง...' : 'ส่งของขวัญ'}
                </Button>

                {/* Summary */}
                {selectedCustomers.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <div className="font-medium text-blue-800">สรุป:</div>
                    <div className="text-blue-700">
                      • ลูกค้าที่เลือก: {selectedCustomers.length} คน
                      {selectedReward && <div>• ของรางวัล: {rewards.find(r => r.id === selectedReward)?.name}</div>}
                      {selectedPromotion && <div>• โปรโมชั่น: {promotions.find(p => p.id === selectedPromotion)?.name}</div>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAppManagement;
