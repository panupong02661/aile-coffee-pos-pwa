
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface OnlineOrder {
  id: string;
  order_number: string;
  total_amount: number;
  items_count: number;
  members?: {
    name: string;
    phone: string;
  };
}

interface NotificationSettings {
  sound_enabled: boolean;
  selected_sound_id?: string;
  volume: number;
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
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [notificationSounds, setNotificationSounds] = useState<NotificationSound[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  // Enhanced user interaction detection - more aggressive
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteracted) {
        console.log('🎯 User interaction detected, enabling notifications');
        setHasUserInteracted(true);
        
        // Test sound immediately after first interaction
        setTimeout(() => {
          playTestSound();
        }, 100);
      }
    };

    // Add more interaction events
    const events = ['click', 'keydown', 'touchstart', 'touchend', 'mousedown', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, capture: true });
    });

    // Auto-enable after 3 seconds if no interaction
    const autoEnableTimeout = setTimeout(() => {
      if (!hasUserInteracted) {
        console.log('🔄 Auto-enabling notifications after timeout');
        setHasUserInteracted(true);
      }
    }, 3000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction, { capture: true });
      });
      clearTimeout(autoEnableTimeout);
    };
  }, [hasUserInteracted]);

  useEffect(() => {
    // Don't show notifications on customer mobile app page
    if (isCustomerMobileApp) {
      console.log('📱 Customer mobile app detected, notifications disabled');
      return;
    }

    console.log('🔔 Setting up notification system...');
    
    // Load notification settings and sounds
    const initializeNotifications = async () => {
      await fetchNotificationSettings();
      await fetchNotificationSounds();
    };
    
    initializeNotifications();
    
    // Setup realtime subscription - more robust configuration
    console.log('📡 Setting up realtime subscription...');
    
    const channel = supabase
      .channel('online-orders-notifications', {
        config: {
          broadcast: { self: false },
          presence: { key: 'admin' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'order_source=eq.online'
        },
        async (payload) => {
          console.log('🔔 New online order detected:', payload);
          
          try {
            // Small delay to ensure data is committed
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Fetch complete order data with member info
            const { data: orderData, error } = await supabase
              .from('orders')
              .select(`
                *,
                members (name, phone)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('❌ Error fetching order details:', error);
              return;
            }

            if (orderData) {
              console.log('📦 Order data fetched:', orderData);
              
              // Always show notification for new orders (remove duplicate check)
              setNewOrder(orderData);
              setShowOrderAlert(true);
              
              // Show toast notification
              console.log('🍞 Showing toast notification...');
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

              // Play notification sound - multiple attempts with different methods
              console.log('🔊 Playing notification sound...');
              await playNotificationSoundWithFallback();
            }
          } catch (error) {
            console.error('❌ Error processing new order notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to online orders channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel subscription error');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Channel subscription timed out - will retry');
        }
      });

    return () => {
      console.log('🧹 Cleaning up notification subscription...');
      supabase.removeChannel(channel);
    };
  }, [navigate, isCustomerMobileApp]);

  const fetchNotificationSettings = async () => {
    try {
      console.log('⚙️ Fetching notification settings...');
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (!error && data) {
        setNotificationSettings(data);
        console.log('✅ Notification settings loaded:', data);
      } else {
        console.log('ℹ️ No notification settings found, using defaults');
        setNotificationSettings({
          sound_enabled: true,
          volume: 1.0
        });
      }
    } catch (error) {
      console.error('❌ Error fetching notification settings:', error);
      setNotificationSettings({
        sound_enabled: true,
        volume: 1.0
      });
    }
  };

  const fetchNotificationSounds = async () => {
    try {
      console.log('🎵 Fetching notification sounds...');
      const { data, error } = await supabase
        .from('notification_sounds')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (!error && data && data.length > 0) {
        setNotificationSounds(data);
        console.log('✅ Notification sounds loaded:', data);
      } else {
        console.log('ℹ️ No notification sounds found, creating default');
        const defaultSound = {
          name: 'เสียงเริ่มต้น',
          file_url: '/sounds/default-notification.mp3',
          is_active: true
        };
        
        const { data: newSound, error: insertError } = await supabase
          .from('notification_sounds')
          .insert(defaultSound)
          .select()
          .single();
        
        if (!insertError && newSound) {
          setNotificationSounds([newSound]);
          console.log('✅ Default notification sound created:', newSound);
        } else {
          // Fallback with hardcoded default
          setNotificationSounds([{
            id: 'default',
            name: 'เสียงเริ่มต้น',
            file_url: '/sounds/default-notification.mp3',
            is_active: true
          }]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching notification sounds:', error);
      setNotificationSounds([{
        id: 'default',
        name: 'เสียงเริ่มต้น',
        file_url: '/sounds/default-notification.mp3',
        is_active: true
      }]);
    }
  };

  const playTestSound = async () => {
    console.log('🧪 Playing test sound...');
    await playNotificationSoundWithFallback();
  };

  const playNotificationSoundWithFallback = async (): Promise<boolean> => {
    console.log('🔊 ==> Starting enhanced notification sound playback...');
    
    if (!notificationSettings?.sound_enabled) {
      console.log('🔇 Notification sound disabled in settings');
      return false;
    }

    // Try multiple sound methods in sequence
    const methods = [
      () => playAudioElement(),
      () => playWebAudioBeep(),
      () => playSystemBeep()
    ];

    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`🔊 Trying sound method ${i + 1}...`);
        const success = await methods[i]();
        if (success) {
          console.log(`✅ Sound method ${i + 1} successful`);
          return true;
        }
      } catch (error) {
        console.warn(`⚠️ Sound method ${i + 1} failed:`, error);
      }
    }

    console.error('❌ All sound methods failed');
    return false;
  };

  const playAudioElement = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        // Clean up previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        let soundUrl = '';
        if (notificationSettings?.selected_sound_id && notificationSounds.length > 0) {
          const selectedSound = notificationSounds.find(
            sound => sound.id === notificationSettings.selected_sound_id
          );
          if (selectedSound) {
            soundUrl = selectedSound.file_url;
          }
        }
        
        if (!soundUrl && notificationSounds.length > 0) {
          soundUrl = notificationSounds[0].file_url;
        }

        if (!soundUrl) {
          soundUrl = '/sounds/default-notification.mp3';
        }

        console.log('🎵 Creating audio element with URL:', soundUrl);
        
        const audio = new Audio();
        audioRef.current = audio;
        
        let resolved = false;
        const resolveOnce = (success: boolean) => {
          if (!resolved) {
            resolved = true;
            resolve(success);
          }
        };

        audio.oncanplaythrough = () => {
          console.log('✅ Audio can play through');
        };
        
        audio.onplay = () => {
          console.log('▶️ Audio started playing');
          resolveOnce(true);
        };
        
        audio.onended = () => {
          console.log('⏹️ Audio finished');
          if (!resolved) resolveOnce(true);
        };
        
        audio.onerror = (error) => {
          console.error('❌ Audio error:', error);
          resolveOnce(false);
        };
        
        // Set timeout
        setTimeout(() => {
          if (!resolved) {
            console.warn('⏰ Audio timeout');
            resolveOnce(false);
          }
        }, 2000);
        
        // Configure and play
        audio.volume = Math.min(notificationSettings?.volume || 1.0, 1.0);
        audio.src = soundUrl;
        audio.load();
        
        // Try to play
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.error('❌ Play promise rejected:', error);
            resolveOnce(false);
          });
        }
        
      } catch (error) {
        console.error('❌ Audio element error:', error);
        resolve(false);
      }
    });
  };

  const playWebAudioBeep = async (): Promise<boolean> => {
    try {
      console.log('🔊 Trying Web Audio API beep...');
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      const volume = Math.min(notificationSettings?.volume || 0.8, 0.8);
      const currentTime = audioContext.currentTime;
      
      // Create double beep
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.02);
      gainNode.gain.setValueAtTime(volume, currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.17);
      gainNode.gain.setValueAtTime(0, currentTime + 0.25);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.27);
      gainNode.gain.setValueAtTime(volume, currentTime + 0.4);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.42);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.5);
      
      console.log('✅ Web Audio beep created');
      return true;
    } catch (error) {
      console.error('❌ Web Audio beep failed:', error);
      return false;
    }
  };

  const playSystemBeep = async (): Promise<boolean> => {
    try {
      console.log('🔊 Trying system beep fallback...');
      
      // Create a data URL for a simple beep sound
      const beepDataUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1O2+dSEFl8Dp3nEsDQZtRO7LUTUGj8Ey4MyCQQc+2ky6jhkHDmCh7t+vdSEFNqTA9N6HOwlMr+vFZTgGeMHt2nkPCGrQ7d+MLA0IrHDl5mlYD0xfqn9lOAZsVK52aQAITFFHSdxPCXGIV2+WOQWz5X1E';
      
      const audio = new Audio(beepDataUrl);
      audio.volume = Math.min(notificationSettings?.volume || 0.5, 0.5);
      await audio.play();
      
      console.log('✅ System beep played');
      return true;
    } catch (error) {
      console.error('❌ System beep failed:', error);
      return false;
    }
  };

  const handleDismiss = () => {
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
      
      {/* Order Alert Dialog with enhanced styling */}
      <Dialog open={showOrderAlert} onOpenChange={setShowOrderAlert}>
        <DialogContent className="sm:max-w-md border-2 border-orange-300 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600 text-xl font-bold">
              <ShoppingBag className="h-6 w-6 animate-bounce" />
              🔔 ออเดอร์ออนไลน์ใหม่!
            </DialogTitle>
          </DialogHeader>
          
          {newOrder && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border-2 border-orange-200 animate-pulse shadow-inner">
                <p className="font-bold text-xl text-orange-700">
                  📋 ออเดอร์ #{newOrder.order_number}
                </p>
                <p className="text-gray-700 font-medium">
                  📦 จำนวน: {newOrder.items_count} รายการ
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  💰 ฿{newOrder.total_amount.toFixed(2)}
                </p>
                {newOrder.members && (
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <p className="text-sm text-gray-700 font-medium">
                      👤 ลูกค้า: {newOrder.members.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      📱 เบอร์: {newOrder.members.phone}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleViewOrder} 
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  ดูรายละเอียด
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                  className="border-2 border-gray-300 hover:bg-gray-100 font-medium"
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
