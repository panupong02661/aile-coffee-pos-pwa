
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
                <Card className="h-full overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                  <CardContent className="p-0 relative">
                    {/* Image/Content Section */}
                    <div className="relative aspect-square">
                      {/* REDEEM Badge */}
                      {canRedeem && (
                        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          REDEEM
                        </div>
                      )}
                      
                      {/* HOT DEAL Badge */}
                      {reward.points_required <= 30 && (
                        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          HOT DEAL
                        </div>
                      )}

                      {/* Content */}
                      {isVoucherItem ? (
                        // Voucher Design
                        <div className="h-full bg-white flex flex-col items-center justify-center p-4 relative">
                          <div className="text-xs text-gray-600 font-medium mb-1">CASH VOUCHER</div>
                          <div className="text-4xl font-bold text-gray-800 mb-1">{voucherValue}</div>
                          <div className="text-sm text-gray-600 font-medium mb-2">THB</div>
                          <div className="text-[8px] text-gray-500 text-center">
                            {voucherValue === '100' ? 'ONE HUNDRED BAHT' : 
                             voucherValue === '200' ? 'TWO HUNDRED BAHT' : 
                             `${voucherValue} BAHT`}
                          </div>
                          {/* Voucher side design */}
                          <div className="absolute right-0 top-0 h-full w-6 bg-gray-100 flex flex-col items-center justify-center">
                            <div className="text-[8px] text-gray-500 transform rotate-90 whitespace-nowrap">
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
                              <Gift className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dotted line separator */}
                    <div className="border-t-2 border-dashed border-gray-300"></div>

                    {/* Text Content */}
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-gray-800 text-center line-clamp-2 leading-tight min-h-[2.5rem]">
                        {reward.name}
                      </h4>
                    </div>

                    {/* Bottom section with points */}
                    <div className="bg-gray-50 p-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">●</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
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
