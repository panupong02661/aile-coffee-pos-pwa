
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioInitializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Enhanced iOS-compatible audio initialization
  const initializeAudio = async () => {
    if (isAudioInitializedRef.current) return;
    
    try {
      console.log('🎵 Initializing iOS-compatible notification audio...');
      
      // Initialize AudioContext for iOS
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        console.log('✅ AudioContext initialized for iOS');
      }
      
      // Try to create enhanced audio element for iOS
      const audio = new Audio();
      
      // iOS-specific attributes
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      // Create enhanced notification sound data URL
      const createEnhancedNotificationSound = () => {
        const sampleRate = 22050;
        const duration = 1.5;
        const samples = sampleRate * duration;
        
        // Create WAV file buffer
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
        
        // Generate enhanced bell sound for iOS
        let offset = 44;
        for (let i = 0; i < samples; i++) {
          const t = i / sampleRate;
          const frequency1 = 800;
          const frequency2 = 1000;
          const frequency3 = 1200;
          const envelope = Math.exp(-t * 1.5);
          
          const sample = envelope * (
            Math.sin(2 * Math.PI * frequency1 * t) * 0.5 +
            Math.sin(2 * Math.PI * frequency2 * t) * 0.3 +
            Math.sin(2 * Math.PI * frequency3 * t) * 0.2
          );
          
          const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
          view.setInt16(offset, intSample, true);
          offset += 2;
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
      };
      
      const audioUrl = createEnhancedNotificationSound();
      audio.src = audioUrl;
      
      // iOS initialization sequence
      audio.muted = true;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          console.log('✅ iOS audio initialized successfully');
        }).catch(error => {
          console.log('⚠️ iOS audio initialization failed:', error);
        });
      }
      
      audioRef.current = audio;
      isAudioInitializedRef.current = true;
      
    } catch (error) {
      console.error('❌ iOS audio initialization failed:', error);
    }
  };

  // Enhanced iOS-compatible notification sound
  const playBellSound = async () => {
    try {
      console.log('🔔 Playing enhanced iOS notification sound for 7 seconds...');
      
      // Method 1: Enhanced AudioContext approach for iOS
      if (audioContextRef.current) {
        const audioContext = audioContextRef.current;
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const playAudioContextNotification = () => {
          const duration = 7; // 7 seconds
          const beepPattern = [
            { freq: 800, start: 0, duration: 0.4 },
            { freq: 1000, start: 0.7, duration: 0.4 },
            { freq: 1200, start: 1.4, duration: 0.4 },
            { freq: 800, start: 2.1, duration: 0.4 },
            { freq: 1000, start: 2.8, duration: 0.4 },
            { freq: 1200, start: 3.5, duration: 0.4 },
            { freq: 800, start: 4.2, duration: 0.4 },
            { freq: 1000, start: 4.9, duration: 0.4 },
            { freq: 1200, start: 5.6, duration: 0.4 },
            { freq: 800, start: 6.3, duration: 0.4 }
          ];
          
          beepPattern.forEach(({ freq, start, duration: beepDuration }) => {
            const startTime = audioContext.currentTime + start;
            const endTime = startTime + beepDuration;
            
            // Create multiple oscillators for richer sound
            [1, 1.5, 2].forEach((multiplier, index) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              const compressor = audioContext.createDynamicsCompressor();
              
              oscillator.connect(gainNode);
              gainNode.connect(compressor);
              compressor.connect(audioContext.destination);
              
              oscillator.frequency.value = freq * multiplier;
              oscillator.type = 'sine';
              
              const volume = 0.4 / (index + 1);
              gainNode.gain.setValueAtTime(0, startTime);
              gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
              gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
              
              oscillator.start(startTime);
              oscillator.stop(endTime);
            });
          });
          
          console.log('✅ AudioContext iOS notification pattern started');
        };
        
        playAudioContextNotification();
      }
      
      // Method 2: HTML5 Audio with loop for iOS
      if (audioRef.current) {
        let playCount = 0;
        const maxPlays = 7; // Play 7 times over 7 seconds
        
        const playNext = async () => {
          if (playCount < maxPlays && audioRef.current) {
            try {
              audioRef.current.currentTime = 0;
              audioRef.current.volume = 1.0;
              
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                await playPromise;
                console.log(`🔔 iOS HTML5 Audio play ${playCount + 1}/${maxPlays}`);
              }
              
              playCount++;
              setTimeout(playNext, 1000); // 1 second intervals
              
            } catch (error) {
              console.log(`⚠️ iOS HTML5 Audio play ${playCount + 1} failed:`, error);
            }
          }
        };
        
        await playNext();
      }
      
      // Method 3: iOS System Integration attempts
      try {
        // Try iOS vibration if available
        if ('vibrate' in navigator) {
          const vibrationPattern = [200, 100, 200, 100, 200, 100, 200];
          navigator.vibrate(vibrationPattern);
          console.log('✅ iOS vibration triggered');
        }
        
        // Visual feedback for iOS
        let flashCount = 0;
        const maxFlashes = 14; // Flash for 7 seconds
        
        const flashScreen = () => {
          if (flashCount < maxFlashes) {
            document.body.style.backgroundColor = flashCount % 2 === 0 ? '#ff6b6b' : '#ffffff';
            setTimeout(() => {
              document.body.style.backgroundColor = '';
              flashCount++;
              if (flashCount < maxFlashes) {
                setTimeout(flashScreen, 250);
              }
            }, 250);
          }
        };
        
        flashScreen();
        
        // Title notification for iOS
        const originalTitle = document.title;
        let titleCount = 0;
        
        const updateTitle = () => {
          if (titleCount < 7) {
            document.title = `🔔 ออเดอร์ใหม่! (${titleCount + 1}/7)`;
            titleCount++;
            setTimeout(updateTitle, 1000);
          } else {
            document.title = originalTitle;
          }
        };
        
        updateTitle();
        
      } catch (error) {
        console.log('⚠️ iOS system integration failed:', error);
      }
      
      console.log('✅ Enhanced iOS notification sequence completed');
      
    } catch (error) {
      console.error('❌ iOS notification failed:', error);
      
      // Ultimate fallback for iOS
      alert('🔔 ออเดอร์ใหม่เข้ามาแล้ว!');
    }
  };

  // Stop notification sound
  const stopBellSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        console.log('🔇 iOS notification sound stopped');
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // Note: We don't close the AudioContext as it might be needed again
        console.log('🔇 AudioContext notifications stopped');
      }
    } catch (error) {
      console.error('Error stopping iOS notification sound:', error);
    }
  };

  // Initialize audio on user interaction for iOS
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!isAudioInitializedRef.current) {
        await initializeAudio();
      }
    };

    // Enhanced event listeners for iOS
    const events = ['touchstart', 'touchend', 'click', 'keydown', 'pointerdown', 'mousedown'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, handleUserInteraction, { 
        once: true, 
        passive: true,
        capture: true 
      });
    });

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleUserInteraction, true);
      });
    };
  }, []);

  // Enhanced real-time order listening
  useEffect(() => {
    console.log('👂 Setting up enhanced iOS-compatible real-time order notifications...');
    
    const channel = supabase
      .channel('enhanced-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_orders'
        },
        (payload) => {
          console.log('🔔 New customer order received:', payload.new);
          
          const order = payload.new as any;
          
          // Play enhanced iOS notification sound immediately
          playBellSound();
          
          // Show toast notification
          toast({
            title: '🔔 มีออเดอร์ออนไลน์ใหม่!',
            description: `ออเดอร์ #${order.order_number} จำนวน ฿${order.total_amount}`,
            duration: 10000,
          });
          
          console.log('📱 Enhanced iOS notification sequence complete');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'order_source=eq.online'
        },
        (payload) => {
          console.log('🔔 New online order received:', payload.new);
          
          const order = payload.new as any;
          
          // Play enhanced iOS notification sound immediately
          playBellSound();
          
          // Show toast notification
          toast({
            title: '🔔 มีออเดอร์ออนไลน์ใหม่!',
            description: `ออเดอร์ #${order.order_number} จำนวน ฿${order.total_amount}`,
            duration: 10000,
          });
          
          console.log('📱 Enhanced iOS notification sequence complete');
        }
      )
      .subscribe();

    console.log('✅ Enhanced iOS-compatible real-time notifications active');

    return () => {
      console.log('🔄 Cleaning up enhanced order notifications...');
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
