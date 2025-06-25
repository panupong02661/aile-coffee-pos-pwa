
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const isVoucherItem = isVoucher(reward.name);
            const voucherValue = isVoucherItem ? getVoucherValue(reward.name) : '';
            const canRedeem = (currentUser?.points || 0) >= reward.points_required;
            
            return (
              <div key={reward.id} className="relative">
                <Card className="h-full overflow-hidden shadow-md">
                  <CardContent className="p-0">
                    {/* Top section with image/voucher and badges */}
                    <div className="relative h-40 bg-gray-50">
                      {/* REDEEM Badge */}
                      {canRedeem && (
                        <Badge className="absolute top-2 right-2 z-10 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2 py-1">
                          REDEEM
                        </Badge>
                      )}
                      
                      {/* HOT DEAL Badge */}
                      {reward.points_required <= 30 && (
                        <Badge className="absolute top-2 left-2 z-10 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-2 py-1">
                          HOT DEAL
                        </Badge>
                      )}

                      {/* Content */}
                      {isVoucherItem ? (
                        // Voucher Design
                        <div className="h-full bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4">
                          <div className="text-xs text-gray-600 font-medium mb-1">CASH VOUCHER</div>
                          <div className="text-2xl font-bold text-gray-800 mb-1">{voucherValue}</div>
                          <div className="text-xs text-gray-600 font-medium mb-2">THB</div>
                          <div className="text-[10px] text-gray-500">
                            {voucherValue === '100' ? 'ONE HUNDRED BAHT' : 
                             voucherValue === '200' ? 'TWO HUNDRED BAHT' : 
                             `${voucherValue} BAHT`}
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
                              <Gift className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom section with details */}
                    <div className="p-3">
                      {/* Reward Name */}
                      <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 leading-tight min-h-[2.5rem]">
                        {reward.name}
                      </h4>

                      {/* Dotted line separator */}
                      <div className="border-b border-dashed border-gray-300 mb-3"></div>

                      {/* Points Required */}
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">●</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">
                            {reward.points_required} POINTS
                          </span>
                        </div>
                      </div>

                      {/* Redeem Button */}
                      <Button
                        onClick={() => onRedeemReward(reward.id, reward.points_required)}
                        className={`w-full h-8 text-sm font-medium ${
                          canRedeem 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                        }`}
                        disabled={!canRedeem}
                      >
                        {canRedeem ? 'คัดลอกโค้ด' : `ต้องการ ${reward.points_required} แต้ม`}
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
