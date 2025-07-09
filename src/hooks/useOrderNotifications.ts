
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const isAudioInitializedRef = useRef(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context for iOS compatibility
  const initializeAudio = async () => {
    if (isAudioInitializedRef.current) return;
    
    try {
      console.log('🎵 Initializing audio for iOS/iPad compatibility...');
      
      // Try to create HTML5 audio element first (more reliable on iOS)
      try {
        const audio = new Audio();
        // Create a short sine wave audio data URL for iOS
        const audioData = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAC4uLi4uLi4uLi4uLi4';
        audio.src = audioData;
        audio.volume = 0.1;
        audio.muted = true;
        await audio.play();
        audio.pause();
        audio.muted = false;
        audioElementRef.current = audio;
        console.log('✅ HTML5 Audio initialized for iPad');
      } catch (audioError) {
        console.log('⚠️ HTML5 Audio failed, trying Web Audio API...');
      }

      // Initialize Web Audio API as backup
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
      testOscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      testOscillator.start();
      testOscillator.stop(audioContext.currentTime + 0.001);
      
      console.log('✅ Web Audio API initialized successfully for iPad/iOS');
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
    }
  };

  // Enhanced bell sound function for iOS/iPad compatibility
  const playBellSound = async () => {
    try {
      console.log('🔔 Playing bell notification for new order (iPad compatible)...');
      
      // Force initialize audio if not already done
      if (!isAudioInitializedRef.current) {
        await initializeAudio();
      }
      
      // Try HTML5 Audio first (most reliable on iOS)
      if (audioElementRef.current) {
        try {
          console.log('🎵 Using HTML5 Audio for iPad notification...');
          
          // Create bell sound sequence using multiple audio elements
          const bellSequence = [
            { freq: 800, delay: 0, duration: 800 },
            { freq: 1000, delay: 300, duration: 600 },
            { freq: 1200, delay: 600, duration: 400 },
            { freq: 800, delay: 1200, duration: 600 },
            { freq: 1000, delay: 1500, duration: 400 }
          ];
          
          // Play sequence of tones
          bellSequence.forEach((note, index) => {
            setTimeout(() => {
              try {
                const audio = new Audio();
                // Generate simple beep tone
                const sampleRate = 44100;
                const duration = note.duration / 1000;
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
                  const sample = Math.sin(2 * Math.PI * note.freq * i / sampleRate) * 0.3;
                  view.setInt16(44 + i * 2, sample * 32767, true);
                }
                
                const blob = new Blob([buffer], { type: 'audio/wav' });
                audio.src = URL.createObjectURL(blob);
                audio.volume = 0.7;
                audio.play().catch(e => console.log('Audio play failed:', e));
                
                // Clean up
                setTimeout(() => {
                  URL.revokeObjectURL(audio.src);
                }, note.duration + 100);
                
              } catch (e) {
                console.log('Individual tone failed:', e);
              }
            }, note.delay);
          });
          
          console.log('✅ Bell sound sequence started on iPad');
          return;
          
        } catch (htmlAudioError) {
          console.log('⚠️ HTML5 Audio sequence failed:', htmlAudioError);
        }
      }
      
      // Fallback to Web Audio API
      if (!audioContextRef.current) {
        console.warn('⚠️ No audio context available');
        // Final fallback - simple alert
        setTimeout(() => {
          console.log('🔔 Audio fallback: Using visual notification only');
        }, 100);
        return;
      }
      
      const audioContext = audioContextRef.current;
      
      // Resume context if suspended (iOS requirement)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('🔄 Audio context resumed');
      }
      
      // Create bell sounds optimized for iPad speakers
      const bellFrequencies = [
        { freq: 800, time: 0.0, duration: 0.8, volume: 0.4 },
        { freq: 1000, time: 0.3, duration: 0.6, volume: 0.35 },
        { freq: 1200, time: 0.6, duration: 0.4, volume: 0.3 },
        { freq: 800, time: 1.2, duration: 0.6, volume: 0.25 },
        { freq: 1000, time: 1.5, duration: 0.4, volume: 0.2 }
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
        
        // Create smooth envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(note.volume, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
        
        oscillators.push(oscillator);
      });
      
      oscillatorsRef.current = oscillators;
      
      // Auto-stop after 7 seconds
      setTimeout(() => {
        stopBellSound();
      }, 7000);
      
      console.log('✅ Web Audio API bell sound played on iPad');
      
    } catch (error) {
      console.error('❌ All audio methods failed on iPad:', error);
    }
  };

  // Stop bell sound function
  const stopBellSound = () => {
    try {
      // Stop Web Audio API oscillators
      oscillatorsRef.current.forEach(oscillator => {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      oscillatorsRef.current = [];
      
      // Close and recreate audio context to ensure clean state
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
        isAudioInitializedRef.current = false;
      }
      
      console.log('🔇 Bell sound stopped');
    } catch (error) {
      console.error('Error stopping bell sound:', error);
    }
  };

  // Enhanced user interaction listeners for iOS
  useEffect(() => {
    const handleUserInteraction = async (event: Event) => {
      console.log('👆 User interaction detected:', event.type);
      
      if (!isAudioInitializedRef.current) {
        await initializeAudio();
        console.log('🎵 Audio initialized after user interaction');
      }
    };

    // Listen for multiple types of user interactions
    const events = ['touchstart', 'touchend', 'click', 'keydown', 'scroll'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, handleUserInteraction, { 
        once: true, 
        passive: true 
      });
    });

    // Also listen on window for broader coverage
    window.addEventListener('focus', handleUserInteraction, { once: true });

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleUserInteraction);
      });
      window.removeEventListener('focus', handleUserInteraction);
    };
  }, []);

  // Real-time order notifications
  useEffect(() => {
    console.log('👂 Setting up real-time order notifications for iPad...');
    
    const channel = supabase
      .channel('new-orders-ipad-enhanced')
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
          
          // Play notification sound immediately
          playBellSound();
          
          // Show enhanced toast notification
          toast({
            title: '🔔 มีออเดอร์ออนไลน์ใหม่!',
            description: `ออเดอร์ #${order.order_number} จำนวน ฿${order.total_amount}`,
            duration: 8000,
          });
          
          // Additional visual feedback
          document.title = `🔔 ออเดอร์ใหม่! - ${document.title.replace(/🔔 ออเดอร์ใหม่! - /, '')}`;
          setTimeout(() => {
            document.title = document.title.replace(/🔔 ออเดอร์ใหม่! - /, '');
          }, 10000);
          
          console.log('📱 iPad notification sequence complete');
        }
      )
      .subscribe();

    console.log('✅ Real-time notifications active on iPad');

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
