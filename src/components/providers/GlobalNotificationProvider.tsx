
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

  // Initialize Audio Context with better error handling
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Try to start the context immediately
          if (ctx.state === 'suspended') {
            try {
              await ctx.resume();
            } catch (error) {
              console.log('🔊 Will resume audio context after user interaction');
            }
          }
          
          setAudioContext(ctx);
          console.log('🎵 Audio Context initialized:', ctx.state);
        }
      } catch (error) {
        console.error('❌ Failed to initialize audio context:', error);
      }
    };

    initAudioContext();
  }, []);

  // Enhanced user interaction detection
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!hasUserInteracted) {
        console.log('🎯 User interaction detected, enabling notifications');
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
        
        // Test sound immediately after first interaction
        if (notificationSettings?.sound_enabled && notificationSounds.length > 0) {
          setTimeout(() => {
            playNotificationSound();
          }, 500);
        }
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'keydown', 'touchstart', 'touchend'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, capture: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction, { capture: true });
      });
    };
  }, [hasUserInteracted, audioContext, notificationSettings, notificationSounds]);

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
    
    // Setup realtime subscription with better configuration
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

              // Play notification sound with retry
              console.log('🔊 Playing notification sound...');
              let soundPlayed = false;
              for (let i = 0; i < 3 && !soundPlayed; i++) {
                soundPlayed = await playNotificationSound();
                if (!soundPlayed) {
                  console.log(`🔄 Sound attempt ${i + 1} failed, retrying...`);
                  await new Promise(resolve => setTimeout(resolve, 200));
                }
              }
              
              if (!soundPlayed) {
                console.warn('⚠️ All sound attempts failed');
              }
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
        console.log('ℹ️ No notification sounds found, creating default sound');
        // Create default sound entry if none exists
        const defaultSound = {
          name: 'เสียงเริ่มต้น',
          file_url: createDefaultNotificationSound(),
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
            file_url: createDefaultNotificationSound(),
            is_active: true
          }]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching notification sounds:', error);
      // Fallback with hardcoded default
      setNotificationSounds([{
        id: 'default',
        name: 'เสียงเริ่มต้น',
        file_url: createDefaultNotificationSound(),
        is_active: true
      }]);
    }
  };

  const createDefaultNotificationSound = (): string => {
    // Create a simple notification sound using Web Audio API
    if (!audioContext) return '';
    
    try {
      // Create a simple beep sound data URL
      const sampleRate = 44100;
      const duration = 0.5;
      const frequency = 800;
      const samples = sampleRate * duration;
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
      
      // Generate sine wave
      for (let i = 0; i < samples; i++) {
        const amplitude = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        const sample = Math.max(-1, Math.min(1, amplitude)) * 32767;
        view.setInt16(44 + i * 2, sample, true);
      }
      
      // Convert to base64 data URL
      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating default sound:', error);
      return '';
    }
  };

  const playNotificationSound = async (): Promise<boolean> => {
    console.log('🔊 ==> Starting notification sound playback...');
    
    if (!notificationSettings?.sound_enabled) {
      console.log('🔇 Notification sound disabled in settings');
      return false;
    }

    if (!hasUserInteracted) {
      console.warn('⚠️ User has not interacted yet, cannot play sound');
      return false;
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
        if (success) {
          console.log('✅ Sound played successfully');
          return true;
        } else {
          console.log('🔊 Audio file failed, falling back to system beep');
          return await playSystemBeep();
        }
      } else {
        console.log('🔊 No sound URL available, using system beep');
        return await playSystemBeep();
      }
      
    } catch (error) {
      console.error('❌ Error in playNotificationSound:', error);
      return await playSystemBeep();
    }
  };

  const playAudioFile = async (soundUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('🎵 Creating new Audio element for:', soundUrl);
      
      const audio = new Audio();
      let hasResolved = false;
      
      const resolveOnce = (success: boolean) => {
        if (!hasResolved) {
          hasResolved = true;
          resolve(success);
        }
      };
      
      // Set up event handlers
      audio.oncanplaythrough = () => {
        console.log('✅ Audio can play through');
      };
      
      audio.onplay = () => {
        console.log('▶️ Audio started playing at volume:', audio.volume);
        resolveOnce(true);
      };
      
      audio.onended = () => {
        console.log('⏹️ Audio finished playing');
        if (!hasResolved) resolveOnce(true);
      };
      
      audio.onerror = (error) => {
        console.error('❌ Audio error:', error);
        resolveOnce(false);
      };
      
      audio.onabort = () => {
        console.warn('⚠️ Audio aborted');
        resolveOnce(false);
      };
      
      // Set timeout to prevent hanging
      setTimeout(() => {
        if (!hasResolved) {
          console.warn('⏰ Audio playback timeout');
          resolveOnce(false);
        }
      }, 3000);
      
      // Configure audio
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.volume = Math.min(notificationSettings?.volume || 1.0, 1.0);
      
      // Set source and attempt to play
      audio.src = soundUrl;
      audio.load(); // Explicitly load the audio
      
      // Attempt to play after a short delay
      setTimeout(() => {
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch((playError) => {
            console.error('❌ Play promise rejected:', playError);
            resolveOnce(false);
          });
        }
      }, 100);
    });
  };

  const playSystemBeep = async (): Promise<boolean> => {
    try {
      console.log('🔊 ==> Playing system beep fallback...');
      
      if (!audioContext) {
        console.error('❌ No audio context available');
        return false;
      }
      
      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        console.log('🔊 Resuming suspended audio context...');
        await audioContext.resume();
      }
      
      if (audioContext.state !== 'running') {
        console.error('❌ Audio context is not running:', audioContext.state);
        return false;
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Enhanced beep configuration for Thai notification style
      oscillator.frequency.value = 800; // Pleasant notification frequency
      oscillator.type = 'sine'; // Smooth sine wave
      
      const beepVolume = Math.min(notificationSettings?.volume || 0.8, 0.8);
      
      console.log('🔊 System beep config - Volume:', beepVolume, 'Frequency:', oscillator.frequency.value);
      
      // Create a pleasant double beep pattern
      const currentTime = audioContext.currentTime;
      const beepDuration = 0.15;
      const pauseDuration = 0.1;
      const numberOfBeeps = 2;
      
      for (let i = 0; i < numberOfBeeps; i++) {
        const startTime = currentTime + (i * (beepDuration + pauseDuration));
        const endTime = startTime + beepDuration;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(beepVolume, startTime + 0.02);
        gainNode.gain.setValueAtTime(beepVolume, endTime - 0.02);
        gainNode.gain.linearRampToValueAtTime(0, endTime);
      }
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + (numberOfBeeps * (beepDuration + pauseDuration)));
      
      console.log(`✅ System beep pattern started (${numberOfBeeps} beeps)`);
      return true;
      
    } catch (beepError) {
      console.error('❌ System beep failed:', beepError);
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
