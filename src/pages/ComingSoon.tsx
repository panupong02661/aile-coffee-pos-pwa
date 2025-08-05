
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shell } from '@/components/Shell';
import { 
  Rocket, 
  Clock, 
  Star, 
  Bell,
  BrainCircuit,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

const ComingSoon = () => {
  const location = useLocation();
  const [isNotified, setIsNotified] = useState(false);
  
  // Get feature info based on current path
  const getFeatureInfo = () => {
    const path = location.pathname;
    
    // Feature categories mapping
    const featureMap: Record<string, { title: string; description: string; category: string; icon: any; eta: string }> = {
      // 📊 ระบบวิเคราะห์และรายงานขั้นสูง
      '/ai-analytics-dashboard': {
        title: 'AI Analytics Dashboard',
        description: 'วิเคราะห์พฤติกรรมลูกค้าด้วยเทคโนโลยี AI ขั้นสูง เพื่อให้ข้อมูลเชิงลึกสำหรับการตัดสินใจทางธุรกิจ',
        category: 'ระบบวิเคราะห์และรายงานขั้นสูง',
        icon: BrainCircuit,
        eta: 'Q2 2025'
      },
      '/predictive-analytics': {
        title: 'Predictive Analytics',
        description: 'คาดการณ์ยอดขายและความต้องการสินค้าในอนาคต ช่วยวางแผนธุรกิจให้แม่นยำขึ้น',
        category: 'ระบบวิเคราะห์และรายงานขั้นสูง',
        icon: TrendingUp,
        eta: 'Q2 2025'
      },
      '/realtime-bi': {
        title: 'Real-time Business Intelligence',
        description: 'ดูข้อมูลสดๆ แบบ Real-time พร้อมแดชบอร์ดที่อัปเดตทันที',
        category: 'ระบบวิเคราะห์และรายงานขั้นสูง',
        icon: Zap,
        eta: 'Q1 2025'
      },
      '/customer-segmentation': {
        title: 'Customer Segmentation',
        description: 'จัดกลุ่มลูกค้าตามพฤติกรรมการซื้อ เพื่อสร้างกลยุทธ์การตลาดที่เหมาะสม',
        category: 'ระบบวิเคราะห์และรายงานขั้นสูง',
        icon: Star,
        eta: 'Q2 2025'
      },
      '/profitability-analysis': {
        title: 'Profitability Analysis',
        description: 'วิเคราะห์กำไรรายสินค้าและหมวดหมู่อย่างละเอียด',
        category: 'ระบบวิเคราะห์และรายงานขั้นสูง',
        icon: TrendingUp,
        eta: 'Q1 2025'
      },
      
      // Default for other new features
      default: {
        title: 'ฟีเจอร์ใหม่',
        description: 'ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา เร็วๆ นี้',
        category: 'ระบบใหม่',
        icon: Rocket,
        eta: 'Q2 2025'
      }
    };
    
    return featureMap[path] || featureMap.default;
  };
  
  const feature = getFeatureInfo();
  const FeatureIcon = feature.icon;
  
  const handleNotifyMe = () => {
    setIsNotified(true);
    // Here you could implement actual notification logic
    setTimeout(() => {
      setIsNotified(false);
    }, 3000);
  };
  
  return (
    <Shell>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full">
              <FeatureIcon className="w-12 h-12 text-red-600" />
            </div>
          </div>
          
          <Badge variant="destructive" className="mb-4">
            🚧 กำลังพัฒนา
          </Badge>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {feature.title}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {feature.description}
          </p>
          
          <div className="flex justify-center items-center space-x-4 mb-8">
            <Badge variant="outline" className="text-sm">
              📂 {feature.category}
            </Badge>
            <Badge variant="outline" className="text-sm">
              ⏰ ETA: {feature.eta}
            </Badge>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>สถานะการพัฒนา</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">วางแผน</span>
                  <Badge variant="default">✅ เสร็จสิ้น</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ออกแบบ UI/UX</span>
                  <Badge variant="default">🔄 กำลังดำเนินการ</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">พัฒนาระบบ</span>
                  <Badge variant="secondary">⏳ รอดำเนินการ</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ทดสอบระบบ</span>
                  <Badge variant="secondary">⏳ รอดำเนินการ</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>คุณสมบัติเด่น</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>ใช้งานง่าย เหมาะกับผู้ใช้ทุกระดับ</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>ความเร็วสูง ประสิทธิภาพดี</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>รองรับการใช้งานบนมือถือ</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>เชื่อมต่อกับระบบเดิมได้อย่างราบรื่น</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Card className="text-center">
          <CardHeader>
            <CardTitle>อยากได้รับแจ้งเตือนเมื่อฟีเจอร์นี้พร้อมใช้งาน?</CardTitle>
            <CardDescription>
              เราจะแจ้งให้คุณทราบทันทีเมื่อฟีเจอร์นี้พร้อมใช้งาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleNotifyMe}
              disabled={isNotified}
              className="bg-red-600 hover:bg-red-700"
            >
              {isNotified ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  แจ้งเตือนแล้ว ✅
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  แจ้งเตือนฉันเมื่อพร้อมใช้งาน
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>ติดตามความคืบหน้าได้ที่แดชบอร์ดหลัก หรือสอบถามทีมพัฒนาได้ตลอดเวลา</p>
        </div>
      </div>
    </Shell>
  );
};

export default ComingSoon;
