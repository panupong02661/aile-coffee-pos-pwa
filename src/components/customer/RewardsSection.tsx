
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const isVoucherItem = isVoucher(reward.name);
            const voucherValue = isVoucherItem ? getVoucherValue(reward.name) : '';
            
            return (
              <div key={reward.id} className="relative">
                <Card className="h-full border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                  {/* Hot Deal Badge - for some items */}
                  {reward.points_required <= 20 && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      HOT DEAL
                    </div>
                  )}
                  
                  {/* Redeem Button */}
                  <div className="absolute top-4 left-4 z-10">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full px-3 py-1 text-xs font-medium"
                      onClick={() => onRedeemReward(reward.id, reward.points_required)}
                      disabled={(currentUser?.points || 0) < reward.points_required}
                    >
                      REDEEM
                    </Button>
                  </div>

                  <CardContent className="p-4 flex flex-col h-full">
                    {isVoucherItem ? (
                      // Voucher Layout
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 w-full">
                          <Ticket className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <div className="text-xs text-gray-600 mb-1">CASH VOUCHER</div>
                          <div className="text-2xl font-bold text-gray-800">
                            {voucherValue}<span className="text-sm">THB</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {voucherValue === '100' ? 'ONE HUNDRED BAHT' : 
                             voucherValue === '200' ? 'TWO HUNDRED BAHT' : 
                             'VOUCHER'}
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-sm text-gray-800 mb-2">
                          {reward.name}
                        </h4>
                        
                        {reward.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {reward.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      // Menu Item Layout
                      <div className="flex-1 flex flex-col">
                        <div className="bg-gray-100 rounded-lg p-4 mb-3 flex items-center justify-center min-h-[120px]">
                          {reward.image_url ? (
                            <img 
                              src={reward.image_url} 
                              alt={reward.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Gift className="w-12 h-12 text-gray-600" />
                          )}
                        </div>
                        
                        <h4 className="font-medium text-sm text-gray-800 mb-2 text-center">
                          {reward.name}
                        </h4>
                        
                        {reward.description && (
                          <p className="text-xs text-gray-600 mb-3 text-center line-clamp-2">
                            {reward.description}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Points Required */}
                    <div className="mt-auto pt-3 border-t border-dashed border-gray-200">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                        <span className="text-sm font-bold text-green-600">
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
