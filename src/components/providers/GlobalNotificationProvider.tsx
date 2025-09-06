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
  created_at?: string; // เพิ่มเวลาที่สั่งซื้อ
}

// Singleton notification manager to prevent duplicate subscriptions
class NotificationManager {
  private static instance: NotificationManager;
  private processedOrders = new Set<string>();
  private activeChannels = new Map<string, any>();
  private lastProcessedOrderId: string | null = null;
  
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
  
  isProcessed(orderId: string): boolean {
    return this.processedOrders.has(orderId);
  }
  
  markAsProcessed(orderId: string): void {
    this.processedOrders.add(orderId);
    this.lastProcessedOrderId = orderId;
    console.log(`✅ Marked order ${orderId} as processed. Total processed: ${this.processedOrders.size}`);
  }
  
  isConsecutiveDuplicate(orderId: string): boolean {
    return this.lastProcessedOrderId === orderId;
  }
  
  addChannel(key: string, channel: any): void {
    if (this.activeChannels.has(key)) {
      console.warn(`Channel ${key} already exists, removing old one`);
      this.removeChannel(key);
    }
    this.activeChannels.set(key, channel);
  }
  
  removeChannel(key: string): void {
    const channel = this.activeChannels.get(key);
    if (channel) {
      try {
        supabase.removeChannel(channel);
        this.activeChannels.delete(key);
        console.log(`🧹 Removed channel: ${key}`);
      } catch (e) {
        console.error(`Error removing channel ${key}:`, e);
      }
    }
  }
  
  hasActiveChannels(): boolean {
    return this.activeChannels.size > 0;
  }
  
  cleanupAll(): void {
    for (const [key] of this.activeChannels) {
      this.removeChannel(key);
    }
  }
  
  getChannel(key: string): any {
    return this.activeChannels.get(key);
  }
  
  
  // Clean up old processed orders (keep only recent ones)
  cleanupProcessedOrders(): void {
    if (this.processedOrders.size > 100) {
      const ordersArray = Array.from(this.processedOrders);
      // Keep only the last 50 orders
      this.processedOrders = new Set(ordersArray.slice(-50));
      console.log(`🧹 Cleaned up processed orders, kept ${this.processedOrders.size} recent orders`);
    }
  }
}

const GlobalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [newOrder, setNewOrder] = useState<OnlineOrder | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const setupCompleted = useRef(false);
  const notificationManager = NotificationManager.getInstance();

  // Use iOS notification service
  const { isIOS, triggerIOSNotification } = useIOSNotificationService();

  console.log('🔔 GlobalNotificationProvider - STARTING on path:', location.pathname);
  console.log('🔔 GlobalNotificationProvider - Component is running at:', new Date().toISOString());
  console.log('🔔 GlobalNotificationProvider - Setup completed status:', setupCompleted.current);
  console.log('🔔 GlobalNotificationProvider - Has active channels:', notificationManager.hasActiveChannels());

  useEffect(() => {
    console.log('🔔 GlobalNotificationProvider - useEffect triggered');
    console.log('🔔 Setup completed status:', setupCompleted.current);
    console.log('🔔 Has active channels:', notificationManager.hasActiveChannels());
    
    // Skip customer mobile app
    if (location.pathname === '/customer-mobile-app') {
      console.log('🚫 Skipping setup on customer mobile app');
      return;
    }

    // Reset and cleanup first
    if (setupCompleted.current) {
      console.log('🔄 Resetting previous setup...');
      notificationManager.cleanupAll();
      setupCompleted.current = false;
    }

    setupCompleted.current = true;
    console.log('🎯 Starting fresh notification setup...');

    // Setup cross-device sync channel
    const syncChannelName = `ui-notification-sync-${Date.now()}-${Math.random()}`;
    const syncChannel = supabase
      .channel(syncChannelName)
      .on('broadcast', { event: 'dismiss-notification' }, () => {
        console.log('📡 Received dismiss broadcast');
        setShowOrderAlert(false);
        setNewOrder(null);
      })
      .subscribe((status) => {
        console.log(`📡 Sync channel status: ${status}`);
      });

    notificationManager.addChannel('sync', syncChannel);

    // Listen for new orders from the orders table
    console.log('🔔 Setting up real-time order listener...');
    const orderChannelName = `order-listener-${Date.now()}-${Math.random()}`;
    const orderChannel = supabase
      .channel(orderChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('🔔 REAL-TIME ORDER INSERT DETECTED:', payload);
          const order = payload.new as any;
          
          // Skip test/trigger orders
          if (order.order_number && order.order_number.includes('-TRIGGER')) {
            console.log(`🚫 Skipping trigger/test order: ${order.order_number}`);
            return;
          }
          
          // Enhanced duplicate prevention with singleton manager
          if (notificationManager.isProcessed(order.id)) {
            console.log(`🚫 Order ${order.id} already processed by manager, skipping`);
            return;
          }

          // Additional check for consecutive same order
          if (notificationManager.isConsecutiveDuplicate(order.id)) {
            console.log(`🚫 Same order ${order.id} received consecutively, skipping`);
            return;
          }

          // Mark as processing immediately to prevent race conditions
          notificationManager.markAsProcessed(order.id);
          
          // Handle both POS and online orders for UI notifications
          console.log(`🎯 New order detected: ${order.order_number} (source: ${order.order_source || 'pos'})`);
          
          // Send Discord notifications only for online orders
          if (order.order_source === 'online') {
            try {
              // Call notification edge function immediately for online orders
              console.log('🚀 Calling send-order-notification edge function...');
              
              // Wait briefly for order items to be inserted
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // Fetch complete order with items for notification
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
                .eq('id', order.id)
                .single();

              if (error || !completeOrder) {
                console.error('❌ Failed to fetch complete order:', error);
                // Don't remove from processed set to prevent retry spam
                return;
              }

              // Prepare order data for notifications
              const orderData = {
                order_number: order.order_number,
                total_amount: order.total_amount,
                items_count: order.items_count,
                member_id: order.member_id,
                payment_method: order.payment_method,
                order_source: 'online',
                status: order.status || 'confirmed',
                created_at: order.created_at,
                customer_notes: order.customer_notes,
                customer_name: completeOrder.members?.name || 'ลูกค้า',
                customer_phone: completeOrder.members?.phone || '',
                order_items: completeOrder.order_items || []
              };
              
              console.log('📦 Order data for notification:', orderData);
              
              // Send notification
              const { data: notificationResult, error: edgeFunctionError } = await supabase.functions.invoke('send-order-notification', {
                body: { orderData }
              });

              if (edgeFunctionError) {
                console.error('❌ Failed to send notifications:', edgeFunctionError);
                // Don't remove from processed set to prevent retry spam
              } else {
                console.log('✅ Notifications sent successfully:', notificationResult);
              }
              
            } catch (notificationError) {
              console.error('❌ Error in notification process:', notificationError);
              // Don't remove from processed set to prevent retry spam
            }
          }
          
          // Show UI notification for both POS and online orders
          console.log(`🔔 Preparing UI notification for order: ${order.order_number} (${order.order_source || 'pos'})`);
          // ลบ setTimeout และเรียกทันที เพื่อป้องกันการซ้ำ
          await handleNewOrderUI({
            orderId: order.id,
            orderNumber: order.order_number,
            totalAmount: order.total_amount,
            memberId: order.member_id,
            orderSource: order.order_source || 'pos',
            orderCreatedAt: order.created_at // เพิ่มเวลาที่สั่งซื้อจริง
          });
        }
      )
      .subscribe((status) => {
        console.log('🔔 Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time order listener is ACTIVE');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription failed');
        }
      });

    notificationManager.addChannel('orders', orderChannel);

    // Cleanup old processed orders periodically
    const cleanupTimer = setInterval(() => {
      notificationManager.cleanupProcessedOrders();
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => {
      console.log('🧹 Cleaning up GlobalNotificationProvider');
      
      setupCompleted.current = false;
      clearInterval(cleanupTimer);
      notificationManager.cleanupAll();
    };
  }, [location.pathname]); // รีเซ็ตเมื่อเปลี่ยน route

  const handleNewOrderUI = async (orderData: any) => {
    try {
      // เพิ่มเวลาที่สั่งซื้อจริงสำหรับแสดงผล
      console.log(`🎯 Processing order for UI display: ${orderData.orderNumber} at ${orderData.orderCreatedAt}`);
      
      // Fetch complete order data for UI with retry logic
      let completeOrder = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts && !completeOrder) {
        attempts++;
        console.log(`📋 UI fetch attempt ${attempts}/${maxAttempts}`);
        
        const { data: orderResult, error } = await supabase
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
          console.error(`❌ UI fetch attempt ${attempts} error:`, error);
        } else if (orderResult && orderResult.order_items && orderResult.order_items.length > 0) {
          completeOrder = orderResult;
          console.log(`✅ Successfully fetched order with ${orderResult.order_items.length} items on attempt ${attempts}`);
          break;
        } else {
          console.log(`⏳ Attempt ${attempts}: Order items not ready, waiting...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (completeOrder && completeOrder.order_items && completeOrder.order_items.length > 0) {
        console.log(`📋 Final UI order data: ${completeOrder.order_items.length} items`);
        
        const orderForNotification: OnlineOrder = {
          id: completeOrder.id,
          order_number: completeOrder.order_number,
          total_amount: completeOrder.total_amount,
          items: completeOrder.order_items,
          order_items: completeOrder.order_items,
          customer_profiles: completeOrder.members ? {
            full_name: completeOrder.members.name,
            phone: completeOrder.members.phone
          } : undefined,
          created_at: orderData.orderCreatedAt || completeOrder.created_at // ใช้เวลาที่สั่งซื้อจริง
        };
        
        setNewOrder(orderForNotification);
        setShowOrderAlert(true);
        
        // Enhanced iOS notification
        if (isIOS) {
          console.log('🍎 Triggering iOS notification');
          await triggerIOSNotification({
            orderNumber: completeOrder.order_number,
            totalAmount: completeOrder.total_amount,
            items: completeOrder.order_items
          });
        }
        
        console.log(`✅ UI notification displayed for: ${completeOrder.order_number} with ${completeOrder.order_items.length} items`);
      } else {
        console.error('❌ Failed to fetch complete order data for UI after all attempts');
      }
      
      // Clean up processed order after 15 minutes (longer to prevent duplicates)
      setTimeout(() => {
        // Don't clean up, let the singleton manager handle cleanup
        console.log(`🔄 Order ${orderData.orderId} cleanup deferred to manager`);
      }, 15 * 60 * 1000);
      
    } catch (error) {
      console.error('❌ Error processing new order UI notification:', error);
    }
  };

  const handleDismiss = () => {
    const syncChannel = notificationManager.getChannel('sync');
    if (syncChannel) {
      syncChannel.send({
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
      
      // Add detailed addon information with pricing
      if (item.selected_addons && item.selected_addons.length > 0) {
        const addons = item.selected_addons.map((addon: any) => {
          if (addon.price && addon.price > 0) {
            return `+${addon.name} (+฿${addon.price})`;
          } else {
            return `+${addon.name}`;
          }
        }).join(', ');
        itemText += ` (${addons})`;
      }
      
      return itemText;
    });
  };

  return (
    <>
      {children}
      
      {/* Enhanced Order Alert Dialog with ALL detailed items and addons */}
      <Dialog open={showOrderAlert} onOpenChange={setShowOrderAlert}>
        <DialogContent className="sm:max-w-lg border-4 border-orange-400 shadow-2xl bg-gradient-to-br from-orange-50 to-yellow-50">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-orange-600 text-xl font-bold">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 animate-bounce" />
                🔔 ออเดอร์ใหม่!
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
                
                {/* Show ALL Order Items with Complete Details */}
                {newOrder.order_items && newOrder.order_items.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-orange-200">
                    <p className="text-lg font-semibold text-orange-700 mb-2">
                      🍽️ รายการสั่งซื้อ ({newOrder.order_items.length} เมนู):
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {formatOrderItems(newOrder.order_items).map((itemText, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-white/50 p-3 rounded border-l-4 border-orange-300">
                          <div className="flex justify-between items-start">
                            <span className="flex-1">• {itemText}</span>
                            <span className="font-bold text-orange-600 ml-2">
                              ฿{newOrder.order_items![index].total_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-3xl font-bold text-orange-600 mt-3">
                  💰 รวมทั้งสิ้น: ฿{newOrder.total_amount.toFixed(2)}
                </p>
                
                {/* แสดงเวลาที่สั่งซื้อจริง */}
                {newOrder.created_at && (
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <p className="text-sm text-gray-600">
                      🕐 เวลาสั่งซื้อ: {new Date(newOrder.created_at).toLocaleString('th-TH', {
                        timeZone: 'Asia/Bangkok',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
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