import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAutoPrint } from './useAutoPrint';

// Global singleton flags to prevent multiple instances
let globalNotificationInstance: any = null;
let isGlobalSetup = false;
let globalProcessedOrders = new Set<string>();
let globalChannelRef: any = null;

export const useOrderNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioInitializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isIOSRef = useRef(false);
  const instanceIdRef = useRef<string>(`${Date.now()}-${Math.random()}`);
  const { isAutoPrintEnabled, printOrderReceipt } = useAutoPrint();

  // Detect iOS
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    isIOSRef.current = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
  }, []);

  // Enhanced iOS-compatible audio initialization
  const initializeAudio = async () => {
    if (isAudioInitializedRef.current) return;
    
    try {
      console.log('🎵 Initializing iOS-compatible notification audio...');
      
      // Initialize AudioContext for iOS
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        console.log('✅ AudioContext initialized for iOS');
      }
      
      // Create enhanced audio element for iOS
      const audio = new Audio();
      
      // iOS-specific attributes
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      // Create enhanced notification sound data URL
      const createEnhancedNotificationSound = () => {
        const sampleRate = 22050;
        const duration = 1.5;
        const samples = sampleRate * duration;
        
        // Create WAV file buffer
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 2, true);
        
        // Generate enhanced bell sound for iOS
        let offset = 44;
        for (let i = 0; i < samples; i++) {
          const t = i / sampleRate;
          const frequency1 = 800;
          const frequency2 = 1000;
          const frequency3 = 1200;
          const envelope = Math.exp(-t * 1.5);
          
          const sample = envelope * (
            Math.sin(2 * Math.PI * frequency1 * t) * 0.5 +
            Math.sin(2 * Math.PI * frequency2 * t) * 0.3 +
            Math.sin(2 * Math.PI * frequency3 * t) * 0.2
          );
          
          const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
          view.setInt16(offset, intSample, true);
          offset += 2;
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
      };
      
      const audioUrl = createEnhancedNotificationSound();
      audio.src = audioUrl;
      
      // iOS initialization sequence
      audio.muted = true;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          console.log('✅ iOS audio initialized successfully');
        }).catch(error => {
          console.log('⚠️ iOS audio initialization failed:', error);
        });
      }
      
      audioRef.current = audio;
      isAudioInitializedRef.current = true;
      
    } catch (error) {
      console.error('❌ iOS audio initialization failed:', error);
    }
  };

  // Enhanced iOS-compatible notification sound
  const playBellSound = async () => {
    try {
      console.log('🔔 Playing enhanced iOS notification sound...');
      
      // Method 1: Enhanced AudioContext approach for iOS
      if (audioContextRef.current && isIOSRef.current) {
        const audioContext = audioContextRef.current;
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // สร้างเสียง beep ด้วย Web Audio API สำหรับ iOS
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // ความถี่เสียง
        gainNode.gain.value = 0.3; // ความดัง
        
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
        }, 500); // เล่น 0.5 วินาที
        
        console.log('✅ iOS AudioContext notification played');
      }
      
      // Method 2: HTML5 Audio fallback for non-iOS
      if (audioRef.current && !isIOSRef.current) {
        try {
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1.0;
          
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('🔔 HTML5 Audio notification played');
          }
        } catch (error) {
          console.log('⚠️ HTML5 Audio play failed:', error);
        }
      }
      
      console.log('✅ Enhanced notification sequence completed');
      
    } catch (error) {
      console.error('❌ Notification failed:', error);
    }
  };

  // Stop notification sound
  const stopBellSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        console.log('🔇 Notification sound stopped');
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        console.log('🔇 AudioContext notifications stopped');
      }
    } catch (error) {
      console.error('Error stopping notification sound:', error);
    }
  };

  // Initialize audio on user interaction for iOS
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!isAudioInitializedRef.current) {
        await initializeAudio();
      }
    };

    // Enhanced event listeners for iOS
    const events = ['touchstart', 'touchend', 'click', 'keydown', 'pointerdown', 'mousedown'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, handleUserInteraction, { 
        once: true, 
        passive: true,
        capture: true 
      });
    });

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleUserInteraction, true);
      });
    };
  }, []);

  // SINGLETON PATTERN: Single notification subscription per application
  useEffect(() => {
    // Check if this instance should be the global singleton
    const shouldBeSingleton = !globalNotificationInstance || !isGlobalSetup;
    
    if (!shouldBeSingleton) {
      console.log(`🚫 Instance ${instanceIdRef.current} - Singleton already exists, skipping setup`);
      return;
    }

    // Claim singleton status
    globalNotificationInstance = instanceIdRef.current;
    isGlobalSetup = true;
    
    console.log(`🏆 Instance ${instanceIdRef.current} - Claimed SINGLETON status for order notifications`);
    
    // Create unique channel name for this singleton instance
    const singletonChannelName = `orders-singleton-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const channel = supabase
      .channel(singletonChannelName)
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
            console.log(`🚫 SINGLETON - Skipping trigger/test order: ${order.order_number}`);
            return;
          }
          
          // CRITICAL: Prevent duplicate processing with global tracking
          if (globalProcessedOrders.has(order.id)) {
            console.log(`🚫 SINGLETON - Order ${order.id} already processed globally, skipping`);
            return;
          }
          
          // Add order to global processed set IMMEDIATELY
          globalProcessedOrders.add(order.id);
          
          console.log(`🔔 SINGLETON - Processing NEW order: ${order.order_number} (ID: ${order.id})`);
          
          // Only process online orders
          if (order.order_source === 'online') {
            console.log(`📱 SINGLETON - Processing online order notification: ${order.order_number}`);
            
            try {
              // Wait longer for ALL order items to be inserted completely
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Fetch complete order details including ALL items and customer info with retry
              let completeOrder = null;
              let attempts = 0;
              const maxAttempts = 5;
              
              while (attempts < maxAttempts && !completeOrder) {
                attempts++;
                console.log(`📋 SINGLETON - Fetching order attempt ${attempts}/${maxAttempts}`);
                
                const { data: orderData, error: orderError } = await supabase
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

                if (orderError) {
                  console.error(`❌ SINGLETON - Attempt ${attempts} error:`, orderError);
                } else if (orderData && orderData.order_items && orderData.order_items.length > 0) {
                  completeOrder = orderData;
                  console.log(`✅ SINGLETON - Successfully fetched order with ${orderData.order_items.length} items on attempt ${attempts}`);
                  break;
                } else {
                  console.log(`⏳ SINGLETON - Attempt ${attempts}: Order items not ready yet, waiting...`);
                  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
                }
              }

              if (completeOrder && completeOrder.order_items && completeOrder.order_items.length > 0) {
                console.log(`📋 SINGLETON - Final order data: ${completeOrder.order_items.length} items for order ${completeOrder.order_number}`);
                
                // Format order items for display with FULL addon details
                const orderItemsText = completeOrder.order_items.map((item: any) => {
                  let itemText = `${item.menu_item_name} x${item.quantity}`;
                  
                  // Add detailed addon information
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
                  
                  itemText += ` - ฿${item.total_price}`;
                  return itemText;
                }).join('\n');

                const customerInfo = completeOrder.members ? 
                  `ลูกค้า: ${completeOrder.members.name} (${completeOrder.members.phone})` : 
                  'ลูกค้าทั่วไป';

                // Play sound notification
                await playBellSound();
                
                // Show detailed toast notification with ALL items and addons
                toast.success('🔔 มีออเดอร์ออนไลน์ใหม่!', {
                  description: `ออเดอร์ #${completeOrder.order_number}\n${customerInfo}\n\nรายการ (${completeOrder.order_items.length} เมนู):\n${orderItemsText}\n\nรวม: ฿${completeOrder.total_amount}`,
                  duration: 20000, // Show longer for detailed content
                  action: {
                    label: 'ดูรายละเอียด',
                    onClick: () => {
                      window.location.href = '/online-orders';
                    }
                  }
                });

                // Auto-print receipt if enabled
                if (isAutoPrintEnabled) {
                  console.log('🖨️ SINGLETON - Auto-printing enabled, printing receipt...');
                  
                  const printOrderData = {
                    id: completeOrder.id,
                    order_number: completeOrder.order_number,
                    total_amount: completeOrder.total_amount,
                    created_at: completeOrder.created_at,
                    customer_name: completeOrder.members?.name,
                    customer_phone: completeOrder.members?.phone,
                    customer_notes: completeOrder.customer_notes,
                    payment_method: completeOrder.payment_method,
                    order_items: completeOrder.order_items
                  };
                  
                  await printOrderReceipt(printOrderData);
                }

                // Send external notification with detailed order info including ALL items and addons
                const { data, error } = await supabase.functions.invoke('send-order-notification', {
                  body: {
                    orderData: {
                      id: completeOrder.id,
                      order_number: completeOrder.order_number,
                      total_amount: completeOrder.total_amount,
                      items_count: completeOrder.order_items.length,
                      member_id: completeOrder.member_id,
                      payment_method: completeOrder.payment_method,
                      order_source: completeOrder.order_source,
                      status: completeOrder.status,
                      created_at: completeOrder.created_at,
                      customer_notes: completeOrder.customer_notes,
                      customer_name: completeOrder.members?.name || 'ลูกค้าทั่วไป',
                      customer_phone: completeOrder.members?.phone || '',
                      order_items: completeOrder.order_items
                    }
                  }
                });

                if (error) {
                  console.error('❌ SINGLETON - Failed to send external notifications:', error);
                } else {
                  console.log('✅ SINGLETON - External notifications sent successfully');
                }
              } else {
                console.error('❌ SINGLETON - Failed to fetch complete order data after all attempts');
              }
            } catch (error) {
              console.error('❌ SINGLETON - Error processing order notification:', error);
            }
            
            console.log(`📱 SINGLETON - Order notification processed for: ${order.order_number}`);
          } else {
            console.log(`📝 SINGLETON - Non-online order ignored: ${order.order_number} (source: ${order.order_source})`);
          }
          
          // Clean up processed order after 10 minutes to prevent memory leak
          setTimeout(() => {
            globalProcessedOrders.delete(order.id);
            console.log(`🗑️ SINGLETON - Cleaned up processed order: ${order.id}`);
          }, 10 * 60 * 1000);
        }
      )
      .subscribe((status, err) => {
        console.log(`📡 SINGLETON - Subscription status: ${status}`);
        if (err) {
          console.error('❌ SINGLETON - Subscription error:', err);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ SINGLETON - Order notifications subscription ACTIVE');
        } else if (status === 'TIMED_OUT') {
          console.log('⏰ SINGLETON - Subscription timed out, will retry automatically');
        }
      });

    globalChannelRef = channel;

    return () => {
      console.log(`🧹 SINGLETON - Cleanup for instance: ${instanceIdRef.current}`);
      
      // Only cleanup if this instance is the current singleton
      if (globalNotificationInstance === instanceIdRef.current) {
        console.log('🧹 SINGLETON - Releasing singleton status and cleaning up');
        
        isGlobalSetup = false;
        globalNotificationInstance = null;
        globalProcessedOrders.clear();
        
        if (globalChannelRef) {
          supabase.removeChannel(globalChannelRef);
          globalChannelRef = null;
        }
        
        stopBellSound();
      }
    };
  }, []);

  return {
    playBellSound,
    stopBellSound,
    initializeAudio,
    instanceId: instanceIdRef.current,
    isAutoPrintEnabled
  };
};
