import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, Plus, Minus, Clock, Upload, QrCode, Settings, X, Gift } from 'lucide-react';
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
}

const OnlineShopSection = ({ currentUser }: OnlineShopSectionProps) => {
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
  
  const [gridColumns, setGridColumns] = useState(2);
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promptPayPhone, setPromptPayPhone] = useState<string>('');
  
  const { toast } = useToast();

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
        .select('*')
        .eq('is_available', true)
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
          created_at,
          updated_at,
          addon_groups!addons_addon_group_id_fkey (
            id,
            name,
            allow_multiple,
            is_required
          )
        `)
        .eq('is_active', true);
      
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
        console.warn('Failed to load membership settings, using defaults:', error);
        setMembershipSettings([
          { tier: 'silver', points_to_redeem: 100, redeem_value: 10, points_per_baht: 1 },
          { tier: 'gold', points_to_redeem: 80, redeem_value: 15, points_per_baht: 1.5 },
          { tier: 'platinum', points_to_redeem: 60, redeem_value: 20, points_per_baht: 2 }
        ]);
      } else {
        setMembershipSettings(data);
      }
    } catch (error) {
      console.warn('Error loading membership settings, using defaults:', error);
      setMembershipSettings([
        { tier: 'silver', points_to_redeem: 100, redeem_value: 10, points_per_baht: 1 },
        { tier: 'gold', points_to_redeem: 80, redeem_value: 15, points_per_baht: 1.5 },
        { tier: 'platinum', points_to_redeem: 60, redeem_value: 20, points_per_baht: 2 }
      ]);
    }
  };

  // Initialize data loading
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing online shop data...');
      setIsLoading(true);
      
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
        setIsLoading(false);
        console.log('✅ Online shop data initialization complete');
      }
    };

    initializeData();
  }, []);

  const fetchShopSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('phone')
        .single();
      
      if (error) throw error;
      if (data?.phone) {
        setPromptPayPhone(data.phone);
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
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
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
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
    
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
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
    
    try {
      // Show immediate success message to user
      toast({ 
        title: 'สั่งซื้อสำเร็จ!', 
        description: 'ขอบคุณสำหรับการสั่งซื้อ ระบบกำลังจัดเตรียมออเดอร์ของคุณ' 
      });

      // Reset processing state immediately - don't wait for anything
      setIsProcessing(false);

      // Clear cart and reset UI immediately for better UX
      setCartItems([]);
      setReceiptFile(null);
      setQrCodeUrl('');
      setPickupTime('');
      setCustomerNotes('');
      setPointsToUse('');
      setShowPayment(false);
      
      // 🔔 PLAY NOTIFICATION SOUND IN BACKGROUND - DON'T BLOCK UI
      console.log('🔔 Playing notification sound in background...');
      playOrderSuccessNotification()
        .then(() => console.log('✅ Notification sound played successfully'))
        .catch(soundError => console.log('⚠️ Notification sound failed:', soundError));

      // รีเฟรชหน้าเว็บหลังจาก 1.5 วินาที
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      // 📢 SEND NOTIFICATION IMMEDIATELY - Don't wait for database
      const orderNumber = generateOrderNumber();
      console.log('📢 Sending immediate order notification for mobile...');
      
      // Edge function will be called after the actual order is saved via realtime notifications

      // ASYNC BACKGROUND DATABASE OPERATIONS - Don't block UI
      setTimeout(async () => {
        try {
          let receiptUrl = null;
          if (receiptFile) {
            receiptUrl = await uploadReceipt(receiptFile);
            if (!receiptUrl) {
              throw new Error('ไม่สามารถอัปโหลดสลีปได้');
            }
          }

          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              order_number: orderNumber,
              member_id: currentUser.id,
              total_amount: finalAmount,
              items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
              payment_method: paymentMethod === 'points' ? 'points' : 'online',
              order_source: 'online',
              receipt_image_url: receiptUrl,
              pickup_time: pickupTime,
              customer_notes: customerNotes
            })
            .select()
            .single();

          if (orderError) throw orderError;

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

          // Save all order items at once
          const { data: orderItems, error: itemError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert)
            .select();

          if (itemError) throw itemError;

          // Handle points and member updates
          if (paymentMethod === 'points' && pointsUsed > 0) {
            // Deduct points
            await supabase
              .from('members')
              .update({
                points: currentUser.points - pointsUsed,
                total_spent: currentUser.total_spent + finalAmount
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
          } else {
            // Earn points from purchase
            const tierSettings = getCurrentTierSettings();
            const pointsEarned = Math.floor(finalAmount * (tierSettings?.points_per_baht || 1));
            
            await supabase
              .from('members')
              .update({
                points: currentUser.points + pointsEarned,
                total_spent: currentUser.total_spent + finalAmount
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
          }

          // Don't call notification trigger here - the GlobalNotificationProvider will handle it via realtime

          // Show final success message
          toast({ 
            title: 'สั่งซื้อสำเร็จ!', 
            description: `หมายเลขออเดอร์: ${orderNumber}` 
          });

          setTimeout(() => {
            toast({ 
              title: '✅ ขอบคุณครับ!', 
              description: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว กรุณารอรับสินค้าตามเวลาที่กำหนด' 
            });
          }, 1000);

        } catch (error: any) {
          console.error('Background order processing error:', error);
          toast({ 
            title: 'ข้อผิดพลาดในการบันทึก', 
            description: error.message || 'ข้อมูลอาจไม่ได้รับการบันทึก กรุณาติดต่อเจ้าหน้าที่', 
            variant: 'destructive' 
          });
        }
      }, 100); // Start background process after 100ms
      
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: error.message || 'ไม่สามารถสั่งซื้อได้', 
        variant: 'destructive' 
      });
      setIsProcessing(false);
    }
  };

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === selectedCategory);

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
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              สั่งสินค้าออนไลน์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดเมนู...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              onClick={() => setShowDisplaySettings(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              ตั้งค่าการแสดงผล
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

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
          {filteredMenuItems.map(item => (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-orange-300" 
              onClick={() => handleAddToCart(item)}
            >
              <CardContent className="p-3">
                <div className="space-y-3">
                  {/* Image Section */}
                  <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Section */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                      {item.name}
                    </h3>
                    
                    {item.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-lg font-bold text-orange-600">
                        ฿{item.price.toLocaleString()}
                      </p>
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
            {paymentMethod === 'qr' && promptPayPhone && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-center">ชำระเงิน</h3>
                <p className="text-center text-xl font-bold text-orange-600 mb-4">
                  ยอดชำระ: ฿{getTotalAmount().toLocaleString()}
                </p>
                <QRCodePromptPay 
                  amount={getTotalAmount()} 
                  defaultPhoneNumber={promptPayPhone}
                  compact={true}
                />
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

            {/* Points Payment Button */}
            {paymentMethod === 'points' && (
              <Button 
                onClick={submitOrder}
                className="w-full mt-4"
                disabled={isProcessing || !pickupTime}
              >
                {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
              </Button>
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
          className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
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
