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
  created_at?: string;
  bill_discount?: number;
  bill_discount_type?: string;
}

// Global state management for processed orders (single unified set)
let globalProcessedOrders = new Set<string>();

// Active subscription tracking to prevent multiple subscriptions
let activeSubscriptionCount = 0;
let lastOrderId: string | null = null;

const GlobalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [newOrder, setNewOrder] = useState<OnlineOrder | null>(null);
  
  const notificationChannelRef = useRef<any>(null);
  const orderChannelRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Use iOS notification service
  const { isIOS, triggerIOSNotification } = useIOSNotificationService();

  console.log('🔔 GlobalNotificationProvider - Rendered on path:', location.pathname);
  console.log('🔔 FORCE DEBUG - Component is running at:', new Date().toISOString());

  useEffect(() => {
    console.log('🔔 GlobalNotificationProvider - useEffect triggered');
    
    // Skip customer mobile app
    if (location.pathname === '/customer-mobile-app') {
      console.log('🚫 Skipping setup on customer mobile app');
      return;
    }

    // Enhanced duplicate subscription prevention
    if (orderChannelRef.current || activeSubscriptionCount > 0) {
      console.log('🚫 Already has active subscription, skipping setup. Count:', activeSubscriptionCount);
      return;
    }

    // Increment active subscription counter
    activeSubscriptionCount++;
    console.log('📈 Incrementing subscription count to:', activeSubscriptionCount);

    console.log('🎯 GlobalNotificationProvider - Starting setup...');
    
    // Setup cross-device sync channel
    const syncChannelName = `ui-notification-sync-${Date.now()}`;
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

    notificationChannelRef.current = syncChannel;

    // Listen for new orders from the orders table
    console.log('🔔 Setting up real-time order listener...');
    const orderChannel = supabase
      .channel(`order-listener-${Date.now()}`)
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
          
          // Enhanced duplicate prevention with multiple checks
          if (globalProcessedOrders.has(order.id)) {
            console.log(`🚫 Order ${order.id} already processed, skipping all notifications`);
            return;
          }

          // Additional check for consecutive same order
          if (lastOrderId === order.id) {
            console.log(`🚫 Same order ${order.id} received consecutively, skipping`);
            return;
          }

          // Mark as processing immediately to prevent race conditions
          globalProcessedOrders.add(order.id);
          lastOrderId = order.id;
          
          console.log(`🎯 Processing unique order: ${order.id} | Processed set size: ${globalProcessedOrders.size}`);
          
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
                    selected_addons,
                    item_discount,
                    item_discount_type
                  )
                `)
                .eq('id', order.id)
                .single();

              if (error || !completeOrder) {
                console.error('❌ Failed to fetch complete order:', error);
                // Remove from processed set on failure so it can be retried
                globalProcessedOrders.delete(order.id);
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
                // Remove from processed set on failure so it can be retried
                globalProcessedOrders.delete(order.id);
              } else {
                console.log('✅ Notifications sent successfully:', notificationResult);
              }
              
            } catch (notificationError) {
              console.error('❌ Error in notification process:', notificationError);
              // Remove from processed set on error so it can be retried
              globalProcessedOrders.delete(order.id);
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

    orderChannelRef.current = orderChannel;

    return () => {
      console.log('🧹 Cleaning up GlobalNotificationProvider');
      
      // Decrement active subscription counter
      activeSubscriptionCount = Math.max(0, activeSubscriptionCount - 1);
      console.log('📉 Decremented subscription count to:', activeSubscriptionCount);
      
      if (notificationChannelRef.current) {
        try {
          supabase.removeChannel(notificationChannelRef.current);
          console.log('🧹 Removed sync channel');
        } catch (e) {
          console.error('Error removing sync channel:', e);
        }
        notificationChannelRef.current = null;
      }
      
      if (orderChannelRef.current) {
        try {
          supabase.removeChannel(orderChannelRef.current);
          console.log('🧹 Removed order channel');
        } catch (e) {
          console.error('Error removing order channel:', e);
        }
        orderChannelRef.current = null;
      }
    };
  }, []); // เปลี่ยนเป็น empty dependency เพื่อป้องกันการ re-run

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
              selected_addons,
              item_discount,
              item_discount_type
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
          created_at: orderData.orderCreatedAt || completeOrder.created_at,
          bill_discount: completeOrder.bill_discount,
          bill_discount_type: completeOrder.bill_discount_type
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
      
      // Clean up processed order after 10 minutes
      setTimeout(() => {
        globalProcessedOrders.delete(orderData.orderId);
        console.log(`🗑️ Cleaned up processed order: ${orderData.orderId}`);
      }, 10 * 60 * 1000);
      
    } catch (error) {
      console.error('❌ Error processing new order UI notification:', error);
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
      
      // Add item discount information
      if (item.item_discount && item.item_discount > 0) {
        const discountText = item.item_discount_type === 'percent' 
          ? `ส่วนลด ${item.item_discount}%`
          : `ส่วนลด ฿${item.item_discount}`;
        itemText += ` [${discountText}]`;
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

                {/* Show discount information */}
                {newOrder.bill_discount > 0 && (
                  <div className="mb-4 pb-4 border-b border-orange-200">
                    <p className="text-lg font-semibold text-orange-700 mb-2">
                      💰 ส่วนลด:
                    </p>
                    <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border-l-4 border-yellow-300">
                      <span className="font-medium">ส่วนลดท้ายบิล: </span>
                      {newOrder.bill_discount_type === 'percent' 
                        ? `${newOrder.bill_discount}%`
                        : `฿${newOrder.bill_discount}`}
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