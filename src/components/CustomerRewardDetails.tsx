import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Award, Star, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface CustomerReward {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_tier: string;
  customer_points: number;
  reward_title: string;
  reward_description: string;
  claimed_at: string;
  used_at: string | null;
  is_used: boolean;
}

const CustomerRewardDetails = () => {
  const [rewards, setRewards] = useState<CustomerReward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<CustomerReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('limited_reward_claims')
        .select(`
          id,
          customer_id,
          claimed_at,
          limited_rewards (
            title,
            description
          )
        `)
        .order('claimed_at', { ascending: false });

      if (error) throw error;

      // Fetch member details
      const customerIds = [...new Set(data?.map(item => item.customer_id) || [])];
      const { data: members, error: memberError } = await supabase
        .from('members')
        .select('id, name, phone, tier, points')
        .in('id', customerIds);

      if (memberError) throw memberError;

      const memberMap = new Map(members?.map(m => [m.id, m]) || []);

      const formatted: CustomerReward[] = data?.map(item => {
        const member = memberMap.get(item.customer_id);
        const reward = item.limited_rewards as any;
        return {
          id: item.id,
          customer_id: item.customer_id,
          customer_name: member?.name || 'ไม่ระบุ',
          customer_phone: member?.phone || '-',
          customer_tier: member?.tier || 'silver',
          customer_points: member?.points || 0,
          reward_title: reward?.title || 'รางวัล',
          reward_description: reward?.description || '',
          claimed_at: item.claimed_at,
          used_at: null, // limited_reward_claims doesn't have used_at
          is_used: false // Assuming not used by default
        };
      }) || [];

      setRewards(formatted);
      setFilteredRewards(formatted);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลรางวัลได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRewards(rewards);
    } else {
      const filtered = rewards.filter(reward =>
        reward.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.customer_phone.includes(searchTerm) ||
        reward.reward_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRewards(filtered);
    }
  }, [searchTerm, rewards]);

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      platinum: { label: 'แพลตตินัม', className: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white' },
      gold: { label: 'โกลด์', className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' },
      silver: { label: 'ซิลเวอร์', className: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' }
    };
    return tierConfig[tier as keyof typeof tierConfig] || tierConfig.silver;
  };

  const totalUsed = filteredRewards.filter(r => r.is_used).length;
  const totalUnused = filteredRewards.filter(r => !r.is_used).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              รายชื่อลูกค้าที่ได้รับรางวัลแต้ม
            </span>
            <div className="flex gap-2">
              <Badge variant="secondary">ทั้งหมด {filteredRewards.length}</Badge>
              <Badge className="bg-green-100 text-green-800">ใช้แล้ว {totalUsed}</Badge>
              <Badge className="bg-blue-100 text-blue-800">ยังไม่ใช้ {totalUnused}</Badge>
            </div>
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, เบอร์โทร หรือชื่อรางวัล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredRewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลรางวัล'}
              </div>
            ) : (
              filteredRewards.map((reward) => {
                const tierInfo = getTierBadge(reward.customer_tier);
                return (
                  <Card 
                    key={reward.id}
                    className={`border-l-4 ${reward.is_used ? 'border-l-green-500 bg-green-50/30' : 'border-l-yellow-500'}`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Customer Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{reward.customer_name}</h4>
                                <Badge className={tierInfo.className}>
                                  {tierInfo.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{reward.customer_phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-purple-600">{reward.customer_points} แต้ม</span>
                          </div>
                        </div>

                        {/* Reward Details */}
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{reward.reward_title}</h5>
                              {reward.reward_description && (
                                <p className="text-xs text-muted-foreground">{reward.reward_description}</p>
                              )}
                            </div>
                            {reward.is_used ? (
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                ใช้แล้ว
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                ยังไม่ใช้
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>รับเมื่อ: {new Date(reward.claimed_at).toLocaleDateString('th-TH')}</span>
                          </div>
                          {reward.is_used && reward.used_at && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>ใช้เมื่อ: {new Date(reward.used_at).toLocaleDateString('th-TH')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRewardDetails;
