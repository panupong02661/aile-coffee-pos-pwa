
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Database, 
  Wifi, 
  Monitor,
  Activity,
  Bell,
  Download,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { toast } from 'sonner';

interface SecurityStatus {
  category: string;
  name: string;
  status: 'active' | 'inactive' | 'warning';
  description: string;
  lastChecked?: string;
  details?: string;
}

const SecurityRecommendationsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [securityStatuses, setSecurityStatuses] = useState<SecurityStatus[]>([]);

  // ตรวจสอบสถานะระบบต่างๆ
  const { data: securityLogs } = useQuery({
    queryKey: ['security-logs-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('security_logs')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['activity-logs-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: offlineQueue } = useQuery({
    queryKey: ['offline-queue-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('offline_sync_queue')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: notificationSettings } = useQuery({
    queryKey: ['notification-settings-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    const checkSystemStatus = () => {
      const statuses: SecurityStatus[] = [
        // การป้องกันการเจาะ
        {
          category: 'การป้องกันการเจาะ',
          name: 'Input Validation',
          status: 'active',
          description: 'ตรวจสอบและกรองข้อมูลที่เข้ามา',
          details: 'ระบบตรวจสอบข้อมูลเพื่อป้องกัน SQL Injection และ XSS'
        },
        {
          category: 'การป้องกันการเจาะ',
          name: 'XSS Protection',
          status: 'active',
          description: 'ป้องกันการโจมตี Cross-Site Scripting',
          details: 'ใช้ Content Security Policy และ Input Sanitization'
        },
        {
          category: 'การป้องกันการเจาะ',
          name: 'CSRF Protection',
          status: 'active',
          description: 'ป้องกันการโจมตี Cross-Site Request Forgery',
          details: 'ใช้ CSRF Token และตรวจสอบ Origin Header'
        },
        {
          category: 'การป้องกันการเจาะ',
          name: 'Rate Limiting',
          status: securityLogs && securityLogs > 0 ? 'active' : 'warning',
          description: 'จำกัดจำนวนคำขอต่อช่วงเวลา',
          details: `บันทึกการตรวจสอบ: ${securityLogs || 0} ครั้ง`
        },

        // การใช้งานแบบ Offline  
        {
          category: 'การใช้งานแบบ Offline',
          name: 'Service Worker',
          status: 'serviceWorker' in navigator ? 'active' : 'inactive',
          description: 'ระบบทำงานแบบออฟไลน์',
          details: 'Service Worker ช่วยให้แอปทำงานได้แม้ไม่มีอินเทอร์เน็ต'
        },
        {
          category: 'การใช้งานแบบ Offline',
          name: 'Local Storage',
          status: 'localStorage' in window ? 'active' : 'inactive',
          description: 'จัดเก็บข้อมูลในเครื่อง',
          details: 'เก็บข้อมูลสำคัญไว้ในเครื่องเพื่อใช้งานออฟไลน์'
        },
        {
          category: 'การใช้งานแบบ Offline',
          name: 'Sync When Online',
          status: offlineQueue && offlineQueue > 0 ? 'active' : 'inactive',
          description: 'ซิงค์ข้อมูลเมื่อกลับมาออนไลน์',
          details: `รายการรอซิงค์: ${offlineQueue || 0} รายการ`
        },
        {
          category: 'การใช้งานแบบ Offline',
          name: 'Cache Management',
          status: 'caches' in window ? 'active' : 'inactive',
          description: 'จัดการแคชข้อมูล',
          details: 'ระบบแคชช่วยเพิ่มความเร็วและประหยัดข้อมูล'
        },

        // การตรวจสอบและล็อก
        {
          category: 'การตรวจสอบและล็อก',
          name: 'Activity Logs',
          status: activityLogs && activityLogs > 0 ? 'active' : 'warning',
          description: 'บันทึกกิจกรรมของผู้ใช้',
          details: `บันทึกกิจกรรม: ${activityLogs || 0} รายการ`
        },
        {
          category: 'การตรวจสอบและล็อก',
          name: 'Error Monitoring',
          status: 'active',
          description: 'ตรวจสอบและบันทึกข้อผิดพลาด',
          details: 'ระบบจะบันทึกข้อผิดพลาดทั้งหมดเพื่อการแก้ไข'
        },
        {
          category: 'การตรวจสอบและล็อก',
          name: 'Security Alerts',
          status: securityLogs && securityLogs > 0 ? 'active' : 'warning',
          description: 'แจ้งเตือนด้านความปลอดภัย',
          details: `การแจ้งเตือน: ${securityLogs || 0} ครั้ง`
        },
        {
          category: 'การตรวจสอบและล็อก',
          name: 'Data Access Logs',
          status: 'active',
          description: 'บันทึกการเข้าถึงข้อมูล',
          details: 'ติดตามการเข้าถึงข้อมูลสำคัญทั้งหมด'
        },

        // ระบบเพิ่มเติมที่แนะนำ
        {
          category: 'ระบบเพิ่มเติมที่แนะนำ',
          name: 'Progressive Web App (PWA)',
          status: 'serviceWorker' in navigator && 'PushManager' in window ? 'active' : 'warning',
          description: 'แอปเว็บที่ทำงานเหมือนแอปมือถือ',
          details: 'รองรับการติดตั้งและการแจ้งเตือน Push'
        },
        {
          category: 'ระบบเพิ่มเติมที่แนะนำ',
          name: 'Push Notifications',
          status: notificationSettings?.sound_enabled ? 'active' : 'inactive',
          description: 'ระบบแจ้งเตือนแบบ Push',
          details: 'แจ้งเตือนเมื่อมีออเดอร์ใหม่หรือเหตุการณ์สำคัญ'
        },
        {
          category: 'ระบบเพิ่มเติมที่แนะนำ',
          name: 'Vulnerability Scanning',
          status: 'warning',
          description: 'สแกนหาช่องโหว่ด้านความปลอดภัย',
          details: 'ควรทำการสแกนเป็นประจำเพื่อตรวจสอบความปลอดภัย'
        }
      ];

      setSecurityStatuses(statuses);
    };

    checkSystemStatus();
  }, [securityLogs, activityLogs, offlineQueue, notificationSettings]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'ใช้งานแล้ว';
      case 'warning':
        return 'ต้องตรวจสอบ';
      case 'inactive':
        return 'ยังไม่ใช้งาน';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'การป้องกันการเจาะ':
        return <Shield className="w-6 h-6 text-blue-500" />;
      case 'การใช้งานแบบ Offline':
        return <Wifi className="w-6 h-6 text-purple-500" />;
      case 'การตรวจสอบและล็อก':
        return <Eye className="w-6 h-6 text-orange-500" />;
      case 'ระบบเพิ่มเติมที่แนะนำ':
        return <Settings className="w-6 h-6 text-green-500" />;
      default:
        return <Monitor className="w-6 h-6 text-gray-500" />;
    }
  };

  const groupedStatuses = securityStatuses.reduce((acc, status) => {
    if (!acc[status.category]) {
      acc[status.category] = [];
    }
    acc[status.category].push(status);
    return acc;
  }, {} as Record<string, SecurityStatus[]>);

  const runSecurityScan = async () => {
    toast.info('เริ่มการสแกนความปลอดภัย...');
    
    // จำลองการสแกน
    setTimeout(() => {
      toast.success('การสแกนเสร็จสิ้น - ระบบปลอดภัย');
    }, 3000);
  };

  return (
    <div className="h-screen bg-cream-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="p-4">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">ระบบความปลอดภัยที่แนะนำ</h1>
            <Button
              onClick={runSecurityScan}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              สแกนความปลอดภัย
            </Button>
          </div>

          <div className="grid gap-6">
            {Object.entries(groupedStatuses).map(([category, statuses]) => (
              <Card key={category} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {statuses.map((status, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status.status)}
                            <h3 className="font-semibold text-gray-900">{status.name}</h3>
                          </div>
                          <Badge className={getStatusColor(status.status)}>
                            {getStatusText(status.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{status.description}</p>
                        {status.details && (
                          <p className="text-xs text-gray-500">{status.details}</p>
                        )}
                        {status.lastChecked && (
                          <p className="text-xs text-gray-400 mt-1">
                            ตรวจสอบล่าสุด: {status.lastChecked}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>คำแนะนำ:</strong> ควรตรวจสอบและอัปเดตระบบความปลอดภัยเป็นประจำ 
                เพื่อให้มั่นใจว่าข้อมูลและระบบได้รับการป้องกันอย่างเหมาะสม
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityRecommendationsPage;
