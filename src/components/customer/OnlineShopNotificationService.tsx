
import { supabase } from '@/integrations/supabase/client';

export class OnlineShopNotificationService {
  private static instance: OnlineShopNotificationService;
  private notificationSettings: any = null;

  private constructor() {}

  static getInstance(): OnlineShopNotificationService {
    if (!OnlineShopNotificationService.instance) {
      OnlineShopNotificationService.instance = new OnlineShopNotificationService();
    }
    return OnlineShopNotificationService.instance;
  }

  async loadNotificationSettings() {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading notification settings:', error);
        return;
      }

      this.notificationSettings = data;
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  async sendOrderNotification(orderData: {
    orderNumber: string;
    totalAmount: number;
    customerName?: string;
    customerPhone?: string;
    items: any[];
  }) {
    try {
      console.log('🔔 Sending order notification for order:', orderData.orderNumber);

      // Load settings if not already loaded
      if (!this.notificationSettings) {
        await this.loadNotificationSettings();
      }

      if (!this.notificationSettings?.online_orders?.enabled) {
        console.log('⚠️ Online order notifications are disabled');
        return;
      }

      const { online_orders } = this.notificationSettings;
      const platforms = online_orders.platforms;

      // Prepare notification message
      const message = online_orders.message
        .replace('{{orderNumber}}', orderData.orderNumber)
        .replace('{{amount}}', orderData.totalAmount.toString());

      // Send notifications to enabled platforms
      const notifications = [];

      if (platforms.line?.enabled && platforms.line?.token) {
        notifications.push(this.sendToLine(platforms.line.token, message, orderData));
      }

      if (platforms.instagram?.enabled && platforms.instagram?.token) {
        notifications.push(this.sendToInstagram(platforms.instagram.token, message, orderData));
      }

      if (platforms.discord?.enabled && platforms.discord?.token) {
        notifications.push(this.sendToDiscord(platforms.discord.token, message, orderData));
      }

      if (platforms.telegram?.enabled && platforms.telegram?.token) {
        notifications.push(this.sendToTelegram(platforms.telegram.token, message, orderData));
      }

      // Wait for all notifications to complete
      await Promise.allSettled(notifications);

      console.log('✅ Order notifications sent successfully');
    } catch (error) {
      console.error('❌ Error sending order notifications:', error);
    }
  }

  private async sendToLine(token: string, message: string, orderData: any) {
    try {
      const { error } = await supabase.functions.invoke('send-line-notification', {
        body: {
          token,
          message,
          orderData
        }
      });

      if (error) {
        console.error('LINE notification error:', error);
      } else {
        console.log('✅ LINE notification sent');
      }
    } catch (error) {
      console.error('LINE notification error:', error);
    }
  }

  private async sendToInstagram(token: string, message: string, orderData: any) {
    try {
      const { error } = await supabase.functions.invoke('send-instagram-notification', {
        body: {
          token,
          message,
          orderData
        }
      });

      if (error) {
        console.error('Instagram notification error:', error);
      } else {
        console.log('✅ Instagram notification sent');
      }
    } catch (error) {
      console.error('Instagram notification error:', error);
    }
  }

  private async sendToDiscord(webhookUrl: string, message: string, orderData: any) {
    try {
      const { error } = await supabase.functions.invoke('send-discord-notification', {
        body: {
          webhookUrl,
          message,
          orderData
        }
      });

      if (error) {
        console.error('Discord notification error:', error);
      } else {
        console.log('✅ Discord notification sent');
      }
    } catch (error) {
      console.error('Discord notification error:', error);
    }
  }

  private async sendToTelegram(token: string, message: string, orderData: any) {
    try {
      const { error } = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          token,
          message,
          orderData
        }
      });

      if (error) {
        console.error('Telegram notification error:', error);
      } else {
        console.log('✅ Telegram notification sent');
      }
    } catch (error) {
      console.error('Telegram notification error:', error);
    }
  }
}

export const onlineShopNotificationService = OnlineShopNotificationService.getInstance();
