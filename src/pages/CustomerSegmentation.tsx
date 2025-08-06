
import React, { useState } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, ShoppingCart, Star } from 'lucide-react';

const CustomerSegmentation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const customerSegments = [
    {
      name: "VIP ลูกค้า",
      count: 156,
      percentage: 12,
      avgSpending: 2500,
      color: "bg-yellow-500",
      description: "ลูกค้าที่ซื้อมากกว่า 10,000 บาท/เดือน"
    },
    {
      name: "ลูกค้าประจำ",
      count: 432,
      percentage: 35,
      avgSpending: 800,
      color: "bg-green-500",
      description: "ลูกค้าที่ซื้อสม่ำเสมอ 3-5 ครั้ง/เดือน"
    },
    {
      name: "ลูกค้าใหม่",
      count: 289,
      percentage: 23,
      avgSpending: 350,
      color: "bg-blue-500",
      description: "ลูกค้าที่สมัครใหม่ใน 30 วันที่ผ่านมา"
    },
    {
      name: "ลูกค้าไม่ประจำ",
      count: 378,
      percentage: 30,
      avgSpending: 200,
      color: "bg-gray-500",
      description: "ลูกค้าที่ซื้อไม่สม่ำเสมอ 1-2 ครั้ง/เดือน"
    }
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <MainSidebar />
      
      <div className="flex-1 flex flex-col h-screen">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="จัดกลุ่มลูกค้า"
          page="other"
        />
        
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Customer Segmentation</CardTitle>
                <CardDescription>วิเคราะห์และจัดกลุ่มลูกค้าตามพฤติกรรมการซื้อ</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="segments" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="segments">กลุ่มลูกค้า</TabsTrigger>
                    <TabsTrigger value="behavior">พฤติกรรม</TabsTrigger>
                    <TabsTrigger value="recommendations">คำแนะนำ</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="segments" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {customerSegments.map((segment, index) => (
                        <Card key={index} className="relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-1 h-full ${segment.color}`} />
                          <CardHeader className="pl-6">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{segment.name}</CardTitle>
                              <Badge variant="secondary">{segment.percentage}%</Badge>
                            </div>
                            <CardDescription>{segment.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pl-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-2xl font-bold">{segment.count}</p>
                                  <p className="text-sm text-muted-foreground">ลูกค้า</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-2xl font-bold">฿{segment.avgSpending}</p>
                                  <p className="text-sm text-muted-foreground">ยอดเฉลี่ย/เดือน</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="behavior" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>การวิเคราะห์พฤติกรรม</CardTitle>
                        <CardDescription>รูปแบบการซื้อของลูกค้าในแต่ละกลุ่ม</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">ช่วงเวลาที่ซื้อมากที่สุด</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-2xl font-bold">11:00-14:00</p>
                                <p className="text-sm text-muted-foreground">ช่วงเที่ยง</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">ความถี่ในการซื้อ</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-2xl font-bold">2.3</p>
                                <p className="text-sm text-muted-foreground">ครั้ง/สัปดาห์</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">มูลค่าเฉลี่ยต่อบิล</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-2xl font-bold">฿485</p>
                                <p className="text-sm text-muted-foreground">บาท</p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="recommendations" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>คำแนะนำการตลาด</CardTitle>
                        <CardDescription>กลยุทธ์ที่แนะนำสำหรับแต่ละกลุ่มลูกค้า</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {customerSegments.map((segment, index) => (
                            <Card key={index}>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                                  <span>{segment.name}</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {segment.name === "VIP ลูกค้า" && (
                                    <>
                                      <li className="flex items-center space-x-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span>จัดโปรโมชั่นพิเศษและส่วนลดสำหรับสมาชิก VIP</span>
                                      </li>
                                      <li className="flex items-center space-x-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span>เชิญร่วมงานอีเวนต์พิเศษและชิมเมนูใหม่ก่อนใคร</span>
                                      </li>
                                    </>
                                  )}
                                  {segment.name === "ลูกค้าประจำ" && (
                                    <>
                                      <li className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span>โปรแกรมสะสมแต้มและแลกของรางวัล</span>
                                      </li>
                                      <li className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span>ส่งข้อเสนอพิเศษตามความชอบของลูกค้า</span>
                                      </li>
                                    </>
                                  )}
                                  {segment.name === "ลูกค้าใหม่" && (
                                    <>
                                      <li className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span>โปรโมชั่นต้อนรับสำหรับลูกค้าใหม่</span>
                                      </li>
                                      <li className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span>แนะนำเมนูยอดนิยมและแนะนำการใช้แอป</span>
                                      </li>
                                    </>
                                  )}
                                  {segment.name === "ลูกค้าไม่ประจำ" && (
                                    <>
                                      <li className="flex items-center space-x-2">
                                        <ShoppingCart className="h-4 w-4 text-gray-500" />
                                        <span>ส่งแคมเปญกระตุ้นให้กลับมาซื้อ</span>
                                      </li>
                                      <li className="flex items-center space-x-2">
                                        <ShoppingCart className="h-4 w-4 text-gray-500" />
                                        <span>เสนอส่วนลดพิเศษเพื่อเพิ่มความถี่ในการซื้อ</span>
                                      </li>
                                    </>
                                  )}
                                </ul>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
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

export default CustomerSegmentation;
