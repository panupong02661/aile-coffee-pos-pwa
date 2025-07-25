import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Bell, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIOSNotificationService } from '@/hooks/useIOSNotificationService';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

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

interface NotificationSound {
  id: string;
  name: string;
  file_url: string;
  is_active: boolean;
}

const GlobalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [newOrder, setNewOrder] = useState<OnlineOrder | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    sound_enabled: true,
    volume: 0.8,
    duration: 2
  });
  const [notificationSounds, setNotificationSounds] = useState<NotificationSound[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationChannelRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Use iOS notification service
  const { isIOS, triggerIOSNotification, playIOSNotificationSound } = useIOSNotificationService();
  
  // Use main order notifications hook
  const { playBellSound, stopBellSound, initializeAudio } = useOrderNotifications();

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  const setupRef = useRef(false);

  useEffect(() => {
    // Prevent multiple setup calls
    if (setupRef.current) {
      console.log('🚫 GlobalNotificationProvider already setup, skipping...');
      return;
    }
    
    // Don't show notifications on customer mobile app page
    if (isCustomerMobileApp) {
      console.log('📱 Customer mobile app detected, notifications disabled');
      return;
    }

    setupRef.current = true;
    console.log('🔔 Setting up GlobalNotificationProvider (simplified)...');
    
    // Load minimal notification data ONCE
    loadNotificationData();
    
    // Setup ONLY essential cross-device sync
    const syncChannel = supabase
      .channel('enhanced-notification-sync')
      .on('broadcast', { event: 'dismiss-notification' }, () => {
        console.log('📡 Received dismiss broadcast');
        setShowOrderAlert(false);
        setNewOrder(null);
      })
      .subscribe((status) => {
        console.log('📡 Sync subscription status:', status);
      });

    notificationChannelRef.current = syncChannel;

    return () => {
      console.log('🧹 Cleaning up GlobalNotificationProvider...');
      setupRef.current = false;
      supabase.removeChannel(syncChannel);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isCustomerMobileApp]); // Remove navigate and other dependencies

  const loadNotificationData = async () => {
    // Only load once per session
    if (notificationSounds.length > 0) {
      console.log('🚫 Notification data already loaded, skipping...');
      return;
    }
    
    try {
      console.log('🔊 Loading notification data...');
      
      // Load only settings (skip sounds to reduce requests)
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      console.log('🔊 Loaded settings:', settings);

      if (settings) {
        setNotificationSettings({
          sound_enabled: settings.sound_enabled ?? true,
          selected_sound_id: settings.selected_sound_id || undefined,
          volume: settings.volume ?? 0.8,
          duration: settings.duration ?? 2
        });
      }

      // Only load sounds if needed for notifications (not for POS page)
      if (location.pathname !== '/') {
        const { data: sounds } = await supabase
          .from('notification_sounds')
          .select('*')
          .order('created_at')
          .limit(5); // Limit to reduce requests

        console.log('🔊 Loaded sounds:', sounds);
        if (sounds && sounds.length > 0) {
          setNotificationSounds(sounds);
        }
      }
    } catch (error) {
      console.error('❌ Error loading notification data:', error);
    }
  };

  const handleNewCustomerOrder = async (orderData: any) => {
    try {
      console.log('🔔 Processing new customer order notification:', orderData);
      
      const orderForNotification: OnlineOrder = {
        id: orderData.id,
        order_number: orderData.order_number,
        total_amount: orderData.total_amount,
        items: orderData.items || [],
        customer_profiles: orderData.customer_profiles
      };
      
      setNewOrder(orderForNotification);
      setShowOrderAlert(true);
      
      // Show toast notification
      toast.success('มีออเดอร์ออนไลน์ใหม่!', {
        description: `ออเดอร์ #${orderData.order_number} - ฿${orderData.total_amount}`,
        duration: 15000,
        action: {
          label: 'ดูรายละเอียด',
          onClick: () => {
            handleDismiss();
            navigate('/online-orders');
          }
        }
      });

      // Enhanced iOS notification handling
      if (isIOS) {
        console.log('🍎 Triggering iOS notification for customer order');
        await triggerIOSNotification({
          orderNumber: orderData.order_number,
          totalAmount: orderData.total_amount,
          items: orderData.items || []
        });
      } else {
        // Play enhanced notification sound for non-iOS
        console.log('🔊 About to call playEnhancedNotificationSound for customer order');
        try {
          await playEnhancedNotificationSound();
        } catch (soundError) {
          console.log('🔊 Sound play error:', soundError);
          createEnhancedBeepSound();
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing new customer order notification:', error);
    }
  };

  const handleNewOrder = async (orderData: any) => {
    try {
      console.log('🔔 Processing new online order notification:', orderData);
      
      // Fetch complete order data with member info
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
        console.log('📦 Complete order data fetched:', completeOrder);
        console.log('🔔 Showing notification and playing sound...');
        
        // Show notification for new order
        const orderForNotification: OnlineOrder = {
          id: completeOrder.id,
          order_number: completeOrder.order_number,
          total_amount: completeOrder.total_amount,
          items: [], // Order items will be fetched separately if needed
          customer_profiles: completeOrder.members ? {
            full_name: completeOrder.members.name,
            phone: completeOrder.members.phone
          } : undefined
        };
        
        setNewOrder(orderForNotification);
        setShowOrderAlert(true);
        
        // Show toast notification
        toast.success('มีออเดอร์ออนไลน์ใหม่!', {
          description: `ออเดอร์ #${completeOrder.order_number} - ฿${completeOrder.total_amount}`,
          duration: 15000,
          action: {
            label: 'ดูรายละเอียด',
            onClick: () => {
              handleDismiss();
              navigate('/online-orders');
            }
          }
        });

        // Enhanced iOS notification handling
        if (isIOS) {
          console.log('🍎 Triggering iOS notification for new order');
          await triggerIOSNotification({
            orderNumber: completeOrder.order_number,
            totalAmount: completeOrder.total_amount,
            items: []
          });
        } else {
          // Play enhanced notification sound for non-iOS
          console.log('🔊 About to call playEnhancedNotificationSound');
          try {
            await playEnhancedNotificationSound();
          } catch (soundError) {
            console.log('🔊 Sound play error:', soundError);
            createEnhancedBeepSound();
          }
        }
        
        // Broadcast notification to all devices
        if (notificationChannelRef.current) {
          notificationChannelRef.current.send({
            type: 'broadcast',
            event: 'new-order-notification',
            payload: {
              orderId: completeOrder.id,
              orderNumber: completeOrder.order_number,
              totalAmount: completeOrder.total_amount,
              items: [],
              customerInfo: completeOrder.members ? {
                full_name: completeOrder.members.name,
                phone: completeOrder.members.phone
              } : undefined
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Error processing new online order notification:', error);
    }
  };

  const playEnhancedNotificationSound = async () => {
    console.log('🔊 playEnhancedNotificationSound called for iOS');
    console.log('🔊 Sound enabled:', notificationSettings.sound_enabled);
    console.log('🔊 Volume:', notificationSettings.volume);
    console.log('🔊 Selected sound ID:', notificationSettings.selected_sound_id);
    console.log('🔊 Duration:', notificationSettings.duration);

    if (!notificationSettings.sound_enabled) {
      console.log('🔇 Sound disabled, skipping');
      return;
    }

    // Clean up previous audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    let soundPlayed = false;
    
    // Enhanced iOS approach for custom sounds
    if (notificationSettings.selected_sound_id && 
        !['ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด', 'ตีดๆๆๆ'].includes(notificationSettings.selected_sound_id)) {
      
      console.log('🔊 Looking for custom sound with ID:', notificationSettings.selected_sound_id);
      
      const selectedSound = notificationSounds.find(
        sound => sound.id === notificationSettings.selected_sound_id
      );
      
      console.log('🔊 Found custom sound:', selectedSound);
      
      if (selectedSound && selectedSound.file_url) {
        console.log('🔊 Attempting to play custom sound for iOS:', selectedSound.name);
        
        try {
          const fullUrl = `https://mzvzbxflwvksohrmxbsy.supabase.co/storage/v1/object/public/notification-sounds/${selectedSound.file_url}`;
          console.log('🔊 Custom sound URL for iOS:', fullUrl);
          
          // Enhanced iOS audio setup
          const audio = new Audio();
          audioRef.current = audio;
          audio.volume = 1.0; // Maximum volume for iOS
          audio.src = fullUrl;
          audio.preload = 'auto';
          audio.setAttribute('playsinline', 'true');
          audio.setAttribute('webkit-playsinline', 'true');
          
          // iOS-specific initialization
          audio.load();
          
          // Play multiple times for iOS notification effect
          let playCount = 0;
          const maxPlays = Math.max(3, Math.floor(notificationSettings.duration));
          
          const playNext = async () => {
            if (playCount < maxPlays && audioRef.current) {
              try {
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
                console.log(`✅ iOS custom sound played ${playCount + 1}/${maxPlays}`);
                soundPlayed = true;
                playCount++;
                
                if (playCount < maxPlays) {
                  setTimeout(playNext, 1000);
                }
              } catch (e) {
                console.log(`⚠️ iOS custom sound play ${playCount + 1} failed:`, e);
              }
            }
          };
          
          await playNext();
          
        } catch (error) {
          console.log('🔊 Custom sound failed for iOS:', error);
        }
      }
    }
    
    // If custom sound didn't play, try enhanced basic sounds for iOS
    if (!soundPlayed) {
      if (notificationSettings.selected_sound_id && 
          ['ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด', 'ตีดๆๆๆ'].includes(notificationSettings.selected_sound_id)) {
        console.log('🔊 Playing enhanced basic sound for iOS:', notificationSettings.selected_sound_id);
        await playEnhancedBasicSound(notificationSettings.selected_sound_id);
        soundPlayed = true;
      } else {
        console.log('🔊 Using enhanced beep fallback for iOS');
        await createEnhancedBeepSound();
      }
    }
  };

  const playEnhancedBasicSound = async (soundName: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // iOS AudioContext handling
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const duration = Math.max(3, notificationSettings.duration) * 1000; // At least 3 seconds for iOS
      const volume = Math.min(notificationSettings.volume * 1.5, 1.0); // Boost volume for iOS
      
      let frequency = 800;
      
      switch (soundName) {
        case 'ระฆัง':
          frequency = 800;
          break;
        case 'กิ่งก่า':
          frequency = 1000;
          break;
        case 'แจ้งเตือน':
          frequency = 600;
          break;
        case 'ปลุก':
          frequency = 1200;
          break;
        case 'กระดิ่ง':
          frequency = 900;
          break;
        case 'ออด':
          frequency = 400;
          break;
        case 'ตีดๆๆๆ':
          // Enhanced beep pattern for iOS
          const beepCount = Math.max(5, Math.floor(duration / 1000));
          const beepDuration = 200;
          const beepInterval = Math.floor(duration / beepCount);
          
          for (let i = 0; i < beepCount; i++) {
            const startTime = audioContext.currentTime + (i * beepInterval / 1000);
            const endTime = startTime + (beepDuration / 1000);
            
            // Multiple oscillators for richer iOS sound
            [800, 1000, 1200].forEach((freq, index) => {
              const beepOscillator = audioContext.createOscillator();
              const beepGainNode = audioContext.createGain();
              const compressor = audioContext.createDynamicsCompressor();
              
              beepOscillator.connect(beepGainNode);
              beepGainNode.connect(compressor);
              compressor.connect(audioContext.destination);
              
              beepOscillator.frequency.setValueAtTime(freq, startTime);
              beepOscillator.type = 'sine';
              
              const nodeVolume = volume / (index + 1);
              beepGainNode.gain.setValueAtTime(0, startTime);
              beepGainNode.gain.linearRampToValueAtTime(nodeVolume, startTime + 0.01);
              beepGainNode.gain.setValueAtTime(nodeVolume, endTime - 0.01);
              beepGainNode.gain.linearRampToValueAtTime(0, endTime);
              
              beepOscillator.start(startTime);
              beepOscillator.stop(endTime);
            });
          }
          
          console.log(`✅ Enhanced iOS beep sound played: ${soundName}`);
          return;
      }
      
      // Enhanced oscillator pattern for iOS
      const beepCount = Math.max(3, Math.floor(duration / 1000));
      const beepDuration = 300;
      const beepInterval = Math.floor(duration / beepCount);
      
      for (let i = 0; i < beepCount; i++) {
        const startTime = audioContext.currentTime + (i * beepInterval / 1000);
        const endTime = startTime + (beepDuration / 1000);
        
        // Multiple harmonics for iOS
        [1, 1.2, 1.5].forEach((multiplier, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const compressor = audioContext.createDynamicsCompressor();
          
          oscillator.connect(gainNode);
          gainNode.connect(compressor);
          compressor.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency * multiplier, startTime);
          oscillator.type = 'sine';
          
          const nodeVolume = volume / (index + 1);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(nodeVolume, startTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
          
          oscillator.start(startTime);
          oscillator.stop(endTime);
        });
      }
      
      console.log(`✅ Enhanced iOS basic sound played: ${soundName}`);
    } catch (error) {
      console.error('❌ Enhanced iOS basic sound failed:', error);
      await createEnhancedBeepSound();
    }
  };

  const createEnhancedBeepSound = async () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // iOS AudioContext handling
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const volume = Math.min(notificationSettings.volume * 1.5, 1.0);
      const duration = Math.max(3, notificationSettings.duration);
      const currentTime = audioContext.currentTime;
      
      // Enhanced beep pattern for iOS notification
      const beepCount = Math.max(6, Math.floor(duration * 2));
      
      for (let i = 0; i < beepCount; i++) {
        const startTime = currentTime + (i * 0.5);
        const endTime = startTime + 0.2;
        
        // Multiple frequency beep for iOS attention
        [800, 1000, 1200].forEach((frequency, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const compressor = audioContext.createDynamicsCompressor();
          
          oscillator.connect(gainNode);
          gainNode.connect(compressor);
          compressor.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          const nodeVolume = volume / (index + 1);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(nodeVolume, startTime + 0.02);
          gainNode.gain.setValueAtTime(nodeVolume, endTime - 0.02);
          gainNode.gain.linearRampToValueAtTime(0, endTime);
          
          oscillator.start(startTime);
          oscillator.stop(endTime);
        });
      }
      
      console.log('✅ Enhanced iOS beep sound played');
    } catch (error) {
      console.error('❌ Enhanced iOS beep sound failed:', error);
      
      // Ultimate iOS fallback
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      
      // Visual feedback for iOS
      document.body.style.backgroundColor = '#ff6b6b';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 300);
    }
  };

  const handleDismiss = () => {
    // Broadcast dismiss to all devices
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
                <p className="text-gray-700 font-medium text-lg">
                  📦 จำนวน: {newOrder.items?.length || 0} รายการ
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
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
