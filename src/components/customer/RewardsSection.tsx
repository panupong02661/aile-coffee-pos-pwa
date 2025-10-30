
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

  // Load redeemed rewards from localStorage on mount
  React.useEffect(() => {
    if (currentUser?.id) {
      const storageKey = `redeemed_rewards_${currentUser.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setRedeemedRewards(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse redeemed rewards:', e);
        }
      }
    }
  }, [currentUser?.id]);

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
      'from-orange-400 to-red-400',
      'from-blue-400 to-purple-500',
      'from-green-400 to-emerald-500',
      'from-pink-300 to-blue-300',
    ];
    return gradients[index % gradients.length];
  };

  const handleRedeemClick = (rewardId: string, pointsRequired: number, rewardName: string) => {
    const canRedeem = (currentUser?.points || 0) >= pointsRequired;
    if (!canRedeem) return;

    const code = generateRewardCode(rewardName);
    const updatedRewards = {
      ...redeemedRewards,
      [rewardId]: code
    };
    setRedeemedRewards(updatedRewards);

    // Save to localStorage
    if (currentUser?.id) {
      const storageKey = `redeemed_rewards_${currentUser.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedRewards));
    }

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
        {/* ปรับขนาดให้เล็กลง - 2x3 นิ้วบนมือถือ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {rewards.map((reward, index) => {
            const rewardType = getRewardType(reward.name);
            const discountInfo = getDiscountValue(reward.name);
            const canRedeem = (currentUser?.points || 0) >= reward.points_required;
            const rewardCode = redeemedRewards[reward.id];
            const gradientClass = getGradientColors(rewardType, index);
            
            return (
              <div key={reward.id} className="relative animate-fade-in">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  {/* Header ขนาดเล็ก */}
                  <div className={`bg-gradient-to-r ${gradientClass} p-2 text-white relative`}>
                    <div className="flex items-center gap-1 mb-1">
                      {rewardType === 'discount' && <span className="text-sm">🎯</span>}
                      {rewardType === 'free' && <span className="text-sm">🎁</span>}
                      {rewardType === 'shipping' && <span className="text-sm">🚚</span>}
                      {rewardType === 'item' && <span className="text-sm">🍰</span>}
                      <h3 className="font-bold text-xs">
                        {rewardType === 'discount' ? 'SALE' : 
                         rewardType === 'shipping' ? 'FREE' :
                         rewardType === 'free' ? 'SPECIAL' : 
                         'FREE'}
                      </h3>
                    </div>
                  </div>

                  {/* เนื้อหาหลักขนาดเล็ก */}
                  <div className="p-2 text-center bg-white relative min-h-[120px]">
                    {/* ค่าส่วนลด */}
                    <div className="mb-2">
                      {rewardType === 'discount' ? (
                        <div className="text-lg font-black text-gray-800 mb-1">
                          {discountInfo.type === 'percent' ? `${discountInfo.value}%` : `${discountInfo.value}฿`}
                        </div>
                      ) : rewardType === 'shipping' ? (
                        <div className="text-lg font-black text-emerald-600 mb-1">FREE</div>
                      ) : rewardType === 'free' ? (
                        <div className="text-lg font-black text-blue-600 mb-1">{discountInfo.value}฿</div>
                      ) : (
                        <div className="text-lg font-black text-pink-600 mb-1">FREE</div>
                      )}
                      
                      <div className="flex justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full opacity-80"></div>
                      </div>
                    </div>

                    {/* โค้ดคูปอง */}
                    <div className="relative mb-2">
                      <div className="bg-gray-800 text-white py-1 px-2 rounded border border-dashed border-gray-400 relative overflow-hidden">
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-dashed border-gray-400"></div>
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-dashed border-gray-400"></div>
                        
                        <div className="font-bold text-xs tracking-wider">
                          {rewardCode || generateRewardCode(reward.name)}
                        </div>
                      </div>
                    </div>

                    {/* เงื่อนไข */}
                    <div className="text-xs text-gray-600 mb-2 bg-gray-50 p-1 rounded">
                      <p className="truncate">ยอดขั้นต่ำ: {Math.max(500, reward.points_required * 5)} ฿</p>
                    </div>

                    {/* ปุ่มแอคชั่น */}
                    <div className="pt-1 border-t border-gray-200">
                      {rewardCode ? (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-1 text-xs shadow-md transform transition-all duration-200 hover:scale-105"
                          onClick={() => {
                            navigator.clipboard.writeText(rewardCode);
                            toast.success('คัดลอกโค้ดแล้ว!');
                          }}
                        >
                          📋 คัดลอก
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className={`w-full font-bold py-1 text-xs shadow-md transform transition-all duration-200 ${
                            canRedeem 
                              ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white hover:scale-105' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          onClick={() => canRedeem && handleRedeemClick(reward.id, reward.points_required, reward.name)}
                          disabled={!canRedeem}
                        >
                          {canRedeem ? 'รับรางวัล' : `${reward.points_required} แต้ม`}
                        </Button>
                      )}
                    </div>

                    {/* แสดงแต้มที่ต้องการ */}
                    {!rewardCode && (
                      <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-500">
                        <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white text-xs font-bold">★</span>
                        </div>
                        <span className="font-medium">{reward.points_required}</span>
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
