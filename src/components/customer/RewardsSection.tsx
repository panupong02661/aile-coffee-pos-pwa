
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Star, Ticket } from 'lucide-react';

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
        <div className="grid grid-cols-2 gap-3">
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
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                          REDEEM
                        </div>
                      </div>
                    )}
                    
                    {/* HOT DEAL Badge for certain items */}
                    {reward.points_required <= 30 && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                          HOT DEAL
                        </div>
                      </div>
                    )}

                    {/* Top section with image or voucher design */}
                    <div className="h-32 bg-gradient-to-br from-orange-400 to-red-500 relative">
                      {isVoucherItem ? (
                        // Voucher Design
                        <div className="h-full flex flex-col items-center justify-center text-white p-4">
                          <div className="text-xs font-medium mb-1">CASH VOUCHER</div>
                          <div className="text-2xl font-bold mb-1">{voucherValue}</div>
                          <div className="text-xs">บาท</div>
                          
                          {/* Decorative elements */}
                          <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2"></div>
                          <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2"></div>
                          
                          {/* Dotted line */}
                          <div className="absolute bottom-6 left-4 right-4 border-b-2 border-dashed border-white/30"></div>
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
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <Gift className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom section with details */}
                    <div className="p-3">
                      {/* Reward Name */}
                      <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
                        {reward.name}
                      </h4>

                      {/* Points Required - Only for non-voucher items */}
                      {!isVoucherItem && (
                        <div className="flex items-center justify-center mb-3">
                          <div className="flex items-center gap-1 bg-yellow-100 rounded-full px-3 py-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-xs font-bold text-green-600">
                              {reward.points_required} POINTS
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Redeem Button */}
                      <Button
                        onClick={() => onRedeemReward(reward.id, reward.points_required)}
                        className={`w-full h-8 text-xs font-medium ${
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
