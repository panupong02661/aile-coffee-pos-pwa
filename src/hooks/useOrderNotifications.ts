
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioInitializedRef = useRef(false);

  // Initialize audio with user interaction for iOS compatibility
  const initializeAudio = async () => {
    if (isAudioInitializedRef.current || audioRef.current) return;
    
    try {
      console.log('🎵 Initializing notification audio for iPad...');
      
      // Create audio element
      const audio = new Audio();
      
      // Try to use an existing notification sound first
      audio.src = '/sounds/default-notification.mp3';
      audio.preload = 'auto';
      audio.volume = 0.8;
      
      // For iOS - need to play and immediately pause to initialize
      audio.muted = true;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          console.log('✅ Audio initialized successfully');
        }).catch(error => {
          console.log('⚠️ Audio initialization with file failed, creating tone...', error);
          // Fallback: create a simple tone
          createNotificationTone();
        });
      }
      
      audioRef.current = audio;
      isAudioInitializedRef.current = true;
      
    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
      // Final fallback
      createNotificationTone();
    }
  };

  // Create notification tone as fallback
  const createNotificationTone = () => {
    try {
      // Create a simple notification tone using data URL
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = 22050;
      const duration = 1;
      const samples = sampleRate * duration;
      
      // Create buffer for bell sound
      const buffer = audioContext.createBuffer(1, samples, sampleRate);
      const channelData = buffer.getChannelData(0);
      
      // Generate bell-like sound
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const frequency1 = 800;
        const frequency2 = 1000;
        const envelope = Math.exp(-t * 3);
        
        channelData[i] = envelope * (
          Math.sin(2 * Math.PI * frequency1 * t) * 0.5 +
          Math.sin(2 * Math.PI * frequency2 * t) * 0.3
        );
      }
      
      // Convert to WAV
      const wavData = audioBufferToWav(buffer);
      const blob = new Blob([wavData], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      audioRef.current = audio;
      
      console.log('✅ Fallback tone created');
      
    } catch (error) {
      console.error('❌ Fallback tone creation failed:', error);
    }
  };

  // Convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  };

  // Play notification sound
  const playBellSound = async () => {
    try {
      console.log('🔔 Playing notification sound...');
      
      if (!audioRef.current) {
        console.log('⚠️ Audio not initialized, initializing now...');
        await initializeAudio();
      }
      
      if (audioRef.current) {
        // Reset audio to beginning
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.8;
        
        // Play the sound
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise.then(() => {
            console.log('✅ Notification sound playing');
            
            // Stop after 7 seconds
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                console.log('🔇 Notification sound stopped after 7 seconds');
              }
            }, 7000);
            
          }).catch(error => {
            console.error('❌ Failed to play notification sound:', error);
            // Try to play system beep as final fallback
            playSystemBeep();
          });
        }
      } else {
        console.error('❌ No audio available, playing system beep');
        playSystemBeep();
      }
      
    } catch (error) {
      console.error('❌ Notification sound error:', error);
      playSystemBeep();
    }
  };

  // System beep fallback
  const playSystemBeep = () => {
    try {
      // Create multiple quick beeps
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          console.log(`🔊 System beep ${i + 1}`);
          // This will at least create a visual feedback
          document.title = `🔔 New Order! ${i + 1}/5`;
          
          // Try to trigger any available system sound
          const context = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          
          oscillator.frequency.value = 800 + (i * 200);
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          
          oscillator.start(context.currentTime);
          oscillator.stop(context.currentTime + 0.3);
          
        }, i * 800);
      }
      
      // Reset title after beeps
      setTimeout(() => {
        document.title = document.title.replace(/🔔 New Order! \d\/5/, '');
      }, 5000);
      
    } catch (error) {
      console.error('❌ System beep failed:', error);
    }
  };

  // Stop notification sound
  const stopBellSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        console.log('🔇 Notification sound stopped manually');
      }
    } catch (error) {
      console.error('Error stopping notification sound:', error);
    }
  };

  // Initialize audio on user interaction
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!isAudioInitializedRef.current) {
        await initializeAudio();
      }
    };

    // Listen for any user interaction to initialize audio
    const events = ['touchstart', 'touchend', 'click', 'keydown'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, handleUserInteraction, { 
        once: true, 
        passive: true 
      });
    });

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleUserInteraction);
      });
    };
  }, []);

  // Listen for new online orders
  useEffect(() => {
    console.log('👂 Setting up real-time order notifications...');
    
    const channel = supabase
      .channel('new-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_orders'
        },
        (payload) => {
          console.log('🔔 New online order received:', payload.new);
          
          const order = payload.new as any;
          
          // Play notification sound immediately
          playBellSound();
          
          // Show toast notification
          toast({
            title: '🔔 มีออเดอร์ออนไลน์ใหม่!',
            description: `ออเดอร์ #${order.order_number} จำนวน ฿${order.total_amount}`,
            duration: 8000,
          });
          
          // Update page title for additional visual feedback
          const originalTitle = document.title;
          document.title = `🔔 ออเดอร์ใหม่! - ${originalTitle}`;
          setTimeout(() => {
            document.title = originalTitle;
          }, 10000);
          
          console.log('📱 Notification sequence complete');
        }
      )
      .subscribe();

    console.log('✅ Real-time notifications active');

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
