
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LimitedPromotions from '../LimitedPromotions';
import MyCoupons from './MyCoupons';
import UsedCoupons from './UsedCoupons';
import RewardsSection from './RewardsSection';

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

interface CouponsTabsSectionProps {
  rewards?: Reward[];
  currentUser?: CustomerProfile | null;
  onRedeemReward?: (rewardId: string, pointsRequired: number) => void;
}

const CouponsTabsSection = ({ rewards = [], currentUser = null, onRedeemReward = () => {} }: CouponsTabsSectionProps) => {
  const [activeTab, setActiveTab] = useState('rewards');

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rewards" className="text-sm">
            ของรางวัล
          </TabsTrigger>
          <TabsTrigger value="promotions" className="text-sm">
            โปรโมชั่นพิเศษ
          </TabsTrigger>
          <TabsTrigger value="my-coupons" className="text-sm">
            คูปองของฉัน
          </TabsTrigger>
          <TabsTrigger value="used-coupons" className="text-sm">
            คูปองที่ใช้แล้ว
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="mt-4">
          <RewardsSection 
            rewards={rewards} 
            currentUser={currentUser} 
            onRedeemReward={onRedeemReward}
          />
        </TabsContent>

        <TabsContent value="promotions" className="mt-4">
          <LimitedPromotions />
        </TabsContent>

        <TabsContent value="my-coupons" className="mt-4">
          <MyCoupons />
        </TabsContent>

        <TabsContent value="used-coupons" className="mt-4">
          <UsedCoupons />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CouponsTabsSection;
