
import React, { useState } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GamepadIcon, Settings, Users, Trophy } from 'lucide-react';

const GamificationSystem = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col h-screen">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="ระบบเกมมิฟิเคชั่น"
          page="gamification"
        />
        
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard">แดชบอร์ด</TabsTrigger>
                <TabsTrigger value="quests">ภารกิจ</TabsTrigger>
                <TabsTrigger value="rewards">รางวัล</TabsTrigger>
                <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <GamificationDashboard />
              </TabsContent>

              <TabsContent value="quests" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">จัดการภารกิจ</h2>
                    <Button>
                      <Trophy className="h-4 w-4 mr-2" />
                      สร้างภารกิจใหม่
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>ภารกิจรายวัน</CardTitle>
                        <CardDescription>ภารกิจที่รีเซ็ตทุกวัน</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'สั่งเครื่องดื่ม 1 แก้ว', reward: '25 XP', active: true },
                          { title: 'แชร์โพสต์', reward: '15 XP', active: true },
                          { title: 'เช็คอิน', reward: '10 XP', active: true },
                        ].map((quest, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{quest.title}</p>
                              <p className="text-sm text-muted-foreground">{quest.reward}</p>
                            </div>
                            <Switch checked={quest.active} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>ภารกิจรายสัปดาห์</CardTitle>
                        <CardDescription>ภารกิจที่รีเซ็ตทุกสัปดาห์</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'ใช้จ่าย 500 บาท', reward: '100 XP', active: true },
                          { title: 'มาร้าน 3 วัน', reward: '150 XP', active: true },
                          { title: 'รีวิวสินค้า 2 รายการ', reward: '75 XP', active: false },
                        ].map((quest, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{quest.title}</p>
                              <p className="text-sm text-muted-foreground">{quest.reward}</p>
                            </div>
                            <Switch checked={quest.active} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rewards" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">จัดการรางวัล</h2>
                    <Button>สร้างรางวัลใหม่</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'ส่วนลด 10%', cost: 500, stock: 50, claimed: 12 },
                      { name: 'กาแฟฟรี', cost: 800, stock: 30, claimed: 8 },
                      { name: 'ขนมฟรี', cost: 300, stock: 100, claimed: 25 },
                      { name: 'ส่วนลด 20%', cost: 1000, stock: 20, claimed: 3 },
                    ].map((reward, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <h3 className="font-medium mb-2">{reward.name}</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>ราคา: {reward.cost} แต้ม</p>
                            <p>คงเหลือ: {reward.stock}</p>
                            <p>แลกแล้ว: {reward.claimed}</p>
                          </div>
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            แก้ไข
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>การตั้งค่าทั่วไป</CardTitle>
                      <CardDescription>ตั้งค่าระบบเกมมิฟิเคชั่น</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="gamification-enabled">เปิดใช้งานระบบ</Label>
                        <Switch id="gamification-enabled" defaultChecked />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="xp-rate">อัตรา XP ต่อ 1 บาท</Label>
                        <Input id="xp-rate" type="number" defaultValue="1" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level-multiplier">ตัวคูณการอัพเลเวล</Label>
                        <Select defaultValue="1000">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="500">500 XP ต่อเลเวล</SelectItem>
                            <SelectItem value="1000">1,000 XP ต่อเลเวล</SelectItem>
                            <SelectItem value="1500">1,500 XP ต่อเลเวล</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="daily-reset">รีเซ็ตภารกิจรายวันอัตโนมัติ</Label>
                        <Switch id="daily-reset" defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>การแจ้งเตือน</CardTitle>
                      <CardDescription>ตั้งค่าการแจ้งเตือนเกมมิฟิเคชั่น</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="level-up-notify">แจ้งเตือนเมื่ออัพเลเวล</Label>
                        <Switch id="level-up-notify" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="quest-complete-notify">แจ้งเตือนเมื่อทำภารกิจสำเร็จ</Label>
                        <Switch id="quest-complete-notify" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="reward-notify">แจ้งเตือนรางวัลใหม่</Label>
                        <Switch id="reward-notify" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="daily-reminder">เตือนภารกิจรายวัน</Label>
                        <Switch id="daily-reminder" defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationSystem;
