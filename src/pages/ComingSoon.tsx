
import React from 'react';
import { Shell } from '@/components/Shell';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { 
  Rocket, 
  Clock, 
  Star, 
  CheckCircle, 
  Coffee, 
  Zap,
  Heart,
  Target
} from 'lucide-react';

const ComingSoon = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const upcomingFeatures = [
    {
      id: 1,
      title: "ระบบ AI สำหรับพยากรณ์ยอดขาย",
      description: "ใช้ AI วิเคราะห์ข้อมูลเพื่อพยากรณ์ยอดขายและแนะนำกลยุทธ์การขาย",
      icon: Zap,
      status: "กำลังพัฒนา",
      progress: 75,
      eta: "เดือนหน้า"
    },
    {
      id: 2,
      title: "ระบบจองโต๊ะออนไลน์",
      description: "ให้ลูกค้าสามารถจองโต๊ะล่วงหน้าผ่านแอปมือถือ",
      icon: Target,
      status: "วางแผน",
      progress: 30,
      eta: "2 เดือน"
    },
    {
      id: 3,
      title: "ระบบรีวิวและคะแนน",
      description: "ให้ลูกค้าสามารถให้คะแนนและรีวิวเมนูต่าง ๆ",
      icon: Star,
      status: "วางแผน",
      progress: 15,
      eta: "3 เดือน"
    },
    {
      id: 4,
      title: "ระบบแชทบอทอัจฉริยะ",
      description: "บอทตอบคำถามและช่วยลูกค้าสั่งเมนูอัตโนมัติ",
      icon: Heart,
      status: "ไอเดีย",
      progress: 5,
      eta: "4 เดือน"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "กำลังพัฒนา":
        return <Badge className="bg-blue-500">กำลังพัฒนา</Badge>;
      case "วางแผน":
        return <Badge variant="secondary">วางแผน</Badge>;
      case "ไอเดีย":
        return <Badge variant="outline">ไอเดีย</Badge>;
      default:
        return <Badge>อื่น ๆ</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return "bg-green-500";
    if (progress >= 40) return "bg-blue-500";
    if (progress >= 20) return "bg-yellow-500";
    return "bg-gray-300";
  };

  return (
    <Shell>
      <div className="h-screen bg-background flex">
        <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
        }`}>
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            title="ฟีเจอร์ที่กำลังจะมา"
          />
          
          <div className="p-6 space-y-6">
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-500 rounded-full">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-blue-700">
                  ฟีเจอร์ใหม่กำลังมา! 🚀
                </CardTitle>
                <CardDescription className="text-lg text-blue-600">
                  เรากำลังพัฒนาฟีเจอร์ใหม่ ๆ ที่จะทำให้ระบบของคุณทรงพลังขึ้น
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Coffee className="w-5 h-5 text-blue-500" />
                    <span>ฟีเจอร์ที่กำลังพัฒนา: <strong>4 ฟีเจอร์</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>ฟีเจอร์ถัดไป: <strong>เดือนหน้า</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features List */}
            <div className="grid gap-6">
              <h2 className="text-2xl font-bold">ฟีเจอร์ที่กำลังพัฒนา</h2>
              
              {upcomingFeatures.map((feature) => (
                <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(feature.status)}
                        <p className="text-sm text-muted-foreground">
                          ETA: {feature.eta}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>ความคืบหน้า</span>
                        <span className="font-medium">{feature.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(feature.progress)}`}
                          style={{ width: `${feature.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Newsletter Section */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-green-700">
                  🔔 อยากรับข่าวสารอัพเดตใหม่ ๆ ?
                </CardTitle>
                <CardDescription className="text-green-600">
                  เราจะแจ้งให้ทราบทันทีเมื่อฟีเจอร์ใหม่พร้อมใช้งาน
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <Button className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  เปิดการแจ้งเตือน
                </Button>
                <p className="text-xs text-green-600 mt-2">
                  คุณจะได้รับการแจ้งเตือนผ่านระบบ Push Notification
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default ComingSoon;
