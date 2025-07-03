
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import LimitedPromotions from '../LimitedPromotions';
import CustomerCoupons from '../CustomerCoupons';

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
      {/* โปรโมชั่นพิเศษ Limited Time */}
      <LimitedPromotions />
      
      {/* คูปองปกติของลูกค้า */}
      <CustomerCoupons />
    </div>
  );
};

export default CouponsSection;
