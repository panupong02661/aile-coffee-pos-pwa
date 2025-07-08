
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Bell, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

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

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  useEffect(() => {
    // Don't show notifications on customer mobile app page
    if (isCustomerMobileApp) {
      console.log('📱 Customer mobile app detected, notifications disabled');
      return;
    }

    console.log('🔔 Setting up notification system...');
    
    // Load notification settings and sounds
    loadNotificationData();
    
    // Setup realtime subscription for new orders
    console.log('📡 Setting up realtime subscription...');
    
    const orderChannel = supabase
      .channel('online-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('🔔 New order detected:', payload);
          // Only handle online orders
          if (payload.new?.order_source === 'online') {
            await handleNewOrder(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Online order subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to online order notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to online order notifications');
        }
      });

    // Setup cross-device notification sync channel
    const syncChannel = supabase
      .channel('notification-sync')
      .on('broadcast', { event: 'dismiss-notification' }, () => {
        console.log('📡 Received dismiss broadcast');
        setShowOrderAlert(false);
        setNewOrder(null);
      })
      .on('broadcast', { event: 'new-order-notification' }, async (payload) => {
        console.log('📡 Received cross-device order notification:', payload);
        const orderData = payload.payload;
        
        // Show notification on this device too
        setNewOrder({
          id: orderData.orderId,
          order_number: orderData.orderNumber,
          total_amount: orderData.totalAmount,
          items: orderData.items || [],
          customer_profiles: orderData.customerInfo
        });
        setShowOrderAlert(true);
        
        // Play sound on this device
        console.log('🔊 About to call playNotificationSound from broadcast');
        try {
          await playNotificationSound();
        } catch (soundError) {
          console.log('🔊 Broadcast sound play error:', soundError);
          createBeepSound();
        }
        
        // Show toast
        toast.success('มีออเดอร์ออนไลน์ใหม่!', {
          description: `ออเดอร์ #${orderData.orderNumber} - ฿${orderData.totalAmount}`,
          duration: 15000,
          action: {
            label: 'ดูรายละเอียด',
            onClick: () => {
              handleDismiss();
              navigate('/online-orders');
            }
          }
        });
      })
      .subscribe((status) => {
        console.log('📡 Sync subscription status:', status);
      });

    notificationChannelRef.current = syncChannel;

    return () => {
      console.log('🧹 Cleaning up notification subscriptions...');
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(syncChannel);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [navigate, isCustomerMobileApp]);

  const loadNotificationData = async () => {
    try {
      // Load settings
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

      // Load sounds
      const { data: sounds } = await supabase
        .from('notification_sounds')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (sounds && sounds.length > 0) {
        setNotificationSounds(sounds);
      }
    } catch (error) {
      console.error('❌ Error loading notification data:', error);
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

        // Play notification sound
        console.log('🔊 About to call playNotificationSound');
        
        try {
          await playNotificationSound();
        } catch (soundError) {
          console.log('🔊 Sound play error:', soundError);
          createBeepSound();
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

  const playNotificationSound = async () => {
    console.log('🔊 playNotificationSound called');
    console.log('🔊 Sound enabled:', notificationSettings.sound_enabled);
    console.log('🔊 Volume:', notificationSettings.volume);
    console.log('🔊 Selected sound ID:', notificationSettings.selected_sound_id);
    console.log('🔊 Available sounds:', notificationSounds);
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
    
    // Check if we have a custom sound selected
    if (notificationSettings.selected_sound_id && !['ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด'].includes(notificationSettings.selected_sound_id)) {
      const selectedSound = notificationSounds.find(
        sound => sound.id === notificationSettings.selected_sound_id
      );
      
      if (selectedSound && selectedSound.file_url) {
        console.log('🔊 Attempting to play custom sound:', selectedSound.name);
        
        try {
          const fullUrl = `https://mzvzbxflwvksohrmxbsy.supabase.co/storage/v1/object/public/notification-sounds/${selectedSound.file_url}`;
          console.log('🔊 Custom sound URL:', fullUrl);
          
          const audio = new Audio();
          audioRef.current = audio;
          audio.volume = Math.min(notificationSettings.volume, 1.0);
          audio.src = fullUrl;
          
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.log('🔊 Custom sound timeout');
              reject(new Error('Timeout'));
            }, 5000);
            
            audio.oncanplaythrough = async () => {
              clearTimeout(timeout);
              console.log('🔊 Custom sound ready, playing...');
              try {
                await audio.play();
                console.log('✅ Custom sound played successfully');
                soundPlayed = true;
                
                // Stop after duration
                setTimeout(() => {
                  if (audio && !audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                  }
                }, notificationSettings.duration * 1000);
                
                resolve();
              } catch (playError) {
                console.log('🔊 Custom sound play failed:', playError);
                reject(playError);
              }
            };
            
            audio.onerror = (error) => {
              clearTimeout(timeout);
              console.log('🔊 Custom sound error:', error);
              reject(error);
            };
            
            audio.load();
          });
        } catch (error) {
          console.log('🔊 Custom sound failed:', error);
        }
      }
    }
    
    // If custom sound didn't play, try basic sounds or beep fallback
    if (!soundPlayed) {
      // Check if it's a basic sound
      if (notificationSettings.selected_sound_id && ['ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด'].includes(notificationSettings.selected_sound_id)) {
        console.log('🔊 Playing basic sound:', notificationSettings.selected_sound_id);
        playBasicSound(notificationSettings.selected_sound_id);
        soundPlayed = true;
      } else {
        console.log('🔊 Using beep fallback');
        createBeepSound();
      }
    }
  };

  const playBasicSound = (soundName: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = notificationSettings.duration * 1000;
      const volume = notificationSettings.volume;
      
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
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
      
      console.log(`✅ Basic sound played: ${soundName}`);
    } catch (error) {
      console.error('❌ Basic sound failed:', error);
      createBeepSound();
    }
  };

  const createBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      const volume = notificationSettings.volume * 0.3;
      const duration = notificationSettings.duration;
      const currentTime = audioContext.currentTime;
      
      // Create beep pattern based on duration
      const beepCount = Math.max(1, Math.floor(duration / 0.5));
      
      for (let i = 0; i < beepCount; i++) {
        const startTime = currentTime + (i * 0.5);
        const endTime = startTime + 0.2;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.setValueAtTime(volume, endTime - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, endTime);
      }
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
      
      console.log('✅ Beep sound played');
    } catch (error) {
      console.error('❌ Beep sound failed:', error);
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
