import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Clock, Upload, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import AddonModal from '@/components/AddonModal';

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
  const [activeAudioContext, setActiveAudioContext] = useState<AudioContext | null>(null);
  const [activeOscillators, setActiveOscillators] = useState<OscillatorNode[]>([]);
  const { toast } = useToast();

  // Notification sound function - ใช้ฟังก์ชันเดียวกันกับหน้าตั้งค่าเสียง
  const playOrderSuccessSound = async (overrideDuration?: number) => {
    try {
      console.log('🔊 Playing order success sound...');
      
      // Load notification settings
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      const notificationSettings = {
        sound_enabled: settings?.sound_enabled ?? true,
        selected_sound_id: settings?.selected_sound_id || undefined,
        volume: settings?.volume ?? 0.8,
        duration: settings?.duration ?? 2
      };

      console.log('🔊 Loaded settings:', notificationSettings);

      if (!notificationSettings.sound_enabled) {
        console.log('🔇 Sound disabled');
        return;
      }

      // Load custom sounds
      const { data: sounds } = await supabase
        .from('notification_sounds')
        .select('*')
        .order('created_at');

      console.log('🔊 Loaded sounds:', sounds);

      let soundPlayed = false;

      // Check if we have a custom sound selected (UUID format)
      if (notificationSettings.selected_sound_id && 
          !['ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด', 'ตีดๆๆๆ'].includes(notificationSettings.selected_sound_id)) {
        
        console.log('🔊 Looking for custom sound with ID:', notificationSettings.selected_sound_id);
        
        const selectedSound = sounds?.find(
          sound => sound.id === notificationSettings.selected_sound_id
        );
        
        console.log('🔊 Found custom sound:', selectedSound);
        
        if (selectedSound && selectedSound.file_url) {
          console.log('🔊 Playing custom sound:', selectedSound.name);
          
          try {
            const fullUrl = `https://mzvzbxflwvksohrmxbsy.supabase.co/storage/v1/object/public/notification-sounds/${selectedSound.file_url}`;
            console.log('🔊 Custom sound URL:', fullUrl);
            
            const audio = new Audio();
            audio.volume = Math.min(notificationSettings.volume * 1.5, 1.0);
            audio.src = fullUrl;
            audio.preload = 'auto';
            
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
              
              audio.oncanplaythrough = async () => {
                clearTimeout(timeout);
                try {
                  await audio.play();
                  console.log('✅ Custom sound played successfully');
                  soundPlayed = true;
                  
                  setTimeout(() => {
                    if (audio && !audio.paused) {
                      audio.pause();
                      audio.currentTime = 0;
                    }
                  }, notificationSettings.duration * 1000);
                  
                  resolve();
                } catch (e) {
                  console.log('🔊 Audio play failed:', e);
                  reject(e);
                }
              };
              
              audio.onerror = (error) => {
                console.log('🔊 Audio error:', error);
                clearTimeout(timeout);
                reject(error);
              };
              
              audio.load();
            });
          } catch (error) {
            console.log('🔊 Custom sound failed:', error);
          }
        } else {
          console.log('🔊 Selected custom sound not found or has no file_url');
        }
      }
      
      // If custom sound didn't play, try basic sounds
      if (!soundPlayed) {
        if (notificationSettings.selected_sound_id && 
            ['ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด', 'ตีดๆๆๆ'].includes(notificationSettings.selected_sound_id)) {
          console.log('🔊 Playing basic sound:', notificationSettings.selected_sound_id);
          
          // Use override duration if provided, otherwise use settings duration
          const soundSettings = overrideDuration 
            ? { ...notificationSettings, duration: overrideDuration }
            : notificationSettings;
          
          await playBasicSuccessSound(notificationSettings.selected_sound_id, soundSettings);
        } else {
          console.log('🔊 Using default beep sound');
          
          // Use override duration if provided, otherwise use settings duration
          const soundSettings = overrideDuration 
            ? { ...notificationSettings, duration: overrideDuration }
            : notificationSettings;
          
          await createSuccessBeepSound(soundSettings);
        }
      }
    } catch (error) {
      console.error('Error playing success sound:', error);
    }
  };

  const playBasicSuccessSound = async (soundName: string, settings: any) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const duration = settings.duration * 1000;
      const volume = Math.min(settings.volume * 2.0, 1.0);
      
      let frequency = 800;
      
      switch (soundName) {
        case 'ระฆัง': frequency = 800; break;
        case 'กิ่งก่า': frequency = 1000; break;
        case 'แจ้งเตือน': frequency = 600; break;
        case 'ปลุก': frequency = 1200; break;
        case 'กระดิ่ง': frequency = 900; break;
        case 'ออด': frequency = 400; break;
        case 'ตีดๆๆๆ': 
          // Create continuous "ตีดๆๆๆ" pattern for the specified duration (3-30 seconds)
          const totalDuration = Math.max(3, Math.min(30, settings.duration)); // Ensure 3-30 seconds
          const beepFrequency = 800; // Simple beep frequency
          const beepInterval = 0.5; // 500ms between beeps
          const beepDuration = 0.15; // 150ms per beep
          
          let currentTime = audioContext.currentTime;
          const endTime = currentTime + totalDuration;
          
          console.log(`🔊 Playing ตีดๆๆๆ for ${totalDuration} seconds`);
          
          // Create continuous beeps for the duration
          while (currentTime < endTime) {
            const beepOscillator = audioContext.createOscillator();
            const beepGainNode = audioContext.createGain();
            
            beepOscillator.connect(beepGainNode);
            beepGainNode.connect(audioContext.destination);
            
            beepOscillator.frequency.setValueAtTime(beepFrequency, currentTime);
            beepOscillator.type = 'square'; // Square wave for classic beep sound
            
            // Quick attack and decay for sharp beep
            beepGainNode.gain.setValueAtTime(0, currentTime);
            beepGainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
            beepGainNode.gain.setValueAtTime(volume, currentTime + beepDuration - 0.01);
            beepGainNode.gain.linearRampToValueAtTime(0, currentTime + beepDuration);
            
            beepOscillator.start(currentTime);
            beepOscillator.stop(currentTime + beepDuration);
            
            currentTime += beepInterval;
          }
          
          console.log(`✅ ตีดๆๆๆ sound played for ${totalDuration} seconds`);
          return; // Exit early for beep pattern
        default:
          frequency = 800;
      }
      
      // Create enhanced sound with musical qualities for order success
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
      
      console.log(`✅ Basic sound played: ${soundName}`);
    } catch (error) {
      console.error('Basic success sound failed:', error);
    }
  };

  const createSuccessBeepSound = async (settings: any) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const volume = Math.min(settings.volume * 2.0, 1.0);
      const duration = settings.duration;
      const currentTime = audioContext.currentTime;
      
      // Create beautiful success melody using musical notes
      // Using a pleasant chord progression: C4 -> E4 -> G4 -> C5
      const successMelody = [
        { freq: 261.63, time: 0.0, duration: 0.3 },     // C4
        { freq: 329.63, time: 0.2, duration: 0.3 },     // E4
        { freq: 392.00, time: 0.4, duration: 0.3 },     // G4
        { freq: 523.25, time: 0.6, duration: 0.6 }      // C5 (hold longer)
      ];
      
      successMelody.forEach((note, index) => {
        if (note.time < duration) {
          // Main note
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = note.freq;
          oscillator.type = 'sine'; // Smooth sine wave for pleasant sound
          
          const startTime = currentTime + note.time;
          const endTime = startTime + Math.min(note.duration, duration - note.time);
          
          // Smooth envelope for pleasant sound
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(volume * 0.6, startTime + 0.02);
          gainNode.gain.setValueAtTime(volume * 0.6, endTime - 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
          
          oscillator.start(startTime);
          oscillator.stop(endTime);
          
          // Add harmonic for richer sound
          if (index === successMelody.length - 1) { // Only on the final note
            const harmonicOscillator = audioContext.createOscillator();
            const harmonicGain = audioContext.createGain();
            
            harmonicOscillator.connect(harmonicGain);
            harmonicGain.connect(audioContext.destination);
            
            harmonicOscillator.frequency.value = note.freq * 2; // Octave higher
            harmonicOscillator.type = 'triangle';
            
            harmonicGain.gain.setValueAtTime(0, startTime);
            harmonicGain.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.1);
            harmonicGain.gain.exponentialRampToValueAtTime(0.01, endTime);
            
            harmonicOscillator.start(startTime + 0.1);
            harmonicOscillator.stop(endTime);
          }
        }
      });
      
      console.log('✅ Success melody played');
    } catch (error) {
      console.error('Success melody failed:', error);
      // Fallback to simple beeps if melody fails
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(settings.volume, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
      } catch (fallbackError) {
        console.error('Fallback beep also failed:', fallbackError);
      }
    }
  };

  // ฟังก์ชันหยุดเสียงแจ้งเตือนทั้งหมด
  const stopAllNotificationSounds = () => {
    try {
      if (activeAudioContext) {
        activeAudioContext.close();
        setActiveAudioContext(null);
      }
      
      activeOscillators.forEach(oscillator => {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      setActiveOscillators([]);
      
      console.log('🔇 All notification sounds stopped');
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  };

  // ฟังก์ชันเล่นเสียงตีดๆสำหรับการยืนยันออเดอร์เป็นเวลา 10 วินาที
  const playOrderSuccessBeep = async () => {
    try {
      console.log('🔊 Playing order success beep for 10 seconds...');
      
      // หยุดเสียงเก่าก่อน
      stopAllNotificationSounds();
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      setActiveAudioContext(audioContext);
      
      const totalDuration = 10; // 10 วินาที
      const beepFrequency = 600; // ลดความถี่ให้นุ่มนวลขึ้น
      const beepInterval = 0.7; // เพิ่มระยะห่างระหว่างเสียงตีด
      const beepDuration = 0.12; // ลดความยาวของแต่ละเสียงตีด
      
      // ใช้ volume จากอุปกรณ์โดยไม่กำหนดค่าแน่นอน
      const deviceVolume = 0.3; // เริ่มที่ระดับเบา
      
      let currentTime = audioContext.currentTime;
      const endTime = currentTime + totalDuration;
      const oscillators: OscillatorNode[] = [];
      
      console.log(`🔊 Playing ตีดๆๆๆ for ${totalDuration} seconds`);
      
      // สร้างเสียงตีดๆต่อเนื่องเป็นเวลา 10 วินาที
      while (currentTime < endTime) {
        const beepOscillator = audioContext.createOscillator();
        const beepGainNode = audioContext.createGain();
        
        // ใช้ low-pass filter เพื่อทำให้เสียงนุ่มนวล
        const lowPassFilter = audioContext.createBiquadFilter();
        lowPassFilter.type = 'lowpass';
        lowPassFilter.frequency.value = 1200; // ตัดความถี่สูงออก
        
        beepOscillator.connect(lowPassFilter);
        lowPassFilter.connect(beepGainNode);
        beepGainNode.connect(audioContext.destination);
        
        beepOscillator.frequency.setValueAtTime(beepFrequency, currentTime);
        beepOscillator.type = 'sine'; // ใช้ sine wave แทน square wave เพื่อเสียงที่นุ่มนวล
        
        // ตั้งค่าการเพิ่มและลดเสียงแบบนุ่มนวล
        beepGainNode.gain.setValueAtTime(0, currentTime);
        beepGainNode.gain.linearRampToValueAtTime(deviceVolume, currentTime + 0.02);
        beepGainNode.gain.setValueAtTime(deviceVolume, currentTime + beepDuration - 0.02);
        beepGainNode.gain.linearRampToValueAtTime(0, currentTime + beepDuration);
        
        beepOscillator.start(currentTime);
        beepOscillator.stop(currentTime + beepDuration);
        
        oscillators.push(beepOscillator);
        currentTime += beepInterval;
      }
      
      setActiveOscillators(oscillators);
      
      // หยุดเสียงอัตโนมัติหลัง 10 วินาที
      setTimeout(() => {
        stopAllNotificationSounds();
      }, totalDuration * 1000);
      
      console.log(`✅ Order success beep played for ${totalDuration} seconds`);
    } catch (error) {
      console.error('Order success beep failed:', error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchAddons();
  }, []);

  // หยุดเสียงเมื่อออกจากหน้า
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopAllNotificationSounds();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopAllNotificationSounds(); // หยุดเสียงเมื่อ component unmount
    };
  }, [activeAudioContext, activeOscillators]);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดเมนูได้', variant: 'destructive' });
      return;
    }
    setMenuItems(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (!error) {
      setCategories(data || []);
    }
  };

  const fetchAddons = async () => {
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
    
    if (!error) {
      setAddons(data || []);
    }
  };

  // ฟังก์ชันดึง addon ที่เกี่ยวข้องกับเมนูและหมวดหมู่
  const getRelevantAddons = async (menuItem: MenuItem) => {
    console.log('Getting addons for menu item:', menuItem);
    
    try {
      // ดึง addon groups ที่เกี่ยวข้องกับเมนูนี้โดยตรง
      const { data: menuAddonGroups, error: menuError } = await supabase
        .from('menu_addon_groups')
        .select('addon_group_id')
        .eq('menu_item_id', menuItem.id);

      if (menuError) {
        console.error('Error fetching menu addon groups:', menuError);
      }

      // ดึง addon groups ที่เกี่ยวข้องกับหมวดหมู่
      const { data: categoryAddonGroups, error: categoryError } = await supabase
        .from('category_addon_groups')
        .select('addon_group_id')
        .eq('category_id', menuItem.category_id);

      if (categoryError) {
        console.error('Error fetching category addon groups:', categoryError);
      }

      // รวม addon group IDs ทั้งหมด
      const allAddonGroupIds = new Set([
        ...(menuAddonGroups || []).map(ag => ag.addon_group_id),
        ...(categoryAddonGroups || []).map(ag => ag.addon_group_id)
      ]);

      console.log('All addon group IDs:', Array.from(allAddonGroupIds));

      // กรอง addons ที่เกี่ยวข้อง
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
    
    // ตรวจสอบ addon ที่เกี่ยวข้องกับเมนูนี้
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

  const generateQRCode = async () => {
    const total = getTotalAmount();
    const qrData = `promptpay://0123456789?amount=${total}`;
    
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

    if (!receiptFile) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาแนบสลีปการชำระเงิน', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    
    try {
      // อัปโหลดสลีป
      const receiptUrl = await uploadReceipt(receiptFile);
      if (!receiptUrl) {
        throw new Error('ไม่สามารถอัปโหลดสลีปได้');
      }

      // สร้างออเดอร์
      const orderNumber = generateOrderNumber();
      const totalAmount = getTotalAmount();
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          member_id: currentUser.id,
          total_amount: totalAmount,
          items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          payment_method: 'online',
          order_source: 'online',
          receipt_image_url: receiptUrl,
          pickup_time: pickupTime,
          customer_notes: customerNotes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // เพิ่มรายการสินค้าและ add-ons
      for (const item of cartItems) {
        // เพิ่มรายการสินค้าหลัก
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            menu_item_id: item.menu_item.id,
            menu_item_name: item.menu_item.name,
            quantity: item.quantity,
            unit_price: item.menu_item.price,
            total_price: item.quantity * item.menu_item.price
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // เพิ่ม add-ons ถ้ามี
        if (item.selected_addons && item.selected_addons.length > 0) {
          const addonItems = item.selected_addons.map(addon => ({
            order_id: order.id,
            order_item_id: orderItem.id,
            addon_id: addon.id,
            addon_name: addon.name,
            quantity: item.quantity,
            unit_price: Number(addon.price),
            total_price: item.quantity * Number(addon.price)
          }));

          const { error: addonError } = await supabase
            .from('order_addons')
            .insert(addonItems);

          if (addonError) throw addonError;
        }
      }

      // อัปเดตแต้มสำหรับสมาชิก
      const pointsEarned = Math.floor(totalAmount);
      await supabase
        .from('members')
        .update({
          points: currentUser.points + pointsEarned,
          total_spent: currentUser.total_spent + totalAmount
        })
        .eq('id', currentUser.id);

      // บันทึกการเปลี่ยนแปลงแต้ม
      await supabase
        .from('point_transactions')
        .insert({
          member_id: currentUser.id,
          points_change: pointsEarned,
          transaction_type: 'earned',
          description: `รับแต้มจากการสั่งซื้อออนไลน์ #${orderNumber}`,
          order_id: order.id
        });

      toast({ 
        title: 'สั่งซื้อสำเร็จ!', 
        description: `หมายเลขออเดอร์: ${orderNumber} รับแต้ม ${pointsEarned} แต้ม` 
      });

      // เล่นเสียงแจ้งเตือนการส่งออเดอร์สำเร็จ - เสียงตีดๆเป็นเวลา 10 วินาที
      try {
        await playOrderSuccessBeep();
      } catch (soundError) {
        console.log('เสียงแจ้งเตือนเล่นไม่ได้:', soundError);
      }

      // รีเซ็ตฟอร์มและซ่อนหน้าการชำระเงิน
      setCartItems([]);
      setPickupTime('');
      setCustomerNotes('');
      setReceiptFile(null);
      setShowPayment(false);
      setQrCodeUrl('');
      
      // แสดงข้อความสำเร็จเพิ่มเติม
      setTimeout(() => {
        toast({ 
          title: '✅ ขอบคุณครับ!', 
          description: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว กรุณารอรับสินค้าตามเวลาที่กำหนด' 
        });
      }, 1000);

    } catch (error: any) {
      console.error('Order submission error:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: error.message || 'ไม่สามารถสั่งซื้อได้', 
        variant: 'destructive' 
      });
    } finally {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            สั่งสินค้าออนไลน์
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Category Filter */}
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

      {/* Menu Items Grid - 5 items per row with smaller size */}
      <div className="grid grid-cols-5 gap-1.5">
        {filteredMenuItems.map(item => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-1.5">
              <div className="space-y-1.5">
                {item.image_url && (
                  <div className="aspect-square w-full overflow-hidden rounded-md">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-0.5">
                  <h3 className="font-medium text-xs leading-tight line-clamp-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                  )}
                  <p className="text-xs font-bold text-green-600">฿{item.price}</p>
                </div>
                
                <Button 
                  onClick={() => handleAddToCart(item)}
                  className="w-full text-xs py-0.5 h-6"
                  size="sm"
                >
                  <Plus className="w-2.5 h-2.5 mr-0.5" />
                  เพิ่ม
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart */}
      {cartItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ตะกร้าสินค้า ({cartItems.length} รายการ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{item.menu_item.name}</h4>
                  <p className="text-sm text-gray-600">฿{item.menu_item.price} x {item.quantity}</p>
                  {item.selected_addons && item.selected_addons.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Add-ons: {item.selected_addons.map(addon => `${addon.name} (+฿${addon.price})`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="ml-4 font-bold">฿{item.total_price}</span>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>ยอดรวม:</span>
                <span className="text-green-600">฿{getTotalAmount()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      {cartItems.length > 0 && (
        <Card>
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

            <Button 
              onClick={generateQRCode}
              className="w-full"
              disabled={!pickupTime}
            >
              <QrCode className="w-4 h-4 mr-2" />
              สร้าง QR Code ชำระเงิน
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Section */}
      {showPayment && (
        <Card>
          <CardHeader>
            <CardTitle>ชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-bold mb-4">ยอดชำระ: ฿{getTotalAmount()}</p>
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
            </div>
            
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
              disabled={!receiptFile || isProcessing}
            >
              {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Addon Modal */}
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
    </div>
  );
};

export default OnlineShopSection;
