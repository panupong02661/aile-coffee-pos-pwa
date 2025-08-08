
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Clock, Send, Pause, Play, Trash2, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { NotificationService, ScheduledNotification } from './NotificationService';

const NotificationQueue = () => {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadScheduledNotifications();
    const interval = setInterval(loadScheduledNotifications, 30000); // รีเฟรชทุก 30 วินาที
    return () => clearInterval(interval);
  }, []);

  const loadScheduledNotifications = () => {
    const scheduled = NotificationService.getScheduledNotifications();
    setNotifications(scheduled);
  };

  const handleSendNow = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // จำลองการส่งการแจ้งเตือน
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const success = await NotificationService.sendBulkNotification({
        title: notification.title,
        message: notification.message,
        recipients: notification.recipients,
        recipientCount: notification.recipientCount
      });

      if (success) {
        NotificationService.updateScheduledNotification(id, 'sent');
        toast({
          title: 'ส่งสำเร็จ! 📱',
          description: `ส่งการแจ้งเตือนไปยัง ${notification.recipientCount} คน`
        });
      } else {
        NotificationService.updateScheduledNotification(id, 'failed');
        toast({
          title: 'ส่งไม่สำเร็จ',
          description: 'เกิดข้อผิดพลาดในการส่งการแจ้งเตือน',
          variant: 'destructive'
        });
      }
    } catch (error) {
      NotificationService.updateScheduledNotification(id, 'failed');
      toast({
        title: 'ส่งไม่สำเร็จ',
        description: 'เกิดข้อผิดพลาดในการส่งการแจ้งเตือน',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      loadScheduledNotifications();
    }
  };

  const handleDeleteNotification = (id: string) => {
    const stored = localStorage.getItem('scheduledNotifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      const updated = notifications.filter((n: ScheduledNotification) => n.id !== id);
      localStorage.setItem('scheduledNotifications', JSON.stringify(updated));
      loadScheduledNotifications();
      
      toast({
        title: 'ลบแล้ว',
        description: 'ลบการแจ้งเตือนออกจากคิวแล้ว'
      });
    }
  };

  const getStatusIcon = (status: ScheduledNotification['status']) => {
    switch (status) {
      case 'sent': return CheckCircle;
      case 'failed': return XCircle;
      case 'scheduled': return Clock;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: ScheduledNotification['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ScheduledNotification['status']) => {
    switch (status) {
      case 'sent': return 'ส่งแล้ว';
      case 'failed': return 'ส่งไม่สำเร็จ';
      case 'scheduled': return 'กำหนดการ';
      case 'draft': return 'ร่าง';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const pendingCount = notifications.filter(n => n.status === 'scheduled').length;
  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const failedCount = notifications.filter(n => n.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* สถิติ */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">รอส่ง</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">ส่งแล้ว</p>
                <p className="text-2xl font-bold">{sentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">ไม่สำเร็จ</p>
                <p className="text-2xl font-bold">{failedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar สำหรับการส่ง */}
      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">กำลังส่งการแจ้งเตือน...</span>
                <span className="text-sm text-gray-500">{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* รายการแจ้งเตือน */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            คิวการแจ้งเตือน ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Send className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>ไม่มีการแจ้งเตือนในคิว</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const StatusIcon = getStatusIcon(notification.status);
                const isScheduled = notification.status === 'scheduled';
                const scheduledTime = new Date(notification.scheduledTime);
                const isPastDue = scheduledTime < new Date() && isScheduled;

                return (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <StatusIcon className={`w-6 h-6 ${
                        notification.status === 'sent' ? 'text-green-500' :
                        notification.status === 'failed' ? 'text-red-500' :
                        'text-blue-500'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge className={getStatusColor(notification.status)}>
                            {getStatusText(notification.status)}
                          </Badge>
                          {isPastDue && (
                            <Badge variant="destructive">เลยกำหนด</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {notification.recipientCount} คน
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {scheduledTime.toLocaleString('th-TH')}
                          </span>
                          <span>กลุ่ม: {notification.recipients}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isScheduled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendNow(notification.id)}
                          disabled={isProcessing}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          ส่งเลย
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationQueue;
