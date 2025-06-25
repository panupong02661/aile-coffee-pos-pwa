
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const isVoucher = (rewardName: string) => {
    return rewardName.toLowerCase().includes('voucher') || 
           rewardName.toLowerCase().includes('คูปอง') || 
           rewardName.toLowerCase().includes('บาท');
  };

  const getVoucherValue = (rewardName: string) => {
    const match = rewardName.match(/(\d+)\s*บาท/);
    return match ? match[1] : '100';
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
        <div className="grid grid-cols-3 gap-2">
          {rewards.map((reward) => {
            const isVoucherItem = isVoucher(reward.name);
            const voucherValue = isVoucherItem ? getVoucherValue(reward.name) : '';
            const canRedeem = (currentUser?.points || 0) >= reward.points_required;
            
            return (
              <div key={reward.id} className="relative">
                <Card className="h-full border border-gray-200 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    {/* REDEEM Badge */}
                    {canRedeem && (
                      <div className="absolute top-1 right-1 z-10">
                        <div className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">
                          REDEEM
                        </div>
                      </div>
                    )}
                    
                    {/* HOT DEAL Badge */}
                    {reward.points_required <= 30 && (
                      <div className="absolute top-1 left-1 z-10">
                        <div className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">
                          HOT DEAL
                        </div>
                      </div>
                    )}

                    {/* Top section with image or voucher design */}
                    <div className="h-20 bg-white relative">
                      {isVoucherItem ? (
                        // Voucher Design - White background with voucher styling
                        <div className="h-full bg-white border border-gray-200 flex flex-col items-center justify-center relative">
                          <div className="text-[8px] text-gray-600 font-medium mb-0.5">CASH VOUCHER</div>
                          <div className="text-lg font-bold text-gray-800 mb-0.5">{voucherValue}</div>
                          <div className="text-[8px] text-gray-600 font-medium">THB</div>
                          <div className="text-[6px] text-gray-500 mt-0.5">ONE HUNDRED BAHT</div>
                          
                          {/* Coupon text at bottom right */}
                          <div className="absolute bottom-1 right-1 text-[6px] text-gray-400 transform -rotate-90 origin-bottom-right">
                            COUPON
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
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Gift className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dotted divider line */}
                    <div className="border-b border-dashed border-gray-300 mx-2"></div>

                    {/* Bottom section with details */}
                    <div className="p-2">
                      {/* Reward Name */}
                      <h4 className="text-[10px] font-medium text-gray-800 mb-1 line-clamp-2 leading-tight">
                        {reward.name}
                      </h4>

                      {/* Points Required */}
                      <div className="flex items-center justify-center mb-2">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                          <span className="text-[9px] font-bold text-green-600">
                            {reward.points_required} POINTS
                          </span>
                        </div>
                      </div>

                      {/* Redeem Button */}
                      <Button
                        onClick={() => onRedeemReward(reward.id, reward.points_required)}
                        className={`w-full h-6 text-[9px] font-medium ${
                          canRedeem 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!canRedeem}
                      >
                        {canRedeem ? 'แลกรางวัล' : `ต้องการ ${reward.points_required} แต้ม`}
                      </Button>
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
