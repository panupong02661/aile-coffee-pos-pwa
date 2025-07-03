
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            คูปองและโปรโมชั่น
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="special" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="special">โปรโมชั่นพิเศษ</TabsTrigger>
              <TabsTrigger value="my-coupons">คูปองของฉัน</TabsTrigger>
              <TabsTrigger value="used-coupons">คูปองที่ใช้แล้ว</TabsTrigger>
            </TabsList>
            
            <TabsContent value="special" className="mt-0 p-4">
              <LimitedPromotions />
            </TabsContent>
            
            <TabsContent value="my-coupons" className="mt-0 p-4">
              <CustomerCoupons activeOnly={true} />
            </TabsContent>
            
            <TabsContent value="used-coupons" className="mt-0 p-4">
              <CustomerCoupons usedOnly={true} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponsSection;
