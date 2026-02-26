import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { PartyPopper, Stamp, Gift, RotateCcw, Calendar, Award, Loader2 } from 'lucide-react';

interface CustomerEngagementProps {
  currentUser: {
    id: string;
    tier: string;
    points: number;
  } | null;
}

const tierOrder: Record<string, number> = { silver: 1, gold: 2, platinum: 3 };

const CustomerEngagement = ({ currentUser }: CustomerEngagementProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<Record<string, any[]>>({});
  const [claims, setClaims] = useState<any[]>([]);
  const [stampCards, setStampCards] = useState<any[]>([]);
  const [customerStampCards, setCustomerStampCards] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) fetchAll();
  }, [currentUser?.id]);

  const fetchAll = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Fetch active festival events - use date-only comparison for broader match
      const today = new Date().toISOString().split('T')[0];
      const { data: eventsData } = await supabase
        .from('festival_events')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', today + 'T23:59:59.999Z')
        .gte('end_date', today + 'T00:00:00.000Z')
        .order('created_at', { ascending: false });

      // Fetch prizes for active events
      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(e => e.id);
        const { data: prizesData } = await supabase
          .from('festival_prizes')
          .select('*')
          .in('festival_event_id', eventIds)
          .eq('is_active', true);
        
        if (prizesData) {
          const grouped: Record<string, any[]> = {};
          prizesData.forEach((p: any) => {
            if (!grouped[p.festival_event_id]) grouped[p.festival_event_id] = [];
            grouped[p.festival_event_id].push(p);
          });
          setPrizes(grouped);
        }

        // Fetch user's claims
        const { data: claimsData } = await supabase
          .from('customer_prize_claims')
          .select('*')
          .eq('customer_id', currentUser.id)
          .in('festival_event_id', eventIds);
        
        setClaims(claimsData || []);
      }

      setEvents(eventsData || []);

      // Fetch active stamp cards
      const { data: cardsData } = await supabase
        .from('stamp_cards')
        .select('*')
        .eq('is_active', true);
      
      setStampCards(cardsData || []);

      if (cardsData && cardsData.length > 0) {
        const { data: customerCards } = await supabase
          .from('customer_stamp_cards')
          .select('*, customer_stamps(*)')
          .eq('customer_id', currentUser.id);
        
        setCustomerStampCards(customerCards || []);

        const cardIds = cardsData.map(c => c.id);
        const { data: milestonesData } = await supabase
          .from('stamp_card_milestones')
          .select('*')
          .in('stamp_card_id', cardIds)
          .eq('is_active', true)
          .order('stamp_number');
        
        if (milestonesData) {
          const grouped: Record<string, any[]> = {};
          milestonesData.forEach((m: any) => {
            if (!grouped[m.stamp_card_id]) grouped[m.stamp_card_id] = [];
            grouped[m.stamp_card_id].push(m);
          });
          setMilestones(grouped);
        }
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canParticipate = (event: any) => {
    if (!currentUser) return false;
    const userTierLevel = tierOrder[currentUser.tier] || 1;
    const requiredTierLevel = tierOrder[event.min_tier] || 1;
    return userTierLevel >= requiredTierLevel;
  };

  const getClaimsForEvent = (eventId: string) => {
    return claims.filter(c => c.festival_event_id === eventId);
  };

  const handleClaimPrize = async (event: any) => {
    if (!currentUser || claimingId) return;

    if (!canParticipate(event)) {
      toast({ title: 'ระดับสมาชิกไม่ถึง', description: `ต้องเป็นระดับ ${event.min_tier} ขึ้นไป`, variant: 'destructive' });
      return;
    }

    const eventClaims = getClaimsForEvent(event.id);
    if (eventClaims.length >= (event.max_claims_per_customer || 1)) {
      toast({ title: 'รับสิทธิ์ครบแล้ว', description: 'คุณได้รับสิทธิ์ครบตามจำนวนที่กำหนดแล้ว', variant: 'destructive' });
      return;
    }

    const eventPrizes = prizes[event.id];
    if (!eventPrizes || eventPrizes.length === 0) {
      toast({ title: 'ไม่มีรางวัล', description: 'กิจกรรมนี้ยังไม่มีรางวัล', variant: 'destructive' });
      return;
    }

    setClaimingId(event.id);

    try {
      const eligiblePrizes = eventPrizes.filter(p => {
        const prizeTierLevel = tierOrder[p.min_tier] || 1;
        const userTierLevel = tierOrder[currentUser.tier] || 1;
        const hasStock = !p.total_quantity || p.claimed_quantity < p.total_quantity;
        return userTierLevel >= prizeTierLevel && hasStock;
      });

      if (eligiblePrizes.length === 0) {
        toast({ title: 'รางวัลหมดแล้ว', description: 'ไม่มีรางวัลที่พร้อมให้รับ', variant: 'destructive' });
        setClaimingId(null);
        return;
      }

      const totalWeight = eligiblePrizes.reduce((sum: number, p: any) => sum + (p.probability_weight || 1), 0);
      let random = Math.random() * totalWeight;
      let selectedPrize = eligiblePrizes[0];
      for (const prize of eligiblePrizes) {
        random -= (prize.probability_weight || 1);
        if (random <= 0) { selectedPrize = prize; break; }
      }

      const claimCode = `${event.event_type.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

      const { error: claimError } = await supabase
        .from('customer_prize_claims')
        .insert({
          customer_id: currentUser.id,
          festival_event_id: event.id,
          festival_prize_id: selectedPrize.id,
          prize_name: selectedPrize.name,
          prize_type: selectedPrize.prize_type,
          prize_value: selectedPrize.prize_value,
          claim_code: claimCode,
          reward_expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        });

      if (claimError) {
        toast({ title: 'เกิดข้อผิดพลาด', description: claimError.message, variant: 'destructive' });
        setClaimingId(null);
        return;
      }

      await supabase
        .from('festival_prizes')
        .update({ claimed_quantity: (selectedPrize.claimed_quantity || 0) + 1 })
        .eq('id', selectedPrize.id);

      toast({
        title: '🎉 ยินดีด้วย!',
        description: `คุณได้รับ: ${selectedPrize.name}! รหัส: ${claimCode}`,
      });

      await fetchAll();
    } catch (error) {
      console.error('Claim error:', error);
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setClaimingId(null);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'lucky_envelope': return '🧧';
      case 'spin_wheel': return '🎡';
      case 'advent_calendar': return '🎄';
      case 'gift_box': return '🎁';
      default: return '🎉';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'lucky_envelope': return 'อั่งเปาสุ่มรางวัล';
      case 'spin_wheel': return 'วงล้อนำโชค';
      case 'advent_calendar': return 'Advent Calendar';
      case 'gift_box': return 'กล่องสุ่ม';
      default: return 'กิจกรรม';
    }
  };

  const getPrizeLabel = (type: string, value: number) => {
    switch (type) {
      case 'discount_percent': return `ส่วนลด ${value}%`;
      case 'discount_fixed': return `ส่วนลด ${value} บาท`;
      case 'free_item': return 'แถมสินค้า';
      case 'free_drink': return 'เครื่องดื่มฟรี';
      case 'bonus_points': return `แต้มโบนัส +${value}`;
      case 'coupon': return 'คูปอง';
      case 'no_prize': return 'เสียใจด้วย';
      default: return type;
    }
  };

  const getMilestoneLabel = (m: any) => {
    switch (m.reward_type) {
      case 'discount_percent':
        return `ส่วนลด % ${m.reward_value}%`;
      case 'discount_fixed':
        return `ส่วนลด (บาท) ${m.reward_value} บาท`;
      case 'free_item':
        return m.reward_description || 'แถมสินค้า';
      case 'free_drink':
        return m.reward_description || 'แถมเครื่องดื่ม';
      case 'bonus_points':
        return `แต้มโบนัส +${m.reward_value}`;
      case 'custom':
        return m.reward_description || 'รางวัลพิเศษ';
      default:
        return m.reward_description || `${m.reward_type} ${m.reward_value}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const hasContent = events.length > 0 || stampCards.length > 0;

  if (!hasContent) {
    return (
      <div className="px-4 py-8 text-center">
        <PartyPopper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">ยังไม่มีกิจกรรมในขณะนี้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Festival Events */}
      {events.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-primary" />
            กิจกรรมพิเศษ
          </h3>
          {events.map((event) => {
            const eventClaims = getClaimsForEvent(event.id);
            const maxClaims = event.max_claims_per_customer || 1;
            const canClaim = canParticipate(event) && eventClaims.length < maxClaims;
            const eligible = canParticipate(event);

            return (
              <Card
                key={event.id}
                className="overflow-hidden"
                style={{ borderLeft: `4px solid ${event.theme_color || 'hsl(var(--primary))'}` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{getEventIcon(event.event_type)}</span>
                      <div>
                        <h4 className="font-bold text-base">{event.name}</h4>
                        <p className="text-xs text-muted-foreground">{getEventLabel(event.event_type)}</p>
                      </div>
                    </div>
                    <Badge variant={eligible ? 'default' : 'secondary'} className="text-xs">
                      {eligible ? `${eventClaims.length}/${maxClaims} ครั้ง` : `ต้อง ${event.min_tier}+`}
                    </Badge>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  )}

                  <p className="text-xs text-muted-foreground mb-3">
                    📅 {new Date(event.start_date).toLocaleDateString('th-TH')} — {new Date(event.end_date).toLocaleDateString('th-TH')}
                  </p>

                  {/* Show claimed prizes */}
                  {eventClaims.length > 0 && (
                    <div className="space-y-1 mb-3">
                      <p className="text-xs font-medium text-muted-foreground">รางวัลที่ได้รับ:</p>
                      {eventClaims.map((claim: any) => (
                        <div key={claim.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/50 text-sm">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            <span>{claim.prize_name} — {getPrizeLabel(claim.prize_type, claim.prize_value)}</span>
                          </div>
                          <Badge variant={claim.is_used ? 'secondary' : 'default'} className="text-xs">
                            {claim.is_used ? 'ใช้แล้ว' : claim.claim_code}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {canClaim && (
                    <Button
                      className="w-full"
                      onClick={() => handleClaimPrize(event)}
                      disabled={claimingId === event.id}
                      style={{
                        backgroundColor: event.theme_color || undefined,
                      }}
                    >
                      {claimingId === event.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังสุ่ม...</>
                      ) : (
                        <><Gift className="w-4 h-4 mr-2" /> {event.event_type === 'lucky_envelope' ? 'เปิดอั่งเปา' : event.event_type === 'spin_wheel' ? 'หมุนวงล้อ' : 'รับรางวัล'}</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stamp Cards */}
      {stampCards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Stamp className="w-5 h-5 text-primary" />
            บัตรสะสมแสตมป์
          </h3>
          {stampCards.map((card) => {
            const customerCard = customerStampCards.find((cc: any) => cc.stamp_card_id === card.id && !cc.is_completed);
            const currentStamps = customerCard?.current_stamps || 0;
            const cardMilestones = milestones[card.id] || [];

            return (
              <Card key={card.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">{card.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {currentStamps}/{card.total_stamps} แสตมป์
                    </Badge>
                  </div>

                  {card.description && (
                    <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
                  )}

                  {/* Stamp visualization */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.from({ length: card.total_stamps }, (_, i) => {
                      const isFilled = i < currentStamps;
                      const milestone = cardMilestones.find((m: any) => m.stamp_number === i + 1);
                      return (
                        <div
                          key={i}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            isFilled
                              ? milestone
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-primary bg-primary/20 text-primary'
                              : milestone
                                ? 'border-amber-400 bg-amber-50 text-amber-600'
                                : 'border-border bg-background text-muted-foreground'
                          }`}
                        >
                          {isFilled ? '✓' : milestone ? <Award className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                      );
                    })}
                  </div>

                  {/* Milestones info - formatted like admin */}
                  {cardMilestones.length > 0 && (
                    <div className="space-y-1">
                      {cardMilestones.map((m: any) => (
                        <div key={m.id} className={`text-xs p-1.5 rounded flex items-center gap-1.5 ${
                          currentStamps >= m.stamp_number ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                        }`}>
                          <Award className="w-3 h-3" />
                          <span>แสตมป์ที่ {m.stamp_number}: {getMilestoneLabel(m)}</span>
                          {currentStamps >= m.stamp_number && <Badge className="text-[10px] ml-auto">ปลดล็อค!</Badge>}
                        </div>
                      ))}
                    </div>
                  )}

                  {card.min_purchase_per_stamp > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      * ซื้อขั้นต่ำ ฿{card.min_purchase_per_stamp} ต่อ 1 แสตมป์
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerEngagement;
