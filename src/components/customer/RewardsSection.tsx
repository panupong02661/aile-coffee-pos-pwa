
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Star } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  image_url?: string;
  is_active: boolean;
}

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

interface RewardsSectionProps {
  rewards: Reward[];
  currentUser: CustomerProfile;
  onRedeemReward: (rewardId: string, pointsRequired: number) => Promise<void>;
}

const RewardsSection: React.FC<RewardsSectionProps> = ({ 
  rewards, 
  currentUser, 
  onRedeemReward 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          ของรางวัล
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium">{reward.name}</h4>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{reward.points_required} แต้ม</span>
                  </div>
                </div>
              </div>
              <Button 
                size="sm"
                onClick={() => onRedeemReward(reward.id, reward.points_required)}
                disabled={(currentUser?.points || 0) < reward.points_required}
              >
                แลก
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsSection;
