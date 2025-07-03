
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LimitedPromotions from '../LimitedPromotions';
import MyCoupons from './MyCoupons';
import UsedCoupons from './UsedCoupons';

const CouponsTabsSection = () => {
  const [activeTab, setActiveTab] = useState('promotions');

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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
