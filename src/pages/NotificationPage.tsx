import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  MessageSquare, 
  Instagram, 
  Send, 
  Phone, 
  Clock, 
  Settings, 
  Calendar,
  ShoppingCart,
  BarChart,
  FileText,
  Zap,
  Save,
  TestTube,
  CheckCircle,
  Volume2,
  VolumeX,
  BellRing,
  Monitor
} from 'lucide-react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import DiscordWebhookGuide from '@/components/DiscordWebhookGuide';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import LineAccountFields, { LineScope } from '@/components/notification/LineAccountFields';

const SCOPE_BY_TYPE: Record<string, LineScope> = {
  'ออเดอร์ออนไลน์': 'online_orders',
  'ออเดอร์ POS': 'pos_orders',
  'รายงานประจำวัน': 'daily_reports',
  'รายงานประจำเดือน': 'monthly_reports',
};

const NotificationPage = () => {
  const { toast } = useToast();
  const { shopId, loading: shopLoading } = useCurrentShop();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDiscordGuide, setShowDiscordGuide] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    // การแจ้งเตือนออเดอร์ออนไลน์
    onlineOrders: {
      enabled: true,
      platforms: {
        line: { enabled: true, token: '', type: 'user' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      },
      instantNotification: true,
      message: ''
    },
    // การแจ้งเตือนออเดอร์ POS
    posOrders: {
      enabled: true,
      platforms: {
        line: { enabled: false, token: '', type: 'user' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: true, token: '' },
        telegram: { enabled: false, token: '' }
      },
      instantNotification: true,
      message: ''
    },
    // รายงานประจำวัน
    dailyReports: {
      enabled: true,
      time: '18:00',
      sendAsImage: true, // ส่งเป็นรูปภาพ Dashboard
      platforms: {
        line: { enabled: true, token: '', type: 'user' }, // type: 'user' or 'group'
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      },
      message: 'สรุปยอดขายประจำวัน {{date}}\nยอดขายรวม: {{totalSales}} บาท\nจำนวนออเดอร์: {{orderCount}} รายการ'
    },
    // รายงานประจำเดือน
    monthlyReports: {
      enabled: true,
      dayOfMonth: 1,
      time: '09:00',
      sendAsImage: true, // ส่งเป็นรูปภาพ Dashboard
      platforms: {
        line: { enabled: true, token: '', type: 'user' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      },
      message: 'สรุปยอดขายประจำเดือน {{month}}\nยอดขายรวม: {{totalSales}} บาท\nเป้าหมาย: {{target}} บาท\nอัตราการเติบโต: {{growth}}%'
    },
    // การตั้งค่าเสียงและป๊อปอัพ
    soundPopup: {
      // การตั้งค่าสำหรับออเดอร์ออนไลน์
      online: {
        soundEnabled: true,
        popupEnabled: true,
        volume: 80
      },
      // การตั้งค่าสำหรับออเดอร์ POS
      pos: {
        soundEnabled: false,
        popupEnabled: false,
        volume: 80
      }
    }
  });

  // โหลดข้อมูลการตั้งค่าจากฐานข้อมูล (รอให้รู้สาขาปัจจุบันก่อน)
  useEffect(() => {
    if (shopLoading || !shopId) return;
    loadSettings();
  }, [shopLoading, shopId]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('shop_id', shopId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        // Merge with defaults to ensure sendAsImage is preserved
        const loadedDailyReports = (data as any).daily_reports || {};
        const loadedMonthlyReports = (data as any).monthly_reports || {};
        const loadedSoundPopup = (data as any).sound_popup || {};
        
        setSettings({
          onlineOrders: (data as any).online_orders || settings.onlineOrders,
          posOrders: (data as any).pos_orders || settings.posOrders,
          dailyReports: {
            ...settings.dailyReports,
            ...loadedDailyReports,
            sendAsImage: loadedDailyReports.sendAsImage ?? settings.dailyReports.sendAsImage
          },
          monthlyReports: {
            ...settings.monthlyReports,
            ...loadedMonthlyReports,
            sendAsImage: loadedMonthlyReports.sendAsImage ?? settings.monthlyReports.sendAsImage
          },
          soundPopup: {
            ...settings.soundPopup,
            ...loadedSoundPopup,
            online: {
              ...settings.soundPopup.online,
              ...(loadedSoundPopup.online || {})
            },
            pos: {
              ...settings.soundPopup.pos,
              ...(loadedSoundPopup.pos || {})
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'ไม่สามารถโหลดการตั้งค่าได้',
        description: 'กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);

      if (shopLoading || !shopId) {
        throw new Error('ยังไม่พบข้อมูลสาขา กรุณารอสักครู่แล้วลองใหม่');
      }

      const { data: existingData, error: selectError } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('shop_id', shopId)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing data:', selectError);
      }

      const settingsData = {
        online_orders: settings.onlineOrders,
        pos_orders: settings.posOrders,
        daily_reports: settings.dailyReports,
        monthly_reports: settings.monthlyReports,
        sound_popup: settings.soundPopup,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingData?.id) {
        result = await supabase
          .from('notification_settings')
          .update(settingsData)
          .eq('id', existingData.id)
          .eq('shop_id', shopId)
          .select('id');
      } else {
        result = await supabase
          .from('notification_settings')
          .insert({
            ...settingsData,
            shop_id: shopId,
            sound_enabled: true,
            volume: 0.5,
            duration: 5
          })
          .select('id');
      }

      if (!result.error && (!result.data || result.data.length === 0)) {
        throw new Error('ไม่มีสิทธิ์บันทึกการตั้งค่าของสาขานี้');
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'บันทึกการตั้งค่าสำเร็จ ✅',
        description: 'การตั้งค่าการแจ้งเตือนถูกบันทึกแล้ว',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'ไม่สามารถบันทึกการตั้งค่าได้',
        description: String(error?.message || 'กรุณาลองใหม่อีกครั้ง'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูลรายงานประจำวัน
  const generateDailyReport = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // ดึงข้อมูลออเดอร์วันนี้
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, bill_discount, created_at')
        .gte('created_at', startOfDay.toISOString())
        .eq('shop_id', shopId);

      if (ordersError) throw ordersError;

      // ดึงข้อมูลรายการเมนูที่ขายวันนี้
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          menu_item_name,
          quantity,
          total_price,
          order:orders!inner(created_at, shop_id)
        `)
        .gte('order.created_at', startOfDay.toISOString())
        .eq('order.shop_id', shopId);

      if (itemsError) throw itemsError;

      // คำนวณสถิติ
      const totalOrders = todayOrders?.length || 0;
      const totalSales = todayOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
      const totalDiscount = todayOrders?.reduce((sum, order) => sum + (Number(order.bill_discount) || 0), 0) || 0;
      const netSales = totalSales - totalDiscount;

      // จัดกลุ่มเมนูและเรียงตามยอดขาย
      const menuStats = orderItems?.reduce((acc: any, item) => {
        const name = item.menu_item_name;
        if (!acc[name]) {
          acc[name] = { quantity: 0, totalSales: 0 };
        }
        acc[name].quantity += item.quantity;
        acc[name].totalSales += Number(item.total_price) || 0;
        return acc;
      }, {}) || {};

      const topMenus = Object.entries(menuStats)
        .map(([name, stats]: [string, any]) => ({
          name,
          quantity: stats.quantity,
          totalSales: stats.totalSales
        }))
        .sort((a, b) => b.quantity - a.quantity || b.totalSales - a.totalSales);

      return {
        date: today.toLocaleDateString('th-TH'),
        time: today.toLocaleTimeString('th-TH'),
        totalOrders,
        totalSales,
        totalDiscount,
        netSales,
        topMenus
      };
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  };

  // ฟังก์ชันส่งรายงานไป Discord
  const sendDiscordReport = async (reportData: any, webhookUrl: string) => {
    const topMenusList = reportData.topMenus
      .map((menu: any, index: number) => 
        `${index + 1}. ${menu.name} - ${menu.quantity} รายการ (${menu.totalSales.toLocaleString()} บาท)`
      )
      .join('\n');

    const embed = {
      title: '📊 สรุปยอดขายประจำวัน',
      description: `รายงานสรุปยอดขายประจำวันที่ ${reportData.date}`,
      color: 0x00ff00,
      fields: [
        {
          name: '📅 วันที่สร้างรายงาน',
          value: `${reportData.date} เวลา ${reportData.time}`,
          inline: true
        },
        {
          name: '🛒 จำนวนออเดอร์ทั้งหมด',
          value: `${reportData.totalOrders} รายการ`,
          inline: true
        },
        {
          name: '💰 ยอดขายรวม',
          value: `${reportData.totalSales.toLocaleString()} บาท`,
          inline: true
        },
        {
          name: '💸 ส่วนลดรวม',
          value: `${reportData.totalDiscount.toLocaleString()} บาท`,
          inline: true
        },
        {
          name: '💵 ยอดขายสุทธิ',
          value: `${reportData.netSales.toLocaleString()} บาท`,
          inline: true
        },
        {
          name: '🏆 เมนูขายดีทั้งหมด',
          value: topMenusList || 'ไม่มีข้อมูล',
          inline: false
        }
      ],
      footer: {
        text: 'ระบบแจ้งเตือนร้านอาหาร'
      },
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: '📊 **รายงานประจำวัน - ส่งทันที**',
        embeds: [embed]
      })
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }
  };

  // ฟังก์ชันส่งรายงานไป LINE
  const sendLineReport = async (reportData: any, token: string, type: string = 'user', scope: LineScope = 'daily_reports') => {
    try {
      const topMenusList = reportData.topMenus
        .map((menu: any, index: number) => 
          `${index + 1}. ${menu.name} - ${menu.quantity} รายการ (${menu.totalSales.toLocaleString()} บาท)`
        )
        .join('\n');

      const messageText = `📊 สรุปยอดขายประจำวัน
📅 ${reportData.date} เวลา ${reportData.time}

🛒 จำนวนออเดอร์: ${reportData.totalOrders} รายการ
💰 ยอดขายรวม: ${reportData.totalSales.toLocaleString()} บาท
💸 ส่วนลด: ${reportData.totalDiscount.toLocaleString()} บาท
💵 ยอดขายสุทธิ: ${reportData.netSales.toLocaleString()} บาท

🏆 เมนูขายดีทั้งหมด:
${topMenusList || 'ไม่มีข้อมูล'}`;

      const { data, error } = await supabase.functions.invoke('line-messaging', {
        body: {
          action: 'send',
          userId: token, // ส่ง userId หรือ groupId
          message: messageText,
          shopId,
          scope
        }
      });

      if (error) throw error;
      
      console.log(`✅ LINE report sent successfully to ${type}:`, data);
    } catch (error) {
      console.error('❌ Error sending LINE report:', error);
      throw error;
    }
  };

  // ฟังก์ชันส่งรายงานไป Telegram (placeholder)
  const sendTelegramReport = async (reportData: any, token: string) => {
    // TODO: Implement Telegram notification
    console.log('Sending to Telegram:', reportData);
  };

  // ฟังก์ชันส่งรายงานไป Instagram (placeholder)
  const sendInstagramReport = async (reportData: any, token: string) => {
    // TODO: Implement Instagram notification
    console.log('Sending to Instagram:', reportData);
  };

  // ฟังก์ชันสร้างรูปภาพรายงาน
  const generateReportImage = async (reportType: 'daily' | 'monthly') => {
    try {
      console.log(`🖼️ Generating ${reportType} report image...`);
      
      const { data, error } = await supabase.functions.invoke('generate-report-image', {
        body: { reportType, shopId }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate image');
      }

      return {
        imageUrl: data.imageUrl,
        reportData: data.reportData,
        reportTitle: data.reportTitle
      };
    } catch (error) {
      console.error('❌ Error generating report image:', error);
      throw error;
    }
  };

  // ฟังก์ชันส่งรูปภาพไป Discord
  const sendDiscordReportWithImage = async (imageUrl: string, reportTitle: string, reportData: any, webhookUrl: string) => {
    const topMenusList = reportData.topMenus
      .map((menu: any, index: number) => 
        `${index + 1}. ${menu.name} - ${menu.quantity} รายการ (${menu.totalSales.toLocaleString()} บาท)`
      )
      .join('\n');

    const embed = {
      title: `📊 ${reportTitle}`,
      description: `สร้างเมื่อ ${reportData.date} เวลา ${reportData.time}`,
      color: 0x3b82f6,
      image: {
        url: imageUrl
      },
      fields: [
        {
          name: '🛒 จำนวนออเดอร์',
          value: `${reportData.totalOrders} รายการ`,
          inline: true
        },
        {
          name: '💰 ยอดขายรวม',
          value: `${reportData.totalSales.toLocaleString()} บาท`,
          inline: true
        },
        {
          name: '💵 ยอดขายสุทธิ',
          value: `${reportData.netSales.toLocaleString()} บาท`,
          inline: true
        },
        {
          name: '🏆 เมนูขายดีทั้งหมด',
          value: topMenusList || 'ไม่มีข้อมูล',
          inline: false
        }
      ],
      footer: {
        text: '☕ POS System'
      },
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `📊 **${reportTitle}** - Dashboard Report`,
        embeds: [embed]
      })
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }
  };

  // ฟังก์ชันส่งรูปภาพไป LINE
  const sendLineReportWithImage = async (imageUrl: string, reportTitle: string, reportData: any, token: string, type: string = 'user', scope: LineScope = 'daily_reports') => {
    try {
      const topMenusList = reportData.topMenus
        .map((menu: any, index: number) => 
          `${index + 1}. ${menu.name} - ${menu.quantity} ชิ้น`
        )
        .join('\n');

      const messageText = `📊 ${reportTitle}
📅 ${reportData.date} เวลา ${reportData.time}

🛒 ออเดอร์: ${reportData.totalOrders} รายการ
💰 ยอดขาย: ${reportData.totalSales.toLocaleString()} บาท
💸 ส่วนลด: ${reportData.totalDiscount.toLocaleString()} บาท
💵 สุทธิ: ${reportData.netSales.toLocaleString()} บาท

🏆 เมนูขายดีทั้งหมด:
${topMenusList || 'ไม่มีข้อมูล'}

📷 ดูรูปภาพรายงานด้านบน`;

      // ส่งทั้งรูปภาพและข้อความ
      const { data, error } = await supabase.functions.invoke('line-messaging', {
        body: {
          action: 'send',
          userId: token,
          message: messageText,
          imageUrl: imageUrl, // ส่ง URL รูปภาพด้วย
          shopId,
          scope
        }
      });

      if (error) throw error;
      
      console.log(`✅ LINE report with image sent successfully to ${type}:`, data);
    } catch (error) {
      console.error('❌ Error sending LINE report with image:', error);
      throw error;
    }
  };

  // ฟังก์ชันส่งรายงานทันที
  const handleSendReportNow = async (reportType: 'daily' | 'monthly' = 'daily') => {
    setIsGeneratingReport(true);
    
    try {
      const reportSettings = reportType === 'daily' ? settings.dailyReports : settings.monthlyReports;
      const sendAsImage = (reportSettings as any).sendAsImage;
      
      let sentCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      if (sendAsImage) {
        // ส่งเป็นรูปภาพ
        toast({
          title: '🖼️ กำลังสร้างรูปภาพรายงาน...',
          description: 'กรุณารอสักครู่',
        });

        const { imageUrl, reportData, reportTitle } = await generateReportImage(reportType);
        
        // ส่งไป Discord ถ้าเปิดใช้งาน
        if (reportSettings.platforms.discord.enabled && reportSettings.platforms.discord.token) {
          try {
            await sendDiscordReportWithImage(imageUrl, reportTitle, reportData, reportSettings.platforms.discord.token);
            sentCount++;
          } catch (error) {
            errorCount++;
            errors.push(`Discord: ${error}`);
          }
        }

        // ส่งไป LINE ถ้าเปิดใช้งาน
        if (reportSettings.platforms.line.enabled && reportSettings.platforms.line.token) {
          try {
            await sendLineReportWithImage(
              imageUrl,
              reportTitle,
              reportData, 
              reportSettings.platforms.line.token,
              (reportSettings.platforms.line as any).type || 'user',
              reportType === 'daily' ? 'daily_reports' : 'monthly_reports'
            );
            sentCount++;
          } catch (error) {
            errorCount++;
            errors.push(`LINE: ${error}`);
          }
        }
      } else if (reportType === 'monthly') {
        // รายงานประจำเดือน: ใช้ข้อมูลทั้งเดือนของสาขานี้ ส่งทุกช่องทางที่บันทึกไว้
        const { data, error } = await supabase.functions.invoke('send-daily-report', {
          body: { manual_trigger: true, reportType: 'monthly', shopId }
        });
        if (error) throw error;
        const shop = (data?.shops || [])[0];
        if (!shop) {
          toast({ title: 'ยังไม่ได้บันทึกการตั้งค่ารายงานประจำเดือน', description: 'กรุณาเปิดใช้งานและกดบันทึกก่อนส่ง', variant: 'destructive' });
          return;
        }
        toast({ title: 'ส่งรายงานประจำเดือนสำเร็จ! ✅', description: `ส่งไปยัง ${shop.sentCount || 0} แพลตฟอร์มแล้ว` });
        return;
      } else {
        // ส่งแบบข้อความปกติ
        const reportData = await generateDailyReport();
        
        // ส่งไป Discord ถ้าเปิดใช้งาน
        if (reportSettings.platforms.discord.enabled && reportSettings.platforms.discord.token) {
          try {
            await sendDiscordReport(reportData, reportSettings.platforms.discord.token);
            sentCount++;
          } catch (error) {
            errorCount++;
            errors.push(`Discord: ${error}`);
          }
        }

        // ส่งไป LINE ถ้าเปิดใช้งาน
        if (reportSettings.platforms.line.enabled && reportSettings.platforms.line.token) {
          try {
            await sendLineReport(
              reportData, 
              reportSettings.platforms.line.token,
              (reportSettings.platforms.line as any).type || 'user',
              reportType === 'daily' ? 'daily_reports' : 'monthly_reports'
            );
            sentCount++;
          } catch (error) {
            errorCount++;
            errors.push(`LINE: ${error}`);
          }
        }
      }

      // ส่งไป Telegram ถ้าเปิดใช้งาน
      if (reportSettings.platforms.telegram.enabled && reportSettings.platforms.telegram.token) {
        try {
          await sendTelegramReport({}, reportSettings.platforms.telegram.token);
          sentCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Telegram: ${error}`);
        }
      }

      // ส่งไป Instagram ถ้าเปิดใช้งาน
      if (reportSettings.platforms.instagram.enabled && reportSettings.platforms.instagram.token) {
        try {
          await sendInstagramReport({}, reportSettings.platforms.instagram.token);
          sentCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Instagram: ${error}`);
        }
      }

      // แสดงผลลัพธ์
      if (sentCount > 0) {
        toast({
          title: sendAsImage ? '🖼️ ส่งรายงานพร้อมรูปภาพสำเร็จ! ✅' : 'ส่งรายงานสำเร็จ! ✅',
          description: `ส่งรายงานไปยัง ${sentCount} แพลตฟอร์มแล้ว${errorCount > 0 ? ` (มีข้อผิดพลาด ${errorCount} แพลตฟอร์ม)` : ''}`,
        });
      } else {
        toast({
          title: 'ไม่สามารถส่งรายงานได้',
          description: 'กรุณาตรวจสอบการตั้งค่าแพลตฟอร์มและ API Token',
          variant: 'destructive'
        });
      }

      if (errors.length > 0) {
        console.error('Notification errors:', errors);
      }

    } catch (error) {
      console.error('Error sending report:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างหรือส่งรายงานได้',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveSettings = () => {
    saveSettings();
  };

  const handleTestNotification = async (type: string, platform: string) => {
    if (platform === 'Discord') {
      // ทดสอบ Discord Webhook
      const discordToken = settings.onlineOrders.platforms.discord.token;
      if (!discordToken) {
        toast({
          title: 'ไม่พบ Webhook URL',
          description: 'กรุณาใส่ Discord Webhook URL ก่อนทดสอบ',
          variant: 'destructive'
        });
        return;
      }

      try {
        const testMessage = {
          content: '🧪 **ทดสอบการแจ้งเตือน**',
          embeds: [{
            title: '🔔 ทดสอบระบบแจ้งเตือนร้านอาหาร',
            description: `การทดสอบ: ${type}`,
            color: 0x00ff00, // สีเขียว
            fields: [
              {
                name: '📅 วันที่',
                value: new Date().toLocaleDateString('th-TH'),
                inline: true
              },
              {
                name: '⏰ เวลา',
                value: new Date().toLocaleTimeString('th-TH'),
                inline: true
              }
            ],
            footer: {
              text: 'ระบบแจ้งเตือนร้านอาหาร'
            },
            timestamp: new Date().toISOString()
          }]
        };

        const response = await fetch(discordToken, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testMessage)
        });

        if (response.ok) {
          toast({
            title: 'ทดสอบสำเร็จ! ✅',
            description: 'ข้อความทดสอบถูกส่งไปยัง Discord แล้ว',
          });
        } else {
          const errorText = await response.text();
          toast({
            title: 'ทดสอบไม่สำเร็จ',
            description: `Error: ${response.status} - ตรวจสอบ Webhook URL`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถเชื่อมต่อ Discord ได้ กรุณาตรวจสอบ URL',
          variant: 'destructive'
        });
      }
    } else if (platform === 'LINE') {
      // ทดสอบ LINE Messaging API
      let lineToken = '';
      if (type === 'ออเดอร์ออนไลน์') {
        lineToken = settings.onlineOrders.platforms.line.token;
      } else if (type === 'ออเดอร์ POS') {
        lineToken = settings.posOrders.platforms.line.token;
      } else if (type === 'รายงานประจำวัน') {
        lineToken = settings.dailyReports.platforms.line.token;
      } else if (type === 'รายงานประจำเดือน') {
        lineToken = settings.monthlyReports.platforms.line.token;
      }

      if (!lineToken || lineToken.trim() === '') {
        toast({
          title: 'ไม่พบ LINE ID',
          description: 'กรุณากรอก LINE User ID หรือ Group ID ในช่องด้านบน (ไม่ใช่ Channel Access Token)',
          variant: 'destructive'
        });
        return;
      }

      const targetId = (lineToken.includes(':') ? lineToken.split(':')[0] : lineToken).trim();
      const isGroupMode = ((): boolean => {
        if (type === 'ออเดอร์ออนไลน์') return settings.onlineOrders.platforms.line.type === 'group';
        if (type === 'ออเดอร์ POS') return settings.posOrders.platforms.line.type === 'group';
        if (type === 'รายงานประจำวัน') return (settings.dailyReports.platforms.line as any).type === 'group';
        return (settings.monthlyReports.platforms.line as any).type === 'group';
      })();

      if (isGroupMode && !/^[CR][0-9a-f]{32}$/i.test(targetId)) {
        toast({
          title: 'Group ID ไม่ถูกต้อง',
          description: 'Group ID ต้องขึ้นต้นด้วยตัว C (หรือ R สำหรับห้องแชท) และยาว 33 ตัวอักษร เชิญบอทเข้ากลุ่มแล้วพิมพ์ข้อความในกลุ่ม บอทจะตอบ Group ID กลับมา',
          variant: 'destructive'
        });
        return;
      }
      if (!isGroupMode && !/^U[0-9a-f]{32}$/i.test(targetId)) {
        toast({
          title: 'User ID ไม่ถูกต้อง',
          description: 'User ID ต้องขึ้นต้นด้วยตัว U และยาว 33 ตัวอักษร หากต้องการส่งเข้ากลุ่ม กรุณาเลือกประเภทการส่งเป็น Group',
          variant: 'destructive'
        });
        return;
      }

      const describeLineError = (status: number, detail: string) => {
        if (status === 429 || /monthly limit/i.test(detail)) {
          return 'โควต้าข้อความ LINE รายเดือนหมดแล้ว — LINE จะรีเซ็ตโควต้าในวันที่ 1 ของเดือนถัดไป หรืออัปเกรดแพลนใน LINE Official Account Manager เพื่อส่งต่อได้ทันที (ระหว่างนี้แจ้งเตือนผ่าน Discord ยังทำงานปกติ)';
        }
        if (status === 401) return 'Channel Access Token ไม่ถูกต้องหรือหมดอายุ กรุณาออก Token ใหม่จาก LINE Developers';
        if (status === 403) {
          return isGroupMode
            ? 'บัญชีทางการ (บอท) ยังไม่ได้อยู่ในกลุ่มนี้ หรือกลุ่มนี้เป็นของบัญชีทางการคนละบัญชีกับที่ระบบใช้อยู่ กรุณาเชิญบอทเข้ากลุ่มก่อน'
            : 'ผู้ใช้คนนี้ยังไม่ได้เพิ่มบอทเป็นเพื่อน หรือบล็อกบอทอยู่';
        }
        if (status === 404) {
          return isGroupMode
            ? 'ไม่พบกลุ่มนี้ บอทอาจถูกเตะออกจากกลุ่มแล้ว หรือรหัสกลุ่มไม่ตรง'
            : 'ไม่พบผู้ใช้คนนี้ กรุณาตรวจสอบ User ID อีกครั้ง';
        }
        if (status === 400) return 'รหัสปลายทางไม่ถูกต้อง กรุณาคัดลอก ID ที่บอทตอบกลับมาให้ครบทุกตัวอักษร';
        return detail || 'ส่งข้อความไม่สำเร็จ';
      };

      try {
        // ตรวจก่อนว่าบอทเข้าถึงปลายทางนี้ได้จริงไหม
        const { data: verify } = await supabase.functions.invoke('line-messaging', {
          body: { action: 'verifyTarget', userId: targetId, shopId, scope: SCOPE_BY_TYPE[type] || 'default' }
        });

        if (verify && verify.ok === false) {
          toast({
            title: 'ทดสอบไม่สำเร็จ',
            description: describeLineError(Number(verify.status) || 0, String(verify.lineError || '')),
            variant: 'destructive'
          });
          return;
        }

        const testMessage = `🧪 ทดสอบระบบแจ้งเตือนร้านอาหาร

ประเภท: ${type}
📅 วันที่: ${new Date().toLocaleDateString('th-TH')}
⏰ เวลา: ${new Date().toLocaleTimeString('th-TH')}

✅ ระบบแจ้งเตือน LINE ทำงานปกติ`;

        const { data, error } = await supabase.functions.invoke('line-messaging', {
          body: {
            action: 'send',
            userId: targetId,
            message: testMessage,
            shopId,
            scope: SCOPE_BY_TYPE[type] || 'default'
          }
        });

        if (error) throw error;
        if (data && data.success === false) {
          toast({
            title: 'ทดสอบไม่สำเร็จ',
            description: describeLineError(Number(data.status) || 0, String(data.lineError || '')),
            variant: 'destructive'
          });
          return;
        }
        if (data?.error) throw new Error(data.error);

        toast({
          title: 'ทดสอบสำเร็จ! ✅',
          description: isGroupMode ? 'ข้อความทดสอบถูกส่งเข้ากลุ่ม LINE แล้ว' : 'ข้อความทดสอบถูกส่งไปยัง LINE แล้ว',
        });
      } catch (error: any) {
        console.error('LINE test error:', error);
        const raw = String(error?.message || error);
        let hint = raw;
        if (raw.includes('429') || /monthly limit/i.test(raw)) {
          hint = 'โควต้าข้อความ LINE รายเดือนหมดแล้ว — LINE จะรีเซ็ตโควต้าในวันที่ 1 ของเดือนถัดไป หรืออัปเกรดแพลนใน LINE Official Account Manager เพื่อส่งต่อได้ทันที (ระหว่างนี้แจ้งเตือนผ่าน Discord ยังทำงานปกติ)';
        } else if (raw.includes('403') || raw.toLowerCase().includes('forbidden')) {
          hint = isGroupMode
            ? 'บอทยังไม่ได้อยู่ในกลุ่มนี้ หรือถูกเตะออกจากกลุ่มแล้ว กรุณาเชิญ LINE Official Account เข้ากลุ่มก่อน'
            : 'ผู้ใช้คนนี้ยังไม่ได้เพิ่มบอทเป็นเพื่อน หรือบล็อกบอทอยู่';
        } else if (raw.includes('400')) {
          hint = 'ID ที่กรอกไม่ถูกต้อง กรุณาคัดลอก ID ที่บอทตอบกลับมาให้ครบทุกตัวอักษร';
        }
        toast({
          title: 'ทดสอบไม่สำเร็จ',
          description: hint,
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'ส่งการทดสอบแล้ว',
        description: `ทดสอบการแจ้งเตือน${type}ผ่าน ${platform}`,
      });
    }
  };

  const PlatformSettings = ({ 
    type, 
    platforms, 
    onChange 
  }: { 
    type: string;
    platforms: any;
    onChange: (platform: string, field: string, value: any) => void;
  }) => (
    <div className="space-y-4">
      {Object.entries(platforms).map(([platform, config]: [string, any]) => {
        const platformIcons = {
          line: MessageSquare,
          instagram: Instagram,
          discord: Send,
          telegram: Phone
        };
        const Icon = platformIcons[platform as keyof typeof platformIcons];
        const platformNames = {
          line: 'LINE',
          instagram: 'Instagram',
          discord: 'Discord',
          telegram: 'Telegram'
        };

        const getTokenLabel = (platform: string) => {
          switch (platform) {
            case 'discord':
              return 'Discord Webhook URL';
            case 'line':
              return 'LINE User ID (รับจากแชทหรือ LINE Official Account Manager)';
            case 'telegram':
              return 'Telegram Bot Token';
            case 'instagram':
              return 'Instagram API Token';
            default:
              return 'API Token';
          }
        };

        const getTokenPlaceholder = (platform: string) => {
          switch (platform) {
            case 'discord':
              return 'https://discord.com/api/webhooks/...';
            case 'line':
              return 'ใส่ LINE User ID ของคุณ (เช่น Uxxxxxxxxxxxxxxxxxxxxx)';
            case 'telegram':
              return 'Bot Token จาก @BotFather';
            case 'instagram':
              return 'Instagram API Token';
            default:
              return `${platformNames[platform as keyof typeof platformNames]} API Token`;
          }
        };

        return (
          <Card key={platform} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <Label className="font-medium">{platformNames[platform as keyof typeof platformNames]}</Label>
                <Badge variant={config.enabled ? "default" : "secondary"}>
                  {config.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </Badge>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => onChange(platform, 'enabled', checked)}
              />
            </div>
            
            {config.enabled && (
              <div className="space-y-3">
                {/* LINE Type Selector - แสดงสำหรับทุกประเภทการแจ้งเตือน */}
                {platform === 'line' && (
                  <LineAccountFields
                    shopId={shopId}
                    scope={SCOPE_BY_TYPE[type] || 'default'}
                    title="บัญชี LINE สำหรับการแจ้งเตือนนี้"
                    description="เว้นว่างไว้ = ใช้บัญชีเริ่มต้นของร้าน กรอกใหม่เมื่ออยากให้ส่งจากบัญชี LINE คนละบัญชี"
                  />
                )}

                {platform === 'line' && (
                  <div>
                    <Label htmlFor={`${type}-${platform}-type`}>ประเภทการส่ง</Label>
                    <Select
                      value={(config as any).type || 'user'}
                      onValueChange={(value) => onChange(platform, 'type', value)}
                    >
                      <SelectTrigger id={`${type}-${platform}-type`}>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">👤 ส่งไปยัง User (1:1 Chat)</SelectItem>
                        <SelectItem value="group">👥 ส่งไปยัง Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor={`${type}-${platform}-token`}>{getTokenLabel(platform)}</Label>
                    {platform === 'discord' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowDiscordGuide(!showDiscordGuide)}
                        className="text-xs"
                      >
                        {showDiscordGuide ? 'ซ่อนคู่มือ' : 'ดูคู่มือ'}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id={`${type}-${platform}-token`}
                        type={platform === 'discord' ? 'url' : 'text'}
                        placeholder={getTokenPlaceholder(platform)}
                        value={config.token || ''}
                        onChange={(e) => onChange(platform, 'token', e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestNotification(type, platformNames[platform as keyof typeof platformNames])}
                        disabled={!config.token || !config.enabled}
                      >
                        <TestTube className="w-4 h-4" />
                        ทดสอบ
                      </Button>
                    </div>
                    {platform === 'line' && (
                      <p className="text-xs text-muted-foreground whitespace-pre-line">
                        {(config as any).type === 'group' 
                          ? '💡 วิธีรับ Group ID:\n1) เชิญ LINE Official Account (บอท) เข้ากลุ่ม\n2) พิมพ์ข้อความอะไรก็ได้ในกลุ่ม บอทจะตอบ Group ID กลับมา\n3) คัดลอก ID ที่ขึ้นต้นด้วย C มาวางในช่องนี้\n⚠️ ต้องเปิด "Allow bot to join group chats" ใน LINE Developers ก่อน'
                          : '💡 ใส่ LINE User ID ของคุณ (หาได้จากการส่งข้อความมาที่บอท หรือจาก LINE Official Account Manager)'}
                      </p>
                    )}
                  </div>
                </div>
                
                {platform === 'discord' && showDiscordGuide && (
                  <DiscordWebhookGuide />
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-background flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
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
          
          <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ระบบแจ้งเตือน</h1>
                <p className="text-gray-600">จัดการการแจ้งเตือนผ่าน LINE, Instagram, Discord และ Telegram</p>
              </div>
            </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">บัญชี LINE เริ่มต้นของร้าน</CardTitle>
            <CardDescription>
              ใช้กับการแจ้งเตือนทุกประเภทที่ไม่ได้ตั้งบัญชีเฉพาะไว้ เปลี่ยนบัญชีเมื่อไหร่ก็ได้โดยไม่ต้องแก้ระบบหลังบ้าน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineAccountFields
              shopId={shopId}
              scope="default"
              allowUseDefault={false}
              title="บัญชี LINE เริ่มต้น"
              description="คัดลอก Channel Access Token และ Channel Secret จาก LINE Developers ของบัญชีทางการที่ต้องการใช้"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="online-orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="online-orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              ออเดอร์ออนไลน์
            </TabsTrigger>
            <TabsTrigger value="pos-orders" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              ออเดอร์ POS
            </TabsTrigger>
            <TabsTrigger value="daily-reports" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              รายงานประจำวัน
            </TabsTrigger>
            <TabsTrigger value="monthly-reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              รายงานประจำเดือน
            </TabsTrigger>
            <TabsTrigger value="sound-popup" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              เสียงและป๊อปอัพ
            </TabsTrigger>
          </TabsList>

          {/* การแจ้งเตือนออเดอร์ออนไลน์ */}
          <TabsContent value="online-orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                    <div>
                      <CardTitle>การแจ้งเตือนออเดอร์ออนไลน์</CardTitle>
                      <CardDescription>
                        แจ้งเตือนทันทีเมื่อมีออเดอร์ออนไลน์เข้ามาใหม่
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <Badge variant="outline">ส่งทันที</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="online-orders-enabled" className="text-base font-medium">
                    เปิดใช้งานการแจ้งเตือนออเดอร์ออนไลน์
                  </Label>
                  <Switch
                    id="online-orders-enabled"
                    checked={settings.onlineOrders.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        onlineOrders: { ...prev.onlineOrders, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.onlineOrders.enabled && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">แพลตฟอร์มการส่ง</h3>
                      <PlatformSettings
                        type="ออเดอร์ออนไลน์"
                        platforms={settings.onlineOrders.platforms}
                        onChange={(platform, field, value) =>
                          setSettings(prev => ({
                            ...prev,
                            onlineOrders: {
                              ...prev.onlineOrders,
                              platforms: {
                                ...prev.onlineOrders.platforms,
                                [platform]: {
                                  ...prev.onlineOrders.platforms[platform as keyof typeof prev.onlineOrders.platforms],
                                  [field]: value
                                }
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* การแจ้งเตือนออเดอร์ POS */}
          <TabsContent value="pos-orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-orange-600" />
                    <div>
                      <CardTitle>การแจ้งเตือนออเดอร์ POS</CardTitle>
                      <CardDescription>
                        แจ้งเตือนทันทีเมื่อมีการสั่งซื้อใหม่ในหน้า POS
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <Badge variant="outline">ส่งทันที</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pos-orders-enabled" className="text-base font-medium">
                    เปิดใช้งานการแจ้งเตือนออเดอร์ POS
                  </Label>
                  <Switch
                    id="pos-orders-enabled"
                    checked={settings.posOrders.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        posOrders: { ...prev.posOrders, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.posOrders.enabled && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">แพลตฟอร์มการส่ง</h3>
                      <PlatformSettings
                        type="ออเดอร์ POS"
                        platforms={settings.posOrders.platforms}
                        onChange={(platform, field, value) =>
                          setSettings(prev => ({
                            ...prev,
                            posOrders: {
                              ...prev.posOrders,
                              platforms: {
                                ...prev.posOrders.platforms,
                                [platform]: {
                                  ...prev.posOrders.platforms[platform as keyof typeof prev.posOrders.platforms],
                                  [field]: value
                                }
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* รายงานประจำวัน */}
          <TabsContent value="daily-reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-6 h-6 text-blue-600" />
                    <div>
                      <CardTitle>รายงานประจำวัน</CardTitle>
                      <CardDescription>
                        ส่งสรุปยอดขายประจำวันในเวลาที่กำหนด
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSendReportNow('daily')}
                    disabled={isGeneratingReport}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Send className="w-4 h-4" />
                    {isGeneratingReport ? 'กำลังส่ง...' : 'ส่งสรุปทันที'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-reports-enabled" className="text-base font-medium">
                    เปิดใช้งานรายงานประจำวัน
                  </Label>
                  <Switch
                    id="daily-reports-enabled"
                    checked={settings.dailyReports.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        dailyReports: { ...prev.dailyReports, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.dailyReports.enabled && (
                  <>
                    <Separator />
                    
                    {/* ตัวเลือกส่งเป็นรูปภาพ */}
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <BarChart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Label htmlFor="daily-send-as-image" className="text-base font-medium">
                            ส่งเป็นรูปภาพ Dashboard
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            สร้างรูปภาพสรุปยอดขาย พร้อมส่งรายการเมนูขายดีทั้งหมด
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="daily-send-as-image"
                        checked={(settings.dailyReports as any).sendAsImage || false}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            dailyReports: { ...prev.dailyReports, sendAsImage: checked } as any
                          }))
                        }
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="daily-time">เวลาส่งรายงาน</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <Input
                            id="daily-time"
                            type="time"
                            value={settings.dailyReports.time}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                dailyReports: { ...prev.dailyReports, time: e.target.value }
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="daily-message">เทมเพลตข้อความ</Label>
                      <Textarea
                        id="daily-message"
                        value={settings.dailyReports.message}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            dailyReports: { ...prev.dailyReports, message: e.target.value }
                          }))
                        }
                        placeholder="เทมเพลตข้อความรายงานประจำวัน"
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        ใช้ {`{{date}}, {{totalSales}}, {{orderCount}}`} เป็นตัวแปร
                      </p>
                    </div>

                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">แพลตฟอร์มการส่ง</h3>
                      <PlatformSettings
                        type="รายงานประจำวัน"
                        platforms={settings.dailyReports.platforms}
                        onChange={(platform, field, value) =>
                          setSettings(prev => ({
                            ...prev,
                            dailyReports: {
                              ...prev.dailyReports,
                              platforms: {
                                ...prev.dailyReports.platforms,
                                [platform]: {
                                  ...prev.dailyReports.platforms[platform as keyof typeof prev.dailyReports.platforms],
                                  [field]: value
                                }
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* รายงานประจำเดือน */}
          <TabsContent value="monthly-reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <div>
                      <CardTitle>รายงานประจำเดือน</CardTitle>
                      <CardDescription>
                        ส่งสรุปยอดขายประจำเดือนในวันและเวลาที่กำหนด
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSendReportNow('monthly')}
                    disabled={isGeneratingReport}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Send className="w-4 h-4" />
                    {isGeneratingReport ? 'กำลังส่ง...' : 'ส่งสรุปทันที'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly-reports-enabled" className="text-base font-medium">
                    เปิดใช้งานรายงานประจำเดือน
                  </Label>
                  <Switch
                    id="monthly-reports-enabled"
                    checked={settings.monthlyReports.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        monthlyReports: { ...prev.monthlyReports, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.monthlyReports.enabled && (
                  <>
                    <Separator />
                    
                    {/* ตัวเลือกส่งเป็นรูปภาพ */}
                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                          <BarChart className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <Label htmlFor="monthly-send-as-image" className="text-base font-medium">
                            ส่งเป็นรูปภาพ Dashboard
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            สร้างรูปภาพสรุปยอดขายเดือน พร้อมส่งรายการเมนูขายดีทั้งหมด
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="monthly-send-as-image"
                        checked={(settings.monthlyReports as any).sendAsImage || false}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            monthlyReports: { ...prev.monthlyReports, sendAsImage: checked } as any
                          }))
                        }
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthly-day">วันที่ส่งรายงาน</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <Select
                            value={settings.monthlyReports.dayOfMonth.toString()}
                            onValueChange={(value) =>
                              setSettings(prev => ({
                                ...prev,
                                monthlyReports: { ...prev.monthlyReports, dayOfMonth: parseInt(value) }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกวันที่" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                <SelectItem key={day} value={day.toString()}>
                                  วันที่ {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="monthly-time">เวลาส่งรายงาน</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <Input
                            id="monthly-time"
                            type="time"
                            value={settings.monthlyReports.time}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                monthlyReports: { ...prev.monthlyReports, time: e.target.value }
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="monthly-message">เทมเพลตข้อความ</Label>
                      <Textarea
                        id="monthly-message"
                        value={settings.monthlyReports.message}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            monthlyReports: { ...prev.monthlyReports, message: e.target.value }
                          }))
                        }
                        placeholder="เทมเพลตข้อความรายงานประจำเดือน"
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        ใช้ {`{{month}}, {{totalSales}}, {{target}}, {{growth}}`} เป็นตัวแปร
                      </p>
                    </div>

                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">แพลตฟอร์มการส่ง</h3>
                      <PlatformSettings
                        type="รายงานประจำเดือน"
                        platforms={settings.monthlyReports.platforms}
                        onChange={(platform, field, value) =>
                          setSettings(prev => ({
                            ...prev,
                            monthlyReports: {
                              ...prev.monthlyReports,
                              platforms: {
                                ...prev.monthlyReports.platforms,
                                [platform]: {
                                  ...prev.monthlyReports.platforms[platform as keyof typeof prev.monthlyReports.platforms],
                                  [field]: value
                                }
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* การตั้งค่าเสียงและป๊อปอัพ */}
          <TabsContent value="sound-popup">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Volume2 className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle>การตั้งค่าเสียงและป๊อปอัพ</CardTitle>
                    <CardDescription>
                      ตั้งค่าเสียงแจ้งเตือนและป๊อปอัพสำหรับออเดอร์ออนไลน์และ POS
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* การตั้งค่าสำหรับออเดอร์ออนไลน์ */}
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">ออเดอร์ออนไลน์ (Online)</h3>
                      <p className="text-sm text-green-600 dark:text-green-400">การแจ้งเตือนเมื่อมีออเดอร์จากลูกค้า</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* เสียงแจ้งเตือน */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {settings.soundPopup.online.soundEnabled ? (
                          <Volume2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Label htmlFor="online-sound-enabled" className="font-medium">เสียงแจ้งเตือน</Label>
                          <p className="text-xs text-muted-foreground">เปิด/ปิดเสียงเมื่อมีออเดอร์ใหม่</p>
                        </div>
                      </div>
                      <Switch
                        id="online-sound-enabled"
                        checked={settings.soundPopup.online.soundEnabled}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            soundPopup: {
                              ...prev.soundPopup,
                              online: { ...prev.soundPopup.online, soundEnabled: checked }
                            }
                          }))
                        }
                      />
                    </div>
                    
                    {/* ป๊อปอัพแจ้งเตือน */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <BellRing className={`w-5 h-5 ${settings.soundPopup.online.popupEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <Label htmlFor="online-popup-enabled" className="font-medium">ป๊อปอัพแจ้งเตือน</Label>
                          <p className="text-xs text-muted-foreground">แสดงป๊อปอัพเมื่อมีออเดอร์ใหม่</p>
                        </div>
                      </div>
                      <Switch
                        id="online-popup-enabled"
                        checked={settings.soundPopup.online.popupEnabled}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            soundPopup: {
                              ...prev.soundPopup,
                              online: { ...prev.soundPopup.online, popupEnabled: checked }
                            }
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Volume Slider for Online */}
                  {settings.soundPopup.online.soundEnabled && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">ระดับเสียง</Label>
                        <span className="text-sm text-muted-foreground">{settings.soundPopup.online.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.soundPopup.online.volume}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            soundPopup: {
                              ...prev.soundPopup,
                              online: { ...prev.soundPopup.online, volume: parseInt(e.target.value) }
                            }
                          }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* การตั้งค่าสำหรับออเดอร์ POS */}
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <Monitor className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-800 dark:text-orange-200">ออเดอร์ POS (หน้าร้าน)</h3>
                      <p className="text-sm text-orange-600 dark:text-orange-400">การแจ้งเตือนเมื่อมีออเดอร์จากหน้า POS</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* เสียงแจ้งเตือน */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {settings.soundPopup.pos.soundEnabled ? (
                          <Volume2 className="w-5 h-5 text-orange-600" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Label htmlFor="pos-sound-enabled" className="font-medium">เสียงแจ้งเตือน</Label>
                          <p className="text-xs text-muted-foreground">เปิด/ปิดเสียงเมื่อมีออเดอร์ใหม่</p>
                        </div>
                      </div>
                      <Switch
                        id="pos-sound-enabled"
                        checked={settings.soundPopup.pos.soundEnabled}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            soundPopup: {
                              ...prev.soundPopup,
                              pos: { ...prev.soundPopup.pos, soundEnabled: checked }
                            }
                          }))
                        }
                      />
                    </div>
                    
                    {/* ป๊อปอัพแจ้งเตือน */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <BellRing className={`w-5 h-5 ${settings.soundPopup.pos.popupEnabled ? 'text-orange-600' : 'text-gray-400'}`} />
                        <div>
                          <Label htmlFor="pos-popup-enabled" className="font-medium">ป๊อปอัพแจ้งเตือน</Label>
                          <p className="text-xs text-muted-foreground">แสดงป๊อปอัพเมื่อมีออเดอร์ใหม่</p>
                        </div>
                      </div>
                      <Switch
                        id="pos-popup-enabled"
                        checked={settings.soundPopup.pos.popupEnabled}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            soundPopup: {
                              ...prev.soundPopup,
                              pos: { ...prev.soundPopup.pos, popupEnabled: checked }
                            }
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Volume Slider for POS */}
                  {settings.soundPopup.pos.soundEnabled && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">ระดับเสียง</Label>
                        <span className="text-sm text-muted-foreground">{settings.soundPopup.pos.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.soundPopup.pos.volume}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            soundPopup: {
                              ...prev.soundPopup,
                              pos: { ...prev.soundPopup.pos, volume: parseInt(e.target.value) }
                            }
                          }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />
                    </div>
                  )}
                </div>

                {/* คำอธิบายเพิ่มเติม */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">คำแนะนำ</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                        <li>• <strong>ออเดอร์ออนไลน์</strong>: แนะนำให้เปิดเสียงและป๊อปอัพ เพื่อรับทราบออเดอร์จากลูกค้าทันที</li>
                        <li>• <strong>ออเดอร์ POS</strong>: สามารถปิดได้ เนื่องจากพนักงานรับออเดอร์เองที่หน้าร้านอยู่แล้ว</li>
                        <li>• การตั้งค่านี้จะมีผลกับการแจ้งเตือนในแอปพลิเคชันทั้งหมด</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

            {/* ปุ่มบันทึก */}
            <div className="flex justify-end gap-3 pt-6">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving || isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
