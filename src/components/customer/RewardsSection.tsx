
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

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

  const getGradientColors = (type: string, index: number) => {
    const gradients = [
      'from-orange-400 to-red-400', // MEGA SALE style
      'from-blue-400 to-purple-500', // SPECIAL OFFER style  
      'from-green-400 to-emerald-500', // FREE SHIPPING style
      'from-pink-300 to-blue-300', // Free items style
    ];
    return gradients[index % gradients.length];
  };

  const handleRedeemClick = (rewardId: string, pointsRequired: number, rewardName: string) => {
    const canRedeem = (currentUser?.points || 0) >= pointsRequired;
    if (!canRedeem) return;

    // Generate a themed code for this reward
    const code = generateRewardCode(rewardName);
    setRedeemedRewards(prev => ({
      ...prev,
      [rewardId]: code
    }));

    // Call the original redeem function
    onRedeemReward(rewardId, pointsRequired);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          ของรางวัล
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Coupon-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((reward, index) => {
            const rewardType = getRewardType(reward.name);
            const discountInfo = getDiscountValue(reward.name);
            const canRedeem = (currentUser?.points || 0) >= reward.points_required;
            const rewardCode = redeemedRewards[reward.id];
            const gradientClass = getGradientColors(rewardType, index);
            
            return (
              <div key={reward.id} className="relative">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Header with gradient and title */}
                  <div className={`bg-gradient-to-r ${gradientClass} p-4 text-white`}>
                    <div className="flex items-center gap-2 mb-1">
                      {rewardType === 'discount' && <span className="text-2xl">🎯</span>}
                      {rewardType === 'free' && <span className="text-2xl">🎁</span>}
                      {rewardType === 'shipping' && <span className="text-2xl">🚚</span>}
                      {rewardType === 'item' && <span className="text-2xl">🍰</span>}
                      <h3 className="font-bold text-lg">
                        {rewardType === 'discount' ? 'MEGA SALE' : 
                         rewardType === 'shipping' ? 'FREE SHIPPING' :
                         rewardType === 'free' ? 'SPECIAL OFFER' : 
                         reward.name}
                      </h3>
                    </div>
                    <p className="text-sm opacity-90">
                      {rewardType === 'discount' ? 'ลดราคาพิเศษ!' :
                       rewardType === 'shipping' ? 'ส่งฟรี!' :
                       rewardType === 'free' ? 'ข้อเสนอพิเศษ' :
                       'ฟรีวันเกิด'}
                    </p>
                  </div>

                  {/* Main content */}
                  <div className="p-6 text-center bg-white">
                    {/* Discount Value */}
                    <div className="mb-4">
                      {rewardType === 'discount' ? (
                        <div className="text-5xl font-bold text-gray-800">
                          {discountInfo.type === 'percent' ? `${discountInfo.value}%` : `${discountInfo.value}฿`}
                        </div>
                      ) : rewardType === 'shipping' ? (
                        <div className="text-5xl font-bold text-emerald-600">FREE</div>
                      ) : rewardType === 'free' ? (
                        <div className="text-5xl font-bold text-blue-600">{discountInfo.value}฿</div>
                      ) : (
                        <div className="text-5xl font-bold text-pink-600">FREE</div>
                      )}
                    </div>

                    {/* Coupon Code Section */}
                    <div className="relative mb-4">
                      <div className="bg-gray-800 text-white py-3 px-4 rounded-lg border-2 border-dashed border-gray-400 relative">
                        {/* Circular cutouts */}
                        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
                        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
                        
                        <div className="font-bold text-lg tracking-wider">
                          {rewardCode || generateRewardCode(reward.name)}
                        </div>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                      {rewardType === 'discount' && (
                        <>
                          <p>ใช้ได้กับ: สินค้าทุกชิ้น</p>
                          <p>ยอดขั้นต่ำ: {reward.points_required * 10} บาท</p>
                        </>
                      )}
                      {rewardType === 'shipping' && (
                        <>
                          <p>ใช้ได้กับ: ทุกคำสั่งซื้อ</p>
                          <p>ยอดขั้นต่ำ: 500 บาท</p>
                        </>
                      )}
                      {rewardType === 'free' && (
                        <>
                          <p>ส่วนลด: {discountInfo.value} บาท</p>
                          <p>ยอดขั้นต่ำ: 2,000 บาท</p>
                        </>
                      )}
                      {rewardType === 'item' && (
                        <>
                          <p>เงื่อนไข: แสดงบัตรประชาชน (วันเกิด)</p>
                          <p>ใช้ได้: วันเกิด ± 3 วัน</p>
                        </>
                      )}
                      <p>หมดอายุ: 31 ธ.ค. 2025</p>
                      <p>สาขา: ทุกสาขา</p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-200">
                      {rewardCode ? (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                          onClick={() => {
                            navigator.clipboard.writeText(rewardCode);
                          }}
                        >
                          คัดลอกโค้ด
                        </Button>
                      ) : (
                        <Button
                          className={`w-full font-bold py-3 ${
                            canRedeem 
                              ? 'bg-gray-800 hover:bg-gray-900 text-white' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          onClick={() => canRedeem && handleRedeemClick(reward.id, reward.points_required, reward.name)}
                          disabled={!canRedeem}
                        >
                          {canRedeem ? 
                            (rewardType === 'item' ? '1 ชิ้นฟรี วันเกิด' : 'ใช้โค้ดร่วมกับโปรอื่น ไม่ได้') :
                            `ต้องการ ${reward.points_required} แต้ม`
                          }
                        </Button>
                      )}
                    </div>

                    {/* Points indicator */}
                    {!rewardCode && (
                      <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">●</span>
                        </div>
                        <span>{reward.points_required} แต้ม</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {rewards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>ยังไม่มีของรางวัลในขณะนี้</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardsSection;
