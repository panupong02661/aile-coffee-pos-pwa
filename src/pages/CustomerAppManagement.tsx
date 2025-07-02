
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Gift, Settings, Users, Calendar } from 'lucide-react';
import LimitedRewardsManagement from '@/components/customer/LimitedRewardsManagement';

const CustomerAppManagement = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการแอปลูกค้า</h1>
          <p className="text-gray-600 mt-2">จัดการระบบแอปพลิเคชันสำหรับลูกค้า</p>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">Customer App</span>
        </div>
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            รางวัลพิเศษ
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            โปรโมชั่น
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            ผู้ใช้งาน
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            การตั้งค่า
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <LimitedRewardsManagement />
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>จัดการโปรโมชั่น</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">ฟีเจอร์จัดการโปรโมชั่นกำลังพัฒนา</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>จัดการผู้ใช้งาน</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">ฟีเจอร์จัดการผู้ใช้งานกำลังพัฒนา</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าแอป</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">ฟีเจอร์การตั้งค่าแอปกำลังพัฒนา</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerAppManagement;
