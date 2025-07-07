
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  Database, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Smartphone
} from 'lucide-react';

const SecurityRecommendations = () => {
  const securityFeatures = [
    {
      category: 'การป้องกันการเจาะ',
      icon: Shield,
      color: 'text-red-600',
      items: [
        { name: 'Rate Limiting', status: 'recommended', description: 'จำกัดจำนวนคำขอเพื่อป้องกัน DDoS' },
        { name: 'Input Validation', status: 'critical', description: 'ตรวจสอบข้อมูลนำเข้าทั้งหมด' },
        { name: 'SQL Injection Protection', status: 'implemented', description: 'ใช้ Supabase RLS ป้องกัน' },
        { name: 'XSS Protection', status: 'recommended', description: 'ป้องกันการแทรก Script' },
        { name: 'CSRF Protection', status: 'recommended', description: 'ป้องกันการปลอมแปลงคำขอ' }
      ]
    },
    {
      category: 'การจัดการผู้ใช้',
      icon: Users,
      color: 'text-blue-600',
      items: [
        { name: 'Multi-Factor Authentication', status: 'recommended', description: 'การยืนยันตัวตน 2 ขั้นตอน' },
        { name: 'Role-Based Access Control', status: 'critical', description: 'จัดการสิทธิ์ตามบทบาท' },
        { name: 'Session Management', status: 'implemented', description: 'จัดการ Session อัตโนมัติ' },
        { name: 'Password Policy', status: 'recommended', description: 'กำหนดนียามรหัสผ่าน' },
        { name: 'Account Lockout', status: 'recommended', description: 'ล็อกบัญชีเมื่อพยายามเข้าผิด' }
      ]
    },
    {
      category: 'การสำรองข้อมูล',
      icon: Database,
      color: 'text-green-600',
      items: [
        { name: 'Auto Backup', status: 'implemented', description: 'สำรองข้อมูลอัตโนมัติ Supabase' },
        { name: 'Point-in-Time Recovery', status: 'implemented', description: 'กู้คืนข้อมูลย้อนหลัง' },
        { name: 'Local Backup', status: 'recommended', description: 'สำรองข้อมูลในเครื่อง' },
        { name: 'Backup Encryption', status: 'critical', description: 'เข้ารหัสไฟล์สำรอง' },
        { name: 'Backup Testing', status: 'recommended', description: 'ทดสอบการกู้คืนข้อมูล' }
      ]
    },
    {
      category: 'การใช้งานแบบ Offline',
      icon: Wifi,
      color: 'text-purple-600',
      items: [
        { name: 'Service Worker', status: 'recommended', description: 'ทำงานแบบ Offline' },
        { name: 'Local Storage', status: 'recommended', description: 'เก็บข้อมูลในเครื่อง' },
        { name: 'Sync When Online', status: 'critical', description: 'ซิงค์เมื่อกลับมา Online' },
        { name: 'Offline Receipt Print', status: 'recommended', description: 'พิมพ์ใบเสร็จแบบ Offline' },
        { name: 'Cache Management', status: 'recommended', description: 'จัดการแคชข้อมูล' }
      ]
    },
    {
      category: 'การตรวจสอบและล็อก',
      icon: Eye,
      color: 'text-orange-600',
      items: [
        { name: 'Activity Logs', status: 'critical', description: 'บันทึกการใช้งานทั้งหมด' },
        { name: 'Error Monitoring', status: 'recommended', description: 'ตรวจสอบข้อผิดพลาด' },
        { name: 'Security Alerts', status: 'critical', description: 'แจ้งเตือนความปลอดภัย' },
        { name: 'Login Tracking', status: 'recommended', description: 'ติดตามการเข้าสู่ระบบ' },
        { name: 'Data Access Logs', status: 'critical', description: 'บันทึกการเข้าถึงข้อมูล' }
      ]
    },
    {
      category: 'ความปลอดภัยเพิ่มเติม',
      icon: Lock,
      color: 'text-teal-600',
      items: [
        { name: 'Data Encryption', status: 'implemented', description: 'เข้ารหัสข้อมูลใน Database' },
        { name: 'HTTPS Only', status: 'implemented', description: 'บังคับใช้ HTTPS' },
        { name: 'API Key Rotation', status: 'recommended', description: 'เปลี่ยน API Key เป็นระยะ' },
        { name: 'Vulnerability Scanning', status: 'recommended', description: 'สแกนหาช่องโหว่' },
        { name: 'Security Headers', status: 'recommended', description: 'ตั้งค่า Security Headers' }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />ใช้งานแล้ว</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />สำคัญมาก</Badge>;
      case 'recommended':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />แนะนำ</Badge>;
      default:
        return <Badge variant="outline">อื่นๆ</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">ระบบความปลอดภัยที่แนะนำ</h2>
        <p className="text-gray-600">เสริมความปลอดภัยและความเสถียรให้กับระบบ POS ของคุณ</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {securityFeatures.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${category.color}`} />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            ระบบเพิ่มเติมที่แนะนำ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Progressive Web App (PWA)</h4>
              <p className="text-sm text-gray-600">ติดตั้งแอปบนมือถือได้ทำงานแบบ Offline</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Push Notifications</h4>
              <p className="text-sm text-gray-600">แจ้งเตือนผ่านเบราว์เซอร์และมือถือ</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Biometric Authentication</h4>
              <p className="text-sm text-gray-600">ใช้ลายนิ้วมือหรือใบหน้าเข้าสู่ระบบ</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Geolocation Security</h4>
              <p className="text-sm text-gray-600">จำกัดการใช้งานตามตำแหน่ง</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Hardware Security Key</h4>
              <p className="text-sm text-gray-600">ใช้อุปกรณ์ยืนยันตัวตนทางกายภาพ</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Blockchain Receipt</h4>
              <p className="text-sm text-gray-600">ใบเสร็จที่ไม่สามารถแก้ไขได้</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityRecommendations;
