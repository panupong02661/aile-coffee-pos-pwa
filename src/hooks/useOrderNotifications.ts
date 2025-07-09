import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // ฟังก์ชันเล่นเสียงกระดิ่ง
  const playBellSound = async () => {
    try {
      console.log('🔔 Playing bell notification for new order...');
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      audioContextRef.current = audioContext;
      
      // สร้างเสียงกระดิ่งที่ไพเราะ
      const bellFrequencies = [
        { freq: 523.25, time: 0.0, duration: 1.0 },   // C5
        { freq: 659.25, time: 0.3, duration: 0.8 },   // E5  
        { freq: 783.99, time: 0.6, duration: 0.6 }    // G5
      ];
      
      const oscillators: OscillatorNode[] = [];
      
      bellFrequencies.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // เพิ่ม reverb effect
        const convolver = audioContext.createConvolver();
        
        oscillator.connect(gainNode);
        gainNode.connect(convolver);
        convolver.connect(audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + note.time;
        const endTime = startTime + note.duration;
        
        // สร้าง bell envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
        
        oscillators.push(oscillator);
      });
      
      oscillatorsRef.current = oscillators;
      
      // หยุดเสียงอัตโนมัติหลัง 2 วินาที
      setTimeout(() => {
        stopBellSound();
      }, 2000);
      
      console.log('✅ Bell sound played for new order');
    } catch (error) {
      console.error('Bell sound failed:', error);
    }
  };

  // ฟังก์ชันหยุดเสียงกระดิ่ง
  const stopBellSound = () => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      oscillatorsRef.current.forEach(oscillator => {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      oscillatorsRef.current = [];
      
      console.log('🔇 Bell sound stopped');
    } catch (error) {
      console.error('Error stopping bell sound:', error);
    }
  };

  useEffect(() => {
    // Subscribe to new orders
    const channel = supabase
      .channel('new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔔 New order received:', payload.new);
          
          const order = payload.new as any;
          
          // เล่นเสียงกระดิ่ง
          playBellSound();
          
          // แสดง toast notification
          toast({
            title: '🔔 มีออเดอร์ใหม่!',
            description: `ออเดอร์ #${order.order_number} จำนวน ฿${order.total_amount}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      stopBellSound();
    };
  }, [toast]);

  return {
    playBellSound,
    stopBellSound
  };
};