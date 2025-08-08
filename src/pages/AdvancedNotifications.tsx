
import React, { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationTemplates from '@/components/notifications/NotificationTemplates';
import NotificationQueue from '@/components/notifications/NotificationQueue';
import { NotificationScheduler } from '@/components/notifications/NotificationScheduler';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { Bell, MessageSquare, Clock, Settings, TrendingUp, Users } from 'lucide-react';
import { NotificationService } from '@/components/notifications/NotificationService';

const AdvancedNotifications = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    orders: true,
    promotions: true,
    inventory: false,
    system: true,
    marketing: false
  });

  const stats = NotificationService.getStats();

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1">
        <div className="p-4">
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(true)}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-coffee-800 flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  ระบบการแจ้งเตือนขั้นสูง
                </CardTitle>
                <CardDescription>
                  จัดการการแจ้งเตือน เทมเพลต การส่งจำนวนมาก และการตั้งเวลา
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* สถิติรวม */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ผู้ติดตาม</p>
                          <p className="text-2xl font-bold">{stats.subscribers}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ส่งแล้ว</p>
                          <p className="text-2xl font-bold">{stats.sentNotifications}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">อัตราเปิด</p>
                          <p className="text-2xl font-bold">87%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Bell className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">สถานะ</p>
                          <p className="text-lg font-bold text-green-600">
                            {stats.permission === 'granted' ? 'เปิด' : 'ปิด'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="templates" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      เทมเพลต
                    </TabsTrigger>
                    <TabsTrigger value="queue" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      คิวการส่ง
                    </TabsTrigger>
                    <TabsTrigger value="scheduler" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      ตั้งเวลา
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      การตั้งค่า
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="templates" className="mt-6">
                    <NotificationTemplates />
                  </TabsContent>
                  
                  <TabsContent value="queue" className="mt-6">
                    <NotificationQueue />
                  </TabsContent>
                  
                  <TabsContent value="scheduler" className="mt-6">
                    <NotificationScheduler />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-6">
                    <NotificationSettings 
                      settings={notificationSettings}
                      onSettingsChange={setNotificationSettings}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedNotifications;
