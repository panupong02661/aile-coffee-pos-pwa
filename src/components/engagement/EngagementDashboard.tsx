
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stamp, PartyPopper, Gift, Users, Award, TrendingUp, BarChart3, Percent } from 'lucide-react';

const EngagementDashboard = () => {
  const [stats, setStats] = useState({
    totalStampCards: 0, activeStampCards: 0,
    totalFestivalEvents: 0, activeFestivalEvents: 0,
    totalPrizeClaims: 0, usedPrizeClaims: 0,
    totalCustomerStampCards: 0, completedStampCards: 0,
    totalPrizes: 0,
  });
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const [
      { count: totalStampCards },
      { count: activeStampCards },
      { count: totalFestivalEvents },
      { count: activeFestivalEvents },
      { count: totalPrizeClaims },
      { count: usedPrizeClaims },
      { count: totalCustomerStampCards },
      { count: completedStampCards },
      { count: totalPrizes },
      { data: claims },
    ] = await Promise.all([
      supabase.from('stamp_cards').select('*', { count: 'exact', head: true }),
      supabase.from('stamp_cards').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('festival_events').select('*', { count: 'exact', head: true }),
      supabase.from('festival_events').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('customer_prize_claims').select('*', { count: 'exact', head: true }),
      supabase.from('customer_prize_claims').select('*', { count: 'exact', head: true }).eq('is_used', true),
      supabase.from('customer_stamp_cards').select('*', { count: 'exact', head: true }),
      supabase.from('customer_stamp_cards').select('*', { count: 'exact', head: true }).eq('is_completed', true),
      supabase.from('festival_prizes').select('*', { count: 'exact', head: true }),
      supabase.from('customer_prize_claims').select('*').order('claimed_at', { ascending: false }).limit(10),
    ]);

    setStats({
      totalStampCards: totalStampCards || 0, activeStampCards: activeStampCards || 0,
      totalFestivalEvents: totalFestivalEvents || 0, activeFestivalEvents: activeFestivalEvents || 0,
      totalPrizeClaims: totalPrizeClaims || 0, usedPrizeClaims: usedPrizeClaims || 0,
      totalCustomerStampCards: totalCustomerStampCards || 0, completedStampCards: completedStampCards || 0,
      totalPrizes: totalPrizes || 0,
    });
    setRecentClaims(claims || []);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-8">กำลังโหลด...</div>;

  const statCards = [
    { label: 'บัตรแสตมป์', value: stats.activeStampCards, sub: `จากทั้งหมด ${stats.totalStampCards}`, icon: Stamp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'กิจกรรมเทศกาล', value: stats.activeFestivalEvents, sub: `จากทั้งหมด ${stats.totalFestivalEvents}`, icon: PartyPopper, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'รางวัลในระบบ', value: stats.totalPrizes, sub: 'รายการรางวัล', icon: Gift, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'รางวัลที่แจกไป', value: stats.totalPrizeClaims, sub: `ใช้แล้ว ${stats.usedPrizeClaims}`, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'ลูกค้าถือบัตร', value: stats.totalCustomerStampCards, sub: `สะสมครบ ${stats.completedStampCards}`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'อัตราการใช้รางวัล', value: stats.totalPrizeClaims > 0 ? `${((stats.usedPrizeClaims / stats.totalPrizeClaims) * 100).toFixed(0)}%` : '0%', sub: 'Redemption Rate', icon: Percent, color: 'text-coffee-600', bg: 'bg-coffee-50' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <BarChart3 className="w-5 h-5" /> แดชบอร์ด Engagement
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">รางวัลที่แจกล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          {recentClaims.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีการแจกรางวัล</p>
          ) : (
            <div className="space-y-2">
              {recentClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-2 rounded border text-sm">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{claim.prize_name}</span>
                    <Badge variant={claim.is_used ? 'secondary' : 'default'} className="text-xs">
                      {claim.is_used ? 'ใช้แล้ว' : 'ยังไม่ใช้'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(claim.claimed_at).toLocaleDateString('th-TH')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementDashboard;
