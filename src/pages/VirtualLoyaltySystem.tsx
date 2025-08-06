
import React, { useState } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import VirtualLoyaltyCard from '@/components/virtual-loyalty/VirtualLoyaltyCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Wallet, History, Settings } from 'lucide-react';

const VirtualLoyaltySystem = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');

  const sampleMember = {
    id: 'M001234',
    name: 'คุณสมชาย ใจดี',
    phone: '081-234-5678',
    tier: 'gold' as const,
    points: 2850,
    totalSpent: 8500,
    joinDate: '2023-01-15'
  };

  const recentTransactions = [
    { date: '2024-01-15', type: 'earn', points: 150, description: 'ซื้อกาแฟ ฿150' },
    { date: '2024-01-12', type: 'redeem', points: -500, description: 'แลกส่วนลด 10%' },
    { date: '2024-01-10', type: 'earn', points: 200, description: 'ซื้อขนม ฿200' },
    { date: '2024-01-08', type: 'bonus', points: 100, description: 'โบนัสวันเกิด' },
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col h-screen">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="ระบบบัตรสมาชิกดิจิทัล"
          page="loyalty"
        />
        
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="card" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="card">บัตรสมาชิก</TabsTrigger>
                <TabsTrigger value="wallet">กระเป๋าดิจิทัล</TabsTrigger>
                <TabsTrigger value="history">ประวัติ</TabsTrigger>
                <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>ค้นหาสมาชิก</CardTitle>
                        <CardDescription>กรอกเบอร์โทรศัพท์เพื่อแสดงบัตรสมาชิก</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="081-234-5678"
                            value={searchPhone}
                            onChange={(e) => setSearchPhone(e.target.value)}
                          />
                          <Button>ค้นหา</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <VirtualLoyaltyCard memberData={sampleMember} />
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>สถิติแต้มสะสม</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span>แต้มที่ได้รับวันนี้</span>
                            <span className="font-bold text-green-600">+150</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span>แต้มที่ใช้ไปเดือนนี้</span>
                            <span className="font-bold text-blue-600">-1,200</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span>แต้มคงเหลือ</span>
                            <span className="font-bold text-purple-600">{sampleMember.points.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>การแจ้งเตือน</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <p className="text-sm font-medium">แต้มจะหมดอายุ</p>
                            <p className="text-xs text-muted-foreground">500 แต้มจะหมดอายุใน 30 วัน</p>
                          </div>
                          <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                            <p className="text-sm font-medium">โปรโมชั่นพิเศษ</p>
                            <p className="text-xs text-muted-foreground">ส่วนลด 20% สำหรับสมาชิก Gold</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="wallet" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wallet className="h-5 w-5 mr-2" />
                        ยอดเงินคงเหลือ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">฿1,250</p>
                      <p className="text-sm text-muted-foreground mt-2">อัปเดตล่าสุด: วันนี้</p>
                      <Button className="w-full mt-4">เติมเงิน</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        คูปองส่วนลด
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">5</p>
                      <p className="text-sm text-muted-foreground mt-2">คูปองพร้อมใช้</p>
                      <Button variant="outline" className="w-full mt-4">ดูคูปอง</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>ของขวัญ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">2</p>
                      <p className="text-sm text-muted-foreground mt-2">ของขวัญที่ได้รับ</p>
                      <Button variant="outline" className="w-full mt-4">ใช้ของขวัญ</Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>คูปองส่วนลดพิเศษ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: 'ส่วนลด 15%', desc: 'สำหรับเครื่องดื่ม', exp: '31 ม.ค. 67' },
                          { title: 'ซื้อ 2 แถม 1', desc: 'เค้ก', exp: '28 ก.พ. 67' },
                          { title: 'ฟรีกาแฟ', desc: 'เมื่อซื้อขนม', exp: '15 มี.ค. 67' },
                          { title: 'ส่วนลด ฿50', desc: 'ขั้นต่ำ 300 บาท', exp: '10 เม.ย. 67' },
                        ].map((coupon, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                            <h3 className="font-bold text-purple-800">{coupon.title}</h3>
                            <p className="text-sm text-purple-600">{coupon.desc}</p>
                            <p className="text-xs text-muted-foreground mt-2">หมดอายุ: {coupon.exp}</p>
                            <Button size="sm" variant="outline" className="mt-2">ใช้เลย</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="h-5 w-5 mr-2" />
                      ประวัติการใช้แต้ม
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                          </div>
                          <div className={`text-right ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <p className="font-bold">
                              {transaction.points > 0 ? '+' : ''}{transaction.points}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.type === 'earn' ? 'ได้รับ' : 
                               transaction.type === 'redeem' ? 'ใช้แต้ม' : 'โบนัส'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        การตั้งค่าบัตร
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">ธีมบัตร</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {['Silver', 'Gold', 'Platinum'].map((theme) => (
                            <div
                              key={theme}
                              className={`h-16 rounded-lg cursor-pointer border-2 ${
                                theme === 'Gold' ? 'border-yellow-400 bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                theme === 'Silver' ? 'border-gray-400 bg-gradient-to-r from-gray-400 to-gray-600' :
                                'border-purple-400 bg-gradient-to-r from-purple-400 to-purple-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">การแจ้งเตือน</h3>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked />
                            แจ้งเตือนเมื่อได้รับแต้ม
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked />
                            แจ้งเตือนโปรโมชั่นพิเศษ
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            แจ้งเตือนแต้มใกล้หมดอายุ
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>ความปลอดภัย</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full">
                        เปลี่ยนรหัส PIN
                      </Button>
                      <Button variant="outline" className="w-full">
                        ตั้งค่าการยืนยันตัวตน
                      </Button>
                      <Button variant="outline" className="w-full">
                        ดูประวัติการเข้าใช้งาน
                      </Button>
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

export default VirtualLoyaltySystem;
