
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioInitializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isIOSRef = useRef(false);

  // Detect iOS
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    isIOSRef.current = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
  }, []);

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
      console.log('🔔 Playing enhanced iOS notification sound...');
      
      // Method 1: Enhanced AudioContext approach for iOS
      if (audioContextRef.current && isIOSRef.current) {
        const audioContext = audioContextRef.current;
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // สร้างเสียง beep ด้วย Web Audio API สำหรับ iOS
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // ความถี่เสียง
        gainNode.gain.value = 0.3; // ความดัง
        
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
        }, 500); // เล่น 0.5 วินาที
        
        console.log('✅ iOS AudioContext notification played');
      }
      
      // Method 2: HTML5 Audio fallback for non-iOS
      if (audioRef.current && !isIOSRef.current) {
        try {
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1.0;
          
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('🔔 HTML5 Audio notification played');
          }
        } catch (error) {
          console.log('⚠️ HTML5 Audio play failed:', error);
        }
      }
      
      // Method 3: iOS System Integration attempts
      try {
        // Try vibration for non-iOS devices only
        if ('vibrate' in navigator && !isIOSRef.current) {
          const vibrationPattern = [200, 100, 200, 100, 200];
          navigator.vibrate(vibrationPattern);
          console.log('✅ Device vibration triggered');
        }
        
        // Visual feedback for iOS (แทนการสั่น)
        if (isIOSRef.current) {
          // แสดง animation แทนการสั่น
          document.body.style.transform = 'translateX(2px)';
          setTimeout(() => {
            document.body.style.transform = 'translateX(-2px)';
          }, 50);
          setTimeout(() => {
            document.body.style.transform = 'translateX(0)';
          }, 100);
        }
        
        // Visual feedback - flash screen
        let flashCount = 0;
        const maxFlashes = 6;
        
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
        
        // Title notification
        const originalTitle = document.title;
        let titleCount = 0;
        
        const updateTitle = () => {
          if (titleCount < 3) {
            document.title = `🔔 ออเดอร์ใหม่! (${titleCount + 1}/3)`;
            titleCount++;
            setTimeout(updateTitle, 1000);
          } else {
            document.title = originalTitle;
          }
        };
        
        updateTitle();
        
      } catch (error) {
        console.log('⚠️ System integration failed:', error);
      }
      
      console.log('✅ Enhanced notification sequence completed');
      
    } catch (error) {
      console.error('❌ Notification failed:', error);
      
      // Ultimate fallback - visual feedback
      document.body.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 200);
    }
  };

  // Stop notification sound
  const stopBellSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        console.log('🔇 Notification sound stopped');
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // Note: We don't close the AudioContext as it might be needed again
        console.log('🔇 AudioContext notifications stopped');
      }
    } catch (error) {
      console.error('Error stopping notification sound:', error);
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
          table: 'orders'
        },
        (payload) => {
          console.log('🔔 New order received:', payload.new);
          
          const order = payload.new as any;
          
          // Only handle online orders
          if (order.order_source === 'online') {
            console.log('🔔 Processing online order notification');
            
            // Play enhanced notification sound immediately
            playBellSound();
            
            // Show toast notification
            toast({
              title: '🔔 มีออเดอร์ออนไลน์ใหม่!',
              description: `ออเดอร์ #${order.order_number} จำนวน ฿${order.total_amount}`,
              duration: 10000,
            });
            
            console.log('📱 Enhanced notification sequence complete');
          }
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
