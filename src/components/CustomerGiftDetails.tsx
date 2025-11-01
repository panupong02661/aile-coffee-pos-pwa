import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Gift, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerGift {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_tier: string;
  customer_points: number;
  gift_title: string;
  gift_description: string;
  gift_type: string;
  created_at: string;
  used_at: string | null;
  is_used: boolean;
}

interface CustomerSummary {
  customer_id: string;
  customer_name: string;
  customer_tier: string;
  customer_points: number;
  total_gifts: number;
  used_gifts: number;
  unused_gifts: number;
  gifts: CustomerGift[];
}

const CustomerGiftDetails = () => {
  const [customerSummaries, setCustomerSummaries] = useState<CustomerSummary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_gifts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch member details
      const customerIds = [...new Set(data?.map(item => item.customer_id) || [])];
      const { data: members, error: memberError } = await supabase
        .from('members')
        .select('id, name, phone, tier, points')
        .in('id', customerIds);

      if (memberError) throw memberError;

      const memberMap = new Map(members?.map(m => [m.id, m]) || []);

        const formatted: CustomerGift[] = data?.map(item => {
        const member = memberMap.get(item.customer_id);
        return {
          id: item.id,
          customer_id: item.customer_id,
          customer_name: member?.name || 'ไม่ระบุ',
          customer_phone: member?.phone || '-',
          customer_tier: member?.tier || 'silver',
          customer_points: member?.points || 0,
          gift_title: item.gift_name || 'ของขวัญ',
          gift_description: item.gift_description || '',
          gift_type: item.gift_type || 'general',
          created_at: item.created_at,
          used_at: item.used_at,
          is_used: item.is_used || false
        };
      }) || [];

      // Group by customer
      const customerMap = new Map<string, CustomerSummary>();
      formatted.forEach(gift => {
        if (!customerMap.has(gift.customer_id)) {
          customerMap.set(gift.customer_id, {
            customer_id: gift.customer_id,
            customer_name: gift.customer_name,
            customer_tier: gift.customer_tier,
            customer_points: gift.customer_points,
            total_gifts: 0,
            used_gifts: 0,
            unused_gifts: 0,
            gifts: []
          });
        }
        const summary = customerMap.get(gift.customer_id)!;
        summary.gifts.push(gift);
        summary.total_gifts++;
        if (gift.is_used) {
          summary.used_gifts++;
        } else {
          summary.unused_gifts++;
        }
      });

      const summaries = Array.from(customerMap.values());
      setCustomerSummaries(summaries);
      setFilteredSummaries(summaries);
    } catch (error) {
      console.error('Error fetching gifts:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลของขวัญได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
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

  const totalUsed = filteredSummaries.reduce((sum, s) => sum + s.used_gifts, 0);
  const totalUnused = filteredSummaries.reduce((sum, s) => sum + s.unused_gifts, 0);

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
                <Gift className="w-5 h-5" />
                รายชื่อลูกค้าที่ได้รับของขวัญ
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
                    <TableHead className="text-center">รอใช้งาน<br />ของขวัญ</TableHead>
                    <TableHead className="text-center">ใช้งานแล้ว<br />ของขวัญ</TableHead>
                    <TableHead className="text-center w-[100px]">ดูรายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSummaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลของขวัญ'}
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
                            <Badge variant="outline" className="bg-pink-50">
                              {summary.unused_gifts}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-50">
                              {summary.used_gifts}
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
              <Gift className="w-5 h-5" />
              รายละเอียดของขวัญ - {selectedCustomer?.customer_name}
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
                  <p className="text-sm text-muted-foreground">ของขวัญทั้งหมด</p>
                  <p className="text-lg font-semibold">{selectedCustomer.total_gifts} รางวัล</p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedCustomer.gifts.map((gift) => (
                  <Card 
                    key={gift.id}
                    className={`border-l-4 ${gift.is_used ? 'border-l-green-500 bg-green-50/30' : 'border-l-pink-500'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">{gift.gift_title}</h5>
                          {gift.gift_description && (
                            <p className="text-sm text-muted-foreground mb-2">{gift.gift_description}</p>
                          )}
                          <Badge variant="outline">
                            {gift.gift_type === 'birthday' ? 'ของขวัญวันเกิด' : 'ของขวัญทั่วไป'}
                          </Badge>
                        </div>
                        {gift.is_used ? (
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
                          <span>ได้รับเมื่อ: {new Date(gift.created_at).toLocaleDateString('th-TH')}</span>
                        </div>
                        {gift.is_used && gift.used_at && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>ใช้เมื่อ: {new Date(gift.used_at).toLocaleDateString('th-TH')}</span>
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

export default CustomerGiftDetails;
