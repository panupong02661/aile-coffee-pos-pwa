
import { useToast } from '@/hooks/use-toast';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: string;
  usage: number;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: string;
  recipientCount: number;
}

class NotificationServiceClass {
  private permission: NotificationPermission = 'default';
  private serviceWorkerReady: boolean = false;
  private subscribers: number = 1247;
  private sentNotifications: number = 8934;

  constructor() {
    this.checkPermission();
    this.checkServiceWorker();
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  private async checkServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        this.serviceWorkerReady = !!registration;
      } catch (error) {
        console.error('Service Worker check failed:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    }
    return 'denied';
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  isServiceWorkerReady(): boolean {
    return this.serviceWorkerReady;
  }

  sendTestNotification(template: NotificationTemplate): boolean {
    if (this.permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(template.title, {
        body: template.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `test-${template.id}`,
        requireInteraction: true,
        data: {
          templateId: template.id,
          timestamp: Date.now()
        }
      });

      notification.onclick = () => {
        console.log('Notification clicked:', template.id);
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  sendBulkNotification(data: {
    title: string;
    message: string;
    recipients: string;
    recipientCount: number;
    icon?: string;
    priority?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        if (this.permission === 'granted') {
          this.sentNotifications += data.recipientCount;
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  }

  scheduleNotification(data: {
    title: string;
    message: string;
    scheduledTime: string;
    recipients: string;
    recipientCount: number;
  }): ScheduledNotification {
    const notification: ScheduledNotification = {
      id: `SCH${Date.now()}`,
      title: data.title,
      message: data.message,
      scheduledTime: data.scheduledTime,
      status: 'scheduled',
      recipients: data.recipients,
      recipientCount: data.recipientCount
    };

    // Store in localStorage for persistence
    const stored = localStorage.getItem('scheduledNotifications');
    const notifications = stored ? JSON.parse(stored) : [];
    notifications.push(notification);
    localStorage.setItem('scheduledNotifications', JSON.stringify(notifications));

    return notification;
  }

  getScheduledNotifications(): ScheduledNotification[] {
    const stored = localStorage.getItem('scheduledNotifications');
    return stored ? JSON.parse(stored) : [];
  }

  updateScheduledNotification(id: string, status: ScheduledNotification['status']): void {
    const stored = localStorage.getItem('scheduledNotifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      const updated = notifications.map((n: ScheduledNotification) => 
        n.id === id ? { ...n, status } : n
      );
      localStorage.setItem('scheduledNotifications', JSON.stringify(updated));
    }
  }

  getStats() {
    return {
      subscribers: this.subscribers,
      sentNotifications: this.sentNotifications,
      permission: this.permission,
      serviceWorkerReady: this.serviceWorkerReady
    };
  }

  updateStats(stats: Partial<{ subscribers: number; sentNotifications: number }>) {
    if (stats.subscribers) this.subscribers = stats.subscribers;
    if (stats.sentNotifications) this.sentNotifications = stats.sentNotifications;
  }
}

export const NotificationService = new NotificationServiceClass();
