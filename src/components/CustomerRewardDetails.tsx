import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Star, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface CustomerSummary {
  customer_id: string;
  customer_name: string;
  customer_tier: string;
  customer_points: number;
  total_rewards: number;
  used_rewards: number;
  unused_rewards: number;
  rewards: CustomerReward[];
}

const CustomerRewardDetails = () => {
  const [customerSummaries, setCustomerSummaries] = useState<CustomerSummary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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
          used_at: null,
          is_used: false
        };
      }) || [];

      // Group by customer
      const customerMap = new Map<string, CustomerSummary>();
      formatted.forEach(reward => {
        if (!customerMap.has(reward.customer_id)) {
          customerMap.set(reward.customer_id, {
            customer_id: reward.customer_id,
            customer_name: reward.customer_name,
            customer_tier: reward.customer_tier,
            customer_points: reward.customer_points,
            total_rewards: 0,
            used_rewards: 0,
            unused_rewards: 0,
            rewards: []
          });
        }
        const summary = customerMap.get(reward.customer_id)!;
        summary.rewards.push(reward);
        summary.total_rewards++;
        if (reward.is_used) {
          summary.used_rewards++;
        } else {
          summary.unused_rewards++;
        }
      });

      const summaries = Array.from(customerMap.values());
      setCustomerSummaries(summaries);
      setFilteredSummaries(summaries);
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
      setFilteredSummaries(customerSummaries);
    } else {
      const filtered = customerSummaries.filter(summary =>
        summary.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSummaries(filtered);
    }
  }, [searchTerm, customerSummaries]);

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      platinum: { label: 'แพลตตินัม', className: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white' },
      gold: { label: 'โกลด์', className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' },
      silver: { label: 'ซิลเวอร์', className: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' }
    };
    return tierConfig[tier as keyof typeof tierConfig] || tierConfig.silver;
  };

  const totalUsed = filteredSummaries.reduce((sum, s) => sum + s.used_rewards, 0);
  const totalUnused = filteredSummaries.reduce((sum, s) => sum + s.unused_rewards, 0);

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
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                รายชื่อลูกค้าที่ได้รับรางวัลแต้ม
              </span>
              <div className="flex gap-2">
                <Badge variant="secondary">ลูกค้า {filteredSummaries.length} คน</Badge>
                <Badge className="bg-green-100 text-green-800">ใช้แล้ว {totalUsed}</Badge>
                <Badge className="bg-blue-100 text-blue-800">ยังไม่ใช้ {totalUnused}</Badge>
              </div>
            </CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="ค้นหาด้วยชื่อลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ลำดับ</TableHead>
                    <TableHead>รายชื่อ</TableHead>
                    <TableHead>ระดับสมาชิก</TableHead>
                    <TableHead className="text-right">แต้ม</TableHead>
                    <TableHead className="text-center">รอใช้งาน<br />รางวัล</TableHead>
                    <TableHead className="text-center">ใช้งานแล้ว<br />รางวัล</TableHead>
                    <TableHead className="text-center w-[100px]">ดูรายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSummaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลรางวัล'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSummaries.map((summary, index) => {
                      const tierInfo = getTierBadge(summary.customer_tier);
                      return (
                        <TableRow key={summary.customer_id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{summary.customer_name}</TableCell>
                          <TableCell>
                            <Badge className={tierInfo.className}>
                              {tierInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-purple-600">
                            {summary.customer_points.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-yellow-50">
                              {summary.unused_rewards}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-50">
                              {summary.used_rewards}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(summary);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              รายละเอียดรางวัลแต้ม - {selectedCustomer?.customer_name}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">ระดับสมาชิก</p>
                  <Badge className={getTierBadge(selectedCustomer.customer_tier).className}>
                    {getTierBadge(selectedCustomer.customer_tier).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">แต้มสะสม</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {selectedCustomer.customer_points.toLocaleString()} แต้ม
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">รางวัลทั้งหมด</p>
                  <p className="text-lg font-semibold">{selectedCustomer.total_rewards} รางวัล</p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedCustomer.rewards.map((reward) => (
                  <Card 
                    key={reward.id}
                    className={`border-l-4 ${reward.is_used ? 'border-l-green-500 bg-green-50/30' : 'border-l-yellow-500'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">{reward.reward_title}</h5>
                          {reward.reward_description && (
                            <p className="text-sm text-muted-foreground">{reward.reward_description}</p>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerRewardDetails;