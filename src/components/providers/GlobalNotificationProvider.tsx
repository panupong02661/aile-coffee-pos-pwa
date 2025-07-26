
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Bell, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIOSNotificationService } from '@/hooks/useIOSNotificationService';

interface OnlineOrder {
  id: string;
  order_number: string;
  total_amount: number;
  items: any[];
  customer_profiles?: {
    full_name: string;
    phone: string;
  };
}

interface NotificationSettings {
  sound_enabled: boolean;
  selected_sound_id?: string;
  volume: number;
  duration: number;
}

const GlobalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [newOrder, setNewOrder] = useState<OnlineOrder | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    sound_enabled: true,
    volume: 0.8,
    duration: 2
  });
  
  const notificationChannelRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isSubscribedRef = useRef(false);
  const setupRef = useRef(false);
  const processedOrdersRef = useRef(new Set<string>());
  const uiLockRef = useRef(new Set<string>()); // เพิ่ม UI lock

  // Use iOS notification service
  const { isIOS, triggerIOSNotification } = useIOSNotificationService();

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  useEffect(() => {
    // ป้องกันการ setup UI หลายครั้ง - DISABLED เพื่อให้ useOrderNotifications เป็น master
    if (setupRef.current || isCustomerMobileApp || isSubscribedRef.current) {
      console.log('🚫 GlobalNotificationProvider: UI system disabled - useOrderNotifications is MASTER');
      return;
    }
    
    console.log('⚠️ GlobalNotificationProvider: DISABLED - useOrderNotifications handles ALL notifications');
    setupRef.current = true;
    
    // Load notification settings only
    loadNotificationSettings();
    
    // สร้างเพียง sync channel สำหรับการซิงค์ UI เท่านั้น (ไม่ฟัง order notifications)
    const uiSyncChannelName = `ui-sync-only-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const syncChannel = supabase
      .channel(uiSyncChannelName)
      .on('broadcast', { event: 'dismiss-notification' }, () => {
        console.log('📡 UI: Received dismiss broadcast');
        setShowOrderAlert(false);
        setNewOrder(null);
      })
      .on('broadcast', { event: 'show-order-ui' }, (payload) => {
        console.log('📡 UI: Received show order UI broadcast', payload);
        handleNewOrderUI(payload.payload);
      })
      .subscribe((status) => {
        console.log('📡 UI Sync subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          console.log('✅ UI sync subscription active (NO order listening)');
        }
      });

    notificationChannelRef.current = syncChannel;

    return () => {
      console.log('🧹 UI: Cleaning up UI sync only...');
      setupRef.current = false;
      isSubscribedRef.current = false;
      processedOrdersRef.current.clear();
      uiLockRef.current.clear();
      
      if (notificationChannelRef.current) {
        supabase.removeChannel(notificationChannelRef.current);
        notificationChannelRef.current = null;
      }
    };
  }, [isCustomerMobileApp]);

  const loadNotificationSettings = async () => {
    try {
      console.log('🔊 Loading notification settings...');
      
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (settings) {
        setNotificationSettings({
          sound_enabled: settings.sound_enabled ?? true,
          selected_sound_id: settings.selected_sound_id || undefined,
          volume: settings.volume ?? 0.8,
          duration: settings.duration ?? 2
        });
      }
    } catch (error) {
      console.error('❌ Error loading notification settings:', error);
    }
  };

  const handleNewOrderUI = async (orderData: any) => {
    try {
      const orderId = orderData.id || orderData.orderId;
      
      // UI lock เพื่อป้องกันการแสดง UI ซ้ำ
      if (uiLockRef.current.has(orderId)) {
        console.log('🚫 UI: Order UI already shown, skipping:', orderId);
        return;
      }
      
      if (processedOrdersRef.current.has(orderId)) {
        console.log('🚫 UI: Order UI already processed, skipping:', orderId);
        return;
      }
      
      uiLockRef.current.add(orderId);
      processedOrdersRef.current.add(orderId);
      
      console.log('🖥️ UI: Showing order UI for:', orderData.orderNumber || orderData.order_number);
      
      // Fetch complete order data if needed
      if (!orderData.members && orderData.id) {
        const { data: completeOrder, error } = await supabase
          .from('orders')
          .select(`
            *,
            members (
              name,
              phone
            )
          `)
          .eq('id', orderData.id)
          .single();

        if (!error && completeOrder) {
          orderData = completeOrder;
        }
      }

      const orderForNotification: OnlineOrder = {
        id: orderData.id || orderId,
        order_number: orderData.order_number || orderData.orderNumber,
        total_amount: orderData.total_amount || orderData.totalAmount,
        items: orderData.items || [],
        customer_profiles: orderData.members ? {
          full_name: orderData.members.name,
          phone: orderData.members.phone
        } : undefined
      };
      
      setNewOrder(orderForNotification);
      setShowOrderAlert(true);
      
      // Enhanced iOS notification for UI
      if (isIOS) {
        console.log('🍎 UI: Triggering iOS UI notification');
        await triggerIOSNotification({
          orderNumber: orderForNotification.order_number,
          totalAmount: orderForNotification.total_amount,
          items: orderForNotification.items
        });
      }
      
      // Broadcast UI update to other devices
      if (notificationChannelRef.current) {
        notificationChannelRef.current.send({
          type: 'broadcast',
          event: 'new-order-ui-shown',
          payload: {
            orderId: orderForNotification.id,
            orderNumber: orderForNotification.order_number,
            totalAmount: orderForNotification.total_amount
          }
        });
      }
      
      // Cleanup locks
      setTimeout(() => {
        uiLockRef.current.delete(orderId);
        processedOrdersRef.current.delete(orderId);
      }, 10 * 60 * 1000);
      
    } catch (error) {
      console.error('❌ UI: Error processing order UI notification:', error);
    }
  };

  const handleNewOrder = async (orderData: any) => {
    // เปลี่ยนให้เรียก handleNewOrderUI แทน
    console.log('📞 UI: Redirecting to handleNewOrderUI');
    await handleNewOrderUI(orderData);
  };

  const handleDismiss = () => {
    if (notificationChannelRef.current) {
      notificationChannelRef.current.send({
        type: 'broadcast',
        event: 'dismiss-notification'
      });
    }
    
    setShowOrderAlert(false);
    setNewOrder(null);
  };

  const handleViewOrder = () => {
    handleDismiss();
    navigate('/online-orders');
  };

  return (
    <>
      {children}
      
      {/* Order Alert Dialog - เหลือเพียง UI เท่านั้น */}
      <Dialog open={showOrderAlert} onOpenChange={setShowOrderAlert}>
        <DialogContent className="sm:max-w-md border-4 border-orange-400 shadow-2xl bg-gradient-to-br from-orange-50 to-yellow-50">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-orange-600 text-xl font-bold">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 animate-bounce" />
                🔔 ออเดอร์ออนไลน์ใหม่!
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {newOrder && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-xl border-2 border-orange-200 animate-pulse shadow-inner">
                <p className="font-bold text-2xl text-orange-700 mb-2">
                  📋 ออเดอร์ #{newOrder.order_number}
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-3">
                  💰 ฿{newOrder.total_amount.toFixed(2)}
                </p>
                {newOrder.customer_profiles && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-base text-gray-700 font-medium">
                      👤 ลูกค้า: {newOrder.customer_profiles.full_name}
                    </p>
                    <p className="text-base text-gray-700">
                      📱 เบอร์: {newOrder.customer_profiles.phone}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleViewOrder} 
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 text-lg"
                >
                  <Bell className="h-5 w-5 mr-2" />
                  ดูรายละเอียดออเดอร์
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                  className="border-2 border-gray-300 hover:bg-gray-100 font-medium py-4 px-6"
                >
                  ปิด
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalNotificationProvider;
