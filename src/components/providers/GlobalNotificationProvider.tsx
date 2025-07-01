
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
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  // Initialize Audio Context
  useEffect(() => {
    const initAudioContext = () => {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        console.log('🎵 Audio Context initialized:', ctx.state);
      }
    };

    initAudioContext();
  }, []);

  // Track user interaction more reliably
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!hasUserInteracted) {
        console.log('🎯 User interaction detected, enabling sound autoplay');
        setHasUserInteracted(true);
        
        // Resume audio context if suspended
        if (audioContext && audioContext.state === 'suspended') {
          try {
            await audioContext.resume();
            console.log('🎵 Audio context resumed successfully');
          } catch (error) {
            console.error('❌ Failed to resume audio context:', error);
          }
        }
        
        // Remove all listeners after first interaction
        document.removeEventListener('click', handleUserInteraction, { capture: true });
        document.removeEventListener('keydown', handleUserInteraction, { capture: true });
        document.removeEventListener('touchstart', handleUserInteraction, { capture: true });
        document.removeEventListener('touchend', handleUserInteraction, { capture: true });
        document.removeEventListener('scroll', handleUserInteraction, { capture: true });
        document.removeEventListener('mousemove', handleUserInteraction, { capture: true });
      }
    };

    if (!hasUserInteracted) {
      // Add multiple event listeners to catch any user interaction
      document.addEventListener('click', handleUserInteraction, { capture: true });
      document.addEventListener('keydown', handleUserInteraction, { capture: true });
      document.addEventListener('touchstart', handleUserInteraction, { capture: true });
      document.addEventListener('touchend', handleUserInteraction, { capture: true });
      document.addEventListener('scroll', handleUserInteraction, { capture: true });
      document.addEventListener('mousemove', handleUserInteraction, { capture: true });
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction, { capture: true });
      document.removeEventListener('keydown', handleUserInteraction, { capture: true });
      document.removeEventListener('touchstart', handleUserInteraction, { capture: true });
      document.removeEventListener('touchend', handleUserInteraction, { capture: true });
      document.removeEventListener('scroll', handleUserInteraction, { capture: true });
      document.removeEventListener('mousemove', handleUserInteraction, { capture: true });
    };
  }, [hasUserInteracted, audioContext]);

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
    
    // Setup realtime subscription for new online orders
    console.log('📡 Setting up realtime subscription...');
    
    const channel = supabase
      .channel('global-online-orders-channel-v2')
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
              console.error('❌ Error fetching order details:', error);
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
              console.log('🔊 Attempting to play notification sound...');
              await playNotificationSound();
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
          console.warn('⏰ Channel subscription timed out');
        }
      });

    return () => {
      console.log('🧹 Cleaning up notification subscription...');
      supabase.removeChannel(channel);
    };
  }, [navigate, isCustomerMobileApp, hasUserInteracted, audioContext]);

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
      console.log('🎵 Fetching notification sounds...');
      const { data, error } = await supabase
        .from('notification_sounds')
        .select('*')
        .eq('is_active', true)
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
    console.log('🔊 ==> Starting notification sound playback process...');
    
    if (!notificationSettings?.sound_enabled) {
      console.log('🔇 Notification sound disabled in settings');
      return;
    }

    if (!hasUserInteracted) {
      console.warn('⚠️ User has not interacted yet, cannot play sound');
      return;
    }

    try {
      let soundUrl = '';
      let selectedSoundName = '';
      
      // Use selected sound or fallback to first available sound
      if (notificationSettings.selected_sound_id && notificationSounds.length > 0) {
        const selectedSound = notificationSounds.find(
          sound => sound.id === notificationSettings.selected_sound_id
        );
        if (selectedSound) {
          soundUrl = selectedSound.file_url;
          selectedSoundName = selectedSound.name;
          console.log('🎵 Using selected sound:', selectedSoundName, soundUrl);
        }
      }
      
      // Fallback to first sound if no specific sound selected
      if (!soundUrl && notificationSounds.length > 0) {
        soundUrl = notificationSounds[0].file_url;
        selectedSoundName = notificationSounds[0].name;
        console.log('🎵 Using first available sound:', selectedSoundName, soundUrl);
      }
      
      if (soundUrl) {
        console.log('🔊 ==> Attempting to play sound from URL:', soundUrl);
        
        const success = await playAudioFile(soundUrl);
        if (!success) {
          console.log('🔊 Audio file failed, falling back to system beep');
          await playSystemBeep();
        }
      } else {
        console.log('🔊 No sound URL available, using system beep');
        await playSystemBeep();
      }
      
    } catch (error) {
      console.error('❌ Error in playNotificationSound:', error);
      // Fallback to system beep
      await playSystemBeep();
    }
  };

  const playAudioFile = async (soundUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('🎵 Creating new Audio element for:', soundUrl);
      
      const audio = new Audio();
      let hasResolved = false;
      
      // Set up event handlers
      audio.onloadstart = () => console.log('🔄 Audio loading started');
      audio.oncanplay = () => {
        console.log('✅ Audio can play');
        // Set volume when audio is ready
        audio.volume = 1.0; // Force maximum volume
        console.log('🔊 Audio volume set to:', audio.volume);
      };
      
      audio.onplay = () => {
        console.log('▶️ Audio started playing at volume:', audio.volume);
        if (!hasResolved) {
          hasResolved = true;
          resolve(true);
        }
      };
      
      audio.onended = () => {
        console.log('⏹️ Audio finished playing');
        if (!hasResolved) {
          hasResolved = true;
          resolve(true);
        }
      };
      
      audio.onerror = (error) => {
        console.error('❌ Audio error:', error);
        if (!hasResolved) {
          hasResolved = true;
          resolve(false);
        }
      };
      
      audio.onabort = () => {
        console.warn('⚠️ Audio aborted');
        if (!hasResolved) {
          hasResolved = true;
          resolve(false);
        }
      };
      
      // Set timeout to prevent hanging
      setTimeout(() => {
        if (!hasResolved) {
          console.warn('⏰ Audio playback timeout');
          hasResolved = true;
          resolve(false);
        }
      }, 5000);
      
      // Configure audio
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.volume = 1.0; // Set volume before setting source
      
      // Set source and attempt to play
      audio.src = soundUrl;
      
      // Attempt to play
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((playError) => {
          console.error('❌ Play promise rejected:', playError);
          if (!hasResolved) {
            hasResolved = true;
            resolve(false);
          }
        });
      }
    });
  };

  const playSystemBeep = async () => {
    try {
      console.log('🔊 ==> Playing system beep fallback...');
      
      if (!audioContext) {
        console.error('❌ No audio context available');
        return;
      }
      
      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        console.log('🔊 Resuming suspended audio context...');
        await audioContext.resume();
      }
      
      if (audioContext.state !== 'running') {
        console.error('❌ Audio context is not running:', audioContext.state);
        return;
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // High frequency beep for iPad speakers
      oscillator.frequency.value = 2000; // Even higher frequency
      oscillator.type = 'square'; // Square wave is more noticeable
      
      // Maximum volume
      const beepVolume = 0.8; // Slightly reduced to prevent distortion
      gainNode.gain.value = beepVolume;
      
      console.log('🔊 System beep config - Volume:', beepVolume, 'Frequency:', oscillator.frequency.value);
      
      // Create a longer, more noticeable beep pattern (5 beeps)
      const currentTime = audioContext.currentTime;
      const beepDuration = 0.15;
      const pauseDuration = 0.1;
      
      // Pattern: beep-pause-beep-pause-beep-pause-beep-pause-beep
      for (let i = 0; i < 5; i++) {
        const startTime = currentTime + (i * (beepDuration + pauseDuration));
        const endTime = startTime + beepDuration;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.setValueAtTime(beepVolume, startTime + 0.01);
        gainNode.gain.setValueAtTime(beepVolume, endTime - 0.01);
        gainNode.gain.setValueAtTime(0, endTime);
      }
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + (5 * (beepDuration + pauseDuration)));
      
      console.log('✅ System beep pattern started (5 beeps)');
      
    } catch (beepError) {
      console.error('❌ System beep failed:', beepError);
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
