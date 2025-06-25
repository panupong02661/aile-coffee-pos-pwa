
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
        <div className="grid grid-cols-3 gap-2">
          {rewards.map((reward) => {
            const isVoucherItem = isVoucher(reward.name);
            const voucherValue = isVoucherItem ? getVoucherValue(reward.name) : '';
            const canRedeem = (currentUser?.points || 0) >= reward.points_required;
            
            return (
              <div key={reward.id} className="relative">
                <Card className="h-full border border-gray-200 shadow-sm">
                  <CardContent className="p-2">
                    {/* REDEEM Badge */}
                    {canRedeem && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          REDEEM
                        </div>
                      </div>
                    )}
                    
                    {/* HOT DEAL Badge for certain items */}
                    {reward.points_required <= 30 && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          HOT DEAL
                        </div>
                      </div>
                    )}

                    {/* Reward Image/Content */}
                    <div className="mb-2">
                      {isVoucherItem ? (
                        // Voucher Design
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 text-center relative">
                          <div className="text-xs text-gray-600 mb-1">CASH VOUCHER</div>
                          <div className="text-2xl font-bold text-gray-800 mb-1">{voucherValue}</div>
                          <div className="text-xs text-gray-600 mb-2">THB</div>
                          <div className="text-xs text-gray-500">ONE HUNDRED BAHT</div>
                          
                          {/* Coupon design elements */}
                          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-gray-100 rounded-full transform -translate-y-1/2"></div>
                          <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-100 rounded-full transform -translate-y-1/2"></div>
                        </div>
                      ) : (
                        // Menu Item Design
                        <div className="relative">
                          {reward.image_url ? (
                            <img 
                              src={reward.image_url} 
                              alt={reward.name}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Gift className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reward Name */}
                    <div className="text-center mb-2">
                      <h4 className="text-xs font-medium text-gray-800 line-clamp-2">
                        {reward.name}
                      </h4>
                      {reward.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                          {reward.description}
                        </p>
                      )}
                    </div>

                    {/* Points Required - Only show for non-voucher items or at bottom */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 bg-yellow-100 rounded-full px-2 py-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-xs font-bold text-green-600">
                          {reward.points_required} POINTS
                        </span>
                      </div>
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
