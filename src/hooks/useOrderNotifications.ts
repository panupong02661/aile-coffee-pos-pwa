import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAutoPrint } from './useAutoPrint';

// Global singleton flags to prevent multiple instances
let globalNotificationInstance: any = null;
let isGlobalSetup = false;
let globalProcessedOrders = new Set<string>();
let globalPollingInterval: any = null;

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

  // ENHANCED REAL-TIME POLLING: Check every 5 seconds for new online orders (reduced to prevent DB overload)
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
    
    console.log(`🏆 Instance ${instanceIdRef.current} - Claimed SINGLETON status for polling every 5 seconds`);
    
    let lastCheckedTime = new Date();
    
    // Real-time polling function - checks every 5 seconds
    const pollForNewOnlineOrders = async () => {
      try {
        console.log(`⏰ POLLING - Checking for new online orders since ${lastCheckedTime.toISOString()}`);
        
        // Query for new online orders since last check
        const { data: newOrders, error } = await supabase
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
          .eq('order_source', 'online')
          .gte('created_at', lastCheckedTime.toISOString())
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ POLLING - Error fetching new orders:', error);
          return;
        }

        if (newOrders && newOrders.length > 0) {
          console.log(`🔔 POLLING - Found ${newOrders.length} new online orders!`);
          
          for (const order of newOrders) {
            // Skip trigger orders
            if (order.order_number && order.order_number.includes('-TRIGGER')) {
              console.log(`🚫 POLLING - Skipping trigger order: ${order.order_number}`);
              continue;
            }
            
            // Prevent duplicate processing
            if (globalProcessedOrders.has(order.id)) {
              console.log(`🚫 POLLING - Order ${order.id} already processed, skipping`);
              continue;
            }
            
            // Create unique identifier for this order notification cycle
            const notificationId = `${order.id}-${Date.now()}`;
            
            // Mark as processed with timestamp-based ID to prevent duplicates within same cycle
            if (globalProcessedOrders.has(order.id)) {
              console.log(`🚫 POLLING - Order ${order.id} already processed in this cycle, skipping`);
              continue;
            }
            
            // Mark as processed for this notification cycle only
            globalProcessedOrders.add(order.id);
            console.log(`📱 POLLING - Processing online order: ${order.order_number}`);
            
            try {
              // Format order items for display with COMPLETE addon details (ฮอตช็อกโกแลต + วิปครีม + ช็อกโกแลตชิป)
              const orderItemsText = order.order_items.map((item: any, index: number) => {
                let itemText = `${index + 1}. ${item.menu_item_name} x${item.quantity}`;
                
                // Add COMPLETE addon information with prices - วิปครีม, ช็อกโกแลตชิป, etc.
                if (item.selected_addons && item.selected_addons.length > 0) {
                  console.log(`📎 Add-ons found for ${item.menu_item_name}:`, item.selected_addons);
                  
                  const addons = item.selected_addons.map((addon: any) => {
                    const addonPrice = addon.price || 0;
                    if (addonPrice > 0) {
                      return `+${addon.name} (+฿${addonPrice})`;
                    } else {
                      return `+${addon.name} (ฟรี)`;
                    }
                  }).join(', ');
                  itemText += `\n   📎 เพิ่มเติม: ${addons}`;
                } else {
                  console.log(`ℹ️ No add-ons for ${item.menu_item_name}`);
                }
                
                // Add item discount information
                if (item.item_discount && item.item_discount > 0) {
                  const discountText = item.item_discount_type === 'percent' 
                    ? `ส่วนลดรายการ ${item.item_discount}%`
                    : `ส่วนลดรายการ ฿${item.item_discount}`;
                  itemText += `\n   🏷️ ${discountText}`;
                }
                
                // Show unit price and total
                itemText += `\n   💰 ราคา: ฿${item.unit_price} x ${item.quantity} = ฿${item.total_price}`;
                return itemText;
              }).join('\n\n');

              const customerInfo = order.members ? 
                `ลูกค้า: ${order.members.name} (${order.members.phone})` : 
                'ลูกค้าทั่วไป';

              // Format discount information
              let discountInfo = '';
              if (order.bill_discount && order.bill_discount > 0) {
                const discountText = order.bill_discount_type === 'percent' 
                  ? `ส่วนลดท้ายบิล ${order.bill_discount}%`
                  : `ส่วนลดท้ายบิล ฿${order.bill_discount}`;
                discountInfo += `\n🏷️ ${discountText}`;
              }

              // Play sound notification IMMEDIATELY
              await playBellSound();
              
              // Show DETAILED toast notification with COMPLETE order info
              toast.success('🔔 มีออเดอร์ออนไลน์ใหม่เข้ามาแล้ว!', {
                description: `📋 ออเดอร์ #${order.order_number}\n👤 ${customerInfo}\n${order.customer_notes ? `📝 หมายเหตุ: ${order.customer_notes}\n` : ''}\n🛍️ รายการสินค้า (${order.order_items.length} เมนู):\n${orderItemsText}${discountInfo}\n\n💳 วิธีชำระ: ${order.payment_method === 'points' ? 'แต้ม' : order.payment_method === 'online' ? 'ออนไลน์' : order.payment_method}\n💵 ยอดรวมทั้งหมด: ฿${order.total_amount}`,
                duration: 25000,
                action: {
                  label: 'ดูรายละเอียด',
                  onClick: () => {
                    window.location.href = '/online-orders';
                  }
                }
              });

              // Auto-print receipt if enabled
              if (isAutoPrintEnabled) {
                console.log('🖨️ POLLING - Auto-printing enabled, printing receipt...');
                
                const printOrderData = {
                  id: order.id,
                  order_number: order.order_number,
                  total_amount: order.total_amount,
                  created_at: order.created_at,
                  customer_name: order.members?.name || 'ลูกค้าทั่วไป',
                  customer_phone: order.members?.phone || '',
                  customer_notes: order.customer_notes || '',
                  payment_method: order.payment_method,
                  order_items: order.order_items.map((item: any) => ({
                    ...item,
                    selected_addons: Array.isArray(item.selected_addons) ? item.selected_addons : []
                  }))
                };
                
                await printOrderReceipt(printOrderData);
              }

              // NOTE: Platform notifications (Discord, LINE, etc.) are now sent immediately 
              // from the customer app to prevent duplicates. This polling only handles 
              // POS-side notifications (sound, toast, auto-print)
              console.log(`✅ POLLING - POS notification completed for ${order.order_number}`);
              
            } catch (error) {
              console.error('❌ POLLING - Error processing order:', error);
            }
            
            // Clean up processed order after 30 seconds to prevent duplicates in same session
            // but allow new notifications for subsequent orders
            setTimeout(() => {
              globalProcessedOrders.delete(order.id);
              console.log(`🗑️ POLLING - Cleaned up processed order: ${order.id}`);
            }, 30 * 1000);
          }
        }
        
        // Update last checked time for next poll
        lastCheckedTime = new Date();
        
      } catch (error) {
        console.error('❌ POLLING - Critical error:', error);
      }
    };

    // Start polling every 5 seconds (reduced from 1 second to prevent DB overload)
    globalPollingInterval = setInterval(pollForNewOnlineOrders, 5000);
    console.log('⏰ POLLING - Started polling every 5 seconds for online orders');

    // Initial poll
    pollForNewOnlineOrders();

    return () => {
      console.log(`🧹 POLLING - Cleanup for instance: ${instanceIdRef.current}`);
      
      // Only cleanup if this instance is the current singleton
      if (globalNotificationInstance === instanceIdRef.current) {
        console.log('🧹 POLLING - Releasing singleton status and cleaning up');
        
        isGlobalSetup = false;
        globalNotificationInstance = null;
        globalProcessedOrders.clear();
        
        if (globalPollingInterval) {
          clearInterval(globalPollingInterval);
          globalPollingInterval = null;
          console.log('⏹️ POLLING - Stopped real-time polling');
        }
        
        stopBellSound();
      }
    };
  }, [playBellSound, printOrderReceipt, isAutoPrintEnabled]);

  return {
    playBellSound,
    stopBellSound,
    initializeAudio,
    instanceId: instanceIdRef.current,
    isAutoPrintEnabled
  };
};