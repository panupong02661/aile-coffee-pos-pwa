
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Send, Save } from 'lucide-react';
import { NotificationService, ScheduledNotification } from './NotificationService';

interface NotificationSchedulerProps {
  onScheduled: (notification: ScheduledNotification) => void;
}

export const NotificationScheduler: React.FC<NotificationSchedulerProps> = ({ onScheduled }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    scheduledDate: '',
    scheduledTime: '',
    recipients: 'all_customers',
    icon: 'coffee',
    priority: 'normal'
  });
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  const recipientOptions = [
    { value: 'all_customers', label: 'ลูกค้าทั้งหมด', count: 1247 },
    { value: 'vip_customers', label: 'ลูกค้า VIP', count: 89 },
    { value: 'recent_orders', label: 'ลูกค้าที่สั่งล่าสุด', count: 156 },
    { value: 'gold_members', label: 'สมาชิก Gold', count: 234 },
    { value: 'new_customers', label: 'ลูกค้าใหม่', count: 67 }
  ];

  const iconOptions = [
    { value: 'coffee', label: '☕ กาแฟ' },
    { value: 'gift', label: '🎁 ของขวัญ' },
    { value: 'star', label: '⭐ ดาว' },
    { value: 'heart', label: '❤️ หัวใจ' },
    { value: 'bell', label: '🔔 กระดิ่ง' },
    { value: 'fire', label: '🔥 ไฟ' },
    { value: 'sparkles', label: '✨ ประกาย' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'ต่ำ' },
    { value: 'normal', label: 'ปกติ' },
    { value: 'high', label: 'สูง' },
    { value: 'urgent', label: 'เร่งด่วน' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRecipientCount = (recipientType: string): number => {
    const option = recipientOptions.find(opt => opt.value === recipientType);
    return option?.count || 0;
  };

  const handleSchedule = async () => {
    if (!formData.title || !formData.message || !formData.scheduledDate || !formData.scheduledTime) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "โปรดระบุหัวข้อ, ข้อความ, วันที่ และเวลา",
        variant: "destructive"
      });
      return;
    }

    setIsScheduling(true);

    try {
      const scheduledTime = `${formData.scheduledDate} ${formData.scheduledTime}`;
      const recipientCount = getRecipientCount(formData.recipients);

      const scheduledNotification = NotificationService.scheduleNotification({
        title: formData.title,
        message: formData.message,
        scheduledTime,
        recipients: formData.recipients,
        recipientCount
      });

      onScheduled(scheduledNotification);

      // Reset form
      setFormData({
        title: '',
        message: '',
        scheduledDate: '',
        scheduledTime: '',
        recipients: 'all_customers',
        icon: 'coffee',
        priority: 'normal'
      });

      toast({
        title: "กำหนดการแจ้งเตือนสำเร็จ! 📅",
        description: `จะส่งไปยัง ${recipientCount} คน เวลา ${new Date(scheduledTime).toLocaleString('th-TH')}`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถกำหนดการแจ้งเตือนได้",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendNow = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "โปรดระบุหัวข้อและข้อความ",
        variant: "destructive"
      });
      return;
    }

    setIsScheduling(true);

    try {
      const recipientCount = getRecipientCount(formData.recipients);
      
      const success = await NotificationService.sendBulkNotification({
        title: formData.title,
        message: formData.message,
        recipients: formData.recipients,
        recipientCount,
        icon: formData.icon,
        priority: formData.priority
      });

      if (success) {
        toast({
          title: "ส่งการแจ้งเตือนสำเร็จ! 🎉",
          description: `ส่งไปยัง ${recipientCount} คนแล้ว`,
        });

        // Reset form
        setFormData({
          title: '',
          message: '',
          scheduledDate: '',
          scheduledTime: '',
          recipients: 'all_customers',
          icon: 'coffee',
          priority: 'normal'
        });
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งการแจ้งเตือนได้",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const saveDraft = () => {
    const drafts = localStorage.getItem('notificationDrafts');
    const draftList = drafts ? JSON.parse(drafts) : [];
    
    const newDraft = {
      id: `DRAFT${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString()
    };

    draftList.push(newDraft);
    localStorage.setItem('notificationDrafts', JSON.stringify(draftList));

    toast({
      title: "บันทึกร่างสำเร็จ! 📝",
      description: "สามารถกลับมาแก้ไขและส่งทีหลังได้",
    });
  };

  // Get minimum date/time for scheduling (current time + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
    };
  };

  const minDateTime = getMinDateTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          สร้างการแจ้งเตือน
        </CardTitle>
        <CardDescription>
          สร้างและส่งการแจ้งเตือนทันที หรือกำหนดเวลาส่ง
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">หัวข้อการแจ้งเตือน *</Label>
            <Input 
              id="title"
              placeholder="เช่น: ออเดอร์ของคุณพร้อมแล้ว!"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipients">ผู้รับ</Label>
            <Select value={formData.recipients} onValueChange={(value) => handleInputChange('recipients', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recipientOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} ({option.count.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">ข้อความ *</Label>
          <Textarea 
            id="message"
            placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icon">ไอคอน</Label>
            <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">ความสำคัญ</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>จำนวนผู้รับ</Label>
            <div className="p-2 bg-muted rounded text-center font-semibold">
              {getRecipientCount(formData.recipients).toLocaleString()} คน
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">วันที่ส่ง (เว้นว่างเพื่อส่งทันที)</Label>
            <Input 
              id="scheduledDate"
              type="date"
              min={minDateTime.date}
              value={formData.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">เวลาส่ง</Label>
            <Input 
              id="scheduledTime"
              type="time"
              min={formData.scheduledDate === minDateTime.date ? minDateTime.time : '00:00'}
              value={formData.scheduledTime}
              onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
              disabled={!formData.scheduledDate}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            className="flex-1"
            onClick={formData.scheduledDate ? handleSchedule : handleSendNow}
            disabled={isScheduling}
          >
            {isScheduling ? (
              <>กำลังดำเนินการ...</>
            ) : formData.scheduledDate ? (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                กำหนดการส่ง
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                ส่งทันที
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={saveDraft}>
            <Save className="w-4 h-4 mr-2" />
            บันทึกร่าง
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
