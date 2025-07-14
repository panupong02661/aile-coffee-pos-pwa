
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Users, 
  Package,
  Star,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  console.log('Index page rendering...');

  const mainFeatures = [
    {
      title: "ระบบขายหน้าร้าน (POS)",
      description: "ระบบขายสินค้าหน้าร้าน รองรับการชำระเงินหลายรูปแบบ",
      icon: ShoppingCart,
      path: "/pos",
      color: "bg-blue-500"
    },
    {
      title: "แดชบอร์ด",
      description: "ภาพรวมยอดขาย สถิติ และข้อมูลสำคัญ",
      icon: BarChart3,
      path: "/dashboard",
      color: "bg-green-500"
    },
    {
      title: "จัดการเมนู",
      description: "เพิ่ม แก้ไข ลบเมนูและหมวดหมู่สินค้า",
      icon: Package,
      path: "/menu-management",
      color: "bg-orange-500"
    },
    {
      title: "รายงาน",
      description: "รายงานยอดขาย กำไร และสรุปต่างๆ",
      icon: TrendingUp,
      path: "/reports",
      color: "bg-purple-500"
    }
  ];

  const handleNavigation = (path) => {
    try {
      console.log('Navigating to:', path);
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ระบบจัดการร้านค้า POS
          </h1>
          <p className="text-xl text-gray-600">
            ระบบครบครันสำหรับจัดการร้านค้าขนาดเล็กถึงขนาดใหญ่
          </p>
        </div>

        {/* Main Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">ฟีเจอร์หลัก</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                    <Button 
                      className="w-full" 
                      onClick={() => handleNavigation(feature.path)}
                    >
                      เข้าใช้งาน
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => handleNavigation("/member-management")}
          >
            <Users className="w-5 h-5 mr-2" />
            จัดการสมาชิก
          </Button>
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => handleNavigation("/inventory")}
          >
            <Package className="w-5 h-5 mr-2" />
            คลังสินค้า
          </Button>
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => handleNavigation("/promotions")}
          >
            <Star className="w-5 h-5 mr-2" />
            โปรโมชั่น
          </Button>
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => handleNavigation("/shop-settings")}
          >
            <Settings className="w-5 h-5 mr-2" />
            ตั้งค่าร้าน
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
