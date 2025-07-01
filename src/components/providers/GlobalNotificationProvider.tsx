
import React, { useEffect, useState } from 'react';
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
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  // Track user interaction to enable autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      console.log('🎯 User interaction detected, enabling sound autoplay');
      setHasUserInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    if (!hasUserInteracted) {
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [hasUserInteracted]);

  useEffect(() => {
    // Don't show notifications on customer mobile app page
    if (isCustomerMobileApp) {
      return;
    }

    console.log('Setting up notification system...');
    
    // Load notification settings and sounds
    const initializeNotifications = async () => {
      await fetchNotificationSettings();
      await fetchNotificationSounds();
    };
    
    initializeNotifications();
    
    // Setup realtime subscription for new online orders
    console.log('Setting up realtime subscription...');
    
    const channel = supabase
      .channel('global-online-orders-channel')
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
              console.error('Error fetching order details:', error);
              return;
            }

            if (orderData) {
              console.log('📦 Order data fetched:', orderData);
              
              setNewOrder(orderData);
              setShowOrderAlert(true);
              
              // Show toast notification
              console.log('🍞 Showing toast notification...');
              toast.success('มีออเดอร์ออนไลน์ใหม่!', {
                description: `ออเดอร์ #${orderData.order_number} - ฿${orderData.total_amount}`,
                duration: 10000,
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
              await playNotificationSound();
            }
          } catch (error) {
            console.error('Error processing new order notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up notification subscription...');
      supabase.removeChannel(channel);
    };
  }, [navigate, isCustomerMobileApp, hasUserInteracted]);

  const fetchNotificationSettings = async () => {
    try {
      console.log('Fetching notification settings...');
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (!error && data) {
        setNotificationSettings(data);
        console.log('✅ Notification settings loaded:', data);
      } else {
        console.log('ℹ️ No notification settings found, using defaults');
        // Set default settings
        setNotificationSettings({
          sound_enabled: true,
          volume: 1.0
        });
      }
    } catch (error) {
      console.error('❌ Error fetching notification settings:', error);
      // Set default settings on error
      setNotificationSettings({
        sound_enabled: true,
        volume: 1.0
      });
    }
  };

  const fetchNotificationSounds = async () => {
    try {
      console.log('Fetching notification sounds...');
      const { data, error } = await supabase
        .from('notification_sounds')
        .select('*')
        .order('created_at');

      if (!error && data) {
        setNotificationSounds(data);
        console.log('✅ Notification sounds loaded:', data);
      } else {
        console.log('ℹ️ No notification sounds found');
      }
    } catch (error) {
      console.error('❌ Error fetching notification sounds:', error);
    }
  };

  const playNotificationSound = async () => {
    console.log('🔊 Attempting to play notification sound...');
    
    if (!notificationSettings?.sound_enabled) {
      console.log('🔇 Notification sound disabled in settings');
      return;
    }

    if (!hasUserInteracted) {
      console.log('⚠️ No user interaction yet, cannot play sound due to autoplay policy');
      await playSystemBeep();
      return;
    }

    try {
      let soundUrl = '';
      
      // Use selected sound or fallback to first available sound
      if (notificationSettings.selected_sound_id && notificationSounds.length > 0) {
        const selectedSound = notificationSounds.find(
          sound => sound.id === notificationSettings.selected_sound_id
        );
        if (selectedSound) {
          soundUrl = selectedSound.file_url;
          console.log('🎵 Using selected sound:', selectedSound.name);
        }
      }
      
      // Fallback to first sound if no specific sound selected
      if (!soundUrl && notificationSounds.length > 0) {
        soundUrl = notificationSounds[0].file_url;
        console.log('🎵 Using first available sound:', notificationSounds[0].name);
      }
      
      if (soundUrl) {
        console.log('🔊 Playing sound from URL:', soundUrl);
        
        // Force minimum volume to 90% to ensure it's loud enough
        const volumeLevel = Math.max(notificationSettings.volume, 0.9);
        console.log('🔊 Setting audio volume to:', volumeLevel);
        
        const audio = new Audio();
        
        // Create a promise to handle the audio loading and playing
        const playAudio = () => {
          return new Promise((resolve, reject) => {
            audio.onloadstart = () => console.log('🔄 Audio loading started');
            audio.oncanplay = () => {
              console.log('✅ Audio can play');
              // Set volume when audio is ready
              audio.volume = volumeLevel;
              console.log('🔊 Audio volume set to:', audio.volume);
            };
            audio.onplay = () => {
              console.log('▶️ Audio started playing at volume:', audio.volume);
              resolve(true);
            };
            audio.onended = () => console.log('⏹️ Audio finished playing');
            audio.onerror = (error) => {
              console.error('❌ Audio error:', error);
              reject(error);
            };
            
            // Set volume before setting source
            audio.volume = volumeLevel;
            audio.src = soundUrl;
            
            // Try to play
            audio.play().catch(reject);
          });
        };
        
        try {
          await playAudio();
          console.log('✅ Notification sound played successfully');
        } catch (playError) {
          console.error('❌ Error playing audio:', playError);
          // Fallback to system beep with high volume
          await playSystemBeep(true);
        }
      } else {
        console.log('🔊 No sound URL available, using system beep');
        await playSystemBeep(true);
      }
      
    } catch (error) {
      console.error('❌ Error in playNotificationSound:', error);
      // Fallback to system beep with high volume
      await playSystemBeep(true);
    }
  };

  const playSystemBeep = async (highVolume = false) => {
    try {
      console.log('🔊 Playing system beep fallback...');
      
      // Try to create Web Audio API beep
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume context if it's suspended (required for autoplay policy)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Use higher frequency for more audible beep
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        
        // Use much higher volume for system beep to ensure it's audible
        const beepVolume = highVolume ? 0.9 : (notificationSettings?.volume || 0.8) * 0.7;
        gainNode.gain.value = beepVolume;
        
        console.log('🔊 System beep volume:', beepVolume);
        console.log('🔊 System beep frequency:', oscillator.frequency.value);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.8); // Longer 800ms beep for better audibility
        
        console.log('✅ System beep played');
      } else {
        console.log('⚠️ Web Audio API not available');
      }
    } catch (beepError) {
      console.error('❌ System beep also failed:', beepError);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <ShoppingBag className="h-5 w-5" />
              ออเดอร์ออนไลน์ใหม่!
            </DialogTitle>
          </DialogHeader>
          
          {newOrder && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-semibold text-lg">
                  ออเดอร์ #{newOrder.order_number}
                </p>
                <p className="text-gray-600">
                  จำนวน: {newOrder.items_count} รายการ
                </p>
                <p className="text-xl font-bold text-orange-600">
                  ฿{newOrder.total_amount.toFixed(2)}
                </p>
                {newOrder.members && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      ลูกค้า: {newOrder.members.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      เบอร์: {newOrder.members.phone}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleViewOrder} className="flex-1">
                  <Bell className="h-4 w-4 mr-2" />
                  ดูรายละเอียด
                </Button>
                <Button variant="outline" onClick={handleDismiss}>
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
