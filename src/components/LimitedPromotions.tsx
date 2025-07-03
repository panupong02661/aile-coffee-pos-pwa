
import React, { useState, useEffect } from 'react';
import { Gift, Clock, Users, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LimitedPromotion {
  id: string;
  title: string;
  description: string;
  discount_value: number;
  discount_type: 'percentage' | 'amount';
  max_claims: number;
  current_claims: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  promo_code?: string;
}

const LimitedPromotions = () => {
  const [promotions, setPromotions] = useState<LimitedPromotion[]>([]);
  const [claimedPromotions, setClaimedPromotions] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch limited promotions from database
  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('limited_promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching promotions:', error);
        return;
      }

      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  // Check which promotions user has already claimed
  const checkClaimedPromotions = async () => {
    // For now, we'll use localStorage to track claims since we don't have user authentication
    const claimed = localStorage.getItem('claimedPromotions');
    if (claimed) {
      setClaimedPromotions(JSON.parse(claimed));
    }
  };

  useEffect(() => {
    fetchPromotions();
    checkClaimedPromotions();
  }, []);

  const claimPromotion = async (promotionId: string) => {
    if (claimedPromotions.includes(promotionId)) {
      toast({ title: 'ข้อผิดพลาด', description: 'คุณได้รับคูปองนี้แล้ว', variant: 'destructive' });
      return;
    }

    const promotion = promotions.find(p => p.id === promotionId);
    if (!promotion) return;

    if (promotion.current_claims >= promotion.max_claims) {
      toast({ title: 'ข้อผิดพลาด', description: 'คูปองหมดแล้ว', variant: 'destructive' });
      return;
    }

    try {
      // Update promotion claims count
      const { error } = await supabase
        .from('limited_promotions')
        .update({ current_claims: promotion.current_claims + 1 })
        .eq('id', promotionId);

      if (error) {
        console.error('Error updating promotion claims:', error);
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถรับคูปองได้', variant: 'destructive' });
        return;
      }

      // Generate coupon code
      const couponCode = `${promotion.promo_code || 'PROMO'}${Date.now().toString().slice(-4)}`;

      // Create customer gift entry (assuming we have a current user)
      const currentUser = JSON.parse(localStorage.getItem('customerLoginData') || '{}');
      if (currentUser.id) {
        const { error: giftError } = await supabase
          .from('customer_gifts')
          .insert({
            customer_id: currentUser.id,
            gift_id: promotionId,
            gift_type: 'promotion',
            gift_name: promotion.title,
            gift_description: promotion.description,
            gift_value: promotion.discount_value,
            gift_code: couponCode,
            expires_at: promotion.end_date,
            message: `โปรโมชั่นพิเศษ: ${promotion.description}`
          });

        if (giftError) {
          console.error('Error creating gift:', giftError);
        }
      }

      // Update local state
      setPromotions(promotions.map(p => 
        p.id === promotionId 
          ? { ...p, current_claims: p.current_claims + 1 }
          : p
      ));

      const newClaimedPromotions = [...claimedPromotions, promotionId];
      setClaimedPromotions(newClaimedPromotions);
      localStorage.setItem('claimedPromotions', JSON.stringify(newClaimedPromotions));
      
      toast({ 
        title: 'สำเร็จ!', 
        description: `รับคูปอง ${promotion.title} แล้ว! โค้ด: ${couponCode}`,
        duration: 5000
      });
    } catch (error) {
      console.error('Error claiming promotion:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการรับคูปอง', variant: 'destructive' });
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const diff = new Date(endTime).getTime() - now.getTime();
    
    if (diff <= 0) return 'หมดเวลา';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `เหลือ ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">โปรโมชั่นพิเศษ</h2>
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">
          Limited Time!
        </span>
      </div>

      {promotions.filter(p => p.is_active).map(promotion => (
        <div key={promotion.id} className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-1">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{promotion.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{promotion.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{getTimeRemaining(promotion.end_date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{promotion.max_claims - promotion.current_claims} ใบเหลือ</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold mb-2">
                  {promotion.discount_type === 'percentage' 
                    ? `${promotion.discount_value}% OFF` 
                    : `฿${promotion.discount_value} OFF`
                  }
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>รับไปแล้ว {promotion.current_claims}/{promotion.max_claims}</span>
                <span>{Math.round(getProgressPercentage(promotion.current_claims, promotion.max_claims))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(promotion.current_claims, promotion.max_claims)}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => claimPromotion(promotion.id)}
              disabled={
                claimedPromotions.includes(promotion.id) || 
                promotion.current_claims >= promotion.max_claims ||
                new Date() > new Date(promotion.end_date)
              }
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                claimedPromotions.includes(promotion.id)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : promotion.current_claims >= promotion.max_claims || new Date() > new Date(promotion.end_date)
                  ? 'bg-red-300 text-red-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {claimedPromotions.includes(promotion.id)
                ? '✓ รับแล้ว'
                : promotion.current_claims >= promotion.max_claims
                ? 'หมดแล้ว'
                : new Date() > new Date(promotion.end_date)
                ? 'หมดเวลา'
                : '🎁 รับคูปอง'
              }
            </button>
          </div>
        </div>
      ))}

      {promotions.filter(p => p.is_active).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>ไม่มีโปรโมชั่นพิเศษในขณะนี้</p>
        </div>
      )}
    </div>
  );
};

export default LimitedPromotions;
