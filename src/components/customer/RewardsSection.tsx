
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';
import { toast } from 'sonner';

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
        {/* Compact Coupon-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rewards.map((reward, index) => {
            const rewardType = getRewardType(reward.name);
            const discountInfo = getDiscountValue(reward.name);
            const canRedeem = (currentUser?.points || 0) >= reward.points_required;
            const rewardCode = redeemedRewards[reward.id];
            const gradientClass = getGradientColors(rewardType, index);
            
            return (
              <div key={reward.id} className="relative animate-fade-in">
                <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  {/* Compact Header with gradient and title */}
                  <div className={`bg-gradient-to-r ${gradientClass} p-3 text-white relative`}>
                    <div className="flex items-center gap-2 mb-1">
                      {rewardType === 'discount' && <span className="text-lg">🎯</span>}
                      {rewardType === 'free' && <span className="text-lg">🎁</span>}
                      {rewardType === 'shipping' && <span className="text-lg">🚚</span>}
                      {rewardType === 'item' && <span className="text-lg">🍰</span>}
                      <h3 className="font-bold text-lg">
                        {rewardType === 'discount' ? 'MEGA SALE' : 
                         rewardType === 'shipping' ? 'FREE SHIPPING' :
                         rewardType === 'free' ? 'SPECIAL OFFER' : 
                         reward.name}
                      </h3>
                    </div>
                    <p className="text-xs opacity-90">
                      {rewardType === 'discount' ? 'ลดราคาพิเศษ!' :
                       rewardType === 'shipping' ? 'ส่งฟรี!' :
                       rewardType === 'free' ? 'ข้อเสนอพิเศษ' :
                       'ฟรีวันเกิด'}
                    </p>
                  </div>

                  {/* Compact Main content */}
                  <div className="p-4 text-center bg-white relative">
                    {/* Discount Value */}
                    <div className="mb-4">
                      {rewardType === 'discount' ? (
                        <div className="text-4xl font-black text-gray-800 mb-2">
                          {discountInfo.type === 'percent' ? `${discountInfo.value}%` : `${discountInfo.value}฿`}
                        </div>
                      ) : rewardType === 'shipping' ? (
                        <div className="text-4xl font-black text-emerald-600 mb-2">FREE</div>
                      ) : rewardType === 'free' ? (
                        <div className="text-4xl font-black text-blue-600 mb-2">{discountInfo.value}฿</div>
                      ) : (
                        <div className="text-4xl font-black text-pink-600 mb-2">FREE</div>
                      )}
                      
                      {/* Small decoration */}
                      <div className="flex justify-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full opacity-80"></div>
                      </div>
                    </div>

                    {/* Compact Coupon Code Section */}
                    <div className="relative mb-4">
                      <div className="bg-gray-800 text-white py-2 px-4 rounded border-2 border-dashed border-gray-400 relative overflow-hidden">
                        {/* Smaller Circular cutouts */}
                        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-dashed border-gray-400"></div>
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-dashed border-gray-400"></div>
                        
                        <div className="font-bold text-sm tracking-widest">
                          {rewardCode || generateRewardCode(reward.name)}
                        </div>
                      </div>
                    </div>

                    {/* Compact Conditions */}
                    <div className="text-xs text-gray-600 mb-4 space-y-1 bg-gray-50 p-2 rounded">
                      {rewardType === 'discount' && (
                        <>
                          <p><strong>ใช้ได้กับ:</strong> สินค้าทุกชิ้น</p>
                          <p><strong>ยอดขั้นต่ำ:</strong> {Math.max(1000, reward.points_required * 10)} บาท</p>
                        </>
                      )}
                      {rewardType === 'shipping' && (
                        <>
                          <p><strong>ใช้ได้กับ:</strong> ทุกคำสั่งซื้อ</p>
                          <p><strong>ยอดขั้นต่ำ:</strong> 500 บาท</p>
                        </>
                      )}
                      {rewardType === 'free' && (
                        <>
                          <p><strong>ส่วนลด:</strong> {discountInfo.value} บาท</p>
                          <p><strong>ยอดขั้นต่ำ:</strong> 2,000 บาท</p>
                        </>
                      )}
                      {rewardType === 'item' && (
                        <>
                          <p><strong>เงื่อนไข:</strong> แสดงบัตรประชาชน (วันเกิด)</p>
                          <p><strong>ใช้ได้:</strong> วันเกิด ± 3 วัน</p>
                        </>
                      )}
                      <p><strong>หมดอายุ:</strong> 31 ธ.ค. 2025</p>
                    </div>

                    {/* Compact Action Button */}
                    <div className="pt-2 border-t border-gray-200">
                      {rewardCode ? (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 text-sm shadow-lg transform transition-all duration-200 hover:scale-105"
                          onClick={() => {
                            navigator.clipboard.writeText(rewardCode);
                            toast.success('คัดลอกโค้ดแล้ว!');
                          }}
                        >
                          📋 คัดลอกโค้ด
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className={`w-full font-bold py-2 text-sm shadow-lg transform transition-all duration-200 ${
                            canRedeem 
                              ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white hover:scale-105' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          onClick={() => canRedeem && handleRedeemClick(reward.id, reward.points_required, reward.name)}
                          disabled={!canRedeem}
                        >
                          {canRedeem ? 'รับรางวัล' : `ต้องการ ${reward.points_required} แต้ม`}
                        </Button>
                      )}
                    </div>

                    {/* Compact Points indicator */}
                    {!rewardCode && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                        <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs font-bold">★</span>
                        </div>
                        <span className="font-medium">{reward.points_required} แต้ม</span>
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
