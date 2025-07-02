
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    const initializeNotifications = async () => {
      await fetchNotificationSettings();
      await fetchNotificationSounds();
    };
    
    initializeNotifications();
    
    // Setup realtime subscription
    console.log('📡 Setting up realtime subscription...');
    
    const channel = supabase
      .channel('online-orders-notifications')
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
              
              // Show notification for new order
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

              // Play notification sound
              console.log('🔊 Playing notification sound...');
              playNotificationSound();
            }
          } catch (error) {
            console.error('❌ Error processing new order notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
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

  const playNotificationSound = async () => {
    console.log('🔊 Starting notification sound playback...');
    
    if (!notificationSettings?.sound_enabled) {
      console.log('🔇 Notification sound disabled in settings');
      return;
    }

    try {
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Determine which sound to play
      let soundUrl = '';
      if (notificationSettings?.selected_sound_id && notificationSounds.length > 0) {
        const selectedSound = notificationSounds.find(
          sound => sound.id === notificationSettings.selected_sound_id
        );
        if (selectedSound) {
          soundUrl = selectedSound.file_url;
          console.log('🎵 Using selected sound:', selectedSound.name);
        }
      }
      
      if (!soundUrl && notificationSounds.length > 0) {
        soundUrl = notificationSounds[0].file_url;
        console.log('🎵 Using first available sound:', notificationSounds[0].name);
      }

      if (!soundUrl) {
        soundUrl = '/sounds/default-notification.mp3';
        console.log('🎵 Using default sound fallback');
      }

      console.log('🎵 Playing sound from URL:', soundUrl);
      
      const audio = new Audio(soundUrl);
      audioRef.current = audio;
      
      // Set volume
      audio.volume = Math.min(notificationSettings?.volume || 1.0, 1.0);
      
      // Handle audio events
      audio.oncanplaythrough = () => {
        console.log('✅ Audio can play through');
      };
      
      audio.onplay = () => {
        console.log('▶️ Audio started playing');
      };
      
      audio.onended = () => {
        console.log('⏹️ Audio finished playing');
      };
      
      audio.onerror = (error) => {
        console.error('❌ Audio error:', error);
        // Fallback to Web Audio API beep
        playWebAudioBeep();
      };
      
      // Load and play
      audio.load();
      await audio.play();
      
    } catch (error) {
      console.error('❌ Error playing notification sound:', error);
      // Fallback to Web Audio API beep
      playWebAudioBeep();
    }
  };

  const playWebAudioBeep = () => {
    try {
      console.log('🔊 Playing Web Audio beep fallback...');
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
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
      
      console.log('✅ Web Audio beep played');
    } catch (error) {
      console.error('❌ Web Audio beep failed:', error);
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
      
      {/* Order Alert Dialog */}
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
