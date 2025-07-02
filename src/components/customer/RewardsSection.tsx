
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useLimitedRewards, useClaimLimitedReward } from '@/hooks/useLimitedRewards';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  birth_date?: string;
  gender?: string;
  tier: string;
  points: number;
  total_spent: number;
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  image_url?: string;
  is_active: boolean;
}

interface RewardsSectionProps {
  rewards: Reward[];
  currentUser: CustomerProfile | null;
  onRedeemReward: (rewardId: string, pointsRequired: number) => void;
}

const RewardsSection = ({ rewards, currentUser, onRedeemReward }: RewardsSectionProps) => {
  const [redeemedRewards, setRedeemedRewards] = React.useState<{[key: string]: string}>({});
  const { data: limitedRewards = [], isLoading: limitedLoading } = useLimitedRewards();
  const claimMutation = useClaimLimitedReward();

  const getRewardType = (rewardName: string) => {
    const name = rewardName.toLowerCase();
    if (name.includes('ส่วนลด') || name.includes('discount') || name.includes('%')) {
      return 'discount';
    }
    if (name.includes('ฟรี') || name.includes('free')) {
      return 'free';
    }
    if (name.includes('shipping') || name.includes('จัดส่ง')) {
      return 'shipping';
    }
    return 'item';
  };

  const getDiscountValue = (rewardName: string) => {
    const percentMatch = rewardName.match(/(\d+)%/);
    if (percentMatch) return { value: percentMatch[1], type: 'percent' };
    
    const amountMatch = rewardName.match(/(\d+)\s*บาท/);
    if (amountMatch) return { value: amountMatch[1], type: 'amount' };
    
    return { value: '50', type: 'percent' };
  };

  const generateRewardCode = (rewardName: string) => {
    const name = rewardName.toLowerCase();
    if (name.includes('ส่วนลด') || name.includes('discount')) {
      return 'SAVE' + Math.floor(Math.random() * 100);
    }
    if (name.includes('shipping') || name.includes('จัดส่ง')) {
      return 'FREESHIP';
    }
    if (name.includes('birthday') || name.includes('วันเกิด')) {
      return 'BIRTHDAY';
    }
    return 'REWARD' + Math.floor(Math.random() * 100);
  };

  const handleRedeemClick = (rewardId: string, pointsRequired: number, rewardName: string) => {
    const canRedeem = (currentUser?.points || 0) >= pointsRequired;
    if (!canRedeem) return;

    const code = generateRewardCode(rewardName);
    setRedeemedRewards(prev => ({
      ...prev,
      [rewardId]: code
    }));

    onRedeemReward(rewardId, pointsRequired);
  };

  const handleClaimLimitedReward = (rewardId: string) => {
    if (!currentUser) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }
    
    claimMutation.mutate({ rewardId, userId: currentUser.id });
  };

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'หมดเวลาแล้ว';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `เหลือ ${days} วัน`;
    } else if (hours > 0) {
      return `เหลือ ${hours} ชม. ${minutes} นาที`;
    } else {
      return `เหลือ ${minutes} นาที`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Limited Time Rewards Section */}
      {limitedRewards.length > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5 animate-pulse" />
              🔥 รางวัลพิเศษ - จำกัดจำนวน!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {limitedRewards.map((reward) => {
                const progress = (reward.current_claims / reward.max_claims) * 100;
                const isAlmostFull = progress >= 80;
                const isFull = reward.current_claims >= reward.max_claims;
                
                return (
                  <div key={reward.id} className="relative">
                    <div className={`bg-white rounded-lg border-2 ${isAlmostFull ? 'border-red-300' : 'border-orange-300'} shadow-lg overflow-hidden transform hover:scale-102 transition-all duration-200`}>
                      {/* Header */}
                      <div className={`p-3 text-white relative ${isAlmostFull ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⚡</span>
                            <div>
                              <h3 className="font-bold text-sm">{reward.name}</h3>
                              <p className="text-xs opacity-90">{formatTimeRemaining(reward.end_date)}</p>
                            </div>
                          </div>
                          {isAlmostFull && <Badge variant="secondary" className="text-xs bg-white text-red-600">เกือบหมด!</Badge>}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <div className="text-center mb-3">
                          <div className="text-2xl font-black text-gray-800">
                            {reward.discount_type === 'percent' ? `${reward.discount_value}%` : `${reward.discount_value}฿`}
                          </div>
                          <p className="text-xs text-gray-600">{reward.description}</p>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>ความคืบหน้า</span>
                            <span>{reward.current_claims}/{reward.max_claims}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${isAlmostFull ? 'bg-red-500' : 'bg-orange-500'}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          size="sm"
                          className={`w-full text-xs ${
                            isFull 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : isAlmostFull 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-orange-600 hover:bg-orange-700'
                          } text-white`}
                          onClick={() => handleClaimLimitedReward(reward.id)}
                          disabled={isFull || claimMutation.isPending}
                        >
                          {isFull ? 'หมดแล้ว' : claimMutation.isPending ? 'กำลังรับ...' : 'รับเลย!'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Rewards Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            ของรางวัล
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Compact grid for small coupons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {rewards.map((reward, index) => {
              const rewardType = getRewardType(reward.name);
              const discountInfo = getDiscountValue(reward.name);
              const canRedeem = (currentUser?.points || 0) >= reward.points_required;
              const rewardCode = redeemedRewards[reward.id];
              
              return (
                <div key={reward.id} className="relative">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                    {/* Mini header */}
                    <div className={`p-2 text-white text-center ${
                      rewardType === 'discount' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      rewardType === 'shipping' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      rewardType === 'free' ? 'bg-gradient-to-r from-pink-400 to-red-400' :
                      'bg-gradient-to-r from-orange-400 to-red-400'
                    }`}>
                      <div className="text-xs font-medium opacity-90">
                        {rewardType === 'discount' ? 'ส่วนลด' :
                         rewardType === 'shipping' ? 'ส่งฟรี' :
                         rewardType === 'free' ? 'ฟรี' : 'ของขวัญ'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 text-center">
                      {/* Value */}
                      <div className="mb-2">
                        <div className="text-lg font-bold text-gray-800">
                          {rewardType === 'discount' ? 
                            (discountInfo.type === 'percent' ? `${discountInfo.value}%` : `${discountInfo.value}฿`) :
                            rewardType === 'shipping' ? 'FREE' :
                            rewardType === 'free' ? `${discountInfo.value}฿` : 'FREE'
                          }
                        </div>
                      </div>

                      {/* Code section */}
                      {rewardCode ? (
                        <div className="mb-2">
                          <div className="bg-gray-800 text-white py-1 px-2 rounded text-xs font-mono">
                            {rewardCode}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-1 text-xs h-6"
                            onClick={() => {
                              navigator.clipboard.writeText(rewardCode);
                              toast.success('คัดลอกโค้ดแล้ว!');
                            }}
                          >
                            คัดลอก
                          </Button>
                        </div>
                      ) : (
                        <div className="mb-2">
                          <Button
                            size="sm"
                            className={`w-full text-xs h-6 ${
                              canRedeem 
                                ? 'bg-gray-800 hover:bg-gray-900 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={() => canRedeem && handleRedeemClick(reward.id, reward.points_required, reward.name)}
                            disabled={!canRedeem}
                          >
                            {canRedeem ? 'รับ' : `${reward.points_required} แต้ม`}
                          </Button>
                        </div>
                      )}

                      {/* Points indicator */}
                      {!rewardCode && (
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">★</span>
                          </div>
                          <span>{reward.points_required}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {rewards.length === 0 && limitedRewards.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>ยังไม่มีของรางวัลในขณะนี้</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsSection;
