
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
                <Card className={`h-full transition-all duration-200 ${canRedeem ? 'border-green-300 shadow-md' : 'border-gray-200'}`}>
                  <CardContent className="p-3">
                    {/* Reward Image/Icon Section */}
                    <div className="mb-3">
                      {isVoucherItem ? (
                        // Voucher Design
                        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-4 text-white text-center relative overflow-hidden">
                          {/* Decorative circles */}
                          <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full opacity-20"></div>
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full opacity-20"></div>
                          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white rounded-full opacity-20"></div>
                          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white rounded-full opacity-20"></div>
                          
                          <Ticket className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-xs font-medium mb-1">คูปองส่วนลด</div>
                          <div className="text-lg font-bold">{voucherValue}฿</div>
                          
                          {/* Dashed border effect */}
                          <div className="absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-white opacity-30 transform -translate-y-1/2"></div>
                        </div>
                      ) : (
                        // Menu Item Design
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center h-24">
                          {reward.image_url ? (
                            <img 
                              src={reward.image_url} 
                              alt={reward.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="text-center">
                              <Gift className="w-8 h-8 text-gray-500 mx-auto mb-1" />
                              <div className="text-xs text-gray-600">เมนูฟรี</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reward Info */}
                    <div className="text-center mb-3">
                      <h4 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                        {reward.name}
                      </h4>
                      {reward.description && (
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {reward.description}
                        </p>
                      )}
                    </div>

                    {/* Points Required */}
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold text-orange-600">
                        {reward.points_required}
                      </span>
                    </div>

                    {/* Redeem Button */}
                    <Button
                      size="sm"
                      className={`w-full text-xs font-medium ${
                        canRedeem 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => canRedeem && onRedeemReward(reward.id, reward.points_required)}
                      disabled={!canRedeem}
                    >
                      {canRedeem ? 'แลกรางวัล' : 'แต้มไม่พอ'}
                    </Button>
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
