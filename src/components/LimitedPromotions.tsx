
import React from 'react';
import { Gift, Clock, Users, Zap } from 'lucide-react';
import { useLimitedPromotions, useClaimPromotion } from '@/hooks/useLimitedPromotions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const LimitedPromotions = () => {
  const { data: promotions = [], isLoading } = useLimitedPromotions();
  const claimPromotion = useClaimPromotion();

  // Mock customer ID - ในการใช้งานจริงจะได้จาก authentication
  const mockCustomerId = 'customer-123';

  const { data: claimedPromotions = [] } = useQuery({
    queryKey: ['customer-promotion-claims', mockCustomerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_promotion_claims')
        .select('promotion_id')
        .eq('customer_id', mockCustomerId);

      if (error) throw error;
      return data?.map(claim => claim.promotion_id) || [];
    },
  });

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'หมดเวลา';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `เหลือ ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const handleClaimPromotion = (promotionId: string) => {
    claimPromotion.mutate({ promotionId, customerId: mockCustomerId });
  };

  if (isLoading) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">โปรโมชั่นพิเศษ</h2>
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">
          Limited Time!
        </span>
      </div>

      {promotions.map(promotion => (
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
              onClick={() => handleClaimPromotion(promotion.id)}
              disabled={
                claimedPromotions.includes(promotion.id) || 
                promotion.current_claims >= promotion.max_claims ||
                new Date() > new Date(promotion.end_date) ||
                claimPromotion.isPending
              }
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                claimedPromotions.includes(promotion.id)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : promotion.current_claims >= promotion.max_claims || new Date() > new Date(promotion.end_date)
                  ? 'bg-red-300 text-red-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {claimPromotion.isPending
                ? 'กำลังรับ...'
                : claimedPromotions.includes(promotion.id)
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

      {promotions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>ไม่มีโปรโมชั่นพิเศษในขณะนี้</p>
        </div>
      )}
    </div>
  );
};

export default LimitedPromotions;
