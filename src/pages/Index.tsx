
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Users, 
  Package,
  Smartphone,
  Shield,
  CreditCard,
  UserPlus,
  Star,
  Globe,
  Printer,
  TrendingUp,
  QrCode,
  AlertTriangle,
  Wrench
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

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

  const advancedFeatures = [
    {
      title: "ระบบจัดการขั้นสูง",
      description: "เวรทำงาน ผู้จำหน่าย โต๊ะ และระบบอื่นๆ",
      icon: Wrench,
      path: "/advanced-management",
      color: "bg-indigo-500"
    },
    {
      title: "จัดการสมาชิก",
      description: "ระบบสมาชิก แต้มสะสม และสิทธิพิเศษ",
      icon: Users,
      path: "/member-management",
      color: "bg-pink-500"
    },
    {
      title: "คลังสินค้า",
      description: "จัดการสต็อกสินค้า วัตถุดิบ และการสั่งซื้อ",
      icon: Package,
      path: "/inventory",
      color: "bg-teal-500"
    },
    {
      title: "โปรโมชั่น",
      description: "สร้างและจัดการส่วนลด คูปอง และแคมเปญ",
      icon: Star,
      path: "/promotions",
      color: "bg-yellow-500"
    }
  ];

  const systemFeatures = [
    {
      title: "ระบบออนไลน์",
      description: "จัดการออเดอร์ออนไลน์และการจัดส่ง",
      icon: Globe,
      path: "/online-system",
      color: "bg-blue-600"
    },
    {
      title: "ระบบลูกค้า",
      description: "แอปพลิเคชันสำหรับลูกค้า",
      icon: Smartphone,
      path: "/customer-system",
      color: "bg-green-600"
    },
    {
      title: "ระบบการเงิน",
      description: "จัดการการเงิน บัญชี และธุรกรรม",
      icon: CreditCard,
      path: "/financial-system",
      color: "bg-emerald-600"
    },
    {
      title: "จัดการพนักงาน",
      description: "ระบบพนักงาน เวลาทำงาน และสิทธิการใช้งาน",
      icon: UserPlus,
      path: "/staff-management",
      color: "bg-purple-600"
    },
    {
      title: "ระบบความปลอดภัย",
      description: "ตรวจสอบการเข้าใช้งานและความปลอดภัย",
      icon: Shield,
      path: "/security-system",
      color: "bg-red-600"
    },
    {
      title: "ระบบเทคโนโลยี",
      description: "การตั้งค่าเทคนิคและระบบต่างๆ",
      icon: Settings,
      path: "/technology-system",
      color: "bg-gray-600"
    }
  ];

  const utilityFeatures = [
    {
      title: "เครื่องพิมพ์",
      description: "ตั้งค่าเครื่องพิมพ์และใบเสร็จ",
      icon: Printer,
      path: "/printer-settings",
      color: "bg-slate-600"
    },
    {
      title: "QR Code PromptPay",
      description: "สร้าง QR Code สำหรับรับชำระเงิน",
      icon: QrCode,
      path: "/qr-promptpay",
      color: "bg-cyan-600"
    },
    {
      title: "รายงานขั้นสูง",
      description: "รายงานและวิเคราะห์ข้อมูลเชิงลึก",
      icon: BarChart3,
      path: "/advanced-reports",
      color: "bg-violet-600"
    },
    {
      title: "คำแนะนำด้านความปลอดภัย",
      description: "แนวทางปฏิบัติด้านความปลอดภัย",
      icon: AlertTriangle,
      path: "/security-recommendations",
      color: "bg-amber-600"
    }
  ];

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
                      onClick={() => navigate(feature.path)}
                    >
                      เข้าใช้งาน
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Advanced Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">ฟีเจอร์ขั้นสูง</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, index) => {
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
                      variant="outline"
                      onClick={() => navigate(feature.path)}
                    >
                      เข้าใช้งาน
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">ระบบจัดการ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="w-full" 
                      onClick={() => navigate(feature.path)}
                    >
                      จัดการ
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Utility Features */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">เครื่องมือเสริม</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {utilityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    <Button 
                      size="sm"
                      variant="ghost"
                      className="w-full" 
                      onClick={() => navigate(feature.path)}
                    >
                      ใช้งาน
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
