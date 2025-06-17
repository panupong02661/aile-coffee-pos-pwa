
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, ShoppingCart, BarChart3, LogIn, Settings } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "ระบบ POS",
      description: "จุดขายหน้าร้านที่ใช้งานง่าย",
      link: "/pos",
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "แดชบอร์ด",
      description: "ดูสถิติและรายงานการขาย",
      link: "/dashboard",
      color: "text-green-600"
    },
    {
      icon: Settings,
      title: "จัดการเมนู",
      description: "เพิ่ม แก้ไข หรือลบรายการสินค้า",
      link: "/menu-management",
      color: "text-purple-600"
    }
  ];

  const bgPattern = "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0Z' fill='%23f5f5f0' opacity='0.1'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-cream-50 to-coffee-100">
      <div 
        className="absolute inset-0 bg-repeat opacity-20"
        style={{ backgroundImage: `url("${bgPattern}")` }}
      ></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 w-20 h-20 bg-coffee-600 rounded-full flex items-center justify-center shadow-xl">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-coffee-800 mb-4">
            Aile Coffee POS
          </h1>
          <p className="text-xl text-coffee-600 mb-8 max-w-2xl mx-auto">
            ระบบจุดขายสำหรับร้านกาแฟ ที่ออกแบบมาเพื่อความง่ายและประสิทธิภาพ
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-coffee-600 hover:bg-coffee-700 text-white font-medium h-12 px-8"
            >
              <Link to="/login">
                <LogIn className="w-5 h-5 mr-2" />
                เข้าสู่ระบบ
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-coffee-300 text-coffee-700 hover:bg-coffee-50 h-12 px-8"
            >
              <Link to="/pos">
                <ShoppingCart className="w-5 h-5 mr-2" />
                ทดลองใช้ POS
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-coffee-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <feature.icon className={`w-12 h-12 mx-auto mb-4 ${feature.color}`} />
                <CardTitle className="text-coffee-800">{feature.title}</CardTitle>
                <CardDescription className="text-coffee-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full border-coffee-300 text-coffee-700 hover:bg-coffee-50"
                >
                  <Link to={feature.link}>
                    เข้าใช้งาน
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 border border-coffee-200">
          <h2 className="text-2xl font-bold text-coffee-800 mb-4 text-center">
            วิธีการเข้าใช้งาน
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-coffee-700 mb-3">
                สำหรับผู้ใช้งานทั่วไป
              </h3>
              <ul className="space-y-2 text-coffee-600">
                <li>• คลิก "ทดลองใช้ POS" เพื่อเข้าใช้งานระบบขายโดยตรง</li>
                <li>• ไม่จำเป็นต้องลงทะเบียนหรือเข้าสู่ระบบ</li>
                <li>• เหมาะสำหรับการทดลองใช้งาน</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-coffee-700 mb-3">
                สำหรับเจ้าของร้าน/พนักงาน
              </h3>
              <ul className="space-y-2 text-coffee-600">
                <li>• คลิก "เข้าสู่ระบบ" เพื่อเข้าใช้งานระบบแบบเต็ม</li>
                <li>• เข้าถึงแดชบอร์ด และการจัดการเมนู</li>
                <li>• รหัสผ่านทดสอบ: <span className="font-mono bg-coffee-100 px-2 py-1 rounded">admin</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-coffee-500">
          <p>&copy; 2024 Aile Coffee POS. ระบบจุดขายสำหรับร้านกาแฟ</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
