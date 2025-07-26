
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Global singleton to prevent multiple instances
let globalNotificationInstance: any = null;

export const useOrderNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioInitializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isIOSRef = useRef(false);
  const processedOrdersRef = useRef(new Set<string>());

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
      
      // Try to create enhanced audio element for iOS
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
        // Note: We don't close the AudioContext as it might be needed again
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

  // SINGLETON: Only create one global notification instance
  useEffect(() => {
    // Prevent multiple instances
    if (globalNotificationInstance) {
      console.log('🚫 Order notifications already active globally, skipping...');
      return;
    }

    console.log('🔔 Setting up GLOBAL SINGLETON order notifications...');
    
    // Mark this instance as the global one
    globalNotificationInstance = true;
    
    // Create unique channel name
    const uniqueChannelName = `orders-global-singleton-${Date.now()}`;
    
    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          const order = payload.new as any;
          
          // CRITICAL: Prevent duplicate processing with unique ID check
          if (processedOrdersRef.current.has(order.id)) {
            console.log('🚫 Order already processed by SINGLETON, skipping:', order.id);
            return;
          }
          
          // Add order to processed set IMMEDIATELY
          processedOrdersRef.current.add(order.id);
          
          console.log('🔔 Processing NEW order (SINGLETON ONLY):', order.order_number);
          
          // Only process online orders
          if (order.order_source === 'online') {
            console.log('🔔 Processing online order notification (SINGLETON):', order.order_number);
            
            // Play sound
            await playBellSound();
            
            // Show toast notification (SINGLE)
            toast.success('🔔 มีออเดอร์ออนไลน์ใหม่!', {
              description: `ออเดอร์ #${order.order_number} จำนวน ฿${order.total_amount}`,
              duration: 10000,
              action: {
                label: 'ดูรายละเอียด',
                onClick: () => {
                  window.location.href = '/online-orders';
                }
              }
            });
            
            // Send external notification (ONCE)
            try {
              const { data, error } = await supabase.functions.invoke('send-order-notification', {
                body: {
                  orderData: {
                    id: order.id,
                    order_number: order.order_number,
                    total_amount: order.total_amount,
                    items_count: order.items_count || 1,
                    member_id: order.member_id,
                    payment_method: order.payment_method,
                    order_source: order.order_source,
                    status: order.status,
                    created_at: order.created_at,
                    customer_notes: order.customer_notes
                  }
                }
              });

              if (error) {
                console.error('❌ Failed to send external notifications:', error);
              } else {
                console.log('✅ External notifications sent successfully (SINGLETON)');
              }
            } catch (error) {
              console.error('❌ Error calling send-order-notification function:', error);
            }
            
            console.log('📱 Order notification processed successfully (SINGLETON)');
          }
          
          // Clean up processed order after 5 minutes
          setTimeout(() => {
            processedOrdersRef.current.delete(order.id);
          }, 5 * 60 * 1000);
        }
      )
      .subscribe((status, err) => {
        console.log('📡 SINGLETON Subscription status:', status);
        if (err) {
          console.error('❌ SINGLETON Subscription error:', err);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ SINGLETON Order notifications subscription active');
        }
      });

    return () => {
      console.log('🔄 Cleaning up SINGLETON order notifications...');
      globalNotificationInstance = null;
      processedOrdersRef.current.clear();
      
      if (channel) {
        supabase.removeChannel(channel);
      }
      stopBellSound();
    };
  }, []);

  return {
    playBellSound,
    stopBellSound,
    initializeAudio
  };
};
