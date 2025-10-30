import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Gift, Tag, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const RecipientsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch promotion claims
  const { data: promotionClaims, isLoading: loadingPromotions } = useQuery({
    queryKey: ['promotion-claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_promotion_claims')
        .select(`
          *,
          customer_profiles(full_name, phone),
          limited_promotions(title, discount_type, discount_value)
        `)
        .order('claimed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch customer gifts
  const { data: customerGifts, isLoading: loadingGifts } = useQuery({
    queryKey: ['customer-gifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_gifts')
        .select(`
          *,
          customer_profiles(full_name, phone),
          menu_items(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch customer rewards
  const { data: customerRewards, isLoading: loadingRewards } = useQuery({
    queryKey: ['customer-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_rewards')
        .select(`
          *,
          customer_profiles(full_name, phone),
          rewards(name, points_required)
        `)
        .order('redeemed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleDeletePromotionClaim = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_promotion_claims')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "ลบสำเร็จ",
        description: "ลบคูปองโปรโมชั่นเรียบร้อยแล้ว"
      });
      
      queryClient.invalidateQueries({ queryKey: ['promotion-claims'] });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบคูปองได้",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGift = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_gifts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "ลบสำเร็จ",
        description: "ลบของขวัญเรียบร้อยแล้ว"
      });
      
      queryClient.invalidateQueries({ queryKey: ['customer-gifts'] });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบของขวัญได้",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReward = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_rewards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "ลบสำเร็จ",
        description: "ลบรางวัลเรียบร้อยแล้ว"
      });
      
      queryClient.invalidateQueries({ queryKey: ['customer-rewards'] });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรางวัลได้",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          รายชื่อลูกค้าที่ได้รับคูปอง/ของรางวัล/โค้ด
        </CardTitle>
        <CardDescription>
          ดูและจัดการคูปอง ของรางวัล และโค้ดที่ลูกค้าได้รับ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="promotions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="promotions">คูปองโปรโมชั่น</TabsTrigger>
            <TabsTrigger value="gifts">ของขวัญ</TabsTrigger>
            <TabsTrigger value="rewards">รางวัลแต้ม</TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="space-y-4">
            {loadingPromotions ? (
              <p className="text-center py-8 text-muted-foreground">กำลังโหลด...</p>
            ) : promotionClaims && promotionClaims.length > 0 ? (
              <div className="space-y-3">
                {promotionClaims.map((claim: any) => (
                  <Card key={claim.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" />
                            <p className="font-medium">{claim.limited_promotions?.title || 'ไม่มีชื่อ'}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ลูกค้า: {claim.customer_profiles?.full_name || 'ไม่ระบุ'} ({claim.customer_profiles?.phone || 'ไม่ระบุ'})
                          </p>
                          <p className="text-sm">
                            ส่วนลด: {claim.limited_promotions?.discount_type === 'percentage' 
                              ? `${claim.limited_promotions?.discount_value}%` 
                              : `${claim.limited_promotions?.discount_value} บาท`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            รับเมื่อ: {format(new Date(claim.claimed_at), 'dd MMMM yyyy HH:mm', { locale: th })}
                          </p>
                          <p className="text-xs">
                            <span className={claim.is_used ? "text-red-500" : "text-green-500"}>
                              {claim.is_used ? '✓ ใช้แล้ว' : '○ ยังไม่ได้ใช้'}
                            </span>
                            {claim.used_at && ` - ใช้เมื่อ: ${format(new Date(claim.used_at), 'dd MMM yyyy HH:mm', { locale: th })}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePromotionClaim(claim.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">ยังไม่มีข้อมูลคูปองโปรโมชั่น</p>
            )}
          </TabsContent>

          <TabsContent value="gifts" className="space-y-4">
            {loadingGifts ? (
              <p className="text-center py-8 text-muted-foreground">กำลังโหลด...</p>
            ) : customerGifts && customerGifts.length > 0 ? (
              <div className="space-y-3">
                {customerGifts.map((gift: any) => (
                  <Card key={gift.id} className="border-l-4 border-l-secondary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-secondary" />
                            <p className="font-medium">{gift.title || 'ของขวัญ'}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ลูกค้า: {gift.customer_profiles?.full_name || 'ไม่ระบุ'} ({gift.customer_profiles?.phone || 'ไม่ระบุ'})
                          </p>
                          <p className="text-sm">
                            ประเภท: {gift.gift_type === 'points' ? 'แต้ม' : 
                                    gift.gift_type === 'discount' ? 'ส่วนลด' : 
                                    gift.gift_type === 'menu_item' ? 'เมนูฟรี' : 'อื่นๆ'}
                          </p>
                          {gift.gift_type === 'points' && <p className="text-sm">แต้ม: {gift.points_value}</p>}
                          {gift.gift_type === 'discount' && (
                            <p className="text-sm">
                              ส่วนลด: {gift.discount_type === 'percentage' 
                                ? `${gift.discount_value}%` 
                                : `${gift.discount_value} บาท`}
                            </p>
                          )}
                          {gift.gift_type === 'menu_item' && gift.menu_items && (
                            <p className="text-sm">เมนู: {gift.menu_items.name}</p>
                          )}
                          {gift.promo_code && <p className="text-sm font-mono">โค้ด: {gift.promo_code}</p>}
                          <p className="text-xs text-muted-foreground">
                            ส่งเมื่อ: {format(new Date(gift.created_at), 'dd MMMM yyyy HH:mm', { locale: th })}
                          </p>
                          <p className="text-xs">
                            <span className={gift.is_used ? "text-red-500" : "text-green-500"}>
                              {gift.is_used ? '✓ ใช้แล้ว' : '○ ยังไม่ได้ใช้'}
                            </span>
                            {gift.used_at && ` - ใช้เมื่อ: ${format(new Date(gift.used_at), 'dd MMM yyyy HH:mm', { locale: th })}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGift(gift.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">ยังไม่มีข้อมูลของขวัญ</p>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            {loadingRewards ? (
              <p className="text-center py-8 text-muted-foreground">กำลังโหลด...</p>
            ) : customerRewards && customerRewards.length > 0 ? (
              <div className="space-y-3">
                {customerRewards.map((reward: any) => (
                  <Card key={reward.id} className="border-l-4 border-l-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-accent" />
                            <p className="font-medium">{reward.rewards?.name || 'รางวัล'}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ลูกค้า: {reward.customer_profiles?.full_name || 'ไม่ระบุ'} ({reward.customer_profiles?.phone || 'ไม่ระบุ'})
                          </p>
                          <p className="text-sm">
                            แต้มที่ใช้: {reward.rewards?.points_required || 0} แต้ม
                          </p>
                          <p className="text-xs text-muted-foreground">
                            แลกเมื่อ: {format(new Date(reward.redeemed_at), 'dd MMMM yyyy HH:mm', { locale: th })}
                          </p>
                          <p className="text-xs">
                            <span className={reward.is_used ? "text-red-500" : "text-green-500"}>
                              {reward.is_used ? '✓ ใช้แล้ว' : '○ ยังไม่ได้ใช้'}
                            </span>
                            {reward.used_at && ` - ใช้เมื่อ: ${format(new Date(reward.used_at), 'dd MMM yyyy HH:mm', { locale: th })}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReward(reward.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">ยังไม่มีข้อมูลรางวัล</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecipientsList;
