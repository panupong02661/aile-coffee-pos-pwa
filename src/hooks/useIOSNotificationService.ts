
import { useEffect, useRef } from 'react';

export const useIOSNotificationService = () => {
  const isIOSRef = useRef(false);
  const serviceWorkerRef = useRef<ServiceWorker | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const notificationPermissionRef = useRef<NotificationPermission>('default');
  const wakeupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect iOS
  useEffect(() => {
    const detectIOS = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
      const isIOSChrome = /crios/.test(userAgent);
      const isIOSFirefox = /fxios/.test(userAgent);
      const isIOSSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
      
      isIOSRef.current = isIOS || isIOSChrome || isIOSFirefox || isIOSSafari;
      
      console.log('🍎 iOS Detection:', {
        isIOS: isIOSRef.current,
        userAgent: navigator.userAgent,
        isIOSChrome,
        isIOSFirefox,
        isIOSSafari
      });
      
      return isIOSRef.current;
    };

    detectIOS();
  }, []);

  // Initialize iOS-specific services
  useEffect(() => {
    const initializeIOSServices = async () => {
      if (!isIOSRef.current) return;

      console.log('🍎 Initializing iOS notification services...');

      try {
        // Request notification permission for iOS
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          notificationPermissionRef.current = permission;
          console.log('🍎 iOS Notification permission:', permission);
        }

        // Register service worker for iOS background support
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          if (registration.active) {
            serviceWorkerRef.current = registration.active;
          }

          // Listen for service worker messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'IOS_BACKGROUND_NOTIFICATION') {
              console.log('🍎 Received background notification from SW:', event.data.payload);
              handleIOSBackgroundNotification(event.data.payload);
            }
            
            if (event.data?.type === 'WAKE_UP_IOS_NOTIFICATION') {
              console.log('🍎 iOS wake-up notification received');
              playIOSWakeupSound();
            }
          });

          console.log('🍎 iOS Service Worker registered successfully');
        }

        // Initialize AudioContext for iOS
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
          
          // iOS requires user interaction to start AudioContext
          const resumeAudioContext = async () => {
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
              await audioContextRef.current.resume();
              console.log('🍎 iOS AudioContext resumed');
            }
          };

          // Add event listeners for user interactions
          const events = ['touchstart', 'touchend', 'click', 'keydown'];
          events.forEach(eventType => {
            document.addEventListener(eventType, resumeAudioContext, { once: true });
          });
        }

        // Set up iOS background detection and wake-up system
        setupIOSBackgroundDetection();

      } catch (error) {
        console.error('🍎 iOS services initialization failed:', error);
      }
    };

    initializeIOSServices();

    return () => {
      if (wakeupIntervalRef.current) {
        clearInterval(wakeupIntervalRef.current);
      }
    };
  }, []);

  // iOS Background Detection and Wake-up System
  const setupIOSBackgroundDetection = () => {
    if (!isIOSRef.current) return;

    let isBackground = false;
    let lastActivityTime = Date.now();

    // Detect when iOS app goes to background/foreground
    const handleVisibilityChange = () => {
      const wasBackground = isBackground;
      isBackground = document.hidden || document.visibilityState === 'hidden';
      
      console.log('🍎 iOS visibility change:', { 
        isBackground, 
        wasBackground, 
        visibilityState: document.visibilityState 
      });

      if (!isBackground && wasBackground) {
        // App came back from background - check for missed notifications
        console.log('🍎 iOS app returned from background, checking for notifications...');
        checkForMissedNotifications();
      }
    };

    // iOS-specific page visibility events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('pagehide', () => {
      isBackground = true;
      console.log('🍎 iOS page hidden');
    });
    document.addEventListener('pageshow', () => {
      isBackground = false;
      console.log('🍎 iOS page shown');
      checkForMissedNotifications();
    });

    // Keep iOS connection alive with periodic pings
    wakeupIntervalRef.current = setInterval(() => {
      if (!isBackground) {
        lastActivityTime = Date.now();
      }
      
      // Send keep-alive ping for iOS
      if (serviceWorkerRef.current) {
        serviceWorkerRef.current.postMessage({
          type: 'IOS_KEEP_ALIVE',
          timestamp: Date.now(),
          isBackground
        });
      }
    }, 5000); // Every 5 seconds
  };

  // Handle iOS background notifications
  const handleIOSBackgroundNotification = async (payload: any) => {
    try {
      console.log('🍎 Handling iOS background notification:', payload);

      // Play notification sound even in background
      await playIOSNotificationSound();

      // Show system notification if permission granted
      if (notificationPermissionRef.current === 'granted') {
        const notification = new Notification('🔔 ออเดอร์ใหม่!', {
          body: `ออเดอร์ #${payload.orderNumber} - ฿${payload.totalAmount}`,
          icon: '/favicon.ico',
          requireInteraction: true,
          silent: false
        });

        // Use navigator.vibrate() separately from Notification
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }

        notification.onclick = () => {
          window.focus();
          window.location.href = '/online-orders';
          notification.close();
        };

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);
      }

      // Visual feedback for iOS
      flashIOSScreen();

    } catch (error) {
      console.error('🍎 iOS background notification error:', error);
    }
  };

  // Play iOS notification sound (works even in background)
  const playIOSNotificationSound = async () => {
    try {
      if (!audioContextRef.current) return;

      const audioContext = audioContextRef.current;
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create aggressive iOS notification sound
      const duration = 7; // 7 seconds for iOS
      const volume = 1.0; // Maximum volume
      
      // Multiple overlapping beeps for iOS attention
      for (let i = 0; i < 10; i++) {
        const startTime = audioContext.currentTime + (i * 0.7);
        const endTime = startTime + 0.5;
        
        // Create multiple frequencies for rich iOS sound
        [800, 1000, 1200].forEach((frequency, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          const nodeVolume = volume / (index + 1);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(nodeVolume, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
          
          oscillator.start(startTime);
          oscillator.stop(endTime);
        });
      }

      console.log('🍎 iOS notification sound played');
    } catch (error) {
      console.error('🍎 iOS notification sound error:', error);
    }
  };

  // iOS wake-up sound for when app returns from background
  const playIOSWakeupSound = async () => {
    try {
      console.log('🍎 Playing iOS wake-up sound...');
      await playIOSNotificationSound();
    } catch (error) {
      console.error('🍎 iOS wake-up sound error:', error);
    }
  };

  // Flash screen for iOS visual feedback
  const flashIOSScreen = () => {
    let flashCount = 0;
    const maxFlashes = 6;
    
    const flash = () => {
      if (flashCount < maxFlashes) {
        document.body.style.backgroundColor = flashCount % 2 === 0 ? '#ff6b6b' : '#ffffff';
        setTimeout(() => {
          document.body.style.backgroundColor = '';
          flashCount++;
          if (flashCount < maxFlashes) {
            setTimeout(flash, 300);
          }
        }, 300);
      }
    };
    
    flash();
  };

  // Check for missed notifications when iOS app becomes active
  const checkForMissedNotifications = async () => {
    try {
      console.log('🍎 Checking for missed iOS notifications...');
      
      // This would typically check with server for any missed notifications
      // For now, we'll just log that we're checking
      
    } catch (error) {
      console.error('🍎 Error checking missed notifications:', error);
    }
  };

  // Trigger iOS notification (to be called when order is placed)
  const triggerIOSNotification = async (payload: any) => {
    try {
      console.log('🍎 Triggering iOS notification:', payload);

      // Send to service worker for background handling
      if (serviceWorkerRef.current) {
        serviceWorkerRef.current.postMessage({
          type: 'PLAY_IOS_NOTIFICATION',
          payload: payload
        });
      }

      // Also handle directly for immediate response
      await handleIOSBackgroundNotification(payload);

    } catch (error) {
      console.error('🍎 iOS notification trigger error:', error);
    }
  };

  return {
    isIOS: isIOSRef.current,
    triggerIOSNotification,
    playIOSNotificationSound,
    checkForMissedNotifications
  };
};
