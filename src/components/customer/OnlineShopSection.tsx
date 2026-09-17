import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, Plus, Minus, Clock, Upload, QrCode, Settings, X, Gift, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import AddonModal from '@/components/AddonModal';
import DisplaySettingsModal from '@/components/DisplaySettingsModal';
import MobileCart from '@/components/MobileCart';
import QRCodePromptPay from '@/components/QRCodePromptPay';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: string;
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface DatabaseAddon {
  id: string;
  name: string;
  price: number;
  addon_group_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  addon_groups?: {
    id: string;
    name: string;
    is_required: boolean;
    allow_multiple: boolean;
  };
}

interface CartItem {
  id: string;
  menu_item: MenuItem;
  quantity: number;
  total_price: number;
  selected_addons?: DatabaseAddon[];
}

interface OnlineShopSectionProps {
  currentUser: any;
  setCurrentUser?: (user: any) => void;
  selectedMenuItemId?: string | null;
  onItemAdded?: () => void;
}

const OnlineShopSection = ({ currentUser, setCurrentUser, selectedMenuItemId, onItemAdded }: OnlineShopSectionProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pickupTime, setPickupTime] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addons, setAddons] = useState<DatabaseAddon[]>([]);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [availableAddons, setAvailableAddons] = useState<DatabaseAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'points'>('qr');
  const [pointsToUse, setPointsToUse] = useState('');
  const [membershipSettings, setMembershipSettings] = useState<any>(null);
  
  // Load display settings from localStorage
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('online-grid-columns');
    return saved ? parseInt(saved) : 2;
  });
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('online-item-size');
    return (saved as 'small' | 'medium' | 'large') || 'medium';
  });
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promptPayPhone, setPromptPayPhone] = useState<string>('');
  const [shopLogoUrl, setShopLogoUrl] = useState<string>('');
  
  const { toast } = useToast();

  // Save display settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('online-grid-columns', gridColumns.toString());
    localStorage.setItem('online-item-size', itemSize);
  }, [gridColumns, itemSize]);

  // Listen for external open display settings event
  useEffect(() => {
    const handler = () => setShowDisplaySettings(true);
    window.addEventListener('openShopDisplaySettings', handler);
    return () => window.removeEventListener('openShopDisplaySettings', handler);
  }, []);

  // Enhanced iOS-compatible notification sound for 7 seconds
  const playOrderSuccessNotification = async () => {
    try {
      console.log('🔔 Playing iOS-compatible order confirmation notification for 7 seconds...');
      
      // Check if this is iOS and use native iOS notification APIs
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      if (isIOS) {
        console.log('🍎 Using iOS-specific notification methods...');
        
        // Method 1: iOS Service Worker notification
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            if (registration.active) {
              registration.active.postMessage({
                type: 'PLAY_IOS_NOTIFICATION',
                payload: {
                  orderNumber: 'CONFIRM',
                  totalAmount: getTotalAmount(),
                  isOrderConfirmation: true
                }
              });
            }
          } catch (error) {
            console.log('🍎 Service Worker notification failed:', error);
          }
        }

        // Method 2: iOS Web Audio with Wake Lock
        try {
          // Request wake lock to prevent iOS from sleeping
          let wakeLock: any = null;
          if ('wakeLock' in navigator) {
            wakeLock = await (navigator as any).wakeLock.request('screen');
            console.log('🍎 iOS wake lock acquired');
          }

          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContext();
          
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          // Create aggressive 7-second iOS notification pattern
          const duration = 7;
          const beepPattern = [];
          
          // Generate 14 beeps over 7 seconds for iOS attention
          for (let i = 0; i < 14; i++) {
            beepPattern.push({
              startTime: i * 0.5,
              frequencies: [800, 1000, 1200],
              duration: 0.3
            });
          }

          beepPattern.forEach(({ startTime, frequencies, duration }) => {
            frequencies.forEach((freq, index) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              const compressor = audioContext.createDynamicsCompressor();
              
              oscillator.connect(gainNode);
              gainNode.connect(compressor);
              compressor.connect(audioContext.destination);
              
              oscillator.frequency.value = freq;
              oscillator.type = 'sine';
              
              const actualStartTime = audioContext.currentTime + startTime;
              const actualEndTime = actualStartTime + duration;
              
              const volume = 0.8 / (index + 1);
              gainNode.gain.setValueAtTime(0, actualStartTime);
              gainNode.gain.linearRampToValueAtTime(volume, actualStartTime + 0.01);
              gainNode.gain.exponentialRampToValueAtTime(0.01, actualEndTime);
              
              oscillator.start(actualStartTime);
              oscillator.stop(actualEndTime);
            });
          });

          // Release wake lock after 8 seconds
          setTimeout(() => {
            if (wakeLock) {
              wakeLock.release();
              console.log('🍎 iOS wake lock released');
            }
          }, 8000);

          console.log('🍎 iOS Web Audio notification pattern started');

        } catch (error) {
          console.log('🍎 iOS Web Audio failed:', error);
        }

        // Method 3: iOS Visual and Haptic Feedback
        try {
          // iOS Haptic Feedback using navigator.vibrate()
          if ('vibrate' in navigator) {
            // Continuous vibration pattern for 7 seconds
            const vibrationPattern = [];
            for (let i = 0; i < 7; i++) {
              vibrationPattern.push(200, 300); // vibrate 200ms, pause 300ms
            }
            navigator.vibrate(vibrationPattern);
            console.log('🍎 iOS vibration pattern triggered');
          }

          // iOS Visual Feedback - Aggressive screen flashing
          let flashCount = 0;
          const maxFlashes = 14; // Flash for 7 seconds
          
          const flashScreen = () => {
            if (flashCount < maxFlashes) {
              const colors = ['#ff0000', '#ff6b6b', '#ffffff', '#ffa500'];
              document.body.style.backgroundColor = colors[flashCount % colors.length];
              
              setTimeout(() => {
                document.body.style.backgroundColor = '';
                flashCount++;
                if (flashCount < maxFlashes) {
                  setTimeout(flashScreen, 500);
                }
              }, 500);
            }
          };
          
          flashScreen();

          // iOS Title Notification
          const originalTitle = document.title;
          let titleCount = 0;
          
          const updateTitle = () => {
            if (titleCount < 7) {
              document.title = `🔔 ยืนยันออเดอร์แล้ว! (${titleCount + 1}/7)`;
              titleCount++;
              setTimeout(updateTitle, 1000);
            } else {
              document.title = originalTitle;
            }
          };
          
          updateTitle();

          console.log('🍎 iOS visual and haptic feedback completed');

        } catch (error) {
          console.log('🍎 iOS visual/haptic feedback failed:', error);
        }

        // Method 4: iOS System Notification (if permission granted)
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('🔔 ออเดอร์ยืนยันแล้ว!', {
              body: `ออเดอร์ของคุณได้รับการยืนยันเรียบร้อยแล้ว จำนวน ฿${getTotalAmount()}`,
              icon: '/favicon.ico',
              requireInteraction: true,
              silent: false
            });

            // Use navigator.vibrate() separately from Notification
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }

            // Auto-close after 7 seconds
            setTimeout(() => notification.close(), 7000);
            
            console.log('🍎 iOS system notification shown');
          }
        } catch (error) {
          console.log('🍎 iOS system notification failed:', error);
        }

        console.log('🍎 All iOS notification methods completed');

      } else {
        // Original non-iOS notification methods
        console.log('💻 Using non-iOS notification methods...');
        
        // Multiple approaches for maximum compatibility
        const approaches = [
          // Approach 1: AudioContext with enhanced compatibility
          async () => {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) throw new Error('AudioContext not supported');
            
            const audioContext = new AudioContext();
            
            // Requires user interaction to resume AudioContext
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
            }
            
            const totalDuration = 7; // 7 seconds
            const bellInterval = 0.7; // Faster interval for better notification
            const volume = 0.8; // High volume
            
            let currentTime = audioContext.currentTime;
            const endTime = currentTime + totalDuration;
            
            console.log(`🔔 AudioContext: Playing notification bell for ${totalDuration} seconds`);
            
            // Create continuous bell sounds
            while (currentTime < endTime) {
              // Enhanced bell sound with multiple harmonics
              const frequencies = [
                { freq: 523.25, delay: 0.0, duration: 0.5, volume: volume },      // C5
                { freq: 659.25, delay: 0.1, duration: 0.4, volume: volume * 0.8 }, // E5  
                { freq: 783.99, delay: 0.2, duration: 0.3, volume: volume * 0.6 }, // G5
                { freq: 1046.50, delay: 0.3, duration: 0.2, volume: volume * 0.4 } // C6
              ];
              
              frequencies.forEach((note) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const compressor = audioContext.createDynamicsCompressor();
                
                // Enhanced audio chain
                oscillator.connect(gainNode);
                gainNode.connect(compressor);
                compressor.connect(audioContext.destination);
                
                oscillator.frequency.value = note.freq;
                oscillator.type = 'sine';
                
                const noteStartTime = currentTime + note.delay;
                const noteEndTime = noteStartTime + note.duration;
                
                // Optimized envelope
                gainNode.gain.setValueAtTime(0, noteStartTime);
                gainNode.gain.linearRampToValueAtTime(note.volume, noteStartTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, noteEndTime);
                
                oscillator.start(noteStartTime);
                oscillator.stop(noteEndTime);
              });
              
              currentTime += bellInterval;
            }
            
            console.log('✅ AudioContext notification completed');
          },
          
          // Approach 2: HTML5 Audio with specific handling
          async () => {
            console.log('🔔 Trying HTML5 Audio approach...');
            
            // Create notification tone data URL for compatibility
            const createNotificationDataURL = () => {
              const sampleRate = 22050;
              const duration = 1;
              const samples = sampleRate * duration;
              
              // Create buffer for enhanced bell sound
              const buffer = new ArrayBuffer(44 + samples * 2);
              const view = new DataView(buffer);
              
              // WAV header for compatibility
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
              
              // Generate enhanced bell sound
              let offset = 44;
              for (let i = 0; i < samples; i++) {
                const t = i / sampleRate;
                const frequency1 = 800;
                const frequency2 = 1000;
                const frequency3 = 1200;
                const envelope = Math.exp(-t * 2);
                
                const sample = envelope * (
                  Math.sin(2 * Math.PI * frequency1 * t) * 0.4 +
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
            
            const audioUrl = createNotificationDataURL();
            const audio = new Audio(audioUrl);
            audio.volume = 0.9;
            audio.preload = 'auto';
            
            // Specific audio setup
            audio.setAttribute('playsinline', 'true');
            audio.setAttribute('webkit-playsinline', 'true');
            
            let playCount = 0;
            const maxPlays = 10; // Play 10 times over 7 seconds
            
            const playNext = async () => {
              if (playCount < maxPlays) {
                try {
                  audio.currentTime = 0;
                  await audio.play();
                  playCount++;
                  setTimeout(playNext, 700); // 0.7 second intervals
                } catch (error) {
                  console.log('🔔 HTML5 Audio play error:', error);
                }
              } else {
                URL.revokeObjectURL(audioUrl);
                console.log('✅ HTML5 Audio notification sequence completed');
              }
            };
            
            await playNext();
          },
          
          // Approach 3: Enhanced Web Audio API with Tone.js compatibility
          async () => {
            console.log('🔔 Trying enhanced Web Audio...');
            
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext();
            
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
            }
            
            // Create a more aggressive notification pattern
            const createNotificationPattern = () => {
              const duration = 7; // 7 seconds total
              const beepCount = 14; // More frequent beeps
              const beepDuration = 0.3;
              const beepInterval = 0.5;
              
              for (let i = 0; i < beepCount; i++) {
                const startTime = audioContext.currentTime + (i * beepInterval);
                const endTime = startTime + beepDuration;
                
                // Create multiple oscillators for richer sound
                [800, 1000, 1200].forEach((freq, index) => {
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();
                  const filter = audioContext.createBiquadFilter();
                  
                  // Optimized audio chain
                  oscillator.connect(filter);
                  filter.connect(gainNode);
                  gainNode.connect(audioContext.destination);
                  
                  oscillator.frequency.value = freq;
                  oscillator.type = 'sine';
                  
                  // Low-pass filter for smoother sound
                  filter.type = 'lowpass';
                  filter.frequency.value = 2000;
                  
                  const vol = 0.6 / (index + 1); // Decreasing volume for harmonics
                  gainNode.gain.setValueAtTime(0, startTime);
                  gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.01);
                  gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
                  
                  oscillator.start(startTime);
                  oscillator.stop(endTime);
                });
              }
            };
            
            createNotificationPattern();
            console.log('✅ Enhanced Web Audio notification started');
          }
        ];
        
        // Try approaches in sequence for maximum compatibility
        for (let i = 0; i < approaches.length; i++) {
          try {
            await approaches[i]();
            console.log(`✅ Notification approach ${i + 1} succeeded`);
            break; // Exit after first successful approach
          } catch (error) {
            console.log(`⚠️ Notification approach ${i + 1} failed:`, error);
            if (i === approaches.length - 1) {
              // Final fallback
              console.log('🔔 Using final fallback notification...');
              
              // Create multiple quick visual + title notifications
              for (let j = 0; j < 7; j++) {
                setTimeout(() => {
                  document.title = `🔔 ออเดอร์ใหม่! (${j + 1}/7)`;
                  
                  // Try to trigger system vibration if available
                  if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                  }
                  
                  console.log(`🔔 Fallback notification ${j + 1}/7`);
                }, j * 1000);
              }
              
              // Reset title after notifications
              setTimeout(() => {
                document.title = document.title.replace(/🔔 ออเดอร์ใหม่! \(\d\/7\)/, '');
              }, 8000);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ All notification methods failed:', error);
      
      // Ultimate fallback - visual feedback
      document.body.style.backgroundColor = '#ff6b6b';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 200);
    }
  };

  const fetchMenuItems = async () => {
    try {
      console.log('🔄 Fetching menu items...');
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories!menu_items_category_id_fkey (
            id,
            is_active
          )
        `)
        .eq('is_available', true)
        .eq('categories.is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching menu items:', error);
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดเมนูได้', variant: 'destructive' });
        return;
      }
      
      console.log('✅ Menu items fetched:', data?.length || 0);
      setMenuItems(data || []);
    } catch (error) {
      console.error('Unexpected error fetching menu items:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการโหลดเมนู', variant: 'destructive' });
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔄 Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      console.log('✅ Categories fetched:', data?.length || 0);
      setCategories(data || []);
    } catch (error) {
      console.error('Unexpected error fetching categories:', error);
    }
  };

  const fetchAddons = async () => {
    try {
      console.log('🔄 Fetching addons...');
      const { data, error } = await supabase
        .from('addons')
        .select(`
          id,
          name,
          price,
          addon_group_id,
          sort_order,
          is_active,
          media_type,
          icon_name,
          image_url,
          created_at,
          updated_at,
          addon_groups!addons_addon_group_id_fkey (
            id,
            name,
            allow_multiple,
            is_required,
            is_active,
            sort_order,
            media_type,
            icon_name,
            image_url
          )
        `)
        .eq('is_active', true)
        .eq('addon_groups.is_active', true);
      
      if (error) {
        console.error('Error fetching addons:', error);
        return;
      }
      
      console.log('✅ Addons fetched:', data?.length || 0);
      setAddons(data || []);
    } catch (error) {
      console.error('Unexpected error fetching addons:', error);
    }
  };

  const fetchMembershipSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_settings')
        .select('*')
        .order('tier');

      if (error) {
        console.warn('[OnlineShop] Failed to load membership settings, using defaults:', error);
        // ใช้ค่า fallback ที่ตรงกับฐานข้อมูล
        setMembershipSettings([
          { tier: 'silver', points_to_redeem: 110, redeem_value: 10, points_per_baht: 1.2, discount_percentage: 5, minimum_spend_for_upgrade: 0 },
          { tier: 'gold', points_to_redeem: 80, redeem_value: 10, points_per_baht: 1.5, discount_percentage: 10, minimum_spend_for_upgrade: 5000 },
          { tier: 'platinum', points_to_redeem: 60, redeem_value: 20, points_per_baht: 2, discount_percentage: 15, minimum_spend_for_upgrade: 15000 }
        ]);
      } else {
        console.log('[OnlineShop] Loaded membership settings from database:', data);
        setMembershipSettings(data);
      }
    } catch (error) {
      console.warn('[OnlineShop] Error loading membership settings, using defaults:', error);
      // ใช้ค่า fallback ที่ตรงกับฐานข้อมูล
      setMembershipSettings([
        { tier: 'silver', points_to_redeem: 110, redeem_value: 10, points_per_baht: 1.2, discount_percentage: 5, minimum_spend_for_upgrade: 0 },
        { tier: 'gold', points_to_redeem: 80, redeem_value: 10, points_per_baht: 1.5, discount_percentage: 10, minimum_spend_for_upgrade: 5000 },
        { tier: 'platinum', points_to_redeem: 60, redeem_value: 20, points_per_baht: 2, discount_percentage: 15, minimum_spend_for_upgrade: 15000 }
      ]);
    }
  };

  // Initialize data loading
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing online shop data...');
      setIsLoading(true);
      
      // Set timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Online shop initialization timeout - forcing load complete');
        setIsLoading(false);
      }, 10000); // 10 second timeout
      
      try {
        await Promise.all([
          fetchMenuItems(),
          fetchCategories(),
          fetchAddons(),
          fetchMembershipSettings(),
          fetchShopSettings()
        ]);
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
        console.log('✅ Online shop data initialization complete');
      }
    };

    initializeData();
  }, []);

  // Auto-add item to cart when selectedMenuItemId changes
  useEffect(() => {
    const autoAddItem = async () => {
      if (selectedMenuItemId && menuItems.length > 0) {
        const menuItem = menuItems.find(item => item.id === selectedMenuItemId);
        if (menuItem) {
          console.log('🎯 Auto-adding menu item from recommendation:', menuItem.name);
          await handleAddToCart(menuItem);
          // Clear selectedMenuItemId after adding
          onItemAdded?.();
        }
      }
    };
    
    autoAddItem();
  }, [selectedMenuItemId, menuItems]);

  const fetchShopSettings = async () => {
    try {
      const res = await fetch('https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/get-promptpay-phone');
      if (!res.ok) throw new Error(`Edge function HTTP ${res.status}`);
      const json = await res.json();
      if (json?.phone) {
        console.log('📱 PromptPay phone (edge):', json.phone);
        setPromptPayPhone(json.phone);
      } else {
        // Fallback: ใช้เบอร์จาก localStorage หากไม่มีในฐานข้อมูล
        const saved = localStorage.getItem('promptpay-phone-numbers');
        const list: string[] = saved ? JSON.parse(saved) : [];
        if (list.length > 0) {
          console.log('📱 Fallback to localStorage phone:', list[0]);
          setPromptPayPhone(list[0]);
        } else {
          console.log('⚠️ ไม่พบเบอร์ทั้งใน Edge และ localStorage', json);
        }
      }
      
      // Load shop logo
      if (json?.logo_url) {
        console.log('🏪 Loaded shop logo:', json.logo_url);
        setShopLogoUrl(json.logo_url);
      }
    } catch (error) {
      console.error('❌ Error fetching PromptPay phone via edge:', error);
      // Error Fallback: localStorage
      const saved = localStorage.getItem('promptpay-phone-numbers');
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (list.length > 0) {
        console.log('📱 Fallback (error) to localStorage phone:', list[0]);
        setPromptPayPhone(list[0]);
      }
    }
  };

  const getRelevantAddons = async (menuItem: MenuItem) => {
    console.log('Getting addons for menu item:', menuItem);
    
    try {
      const { data: menuAddonGroups, error: menuError } = await supabase
        .from('menu_addon_groups')
        .select('addon_group_id')
        .eq('menu_item_id', menuItem.id);

      if (menuError) {
        console.error('Error fetching menu addon groups:', menuError);
      }

      const { data: categoryAddonGroups, error: categoryError } = await supabase
        .from('category_addon_groups')
        .select('addon_group_id')
        .eq('category_id', menuItem.category_id);

      if (categoryError) {
        console.error('Error fetching category addon groups:', categoryError);
      }

      const allAddonGroupIds = new Set([
        ...(menuAddonGroups || []).map(ag => ag.addon_group_id),
        ...(categoryAddonGroups || []).map(ag => ag.addon_group_id)
      ]);

      console.log('All addon group IDs:', Array.from(allAddonGroupIds));

      const relevantAddons = addons.filter(addon => 
        addon.addon_group_id && allAddonGroupIds.has(addon.addon_group_id)
      );

      console.log('Relevant addons:', relevantAddons);
      return relevantAddons;
    } catch (error) {
      console.error('Error getting relevant addons:', error);
      return [];
    }
  };

  const addToCart = (menuItem: MenuItem, selectedAddons: DatabaseAddon[] = []) => {
    const existingItem = cartItems.find(item => 
      item.menu_item.id === menuItem.id &&
      JSON.stringify(item.selected_addons) === JSON.stringify(selectedAddons)
    );
    
    const addonPrice = selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
    const itemTotalPrice = menuItem.price + addonPrice;
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === existingItem.id
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              total_price: (item.quantity + 1) * (menuItem.price + addonPrice)
            }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36),
        menu_item: menuItem,
        quantity: 1,
        total_price: itemTotalPrice,
        selected_addons: selectedAddons
      };
      setCartItems([...cartItems, newItem]);
    }
    
    // Show success toast
    toast({
      title: "เพิ่มลงตะกร้าแล้ว",
      description: `${menuItem.name} ถูกเพิ่มลงในตะกร้าเรียบร้อยแล้ว`,
    });
  };

  const handleAddToCart = async (menuItem: MenuItem) => {
    console.log('Adding to cart:', menuItem);
    
    const relevantAddons = await getRelevantAddons(menuItem);
    
    if (relevantAddons.length > 0) {
      setSelectedMenuItem(menuItem);
      setAvailableAddons(relevantAddons);
      setShowAddonModal(true);
    } else {
      addToCart(menuItem);
    }
  };

  const handleAddonModalAddToCart = (menuItem: MenuItem, selectedAddons: DatabaseAddon[]) => {
    addToCart(menuItem, selectedAddons);
    setShowAddonModal(false);
    setSelectedMenuItem(null);
    setAvailableAddons([]);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: newQuantity, 
              total_price: newQuantity * (item.menu_item.price + (item.selected_addons?.reduce((sum, addon) => sum + Number(addon.price), 0) || 0))
            }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    const total = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    console.log('💰 Total amount:', total, 'Cart items:', cartItems.length);
    return total;
  };

  const getCurrentTierSettings = () => {
    if (!currentUser || !membershipSettings) return null;
    return membershipSettings.find((setting: any) => setting.tier === currentUser.tier);
  };

  const calculatePointsValue = (points: number) => {
    const tierSettings = getCurrentTierSettings();
    if (!tierSettings) return 0;
    return (points / tierSettings.points_to_redeem) * tierSettings.redeem_value;
  };

  const calculateRequiredPoints = (amount: number) => {
    const tierSettings = getCurrentTierSettings();
    if (!tierSettings) return 0;
    return Math.ceil((amount / tierSettings.redeem_value) * tierSettings.points_to_redeem);
  };

  const getMinimumPoints = () => {
    const tierSettings = getCurrentTierSettings();
    if (!tierSettings) return 0;
    return tierSettings.points_to_redeem;
  };

  const getMaximumPoints = () => {
    const tierSettings = getCurrentTierSettings();
    if (!currentUser || !tierSettings) return 0;
    const total = getTotalAmount();
    return Math.min(
      currentUser.points,
      calculateRequiredPoints(total)
    );
  };

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'silver': return 'เงิน';
      case 'gold': return 'ทอง';
      case 'platinum': return 'แพลตินัม';
      default: return tier;
    }
  };

  const generateQRCode = async () => {
    const total = getTotalAmount();
    let finalAmount = total;
    
    // Calculate final amount after points redemption
    if (paymentMethod === 'points' && pointsToUse) {
      const pointsValue = calculatePointsValue(parseInt(pointsToUse));
      finalAmount = Math.max(0, total - pointsValue);
    }
    
    if (finalAmount === 0) {
      // If fully paid with points, skip QR generation
      setShowPayment(true);
      return;
    }
    
    const qrData = `promptpay://0123456789?amount=${finalAmount}`;
    
    try {
      const url = await QRCode.toDataURL(qrData);
      setQrCodeUrl(url);
      setShowPayment(true);
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถสร้าง QR Code ได้', variant: 'destructive' });
    }
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    const fileName = `receipt_${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    // receipts bucket is private — use a signed URL (7-day expiry) so staff can view the slip
    const { data: signedData, error: signError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(fileName, 604800);

    if (signError || !signedData?.signedUrl) {
      console.error('Signed URL error:', signError);
      return null;
    }

    return signedData.signedUrl;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-4);
    return `ONL-${dateStr}-${timeStr}`;
  };

  const submitOrder = async () => {
    if (!currentUser) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเข้าสู่ระบบก่อน', variant: 'destructive' });
      return;
    }

    if (cartItems.length === 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกสินค้า', variant: 'destructive' });
      return;
    }

    if (!pickupTime) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกเวลารับสินค้า', variant: 'destructive' });
      return;
    }

    // Validate points usage
    if (paymentMethod === 'points') {
      const pointsValue = parseInt(pointsToUse || '0');
      const minimumPoints = getMinimumPoints();
      const maximumPoints = getMaximumPoints();

      if (pointsValue < minimumPoints) {
        toast({
          title: 'แต้มไม่เพียงพอ',
          description: `ต้องใช้แต้มขั้นต่ำ ${minimumPoints} แต้ม`,
          variant: 'destructive'
        });
        return;
      }

      if (pointsValue > maximumPoints) {
        toast({
          title: 'แต้มเกินจำนวนที่มี',
          description: `สามารถใช้แต้มได้สูงสุด ${maximumPoints} แต้ม`,
          variant: 'destructive'
        });
        return;
      }
    }

    const total = getTotalAmount();
    let finalAmount = total;
    let pointsUsed = 0;
    
    if (paymentMethod === 'points' && pointsToUse) {
      pointsUsed = parseInt(pointsToUse);
      const pointsValue = calculatePointsValue(pointsUsed);
      finalAmount = Math.max(0, total - pointsValue);
    }

    // For QR payment, require receipt upload if there's remaining amount
    if (paymentMethod === 'qr' && finalAmount > 0 && !receiptFile) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาแนบสลีปการชำระเงิน', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    const orderNumber = generateOrderNumber();
    
    try {
      console.log('📝 Starting order submission:', orderNumber);

      // Upload receipt first if needed
      let receiptUrl = null;
      if (receiptFile) {
        console.log('📤 Uploading receipt...');
        receiptUrl = await uploadReceipt(receiptFile);
        if (!receiptUrl) {
          throw new Error('ไม่สามารถอัปโหลดสลีปได้');
        }
        console.log('✅ Receipt uploaded:', receiptUrl);
      }

      // Insert order into database
      console.log('💾 Inserting order to database...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          member_id: currentUser.id,
          total_amount: finalAmount,
          items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          payment_method: paymentMethod === 'points' ? 'points' : 'online',
          order_source: 'online',
          order_type: 'online',
          receipt_image_url: receiptUrl,
          pickup_time: pickupTime,
          customer_notes: customerNotes,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Order insert error:', orderError);
        throw orderError;
      }
      console.log('✅ Order created:', order.id);

      // Prepare order items for batch insert
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item.id,
        menu_item_name: item.menu_item.name,
        quantity: item.quantity,
        unit_price: item.menu_item.price,
        total_price: item.quantity * item.menu_item.price,
        selected_addons: JSON.parse(JSON.stringify(item.selected_addons || []))
      }));

      // Save all order items
      console.log('💾 Inserting order items...', orderItemsToInsert.length, 'items');
      const { error: itemError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemError) {
        console.error('❌ Order items insert error:', itemError);
        throw itemError;
      }
      console.log('✅ Order items saved');

      // Send order notification to LINE/Discord
      console.log('📢 Sending order notification...');
      try {
        // Fetch complete order with items for notification
        const { data: completeOrder, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              menu_item_id,
              menu_item_name,
              quantity,
              unit_price,
              total_price,
              item_discount,
              item_discount_type,
              selected_addons
            ),
            members (
              name,
              phone,
              email
            )
          `)
          .eq('id', order.id)
          .single();

        if (!fetchError && completeOrder) {
          const orderData = {
            id: completeOrder.id,
            order_number: completeOrder.order_number,
            total_amount: completeOrder.total_amount,
            items_count: completeOrder.items_count,
            member_id: completeOrder.member_id,
            payment_method: completeOrder.payment_method,
            order_source: 'online',
            status: completeOrder.status,
            created_at: completeOrder.created_at,
            customer_notes: completeOrder.customer_notes || '',
            customer_name: completeOrder.members?.name || currentUser.name || 'ลูกค้า',
            customer_phone: completeOrder.members?.phone || currentUser.phone || '',
            bill_discount: completeOrder.bill_discount || 0,
            bill_discount_type: completeOrder.bill_discount_type || 'amount',
            discount_code: null,
            order_items: completeOrder.order_items || []
          };

          const { error: notificationError } = await supabase.functions.invoke('send-order-notification', {
            body: { orderData }
          });

          if (notificationError) {
            console.error('❌ Failed to send notification:', notificationError);
          } else {
            console.log('✅ Order notification sent successfully');
          }
        }
      } catch (notificationError) {
        console.error('❌ Notification error:', notificationError);
        // Don't throw - notification failure shouldn't break order
      }

      // Handle points and member updates
      let newPoints = currentUser.points;
      let newTotalSpent = currentUser.total_spent + finalAmount;

      if (paymentMethod === 'points' && pointsUsed > 0) {
        console.log('💎 Processing points redemption:', pointsUsed);
        newPoints = currentUser.points - pointsUsed;
        
        // Deduct points
        await supabase
          .from('members')
          .update({
            points: newPoints,
            total_spent: newTotalSpent
          })
          .eq('id', currentUser.id);

        // Log point transaction
        await supabase
          .from('point_transactions')
          .insert({
            member_id: currentUser.id,
            points_change: -pointsUsed,
            transaction_type: 'redeem',
            description: `ใช้แต้มชำระเงินออนไลน์ #${orderNumber}`,
            order_id: order.id
          });
        console.log('✅ Points redeemed');
      } else {
        // Earn points from purchase
        const tierSettings = getCurrentTierSettings();
        const pointsEarned = Math.floor(finalAmount * (tierSettings?.points_per_baht || 1));
        console.log('💎 Processing points earning:', pointsEarned);
        newPoints = currentUser.points + pointsEarned;
        
        await supabase
          .from('members')
          .update({
            points: newPoints,
            total_spent: newTotalSpent
          })
          .eq('id', currentUser.id);

        if (pointsEarned > 0) {
          await supabase
            .from('point_transactions')
            .insert({
              member_id: currentUser.id,
              points_change: pointsEarned,
              transaction_type: 'earned',
              description: `รับแต้มจากการสั่งซื้อออนไลน์ #${orderNumber}`,
              order_id: order.id
            });
        }
        console.log('✅ Points earned');
      }

      // Update currentUser state with the TRUTH from database (avoid stale UI)
      let updatedUser = {
        ...currentUser,
        points: newPoints,
        total_spent: newTotalSpent
      } as any;

      try {
        const { data: freshMember } = await supabase
          .from('members')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (freshMember) {
          updatedUser = {
            id: freshMember.id,
            name: freshMember.name,
            phone: freshMember.phone,
            email: freshMember.email || '',
            tier: freshMember.tier,
            points: freshMember.points,
            total_spent: freshMember.total_spent,
            birth_date: freshMember.birth_date,
            gender: freshMember.gender
          };
        }
      } catch (e) {
        console.warn('⚠️ Could not refetch member, falling back to computed values');
      }
      
      // Directly update parent state if provided
      if (typeof setCurrentUser === 'function') {
        setCurrentUser(updatedUser);
      }
      
      // Update parent component's currentUser via props if possible
      // This will update the points displayed on the member card
      if (typeof window !== 'undefined') {
        // Trigger a custom event to notify parent component
        window.dispatchEvent(new CustomEvent('memberPointsUpdated', { 
          detail: updatedUser 
        }));
        
        // Also update localStorage so the new points persist
        localStorage.setItem('customerAuth', JSON.stringify(updatedUser));
        console.log('✅ Updated currentUser state with new points:', updatedUser.points);
      }

      console.log('🎉 Order completed successfully!');

      // Show success message
      toast({ 
        title: 'สั่งซื้อสำเร็จ!', 
        description: `หมายเลขออเดอร์: ${orderNumber}` 
      });

      // Play success notification
      playOrderSuccessNotification()
        .then(() => console.log('✅ Notification sound played'))
        .catch(err => console.log('⚠️ Sound failed:', err));

      // Clear cart and reset UI
      setCartItems([]);
      setReceiptFile(null);
      setQrCodeUrl('');
      setPickupTime('');
      setCustomerNotes('');
      setPointsToUse('');
      setShowPayment(false);
      setIsProcessing(false);

      // Show thank you message
      setTimeout(() => {
        toast({ 
          title: '✅ ขอบคุณครับ!', 
          description: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว กรุณารอรับสินค้าตามเวลาที่กำหนด' 
        });
      }, 1000);

    } catch (error: any) {
      console.error('❌ Order submission error:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: error.message || 'ไม่สามารถสั่งซื้อได้', 
        variant: 'destructive' 
      });
      setIsProcessing(false);
    }
  };

  // Filter by availability first, then by category
  const availableMenuItems = menuItems.filter(item => item.is_available);
  
  const filteredMenuItems = selectedCategory === 'all' 
    ? availableMenuItems 
    : availableMenuItems.filter(item => item.category_id === selectedCategory);

  const getMinPickupTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                สั่งสินค้าออนไลน์
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                รีเฟรช
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดเมนู...</p>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()} 
                className="mx-auto flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                รีเฟรชหน้าเว็บ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Menu Items Grid with improved layout */}
      {filteredMenuItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">ไม่พบเมนูที่ต้องการ</p>
              <p className="text-sm">
                {selectedCategory === 'all' 
                  ? 'ขณะนี้ยังไม่มีเมนูที่พร้อมให้บริการ' 
                  : 'ไม่มีเมนูในหมวดหมู่ที่เลือก'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div 
          className="grid gap-4" 
          style={{ 
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` 
          }}
        >
          {filteredMenuItems.map(item => {
            // Size-dependent classes
            const imageHeight = itemSize === 'small' ? 'h-20' : itemSize === 'large' ? 'h-44' : 'h-32';
            const padding = itemSize === 'small' ? 'p-2' : 'p-3';
            const titleSize = itemSize === 'small' ? 'text-xs' : 'text-sm';
            const priceSize = itemSize === 'small' ? 'text-sm' : 'text-lg';
            const iconSize = itemSize === 'small' ? 'w-6 h-6' : 'w-8 h-8';
            const plusSize = itemSize === 'small' ? 'w-3 h-3' : 'w-4 h-4';
            const emojiSize = itemSize === 'small' ? 'text-2xl' : itemSize === 'large' ? 'text-5xl' : 'text-4xl';
            const spacing = itemSize === 'small' ? 'space-y-1' : itemSize === 'large' ? 'space-y-4' : 'space-y-3';
            const descLines = itemSize === 'large' ? 'line-clamp-3' : 'line-clamp-2';

            return (
              <Card 
                key={item.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-orange-300" 
                onClick={() => handleAddToCart(item)}
              >
                <CardContent className={padding}>
                  <div className={spacing}>
                    {/* Image Section */}
                    <div className={`w-full ${imageHeight} overflow-hidden rounded-lg bg-gray-100`}>
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className={emojiSize}>🍽️</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Text Section */}
                    <div className={itemSize === 'small' ? 'space-y-0.5' : 'space-y-2'}>
                      <h3 className={`font-semibold text-gray-900 ${titleSize} leading-tight line-clamp-2`}>
                        {item.name}
                      </h3>
                      
                      {item.description && itemSize !== 'small' && (
                        <p className={`text-xs text-gray-600 ${descLines}`}>
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-1">
                        <p className={`${priceSize} font-bold text-orange-600`}>
                          ฿{item.price.toLocaleString()}
                        </p>
                        <div className={`${iconSize} bg-orange-500 rounded-full flex items-center justify-center`}>
                          <Plus className={`${plusSize} text-white`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}


      {/* Order Details */}
      {cartItems.length > 0 && (
        <Card id="payment-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              รายละเอียดการสั่งซื้อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pickupTime">เวลาที่ต้องการรับสินค้า</Label>
              <Input
                id="pickupTime"
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                min={getMinPickupTime()}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">หมายเหตุ (ถ้ามี)</Label>
              <Textarea
                id="notes"
                placeholder="เช่น ไม่ใส่น้ำตาล, เพิ่มน้ำแข็ง..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label className="text-base font-medium">วิธีการชำระเงิน</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as 'qr' | 'points')}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="qr" id="qr" />
                  <Label htmlFor="qr" className="flex items-center gap-2 cursor-pointer">
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </Label>
                </div>
                
                {currentUser && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="points" id="points" />
                    <Label htmlFor="points" className="flex items-center gap-2 cursor-pointer">
                      <Gift className="w-4 h-4" />
                      ใช้แต้มแลก
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* QR Code Payment Section - Auto-display when cart has items */}
            {paymentMethod === 'qr' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-center">ชำระเงิน</h3>
                <p className="text-center text-xl font-bold text-orange-600 mb-4">
                  ยอดชำระ: ฿{getTotalAmount().toLocaleString()}
                </p>
                {promptPayPhone ? (
                  <QRCodePromptPay 
                    key={`qr-${getTotalAmount()}`}
                    amount={getTotalAmount()} 
                    defaultPhoneNumber={promptPayPhone}
                    shopLogoUrl={shopLogoUrl}
                    compact={true}
                  />
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      ยังไม่ได้ตั้งค่าเบอร์โทรศัพท์ PromptPay
                    </p>
                    <p className="text-sm text-gray-500">
                      กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าเบอร์โทรศัพท์ PromptPay
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Receipt Upload and Submit Button */}
            {paymentMethod === 'qr' && (
              <div className="space-y-3 mt-4">
                <div>
                  <Label htmlFor="receipt">แนบสลีปการชำระเงิน</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {receiptFile && (
                    <p className="text-sm text-green-600 mt-2">
                      <Upload className="w-4 h-4 inline mr-1" />
                      {receiptFile.name}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={submitOrder}
                  className="w-full"
                  disabled={isProcessing || !pickupTime || !receiptFile}
                >
                  {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
                </Button>
              </div>
            )}

            {/* Points Payment Section */}
            {paymentMethod === 'points' && currentUser && (
              <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 space-y-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-600" />
                  ใช้แต้มแลกสินค้า
                </h3>

                {/* Available Points */}
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">แต้มที่มีอยู่:</span>
                    <span className="text-2xl font-bold text-amber-600">
                      {currentUser.points.toLocaleString()} แต้ม
                    </span>
                  </div>
                  
                  {/* Tier info */}
                  {getCurrentTierSettings() && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                      <p>อัตราแลกแต้ม: {getCurrentTierSettings()?.points_to_redeem} แต้ม = {getCurrentTierSettings()?.redeem_value} บาท</p>
                      <p className="mt-1">ขั้นต่ำในการแลก: {getMinimumPoints()} แต้ม</p>
                    </div>
                  )}
                </div>

                {/* Points Input */}
                <div>
                  <Label htmlFor="pointsToUse" className="text-base font-medium">
                    จำนวนแต้มที่ต้องการใช้
                  </Label>
                  <Input
                    id="pointsToUse"
                    type="number"
                    placeholder={`ขั้นต่ำ ${getMinimumPoints()} แต้ม`}
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(e.target.value)}
                    min={getMinimumPoints()}
                    max={getMaximumPoints()}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    สามารถใช้ได้สูงสุด {getMaximumPoints().toLocaleString()} แต้ม
                  </p>
                </div>

                {/* Points Calculation Display */}
                {pointsToUse && parseInt(pointsToUse) > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-amber-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">แต้มที่ใช้:</span>
                      <span className="font-semibold text-amber-700">
                        {parseInt(pointsToUse).toLocaleString()} แต้ม
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">มูลค่าที่ได้:</span>
                      <span className="font-semibold text-green-600">
                        ฿{calculatePointsValue(parseInt(pointsToUse)).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-700">แต้มคงเหลือ:</span>
                      <span className="text-xl font-bold text-amber-600">
                        {(currentUser.points - parseInt(pointsToUse)).toLocaleString()} แต้ม
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                      <span className="font-semibold text-gray-900">ยอดที่ต้องชำระ:</span>
                      <span className="text-xl font-bold text-orange-600">
                        ฿{Math.max(0, getTotalAmount() - calculatePointsValue(parseInt(pointsToUse))).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Validation Messages */}
                {pointsToUse && parseInt(pointsToUse) > 0 && (
                  <div>
                    {parseInt(pointsToUse) < getMinimumPoints() && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-700">
                          <p className="font-semibold">แต้มไม่เพียงพอในการแลก</p>
                          <p className="mt-1">กรุณาใช้แต้มขั้นต่ำ {getMinimumPoints()} แต้ม</p>
                        </div>
                      </div>
                    )}
                    
                    {parseInt(pointsToUse) > getMaximumPoints() && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-700">
                          <p className="font-semibold">แต้มเกินจำนวนที่มี</p>
                          <p className="mt-1">คุณมีแต้ม {currentUser.points.toLocaleString()} แต้ม สามารถใช้ได้สูงสุด {getMaximumPoints().toLocaleString()} แต้ม</p>
                        </div>
                      </div>
                    )}
                    
                    {parseInt(pointsToUse) >= getMinimumPoints() && 
                     parseInt(pointsToUse) <= getMaximumPoints() && (
                      <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-700">
                          <p className="font-semibold">แต้มใช้ได้!</p>
                          <p className="mt-1">คุณจะได้รับส่วนลด ฿{calculatePointsValue(parseInt(pointsToUse)).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={submitOrder}
                  className="w-full"
                  disabled={
                    isProcessing || 
                    !pickupTime || 
                    !pointsToUse || 
                    parseInt(pointsToUse) < getMinimumPoints() ||
                    parseInt(pointsToUse) > getMaximumPoints()
                  }
                >
                  {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {/* Display Settings Modal */}
      <DisplaySettingsModal
        isOpen={showDisplaySettings}
        onClose={() => setShowDisplaySettings(false)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        itemSize={itemSize}
        setItemSize={setItemSize}
        page="online"
      />

      <AddonModal
        isOpen={showAddonModal}
        onClose={() => {
          setShowAddonModal(false);
          setSelectedMenuItem(null);
          setAvailableAddons([]);
        }}
        menuItem={selectedMenuItem}
        addons={availableAddons}
        onAddToCart={handleAddonModalAddToCart}
      />

      {/* Mobile Cart Component */}
      <MobileCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems.map(item => ({
          ...item,
          menu_item: item.menu_item,
          selected_addons: (item.selected_addons || []).map(addon => ({
            id: addon.id,
            name: addon.name,
            price: addon.price,
            category: 'other' as const,
            is_required: addon.addon_groups?.is_required || false,
            allow_multiple: addon.addon_groups?.allow_multiple || false,
            addon_group_id: addon.addon_group_id
          })),
          item_discount: 0,
          item_discount_type: 'amount' as const
        }))}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={(itemId) => {
          setCartItems(prev => prev.filter(item => item.id !== itemId));
        }}
        onUpdateDiscount={() => {}} // Not used in online ordering
        onClearCart={() => setCartItems([])}
        billDiscount={0}
        billDiscountType="amount"
        onUpdateBillDiscount={() => {}} // Not used in online ordering
        onUpdateBillDiscountType={() => {}} // Not used in online ordering
        onRestoreCart={() => {}} // Not used in online ordering
        onCodeApply={() => {}} // Not used in online ordering
        appliedGiftCode={null}
        onPaymentComplete={() => {}} // Not used in online ordering
        selectedMember={currentUser}
        onProceedToPayment={() => {
          setIsCartOpen(false);
          setTimeout(() => {
            // Scroll to payment section
            const paymentSection = document.getElementById('payment-section');
            if (paymentSection) {
              paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 300);
        }}
      />

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="ตะกร้าสินค้า"
        >
          <div className="relative">
            <ShoppingCart className="w-7 h-7" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
};

export default OnlineShopSection;
