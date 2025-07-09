
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const isAudioInitializedRef = useRef(false);

  // Initialize audio context for iOS compatibility
  const initializeAudio = async () => {
    if (isAudioInitializedRef.current) return;
    
    try {
      console.log('🎵 Initializing audio for iOS/iPad compatibility...');
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      if (!AudioContextClass) {
        console.warn('⚠️ AudioContext not supported');
        return;
      }

      const audioContext = new AudioContextClass();
      
      // Resume context if suspended (required for iOS)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('✅ Audio context resumed for iOS');
      }
      
      audioContextRef.current = audioContext;
      isAudioInitializedRef.current = true;
      
      // Test audio capability with a silent tone
      const testOscillator = audioContext.createOscillator();
      const testGain = audioContext.createGain();
      testGain.gain.setValueAtTime(0, audioContext.currentTime);
      testOscillator.connect(testGain);
      testGain.connect(audioContext.destination);
      testOscillator.start();
      testOscillator.stop(audioContext.currentTime + 0.001);
      
      console.log('✅ Audio initialized successfully for iPad/iOS');
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
    }
  };

  // Enhanced bell sound function for iOS/iPad compatibility
  const playBellSound = async () => {
    try {
      console.log('🔔 Playing bell notification for new order (iOS compatible)...');
      
      // Initialize audio if not already done
      await initializeAudio();
      
      if (!audioContextRef.current) {
        console.warn('⚠️ Audio context not available, falling back to HTML5 audio');
        // Fallback to HTML5 audio for older devices
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGm+H3yoUqBOFvyO6ueB4EcqXs0oQqBi+N1fS4bSQDJHfH8N2QQAoUXrTp66hVFApGm+H3yoUqBOFvyO6ueB4EcqXs0oQqBi+N1fS4bSQDJHfH8N2QQAoUXrTp66hVFApGm+H3yoUqBOFvyO6ueB4EcqXs0oQqBi+N1fS4bSQDJHfH8N2QQAoUXrTp66hVFApGm+H3yoUqBOFvyO6ueB4EcqXs0oQqBi+N1fS4bSQD');
          audio.volume = 0.7;
          await audio.play();
          console.log('✅ Fallback audio played');
          return;
        } catch (fallbackError) {
          console.error('❌ Fallback audio failed:', fallbackError);
          return;
        }
      }
      
      const audioContext = audioContextRef.current;
      
      // Resume context if suspended (iOS requirement)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create more pleasant bell sounds optimized for iPad speakers
      const bellFrequencies = [
        { freq: 800, time: 0.0, duration: 0.8, volume: 0.3 },   // First chime
        { freq: 1000, time: 0.3, duration: 0.6, volume: 0.25 }, // Second chime  
        { freq: 1200, time: 0.6, duration: 0.4, volume: 0.2 },  // Third chime
        { freq: 800, time: 1.2, duration: 0.6, volume: 0.15 },  // Echo
        { freq: 1000, time: 1.5, duration: 0.4, volume: 0.1 }   // Final echo
      ];
      
      const oscillators: OscillatorNode[] = [];
      
      bellFrequencies.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Use sine wave for cleaner sound on iPad
        oscillator.type = 'sine';
        oscillator.frequency.value = note.freq;
        
        // Connect audio nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const startTime = audioContext.currentTime + note.time;
        const endTime = startTime + note.duration;
        
        // Create smooth envelope for pleasant sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(note.volume, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
        
        oscillators.push(oscillator);
      });
      
      oscillatorsRef.current = oscillators;
      
      // Auto-stop after 7 seconds (as requested)
      setTimeout(() => {
        stopBellSound();
      }, 7000);
      
      console.log('✅ Bell sound played successfully on iPad/iOS');
    } catch (error) {
      console.error('❌ Bell sound failed on iPad:', error);
      
      // Final fallback - try simple beep
      try {
        console.log('🔄 Trying simple beep fallback...');
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGm+H3yoUqBOFvyO6ueB4EcqXs0oQqBi+N1fS4bSQDJHfH8N2QQAoUXrTp66hVFApGm+H3yoUqBOFvyO6ueB4EcqXs0oQqBi+N1fS4bSQD';
        audio.volume = 0.5;
        await audio.play();
      } catch (beepError) {
        console.error('❌ All audio methods failed on iPad');
      }
    }
  };

  // Stop bell sound function
  const stopBellSound = () => {
    try {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
        isAudioInitializedRef.current = false;
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

  // Add touch/click event listener to initialize audio (required for iOS)
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!isAudioInitializedRef.current) {
        await initializeAudio();
        console.log('🎵 Audio initialized after user interaction (iOS requirement)');
      }
    };

    // Listen for any user interaction to initialize audio
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchend', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    // Subscribe to new orders with enhanced logging
    const channel = supabase
      .channel('new-orders-ipad')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_orders'
        },
        (payload) => {
          console.log('🔔 New online order received on iPad:', payload.new);
          
          const order = payload.new as any;
          
          // Play notification sound (7 seconds as requested)
          playBellSound();
          
          // Show toast notification
          toast({
            title: '🔔 มีออเดอร์ออนไลน์ใหม่!',
            description: `ออเดอร์ #${order.order_number} จำนวน ฿${order.total_amount}`,
            duration: 5000,
          });
          
          console.log('📱 iPad notification complete');
        }
      )
      .subscribe();

    console.log('👂 Listening for new online orders on iPad...');

    // Cleanup
    return () => {
      console.log('🔄 Cleaning up order notifications...');
      supabase.removeChannel(channel);
      stopBellSound();
    };
  }, [toast]);

  return {
    playBellSound,
    stopBellSound,
    initializeAudio
  };
};
