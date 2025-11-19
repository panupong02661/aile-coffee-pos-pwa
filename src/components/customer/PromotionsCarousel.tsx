import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Tag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CustomerGift {
  id: string;
  gift_name: string;
  gift_description: string | null;
  gift_value: number | null;
  expires_at: string | null;
  gift_type: string;
}

interface LimitedPromotion {
  id: string;
  title: string;
  description: string | null;
  discount_value: number;
  discount_type: string;
  max_claims: number;
  current_claims: number;
}

interface LimitedReward {
  id: string;
  name: string;
  description: string | null;
  discount_value: number | null;
  discount_type: string | null;
  reward_type: string;
}

const PromotionsCarousel = ({ customerId }: { customerId?: string }) => {
  const [gifts, setGifts] = useState<CustomerGift[]>([]);
  const [promotions, setPromotions] = useState<LimitedPromotion[]>([]);
  const [rewards, setRewards] = useState<LimitedReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, [customerId]);

  const loadPromotions = async () => {
    try {
      setIsLoading(true);

      // Load customer gifts
      if (customerId) {
        const { data: giftsData } = await supabase
          .from('customer_gifts')
          .select('*')
          .eq('customer_id', customerId)
          .eq('is_used', false)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (giftsData) setGifts(giftsData);
      }

      // Load limited promotions
      const now = new Date().toISOString();
      const { data: promotionsData } = await supabase
        .from('limited_promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (promotionsData) setPromotions(promotionsData);

      // Load limited rewards
      const { data: rewardsData } = await supabase
        .from('limited_rewards')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (rewardsData) setRewards(rewardsData);

    } catch (error) {
      console.error('Error loading promotions:', error);
      toast.error('ไม่สามารถโหลดโปรโมชั่นได้');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-3">โปรโมชั่นแนะนำ</h3>
        <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-6 animate-pulse">
          <div className="h-20"></div>
        </div>
      </div>
    );
  }

  const allItems = [
    ...gifts.map(g => ({ type: 'gift' as const, data: g })),
    ...promotions.map(p => ({ type: 'promotion' as const, data: p })),
    ...rewards.map(r => ({ type: 'reward' as const, data: r }))
  ];

  if (allItems.length === 0) {
    return (
      <div className="px-4 py-6">
        <h3 className="text-lg font-semibold mb-3">โปรโมชั่นแนะนำ</h3>
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 text-center">
          <p className="text-muted-foreground">ไม่มีโปรโมชั่นในขณะนี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h3 className="text-lg font-semibold mb-3 px-4">โปรโมชั่นแนะนำ</h3>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="px-4">
          {allItems.map((item, index) => (
            <CarouselItem key={`item-${index}`} className="basis-4/5 sm:basis-1/2 md:basis-1/3">
              {(() => {
                if (item.type === 'gift') {
                  const gift = item.data as CustomerGift;
                  return (
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white h-full">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-5 h-5" />
                          <p className="text-sm opacity-90 font-medium">ของขวัญพิเศษ</p>
                        </div>
                        <h4 className="text-xl font-bold mb-1">{gift.gift_name}</h4>
                        {gift.gift_description && (
                          <p className="text-sm opacity-90 mb-2 line-clamp-2">{gift.gift_description}</p>
                        )}
                        {gift.gift_value && (
                          <p className="text-lg font-semibold mt-auto">มูลค่า {gift.gift_value} บาท</p>
                        )}
                        <div className="text-4xl mt-2 text-right">🎁</div>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'promotion') {
                  const promo = item.data as LimitedPromotion;
                  const availableClaims = promo.max_claims - promo.current_claims;
                  return (
                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white h-full">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-5 h-5" />
                          <p className="text-sm opacity-90 font-medium">โปรโมชั่นพิเศษ</p>
                        </div>
                        <h4 className="text-xl font-bold mb-1 line-clamp-2">{promo.title}</h4>
                        {promo.description && (
                          <p className="text-sm opacity-90 mb-2 line-clamp-2">{promo.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-auto">
                          <p className="text-lg font-semibold">
                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `${promo.discount_value} บาท`}
                          </p>
                          <p className="text-xs opacity-75">
                            เหลือ {availableClaims} สิทธิ์
                          </p>
                        </div>
                        <div className="text-4xl mt-2 text-right">🎉</div>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'reward') {
                  const reward = item.data as LimitedReward;
                  return (
                    <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white h-full">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5" />
                          <p className="text-sm opacity-90 font-medium">รางวัลพิเศษ</p>
                        </div>
                        <h4 className="text-xl font-bold mb-1 line-clamp-2">{reward.name}</h4>
                        {reward.description && (
                          <p className="text-sm opacity-90 mb-2 line-clamp-2">{reward.description}</p>
                        )}
                        {reward.discount_value && (
                          <p className="text-lg font-semibold mt-auto">
                            {reward.discount_type === 'percentage' ? `${reward.discount_value}%` : `${reward.discount_value} บาท`}
                          </p>
                        )}
                        <div className="text-4xl mt-2 text-right">⭐</div>
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default PromotionsCarousel;
