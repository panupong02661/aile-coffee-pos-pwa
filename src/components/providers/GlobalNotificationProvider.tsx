
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
  order_items?: any[];
}

// Global UI state management
let globalUIProcessedOrders = new Set<string>();
let globalUIInstance: string | null = null;

const GlobalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [newOrder, setNewOrder] = useState<OnlineOrder | null>(null);
  
  const notificationChannelRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const instanceIdRef = useRef<string>(`ui-${Date.now()}-${Math.random()}`);

  // Use iOS notification service
  const { isIOS, triggerIOSNotification } = useIOSNotificationService();

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  useEffect(() => {
    // Skip setup on customer mobile app
    if (isCustomerMobileApp) {
      console.log('🚫 GlobalNotificationProvider - Skipping setup on customer mobile app');
      return;
    }

    // Singleton pattern for UI notifications
    if (globalUIInstance) {
      console.log(`🚫 GlobalNotificationProvider - UI singleton already exists: ${globalUIInstance}`);
      return;
    }

    // Claim UI singleton status
    globalUIInstance = instanceIdRef.current;
    console.log(`🎯 GlobalNotificationProvider - Claimed UI SINGLETON: ${instanceIdRef.current}`);
    
    // Setup UI-specific cross-device sync channel
    const uiSyncChannelName = `ui-notification-sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const syncChannel = supabase
      .channel(uiSyncChannelName)
      .on('broadcast', { event: 'dismiss-notification' }, () => {
        console.log('📡 UI SINGLETON - Received dismiss broadcast');
        setShowOrderAlert(false);
        setNewOrder(null);
      })
      .on('broadcast', { event: 'new-order-ui' }, async (payload) => {
        console.log('📡 UI SINGLETON - Received new order UI broadcast:', payload.payload);
        await handleNewOrderUI(payload.payload);
      })
      .subscribe((status) => {
        console.log(`📡 UI SINGLETON - Sync subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('✅ UI SINGLETON - Cross-device sync active');
        }
      });

    notificationChannelRef.current = syncChannel;

    // Listen for new orders from the main notification system
    const orderChannel = supabase
      .channel(`ui-order-listener-${instanceIdRef.current}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          const order = payload.new as any;
          
          // Only handle online orders for UI display
          if (order.order_source === 'online') {
            console.log(`🎯 UI SINGLETON - New online order for UI: ${order.order_number}`);
            
            // Broadcast to sync channel for cross-device UI sync
            if (notificationChannelRef.current) {
              notificationChannelRef.current.send({
                type: 'broadcast',
                event: 'new-order-ui',
                payload: {
                  orderId: order.id,
                  orderNumber: order.order_number,
                  totalAmount: order.total_amount,
                  memberId: order.member_id
                }
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`🧹 UI SINGLETON - Cleanup for: ${instanceIdRef.current}`);
      
      // Only cleanup if this is the current UI singleton
      if (globalUIInstance === instanceIdRef.current) {
        console.log('🧹 UI SINGLETON - Releasing UI singleton status');
        globalUIInstance = null;
        globalUIProcessedOrders.clear();
      }
      
      if (notificationChannelRef.current) {
        supabase.removeChannel(notificationChannelRef.current);
        notificationChannelRef.current = null;
      }
      
      supabase.removeChannel(orderChannel);
    };
  }, [isCustomerMobileApp]);

  const handleNewOrderUI = async (orderData: any) => {
    try {
      // Prevent duplicate UI processing
      if (globalUIProcessedOrders.has(orderData.orderId)) {
        console.log(`🚫 UI SINGLETON - Order ${orderData.orderId} already processed for UI, skipping`);
        return;
      }
      
      globalUIProcessedOrders.add(orderData.orderId);
      console.log(`🎯 UI SINGLETON - Processing order for UI display: ${orderData.orderNumber}`);
      
      // Fetch complete order data for UI with items
      const { data: completeOrder, error } = await supabase
        .from('orders')
        .select(`
          *,
          members (
            name,
            phone
          ),
          order_items (
            id,
            menu_item_name,
            quantity,
            unit_price,
            total_price,
            selected_addons
          )
        `)
        .eq('id', orderData.orderId)
        .single();

      if (error) {
        console.error('❌ UI SINGLETON - Error fetching complete order details:', error);
        return;
      }

      if (completeOrder) {
        const orderForNotification: OnlineOrder = {
          id: completeOrder.id,
          order_number: completeOrder.order_number,
          total_amount: completeOrder.total_amount,
          items: completeOrder.order_items || [],
          order_items: completeOrder.order_items || [],
          customer_profiles: completeOrder.members ? {
            full_name: completeOrder.members.name,
            phone: completeOrder.members.phone
          } : undefined
        };
        
        setNewOrder(orderForNotification);
        setShowOrderAlert(true);
        
        // Enhanced iOS notification
        if (isIOS) {
          console.log('🍎 UI SINGLETON - Triggering iOS notification');
          await triggerIOSNotification({
            orderNumber: completeOrder.order_number,
            totalAmount: completeOrder.total_amount,
            items: completeOrder.order_items || []
          });
        }
        
        console.log(`✅ UI SINGLETON - UI notification displayed for: ${completeOrder.order_number}`);
      }
      
      // Clean up UI processed order after 10 minutes
      setTimeout(() => {
        globalUIProcessedOrders.delete(orderData.orderId);
        console.log(`🗑️ UI SINGLETON - Cleaned up UI processed order: ${orderData.orderId}`);
      }, 10 * 60 * 1000);
      
    } catch (error) {
      console.error('❌ UI SINGLETON - Error processing new order UI notification:', error);
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

  const formatOrderItems = (items: any[]) => {
    return items.map((item) => {
      let itemText = `${item.menu_item_name} x${item.quantity}`;
      
      // Add addon details if present
      if (item.selected_addons && item.selected_addons.length > 0) {
        const addons = item.selected_addons.map((addon: any) => addon.name).join(', ');
        itemText += ` (${addons})`;
      }
      
      return itemText;
    });
  };

  return (
    <>
      {children}
      
      {/* Enhanced Order Alert Dialog with detailed items */}
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
                
                {newOrder.customer_profiles && (
                  <div className="mb-4 pb-4 border-b border-orange-200">
                    <p className="text-base text-gray-700 font-medium">
                      👤 ลูกค้า: {newOrder.customer_profiles.full_name}
                    </p>
                    <p className="text-base text-gray-700">
                      📱 เบอร์: {newOrder.customer_profiles.phone}
                    </p>
                  </div>
                )}
                
                {/* Order Items Details */}
                {newOrder.order_items && newOrder.order_items.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-orange-200">
                    <p className="text-lg font-semibold text-orange-700 mb-2">🍽️ รายการสั่งซื้อ:</p>
                    <div className="space-y-2">
                      {formatOrderItems(newOrder.order_items).map((itemText, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-white/50 p-2 rounded">
                          • {itemText}
                          <span className="float-right font-medium">
                            ฿{newOrder.order_items[index].total_price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-3xl font-bold text-orange-600 mt-3">
                  💰 รวม: ฿{newOrder.total_amount.toFixed(2)}
                </p>
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
