
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MessageSquare, Calendar } from 'lucide-react';
import DailyReportTester from '@/components/DailyReportTester';

const NotificationPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">ระบบแจ้งเตือน</h1>
          <p className="text-muted-foreground">
            จัดการการแจ้งเตือนและรายงานอัตโนมัติ
          </p>
        </div>
      </div>

      <Tabs defaultValue="daily-reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily-reports" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            รายงานประจำวัน
          </TabsTrigger>
          <TabsTrigger value="order-notifications" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            แจ้งเตือนออเดอร์
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            ตั้งค่าทั่วไป
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>รายงานประจำวัน</CardTitle>
              <CardDescription>
                ระบบส่งรายงานสรุปยอดขายประจำวันอัตโนมัติ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DailyReportTester />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-notifications">
          <Card>
            <CardHeader>
              <CardTitle>การแจ้งเตือนออเดอร์</CardTitle>
              <CardDescription>
                ตั้งค่าการแจ้งเตือนเมื่อมีออเดอร์ใหม่
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ฟีเจอร์นี้จะเพิ่มเติมในอนาคต
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าทั่วไป</CardTitle>
              <CardDescription>
                ตั้งค่าระบบแจ้งเตือนทั่วไป
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ฟีเจอร์นี้จะเพิ่มเติมในอนาคต
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationPage;
