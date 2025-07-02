
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
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    sound_enabled: true,
    volume: 1.0
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
          table: 'orders',
          filter: 'order_source=eq.online'
        },
        async (payload) => {
          console.log('🔔 New online order detected:', payload);
          await handleNewOrder(payload.new.id);
        }
      )
      .subscribe((status) => {
        console.log('📡 Order subscription status:', status);
      });

    // Setup cross-device notification sync channel
    const syncChannel = supabase
      .channel('notification-sync')
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
          volume: settings.volume ?? 1.0
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

  const handleNewOrder = async (orderId: string) => {
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
        .eq('id', orderId)
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
        playNotificationSound();
      }
    } catch (error) {
      console.error('❌ Error processing new order notification:', error);
    }
  };

  const playNotificationSound = () => {
    if (!notificationSettings.sound_enabled) {
      console.log('🔇 Sound disabled');
      return;
    }

    console.log('🔊 Playing notification sound...');

    // Try to play audio file first
    let soundUrl = '/sounds/default-notification.mp3';
    
    if (notificationSettings.selected_sound_id && notificationSounds.length > 0) {
      const selectedSound = notificationSounds.find(
        sound => sound.id === notificationSettings.selected_sound_id
      );
      if (selectedSound) {
        soundUrl = selectedSound.file_url;
      }
    }

    try {
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(soundUrl);
      audioRef.current = audio;
      audio.volume = Math.min(notificationSettings.volume, 1.0);
      
      audio.oncanplaythrough = () => {
        console.log('✅ Audio ready, playing...');
        audio.play().catch(() => {
          console.log('🔊 File audio failed, using beep fallback');
          createBeepSound();
        });
      };

      audio.onerror = () => {
        console.log('🔊 Audio file error, using beep fallback');
        createBeepSound();
      };

      // Load the audio
      audio.load();

    } catch (error) {
      console.log('🔊 Audio creation failed, using beep fallback');
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
      const currentTime = audioContext.currentTime;
      
      // Create triple beep pattern
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.05);
      gainNode.gain.setValueAtTime(volume, currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, currentTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.35);
      gainNode.gain.setValueAtTime(volume, currentTime + 0.45);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, currentTime + 0.6);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.65);
      gainNode.gain.setValueAtTime(volume, currentTime + 0.75);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.8);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 1);
      
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
