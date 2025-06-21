
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Gift, User, Star, Search, Send, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  name: string;
  phone: string;
  tier: string;
  points: number;
  email?: string;
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
  type: string;
  is_active: boolean;
}

const GiftManagement = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [selectedGiftType, setSelectedGiftType] = useState<'reward' | 'promotion' | 'points'>('reward');
  const [selectedGiftId, setSelectedGiftId] = useState('');
  const [pointsAmount, setPointsAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchRewards();
    fetchPromotions();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลสมาชิกได้', variant: 'destructive' });
      return;
    }
    setMembers(data || []);
  };

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_required');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดของรางวัลได้', variant: 'destructive' });
      return;
    }
    setRewards(data || []);
  };

  const fetchPromotions = async () => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดโปรโมชั่นได้', variant: 'destructive' });
      return;
    }
    setPromotions(data || []);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'ทองแดง';
      case 'silver': return 'เงิน';
      case 'gold': return 'ทอง';
      case 'platinum': return 'แพลทินัม';
      default: return tier;
    }
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  const sendGift = async () => {
    if (!selectedMember) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกสมาชิก', variant: 'destructive' });
      return;
    }

    if (selectedGiftType !== 'points' && !selectedGiftId) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกของขวัญ', variant: 'destructive' });
      return;
    }

    if (selectedGiftType === 'points' && pointsAmount <= 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาใส่จำนวนแต้ม', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      if (selectedGiftType === 'points') {
        // Add points to member
        const { error: updateError } = await supabase
          .from('members')
          .update({ points: selectedMember.points + pointsAmount })
          .eq('id', selectedMember.id);

        if (updateError) throw updateError;

        // Record point transaction
        const { error: transactionError } = await supabase
          .from('point_transactions')
          .insert({
            member_id: selectedMember.id,
            transaction_type: 'gift',
            points_change: pointsAmount,
            description: `ได้รับแต้มสะสมจากของขวัญ: ${giftMessage || 'ไม่มีข้อความ'}`
          });

        if (transactionError) throw transactionError;
      }

      toast({ 
        title: 'สำเร็จ', 
        description: `ส่งของขวัญให้ ${selectedMember.name} เรียบร้อยแล้ว` 
      });
      
      // Reset form
      setSelectedMember(null);
      setSelectedGiftId('');
      setPointsAmount(0);
      setGiftMessage('');
      fetchMembers(); // Refresh member data
      
    } catch (error: any) {
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: `ไม่สามารถส่งของขวัญได้: ${error.message}`, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Gift className="w-8 h-8" />
              ระบบส่งของขวัญให้ลูกค้า
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Member Selection */}
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">เลือกสมาชิก</Label>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-3"
                    />
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2 bg-gray-50">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedMember?.id === member.id 
                            ? 'bg-purple-100 border-2 border-purple-500' 
                            : 'bg-white border hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-purple-100 text-purple-800">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{member.name}</h4>
                            <p className="text-sm text-gray-600">{member.phone}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getTierColor(member.tier)}>
                                {getTierName(member.tier)}
                              </Badge>
                              <span className="text-sm text-purple-600 font-medium">
                                {member.points} แต้ม
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gift Selection */}
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">เลือกประเภทของขวัญ</Label>
                  <Tabs value={selectedGiftType} onValueChange={(value) => setSelectedGiftType(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="reward">ของรางวัล</TabsTrigger>
                      <TabsTrigger value="promotion">โปรโมชั่น</TabsTrigger>
                      <TabsTrigger value="points">แต้มสะสม</TabsTrigger>
                    </TabsList>

                    <TabsContent value="reward" className="space-y-4">
                      <Select value={selectedGiftId} onValueChange={setSelectedGiftId}>
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
                    </TabsContent>

                    <TabsContent value="promotion" className="space-y-4">
                      <Select value={selectedGiftId} onValueChange={setSelectedGiftId}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกโปรโมชั่น" />
                        </SelectTrigger>
                        <SelectContent>
                          {promotions.map((promotion) => (
                            <SelectItem key={promotion.id} value={promotion.id}>
                              {promotion.name} (ลด {promotion.discount_value}
                              {promotion.type === 'percentage' ? '%' : ' บาท'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TabsContent>

                    <TabsContent value="points" className="space-y-4">
                      <div>
                        <Label>จำนวนแต้มที่จะให้</Label>
                        <Input
                          type="number"
                          value={pointsAmount || ''}
                          onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                          placeholder="กรอกจำนวนแต้ม"
                          min="1"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">ข้อความแนบ</Label>
                  <Textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="พิมพ์ข้อความให้ลูกค้า..."
                    rows={4}
                  />
                </div>

                {selectedMember && (
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">สรุปการส่งของขวัญ</h4>
                      <p><strong>ผู้รับ:</strong> {selectedMember.name}</p>
                      <p><strong>เบอร์โทร:</strong> {selectedMember.phone}</p>
                      <p><strong>ประเภทของขวัญ:</strong> {
                        selectedGiftType === 'reward' ? 'ของรางวัล' :
                        selectedGiftType === 'promotion' ? 'โปรโมชั่น' : 'แต้มสะสม'
                      }</p>
                      {selectedGiftType === 'points' && pointsAmount > 0 && (
                        <p><strong>จำนวนแต้ม:</strong> {pointsAmount} แต้ม</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Button 
                  onClick={sendGift}
                  disabled={!selectedMember || isLoading}
                  className="w-full py-3 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isLoading ? 'กำลังส่ง...' : 'ส่งของขวัญ'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GiftManagement;
