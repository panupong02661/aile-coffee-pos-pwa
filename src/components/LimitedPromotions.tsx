
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
  min_purchase?: number;
}

const LimitedPromotions = () => {
  const [promotions, setPromotions] = useState<LimitedPromotion[]>([]);
  const [claimedPromotions, setClaimedPromotions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch limited promotions from database
  const fetchPromotions = async () => {
    try {
      console.log('🔄 Starting to fetch limited promotions...');
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('limited_promotions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('📊 Raw data from database:', data);
      console.log('❌ Database error:', error);

      if (error) {
        console.error('❌ Error fetching promotions:', error);
        setError(`Database error: ${error.message}`);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: `ไม่สามารถโหลดโปรโมชั่นได้: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No data returned from database');
        setError('No promotions found in database');
        setPromotions([]);
        return;
      }

      // Transform the data
      const transformedPromotions: LimitedPromotion[] = data.map(item => {
        console.log('🔄 Processing promotion:', item.title);
        return {
          id: item.id,
          title: item.title,
          description: item.description || '',
          discount_value: Number(item.discount_value),
          discount_type: item.discount_type as 'percentage' | 'amount',
          max_claims: item.max_claims,
          current_claims: item.current_claims,
          start_date: item.start_date,
          end_date: item.end_date,
          is_active: item.is_active,
          promo_code: item.promo_code,
          min_purchase: item.min_purchase
        };
      });

      console.log('✅ Transformed promotions:', transformedPromotions);
      setPromotions(transformedPromotions);
    } catch (error) {
      console.error('❌ Unexpected error in fetchPromotions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Unexpected error: ${errorMessage}`);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดโปรโมชั่นได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check which promotions user has already claimed
  const checkClaimedPromotions = async () => {
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
      console.log('🎯 Claiming promotion:', promotion.title);
      
      // Update promotion claims count
      const { error } = await supabase
        .from('limited_promotions')
        .update({ current_claims: promotion.current_claims + 1 })
        .eq('id', promotionId);

      if (error) {
        console.error('❌ Error updating promotion claims:', error);
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถรับคูปองได้', variant: 'destructive' });
        return;
      }

      // Generate coupon code
      const couponCode = `${promotion.promo_code || 'PROMO'}${Date.now().toString().slice(-4)}`;

      // Create customer gift entry (assuming we have a current user)
      const currentUser = JSON.parse(localStorage.getItem('customerAuth') || '{}');
      if (currentUser.id) {
        const { error: giftError } = await supabase
          .from('customer_gifts')
          .insert({
            customer_id: currentUser.id,
            gift_id: promotionId,
            gift_type: 'promotion',
            gift_name: promotion.title,
            gift_description: promotion.description + (promotion.min_purchase && promotion.min_purchase > 0 ? ` (ยอดขั้นต่ำ: ${promotion.min_purchase}฿)` : ''),
            gift_value: promotion.discount_value,
            gift_code: couponCode,
            expires_at: promotion.end_date,
            message: `โปรโมชั่นพิเศษ: ${promotion.description}`
          });

        if (giftError) {
          console.error('❌ Error creating gift:', giftError);
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

      console.log('✅ Promotion claimed successfully:', couponCode);
    } catch (error) {
      console.error('❌ Error claiming promotion:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการรับคูปอง', variant: 'destructive' });
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const diff = new Date(endTime).getTime() - now.getTime();
    
    if (diff <= 0) return 'หมดเวลา';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `เหลือ ${days} วัน`;
    if (hours > 0) return `เหลือ ${hours} ชั่วโมง`;
    return `เหลือ ${minutes} นาที`;
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const formatDiscountDisplay = (value: number, type: 'percentage' | 'amount') => {
    if (type === 'percentage') {
      return `${value}% OFF`;
    } else {
      return `฿${value} OFF`;
    }
  };

  const isPromotionActive = (promotion: LimitedPromotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    return promotion.is_active && now >= startDate && now <= endDate;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">โปรโมชั่นพิเศษ</h2>
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">
            Limited Time!
          </span>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">กำลังโหลดโปรโมชั่น...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">โปรโมชั่นพิเศษ</h2>
        </div>
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-medium">เกิดข้อผิดพลาด</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={fetchPromotions}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
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

      {/* Debug info */}
      <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4">
        📊 Debug: พบโปรโมชั่น {promotions.length} รายการ | 
        เปิดใช้งาน: {promotions.filter(p => p.is_active).length} รายการ | 
        ในช่วงเวลา: {promotions.filter(p => isPromotionActive(p)).length} รายการ
        <br />
        🔍 Database connection: OK | Error: {error || 'None'}
      </div>

      {promotions.length > 0 ? (
        promotions.map(promotion => (
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
                    {promotion.min_purchase && promotion.min_purchase > 0 && (
                      <div className="flex items-center space-x-1">
                        <Gift className="h-4 w-4" />
                        <span>ยอดขั้นต่ำ: {promotion.min_purchase}฿</span>
                      </div>
                    )}
                  </div>
                  
                  {promotion.min_purchase && promotion.min_purchase > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      *ขั้นต่ำ ฿{promotion.min_purchase}
                    </p>
                  )}

                  {/* Debug info per promotion */}
                  <div className="text-xs text-gray-400 mt-1">
                    🔍 Active: {promotion.is_active ? 'Yes' : 'No'} | 
                    Start: {new Date(promotion.start_date).toLocaleDateString()} | 
                    End: {new Date(promotion.end_date).toLocaleDateString()} |
                    In time range: {isPromotionActive(promotion) ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold mb-2">
                    {formatDiscountDisplay(promotion.discount_value, promotion.discount_type)}
                  </div>
                  {promotion.promo_code && (
                    <div className="text-xs text-gray-500">
                      โค้ด: {promotion.promo_code}
                    </div>
                  )}
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
                  !isPromotionActive(promotion)
                }
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                  claimedPromotions.includes(promotion.id)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : promotion.current_claims >= promotion.max_claims
                    ? 'bg-red-300 text-red-700 cursor-not-allowed'
                    : !isPromotionActive(promotion)
                    ? 'bg-red-300 text-red-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {claimedPromotions.includes(promotion.id)
                  ? '✓ รับแล้ว'
                  : promotion.current_claims >= promotion.max_claims
                  ? 'หมดแล้ว'
                  : !isPromotionActive(promotion)
                  ? 'หมดเวลา'
                  : '🎁 รับคูปอง'
                }
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>ไม่มีโปรโมชั่นพิเศษในขณะนี้</p>
          <p className="text-sm mt-2">อาจเป็นเพราะ:</p>
          <ul className="text-sm mt-1 space-y-1">
            <li>• ไม่มีโปรโมชั่นในฐานข้อมูล</li>
            <li>• โปรโมชั่นไม่อยู่ในช่วงเวลาที่กำหนด</li>
            <li>• โปรโมชั่นถูกปิดใช้งาน</li>
          </ul>
          <button 
            onClick={fetchPromotions}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            รีเฟรช
          </button>
        </div>
      )}
    </div>
  );
};

export default LimitedPromotions;
