
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

  // iOS Custom Alert Modal
  const showIOSAlert = (message: string) => {
    if (!isIOSRef.current) {
      alert(message);
      return;
    }

    // สร้าง custom alert modal สำหรับ iOS
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
      ">
        <div style="
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          max-width: 300px;
          margin: 20px;
        ">
          <p style="margin: 0; font-size: 16px; color: #333;">${message}</p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            margin-top: 15px;
            padding: 8px 16px;
            background: #007AFF;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
          ">ตกลง</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Auto remove หลัง 3 วินาที
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove();
      }
    }, 3000);
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

        // Use navigator.vibrate() for non-iOS devices only
        if ('vibrate' in navigator && !isIOSRef.current) {
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

      console.log('🍎 iOS notification sound played');
    } catch (error) {
      console.error('🍎 iOS notification sound error:', error);
      // Fallback - visual feedback
      document.body.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 200);
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

  // iOS Visual Shake Animation (แทนการสั่น)
  const playIOSShakeAnimation = () => {
    if (!isIOSRef.current) return;

    // แสดง animation แทนการสั่น
    document.body.style.transform = 'translateX(2px)';
    setTimeout(() => {
      document.body.style.transform = 'translateX(-2px)';
    }, 50);
    setTimeout(() => {
      document.body.style.transform = 'translateX(2px)';
    }, 100);
    setTimeout(() => {
      document.body.style.transform = 'translateX(-2px)';
    }, 150);
    setTimeout(() => {
      document.body.style.transform = 'translateX(0)';
    }, 200);
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

      // Show iOS-compatible alert
      showIOSAlert('🔔 ออเดอร์ใหม่เข้ามาแล้ว!');

      // Send to service worker for background handling
      if (serviceWorkerRef.current) {
        serviceWorkerRef.current.postMessage({
          type: 'PLAY_IOS_NOTIFICATION',
          payload: payload
        });
      }

      // Play sound and visual feedback
      await playIOSNotificationSound();
      playIOSShakeAnimation();
      flashIOSScreen();

    } catch (error) {
      console.error('🍎 iOS notification trigger error:', error);
    }
  };

  return {
    isIOS: isIOSRef.current,
    triggerIOSNotification,
    playIOSNotificationSound,
    checkForMissedNotifications,
    showIOSAlert,
    playIOSShakeAnimation
  };
};
