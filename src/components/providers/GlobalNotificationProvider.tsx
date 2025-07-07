
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

interface NotificationContextType {
  hasNewOrders: boolean;
  clearNewOrders: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  hasNewOrders: false,
  clearNewOrders: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface GlobalNotificationProviderProps {
  children: React.ReactNode;
}

export const GlobalNotificationProvider: React.FC<GlobalNotificationProviderProps> = ({ children }) => {
  const [hasNewOrders, setHasNewOrders] = useState(false);

  useEffect(() => {
    // ตั้งค่าการฟัง real-time updates
    const channel = supabase
      .channel('online-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_orders'
        },
        (payload) => {
          console.log('New online order received:', payload);
          
          setHasNewOrders(true);
          
          // แสดงการแจ้งเตือน
          toast.success('มีออเดอร์ออนไลน์ใหม่!', {
            description: `ออเดอร์ใหม่เข้ามาแล้ว`,
            duration: 10000,
            action: {
              label: 'ดูออเดอร์',
              onClick: () => {
                window.location.href = '/online-order-management';
              },
            },
          });

          // เล่นเสียงแจ้งเตือน
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const playNotificationSound = async () => {
    try {
      // ดึงการตั้งค่าเสียง
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)
        .single();

      if (!settings?.sound_enabled) return;

      const selectedSound = settings.selected_sound_id;
      const duration = (settings.duration || 2) * 1000;
      const volume = settings.volume || 0.8;
      
      // เสียงพื้นฐาน
      const basicSounds = ['ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด'];
      
      if (basicSounds.includes(selectedSound)) {
        // เล่นเสียงพื้นฐาน
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        let frequency = 800;
        switch (selectedSound) {
          case 'ระฆัง': frequency = 800; break;
          case 'กิ่งก่า': frequency = 1000; break;
          case 'แจ้งเตือน': frequency = 600; break;
          case 'ปลุก': frequency = 1200; break;
          case 'กระดิ่ง': frequency = 900; break;
          case 'ออด': frequency = 400; break;
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
        
      } else if (selectedSound === 'initial') {
        // เล่นเสียงเริ่มต้น
        const audio = new Audio('/sounds/default-notification.mp3');
        audio.volume = volume;
        
        await audio.play();
        
        setTimeout(() => {
          if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        }, duration);
        
      } else if (selectedSound) {
        // เล่นเสียงที่อัปโหลด
        const { data: soundData } = await supabase
          .from('notification_sounds')
          .select('file_url')
          .eq('id', selectedSound)
          .single();
          
        if (soundData) {
          const audio = new Audio(soundData.file_url);
          audio.volume = volume;
          
          await audio.play();
          
          setTimeout(() => {
            if (audio && !audio.paused) {
              audio.pause();
              audio.currentTime = 0;
            }
          }, duration);
        }
      } else {
        // เล่นเสียงเริ่มต้นถ้าไม่มีการเลือก
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      }
      
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const clearNewOrders = () => {
    setHasNewOrders(false);
  };

  return (
    <NotificationContext.Provider value={{
      hasNewOrders,
      clearNewOrders
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
