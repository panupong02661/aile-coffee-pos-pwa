
import React from 'react';
import CouponsTabsSection from './CouponsTabsSection';

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

interface Coupon {
  id: string;
  name: string;
  code: string;
  discount_value: number;
  discount_type: string;
  is_used: boolean;
  end_date: string;
}

interface CouponsSectionProps {
  coupons: Coupon[];
  rewards?: Reward[];
  currentUser?: CustomerProfile | null;
  onRedeemReward?: (rewardId: string, pointsRequired: number) => void;
}

const CouponsSection = ({ coupons, rewards = [], currentUser = null, onRedeemReward = () => {} }: CouponsSectionProps) => {
  return (
    <div className="space-y-6">
      <CouponsTabsSection 
        rewards={rewards}
        currentUser={currentUser}
        onRedeemReward={onRedeemReward}
      />
    </div>
  );
};

export default CouponsSection;
