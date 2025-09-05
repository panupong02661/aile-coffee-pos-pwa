import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gift, Bell, Settings, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CustomerAppOverview = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalGifts: 0,
    totalNotifications: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch members count
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      // Fetch gifts count
      const { count: giftsCount } = await supabase
        .from('customer_gifts')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalMembers: membersCount || 0,
        totalGifts: giftsCount || 0,
        totalNotifications: 89, // Static for now as shown in the image
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'ภาพรวม',
      subtitle: 'ของขวัญกันดีได ของแอปพลิเคชั่นลูกค้า',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      value: stats.totalMembers.toLocaleString(),
      label: 'ผู้ใช้งานทั้งหมด',
      color: 'text-blue-600'
    },
    {
      title: 'ของขวัญ',
      subtitle: 'ของขวัญกันดีได ของแอปพลิเคชั่นลูกค้า',
      icon: <Gift className="w-5 h-5 text-green-600" />,
      value: stats.totalGifts.toLocaleString(),
      label: 'ของขวัญที่จัดแล้ว',
      color: 'text-green-600'
    },
    {
      title: 'การแจ้งเตือน',
      subtitle: 'การแจ้งเตือนขันใหม่',
      icon: <Bell className="w-5 h-5 text-orange-600" />,
      value: stats.totalNotifications.toLocaleString(),
      label: 'การแจ้งเตือนขันใหม่',
      color: 'text-orange-600'
    }
  ];

  const appManagementItems = [
    {
      title: 'ระบบประเมินแอป',
      subtitle: 'อัตราการแลกแอปเปอร์มันส่วนของ',
      value: '1:1',
      unit: 'แต้ม : บาท',
      icon: <TrendingUp className="w-4 h-4 text-green-600" />
    },
    {
      title: 'ระบบสมาชิก',
      subtitle: 'ระดับสมาชิกและสิทธิประโยชน์',
      value: '3',
      unit: 'ระดับ',
      icon: <Star className="w-4 h-4 text-yellow-600" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* App Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            การตั้งค่าแอป
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appManagementItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.unit}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAppOverview;