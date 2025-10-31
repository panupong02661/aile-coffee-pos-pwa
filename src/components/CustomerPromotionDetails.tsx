import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Award, Gift, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface CustomerPromotion {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_tier: string;
  customer_points: number;
  promotion_title: string;
  promotion_description: string;
  claimed_at: string;
  used_at: string | null;
  is_used: boolean;
}

const CustomerPromotionDetails = () => {
  const [promotions, setPromotions] = useState<CustomerPromotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<CustomerPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_promotion_claims')
        .select(`
          id,
          customer_id,
          claimed_at,
          used_at,
          is_used,
          promotion_id,
          limited_promotions (
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

      const formatted: CustomerPromotion[] = data?.map(item => {
        const member = memberMap.get(item.customer_id);
        const promotion = item.limited_promotions as any;
        return {
          id: item.id,
          customer_id: item.customer_id,
          customer_name: member?.name || 'ไม่ระบุ',
          customer_phone: member?.phone || '-',
          customer_tier: member?.tier || 'silver',
          customer_points: member?.points || 0,
          promotion_title: promotion?.title || 'โปรโมชั่น',
          promotion_description: promotion?.description || '',
          claimed_at: item.claimed_at,
          used_at: item.used_at,
          is_used: item.is_used
        };
      }) || [];

      setPromotions(formatted);
      setFilteredPromotions(formatted);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลคูปองได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPromotions(promotions);
    } else {
      const filtered = promotions.filter(promo =>
        promo.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.customer_phone.includes(searchTerm) ||
        promo.promotion_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPromotions(filtered);
    }
  }, [searchTerm, promotions]);

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      platinum: { label: 'แพลตตินัม', className: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white' },
      gold: { label: 'โกลด์', className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' },
      silver: { label: 'ซิลเวอร์', className: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' }
    };
    return tierConfig[tier as keyof typeof tierConfig] || tierConfig.silver;
  };

  const totalUsed = filteredPromotions.filter(p => p.is_used).length;
  const totalUnused = filteredPromotions.filter(p => !p.is_used).length;

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
              รายชื่อลูกค้าที่ได้รับคูปองโปรโมชั่น
            </span>
            <div className="flex gap-2">
              <Badge variant="secondary">ทั้งหมด {filteredPromotions.length}</Badge>
              <Badge className="bg-green-100 text-green-800">ใช้แล้ว {totalUsed}</Badge>
              <Badge className="bg-blue-100 text-blue-800">ยังไม่ใช้ {totalUnused}</Badge>
            </div>
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, เบอร์โทร หรือชื่อโปรโมชั่น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredPromotions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลคูปอง'}
              </div>
            ) : (
              filteredPromotions.map((promo) => {
                const tierInfo = getTierBadge(promo.customer_tier);
                return (
                  <Card 
                    key={promo.id}
                    className={`border-l-4 ${promo.is_used ? 'border-l-green-500 bg-green-50/30' : 'border-l-blue-500'}`}
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
                                <h4 className="font-semibold">{promo.customer_name}</h4>
                                <Badge className={tierInfo.className}>
                                  {tierInfo.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{promo.customer_phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-purple-600">{promo.customer_points} แต้ม</span>
                          </div>
                        </div>

                        {/* Promotion Details */}
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{promo.promotion_title}</h5>
                              {promo.promotion_description && (
                                <p className="text-xs text-muted-foreground">{promo.promotion_description}</p>
                              )}
                            </div>
                            {promo.is_used ? (
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
                            <span>หมดอายุ: {new Date(promo.claimed_at).toLocaleDateString('th-TH')}</span>
                          </div>
                          {promo.is_used && promo.used_at && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>ใช้เมื่อ: {new Date(promo.used_at).toLocaleDateString('th-TH')}</span>
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

export default CustomerPromotionDetails;
