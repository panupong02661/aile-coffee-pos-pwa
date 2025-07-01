
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
}

const GlobalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOrderAlert, setShowOrderAlert] = useState(false);
  const [newOrder, setNewOrder] = useState<OnlineOrder | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [notificationSounds, setNotificationSounds] = useState<NotificationSound[]>([]);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is customer mobile app
  const isCustomerMobileApp = location.pathname === '/customer-mobile-app';

  useEffect(() => {
    // Don't show notifications on customer mobile app page
    if (isCustomerMobileApp) {
      return;
    }

    // Load notification settings and sounds
    const initializeNotifications = async () => {
      await fetchNotificationSettings();
      await fetchNotificationSounds();
    };
    
    initializeNotifications();
    
    // Setup realtime subscription for new online orders
    const channel = supabase
      .channel('global-online-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'order_source=eq.online'
        },
        async (payload) => {
          console.log('New global online order received:', payload);
          
          // Fetch complete order data with member info
          const { data: orderData, error } = await supabase
            .from('orders')
            .select(`
              *,
              members (name, phone)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && orderData) {
            setNewOrder(orderData);
            setShowOrderAlert(true);
            
            // Show toast notification
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
            await playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      // Clean up audio instance
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = '';
      }
    };
  }, [navigate, isCustomerMobileApp, notificationSettings, notificationSounds]);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (!error && data) {
        setNotificationSettings(data);
        console.log('Notification settings loaded:', data);
      } else if (error) {
        console.log('No notification settings found, using defaults');
        // Set default settings
        setNotificationSettings({
          sound_enabled: true,
          volume: 0.8
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const fetchNotificationSounds = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_sounds')
        .select('*')
        .order('created_at');

      if (!error && data) {
        setNotificationSounds(data);
        console.log('Notification sounds loaded:', data);
      }
    } catch (error) {
      console.error('Error fetching notification sounds:', error);
    }
  };

  const playNotificationSound = async () => {
    if (!notificationSettings?.sound_enabled) {
      console.log('Notification sound disabled');
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
        }
      }
      
      // Fallback to first sound if no specific sound selected
      if (!soundUrl && notificationSounds.length > 0) {
        soundUrl = notificationSounds[0].file_url;
      }
      
      // Ultimate fallback - use a default system sound
      if (!soundUrl) {
        console.log('No notification sound available, using default');
        // Try to play a simple beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = notificationSettings.volume || 0.8;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        return;
      }

      console.log('Playing notification sound:', soundUrl);
      
      // Clean up previous audio instance
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = '';
      }
      
      const audio = new Audio(soundUrl);
      audio.volume = notificationSettings.volume || 0.8;
      setAudioInstance(audio);
      
      // Handle audio loading and playing
      const playPromise = new Promise((resolve, reject) => {
        audio.oncanplaythrough = () => {
          audio.play()
            .then(resolve)
            .catch(reject);
        };
        
        audio.onerror = (error) => {
          console.error('Audio load error:', error);
          reject(error);
        };
        
        // Timeout after 5 seconds
        setTimeout(() => {
          reject(new Error('Audio load timeout'));
        }, 5000);
      });
      
      audio.load();
      
      await playPromise;
      console.log('Notification sound played successfully');
      
    } catch (error) {
      console.error('Error playing notification sound:', error);
      
      // Fallback beep if audio fails
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.5;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (fallbackError) {
        console.error('Fallback beep also failed:', fallbackError);
      }
    }
  };

  const handleViewOrder = () => {
    handleDismiss();
    navigate('/online-orders');
  };

  const handleDismiss = () => {
    setShowOrderAlert(false);
    setNewOrder(null);
    // Dismiss all toasts
    toast.dismiss();
  };

  // Don't render anything on customer mobile app page
  if (isCustomerMobileApp) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Global Order Alert Dialog */}
      <Dialog open={showOrderAlert} onOpenChange={handleDismiss}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Bell className="w-5 h-5 animate-bounce" />
              มีออเดอร์ออนไลน์ใหม่!
            </DialogTitle>
          </DialogHeader>
          
          {newOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <ShoppingBag className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">#{newOrder.order_number}</h3>
                  <p className="text-sm text-gray-600">
                    {newOrder.members?.name} • {newOrder.members?.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {newOrder.items_count} รายการ
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ฿{newOrder.total_amount}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleViewOrder}
                  className="flex-1"
                >
                  ดูรายละเอียดออเดอร์
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
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
