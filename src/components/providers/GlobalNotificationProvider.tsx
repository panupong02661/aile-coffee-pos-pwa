
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

// Global flag to prevent multiple UI providers
let globalUIProviderActive = false;

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
  const processedOrdersRef = useRef(new Set<string>());

  // Use iOS notification service
  const { isIOS, triggerIOSNotification } = useIOSNotificationService();

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  useEffect(() => {
    // Prevent multiple UI providers
    if (globalUIProviderActive || isCustomerMobileApp) {
      console.log('🚫 GlobalNotificationProvider UI already setup or on customer app, skipping...');
      return;
    }
    
    globalUIProviderActive = true;
    console.log('🔔 Setting up UI-only GlobalNotificationProvider...');
    
    // Load notification settings
    loadNotificationSettings();
    
    // Setup UI-only sync channel for cross-device communication
    const uniqueSyncChannelName = `ui-sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const syncChannel = supabase
      .channel(uniqueSyncChannelName)
      .on('broadcast', { event: 'dismiss-notification' }, () => {
        console.log('📡 Received dismiss broadcast');
        setShowOrderAlert(false);
        setNewOrder(null);
      })
      .on('broadcast', { event: 'new-order-ui' }, (payload) => {
        console.log('📡 Received new order UI broadcast:', payload);
        handleNewOrderUI(payload.payload);
      })
      .subscribe((status) => {
        console.log('📡 UI Sync subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ UI sync subscription active');
        }
      });

    notificationChannelRef.current = syncChannel;

    return () => {
      console.log('🧹 Cleaning up UI GlobalNotificationProvider...');
      globalUIProviderActive = false;
      processedOrdersRef.current.clear();
      
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
      // CRITICAL: Prevent duplicate UI processing
      if (processedOrdersRef.current.has(orderData.id)) {
        console.log('🚫 Order already processed in UI, skipping:', orderData.id);
        return;
      }
      
      processedOrdersRef.current.add(orderData.id);
      console.log('🔔 Processing new order for UI display:', orderData.order_number);
      
      // Fetch complete order data
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

      if (error) {
        console.error('❌ Error fetching complete order details:', error);
        return;
      }

      if (completeOrder) {
        const orderForNotification: OnlineOrder = {
          id: completeOrder.id,
          order_number: completeOrder.order_number,
          total_amount: completeOrder.total_amount,
          items: [],
          customer_profiles: completeOrder.members ? {
            full_name: completeOrder.members.name,
            phone: completeOrder.members.phone
          } : undefined
        };
        
        setNewOrder(orderForNotification);
        setShowOrderAlert(true);
        
        // Enhanced iOS notification
        if (isIOS) {
          console.log('🍎 Triggering iOS notification');
          await triggerIOSNotification({
            orderNumber: completeOrder.order_number,
            totalAmount: completeOrder.total_amount,
            items: []
          });
        }
        
        // Clean up processed order after 5 minutes
        setTimeout(() => {
          processedOrdersRef.current.delete(orderData.id);
        }, 5 * 60 * 1000);
      }
    } catch (error) {
      console.error('❌ Error processing new order notification:', error);
    }
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
      
      {/* Order Alert Dialog */}
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
