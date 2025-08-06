
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Gift, Settings, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Shell } from '@/components/Shell';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';

const GamificationSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: 'บันทึกการตั้งค่า',
      description: 'การตั้งค่าระบบ Gamification ถูกบันทึกเรียบร้อยแล้ว',
    });
  };

  return (
    <Shell 
      title="ระบบ Gamification" 
      subtitle="จัดการระบบเกมส์และการให้คะแนนเพื่อเพิ่มการมีส่วนร่วมของลูกค้า"
      activeTab="other"
    >
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">
            <Trophy className="mr-2 h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="mr-2 h-4 w-4" />
            ความท้าทาย
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="mr-2 h-4 w-4" />
            รางวัล
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <TrendingUp className="mr-2 h-4 w-4" />
            ลีดเดอร์บอร์ด
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            ผู้ใช้งาน
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            ตั้งค่า
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <GamificationDashboard />
        </TabsContent>
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle>จัดการความท้าทาย</CardTitle>
              <CardDescription>สร้างและแก้ไขความท้าทายต่างๆ</CardDescription>
            </CardHeader>
            <CardContent>
              <p>เนื้อหาเกี่ยวกับความท้าทาย</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>จัดการรางวัล</CardTitle>
              <CardDescription>กำหนดรางวัลสำหรับการทำกิจกรรมต่างๆ</CardDescription>
            </CardHeader>
            <CardContent>
              <p>เนื้อหาเกี่ยวกับรางวัล</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>ลีดเดอร์บอร์ด</CardTitle>
              <CardDescription>แสดงอันดับของผู้ใช้งาน</CardDescription>
            </CardHeader>
            <CardContent>
              <p>เนื้อหาเกี่ยวกับลีดเดอร์บอร์ด</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>ผู้ใช้งาน</CardTitle>
              <CardDescription>จัดการผู้ใช้งานในระบบ</CardDescription>
            </CardHeader>
            <CardContent>
              <p>เนื้อหาเกี่ยวกับผู้ใช้งาน</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าระบบ</CardTitle>
              <CardDescription>ปรับแต่งการทำงานของระบบ Gamification</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSaveSettings}>บันทึกการตั้งค่า</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
};

export default GamificationSystem;
