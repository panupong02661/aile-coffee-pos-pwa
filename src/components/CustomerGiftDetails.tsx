import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Award, Gift, Calendar, CheckCircle, XCircle } from 'lucide-react';

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

const CustomerGiftDetails = () => {
  const [gifts, setGifts] = useState<CustomerGift[]>([]);
  const [filteredGifts, setFilteredGifts] = useState<CustomerGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

      setGifts(formatted);
      setFilteredGifts(formatted);
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
      setFilteredGifts(gifts);
    } else {
      const filtered = gifts.filter(gift =>
        gift.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.customer_phone.includes(searchTerm) ||
        gift.gift_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGifts(filtered);
    }
  }, [searchTerm, gifts]);

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      platinum: { label: 'แพลตตินัม', className: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white' },
      gold: { label: 'โกลด์', className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' },
      silver: { label: 'ซิลเวอร์', className: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' }
    };
    return tierConfig[tier as keyof typeof tierConfig] || tierConfig.silver;
  };

  const totalUsed = filteredGifts.filter(g => g.is_used).length;
  const totalUnused = filteredGifts.filter(g => !g.is_used).length;

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
              <Gift className="w-5 h-5" />
              รายชื่อลูกค้าที่ได้รับของขวัญ
            </span>
            <div className="flex gap-2">
              <Badge variant="secondary">ทั้งหมด {filteredGifts.length}</Badge>
              <Badge className="bg-green-100 text-green-800">ใช้แล้ว {totalUsed}</Badge>
              <Badge className="bg-blue-100 text-blue-800">ยังไม่ใช้ {totalUnused}</Badge>
            </div>
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, เบอร์โทร หรือชื่อของขวัญ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredGifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลของขวัญ'}
              </div>
            ) : (
              filteredGifts.map((gift) => {
                const tierInfo = getTierBadge(gift.customer_tier);
                return (
                  <Card 
                    key={gift.id}
                    className={`border-l-4 ${gift.is_used ? 'border-l-green-500 bg-green-50/30' : 'border-l-pink-500'}`}
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
                                <h4 className="font-semibold">{gift.customer_name}</h4>
                                <Badge className={tierInfo.className}>
                                  {tierInfo.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{gift.customer_phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-purple-600">{gift.customer_points} แต้ม</span>
                          </div>
                        </div>

                        {/* Gift Details */}
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{gift.gift_title}</h5>
                              {gift.gift_description && (
                                <p className="text-xs text-muted-foreground">{gift.gift_description}</p>
                              )}
                              <Badge variant="outline" className="mt-2">
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
                        </div>

                        {/* Dates */}
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

export default CustomerGiftDetails;
