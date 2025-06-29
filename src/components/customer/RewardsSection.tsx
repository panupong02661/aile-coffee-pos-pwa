
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

  const isVoucher = (rewardName: string) => {
    return rewardName.toLowerCase().includes('voucher') || 
           rewardName.toLowerCase().includes('คูปอง') || 
           rewardName.toLowerCase().includes('บาท');
  };

  const getVoucherValue = (rewardName: string) => {
    const match = rewardName.match(/(\d+)\s*บาท/);
    return match ? match[1] : '200';
  };

  const generateRewardCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleRedeemClick = (rewardId: string, pointsRequired: number) => {
    const canRedeem = (currentUser?.points || 0) >= pointsRequired;
    if (!canRedeem) return;

    // Generate a unique code for this reward
    const code = generateRewardCode();
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
        {/* Updated grid: 2 columns on mobile, 4-5 columns on tablet+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {rewards.map((reward) => {
            const isVoucherItem = isVoucher(reward.name);
            const voucherValue = isVoucherItem ? getVoucherValue(reward.name) : '';
            const canRedeem = (currentUser?.points || 0) >= reward.points_required;
            const rewardCode = redeemedRewards[reward.id];
            
            return (
              <div key={reward.id} className="relative">
                <Card className="h-full overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                  <CardContent className="p-0 relative">
                    {/* Image/Content Section - Made smaller */}
                    <div className="relative aspect-square">
                      {/* REDEEM Badge - Smaller */}
                      {canRedeem && (
                        <div className="absolute top-1 right-1 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          REDEEM
                        </div>
                      )}
                      
                      {/* HOT DEAL Badge - Smaller */}
                      {reward.points_required <= 30 && (
                        <div className="absolute top-1 left-1 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          HOT DEAL
                        </div>
                      )}

                      {/* Content */}
                      {isVoucherItem ? (
                        // Voucher Design - Smaller
                        <div className="h-full bg-white flex flex-col items-center justify-center p-2 relative">
                          <div className="text-[8px] text-gray-600 font-medium mb-0.5">CASH VOUCHER</div>
                          <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-0.5">{voucherValue}</div>
                          <div className="text-xs text-gray-600 font-medium mb-1">THB</div>
                          <div className="text-[6px] md:text-[8px] text-gray-500 text-center">
                            {voucherValue === '100' ? 'ONE HUNDRED BAHT' : 
                             voucherValue === '200' ? 'TWO HUNDRED BAHT' : 
                             `${voucherValue} BAHT`}
                          </div>
                          {/* Voucher side design - Smaller */}
                          <div className="absolute right-0 top-0 h-full w-4 bg-gray-100 flex flex-col items-center justify-center">
                            <div className="text-[6px] md:text-[8px] text-gray-500 transform rotate-90 whitespace-nowrap">
                              COUPON
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Menu Item Image
                        <div className="h-full">
                          {reward.image_url ? (
                            <img 
                              src={reward.image_url} 
                              alt={reward.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Gift className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Text Content - Smaller */}
                    <div className="p-2">
                      <h4 className="text-xs md:text-sm font-medium text-gray-800 text-center line-clamp-2 leading-tight min-h-[2rem] md:min-h-[2.5rem]">
                        {reward.name}
                      </h4>
                    </div>

                    {/* Dotted line separator */}
                    <div className="border-t-2 border-dashed border-gray-300 mx-2"></div>

                    {/* Bottom section with points/code - Smaller */}
                    <div className="bg-gray-50 p-2">
                      {rewardCode ? (
                        // Show code after redemption
                        <div className="text-center">
                          <div className="text-[10px] text-gray-600 mb-1">โค้ดของคุณ</div>
                          <div className="text-sm md:text-lg font-bold text-green-600 mb-1">{rewardCode}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[10px] md:text-xs px-2 py-0.5 h-6"
                            onClick={() => {
                              navigator.clipboard.writeText(rewardCode);
                            }}
                          >
                            คัดลอกโค้ด
                          </Button>
                        </div>
                      ) : (
                        // Show points and redeem button
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">●</span>
                            </div>
                            <span className="text-sm md:text-lg font-bold text-green-600">
                              {reward.points_required}
                            </span>
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-600 mb-1">POINTS</div>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-[10px] md:text-xs px-2 py-0.5 h-6"
                            onClick={() => handleRedeemClick(reward.id, reward.points_required)}
                            disabled={!canRedeem}
                          >
                            ใช้โค้ด
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
