
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
          
          // CRITICAL: Filter out test/trigger orders
          if (order.order_number && order.order_number.includes('-TRIGGER')) {
            console.log(`🚫 UI SINGLETON - Skipping trigger/test order: ${order.order_number}`);
            return;
          }
          
          // Only handle online orders for UI display
          if (order.order_source === 'online') {
            console.log(`🎯 UI SINGLETON - New online order for UI: ${order.order_number}`);
            
            // Call edge function immediately to send notifications
            try {
              console.log('🚀 GlobalNotificationProvider - Calling send-order-notification edge function...');
              
              // Wait a bit for order items to be inserted
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Fetch the complete order with items for notification
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
                console.error('❌ Failed to fetch complete order for notifications:', error);
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
              
              console.log('📦 Complete order data being sent to edge function:', orderData);
              
              const { data: notificationResult, error: edgeFunctionError } = await supabase.functions.invoke('send-order-notification', {
                body: { orderData }
              });

              if (edgeFunctionError) {
                console.error('❌ Failed to send order notifications:', edgeFunctionError);
              } else {
                console.log('✅ Order notifications sent successfully to all platforms:', notificationResult);
              }
              
            } catch (notificationError) {
              console.error('❌ Error calling notification edge function:', notificationError);
            }
            
            // Wait longer for order items to be inserted completely for UI
            await new Promise(resolve => setTimeout(resolve, 2000));
            
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
      
      // Fetch complete order data for UI with ALL items and retry logic
      let completeOrder = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts && !completeOrder) {
        attempts++;
        console.log(`📋 UI SINGLETON - UI fetch attempt ${attempts}/${maxAttempts}`);
        
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
          console.error(`❌ UI SINGLETON - UI fetch attempt ${attempts} error:`, error);
        } else if (orderResult && orderResult.order_items && orderResult.order_items.length > 0) {
          completeOrder = orderResult;
          console.log(`✅ UI SINGLETON - UI successfully fetched order with ${orderResult.order_items.length} items on attempt ${attempts}`);
          break;
        } else {
          console.log(`⏳ UI SINGLETON - UI attempt ${attempts}: Order items not ready, waiting...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (completeOrder && completeOrder.order_items && completeOrder.order_items.length > 0) {
        console.log(`📋 UI SINGLETON - Final UI order data: ${completeOrder.order_items.length} items`);
        
        const orderForNotification: OnlineOrder = {
          id: completeOrder.id,
          order_number: completeOrder.order_number,
          total_amount: completeOrder.total_amount,
          items: completeOrder.order_items,
          order_items: completeOrder.order_items,
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
            items: completeOrder.order_items
          });
        }
        
        console.log(`✅ UI SINGLETON - UI notification displayed for: ${completeOrder.order_number} with ${completeOrder.order_items.length} items`);
      } else {
        console.error('❌ UI SINGLETON - Failed to fetch complete order data for UI after all attempts');
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
