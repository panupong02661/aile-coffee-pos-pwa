
import React from 'react';
import CouponsTabsSection from './CouponsTabsSection';

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
}

const CouponsSection = ({ coupons }: CouponsSectionProps) => {
  return (
    <div className="space-y-6">
      <CouponsTabsSection />
    </div>
  );
};

export default CouponsSection;
