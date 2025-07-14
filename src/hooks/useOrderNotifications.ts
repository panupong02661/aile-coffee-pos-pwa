
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [volume, setVolume] = useState(0.8);

  // Initialize audio on first user interaction
  const initializeAudio = async () => {
    if (!isAudioInitialized) {
      try {
        // Create audio element for notification sound
        const audio = new Audio('/sounds/default-notification.mp3');
        audio.volume = volume;
        audioRef.current = audio;
        
        // Test play (most browsers require user interaction first)
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        
        setIsAudioInitialized(true);
        console.log('🎵 Audio initialized successfully');
        return true;
      } catch (error) {
        console.log('⚠️ Audio initialization failed:', error);
        // Fallback: still set initialized to true to avoid repeated attempts
        setIsAudioInitialized(true);
        return false;
      }
    }
    return true;
  };

  // Play notification sound
  const playBellSound = async () => {
    try {
      if (!audioRef.current) {
        await initializeAudio();
      }
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume;
        await audioRef.current.play();
        console.log('🔔 Notification sound played');
      }
    } catch (error) {
      console.log('⚠️ Failed to play notification sound:', error);
    }
  };

  // Listen for real-time order notifications
  useEffect(() => {
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_orders'
        },
        async (payload) => {
          console.log('🛒 New customer order received:', payload.new);
          
          // Play notification sound
          await playBellSound();
          
          // Show toast notification
          toast({
            title: "🔔 ออเดอร์ใหม่!",
            description: `ออเดอร์หมายเลข ${payload.new.order_number} เข้ามาแล้ว`,
            duration: 10000, // Show for 10 seconds
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [volume]);

  return {
    initializeAudio,
    playBellSound,
    isAudioInitialized,
    volume,
    setVolume
  };
};
