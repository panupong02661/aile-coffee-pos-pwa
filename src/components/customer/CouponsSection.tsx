
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          คูปองของฉัน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-600 py-8">ยังไม่มีคูปอง</div>
      </CardContent>
    </Card>
  );
};

export default CouponsSection;
