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
  
  const [gridColumns, setGridColumns] = useState(5);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  
  const { toast } = useToast();

  // Function to play notification bell for 7 seconds
  const playOrderSuccessNotification = async () => {
    try {
      console.log('🔔 Playing order confirmation notification for 7 seconds...');
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const totalDuration = 7; // 7 seconds
      const bellInterval = 0.8; // Interval between bell sounds
      const volume = 0.4; // Volume level
      
      let currentTime = audioContext.currentTime;
      const endTime = currentTime + totalDuration;
      
      console.log(`🔔 Playing notification bell for ${totalDuration} seconds`);
      
      // Create continuous bell sounds for 7 seconds
      while (currentTime < endTime) {
        // Create pleasant bell sound with 3 harmonious notes
        const bellFrequencies = [
          { freq: 523.25, delay: 0.0, duration: 0.6 },   // C5
          { freq: 659.25, delay: 0.15, duration: 0.5 },  // E5  
          { freq: 783.99, delay: 0.3, duration: 0.4 }    // G5
        ];
        
        bellFrequencies.forEach((note) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          // Add low-pass filter for softer sound
          const lowPassFilter = audioContext.createBiquadFilter();
          lowPassFilter.type = 'lowpass';
          lowPassFilter.frequency.value = 2000;
          
          oscillator.connect(lowPassFilter);
          lowPassFilter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = note.freq;
          oscillator.type = 'sine';
          
          const noteStartTime = currentTime + note.delay;
          const noteEndTime = noteStartTime + note.duration;
          
          // Create smooth bell sound envelope
          gainNode.gain.setValueAtTime(0, noteStartTime);
          gainNode.gain.linearRampToValueAtTime(volume, noteStartTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, noteEndTime);
          
          oscillator.start(noteStartTime);
          oscillator.stop(noteEndTime);
        });
        
        currentTime += bellInterval;
      }
      
      console.log(`✅ Order confirmation notification played for ${totalDuration} seconds`);
    } catch (error) {
      console.error('Notification sound failed:', error);
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
          fetchMembershipSettings()
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

  // Points calculation functions
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
      // Play notification sound for 7 seconds
      await playOrderSuccessNotification();

      let receiptUrl = null;
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile);
        if (!receiptUrl) {
          throw new Error('ไม่สามารถอัปโหลดสลีปได้');
        }
      }

      const orderNumber = generateOrderNumber();
      
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

      // Save order items
      for (const item of cartItems) {
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

      toast({ 
        title: 'สั่งซื้อสำเร็จ!', 
        description: `หมายเลขออเดอร์: ${orderNumber}` 
      });

      setCartItems([]);
      setPickupTime('');
      setCustomerNotes('');
      setReceiptFile(null);
      setShowPayment(false);
      setQrCodeUrl('');
      setPaymentMethod('qr');
      setPointsToUse('');
      
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

      {/* Menu Items Grid */}
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
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
          {filteredMenuItems.map(item => (
            <Card 
              key={item.id} 
              className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => handleAddToCart(item)}
            >
              <CardContent className="p-1.5">
                <div className="space-y-1.5 h-28 flex flex-col">
                  {item.image_url ? (
                    <div className="aspect-square w-full overflow-hidden rounded-md flex-shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                  
                  <div className="space-y-0.5 flex-1 flex flex-col">
                    <h3 className="font-medium text-xs leading-tight line-clamp-2 flex-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                    )}
                    <p className="text-xs font-bold text-green-600">฿{item.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

            {/* Points Payment Details */}
            {paymentMethod === 'points' && currentUser && (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg border">
                  <div className="text-sm text-purple-700 space-y-1">
                    <div className="font-medium text-purple-800">
                      สมาชิกระดับ{getTierDisplayName(currentUser.tier)}
                    </div>
                    <div>แต้มที่มี: {currentUser.points?.toLocaleString() || 0} แต้ม</div>
                    {getCurrentTierSettings() && (
                      <>
                        <div className="font-medium">
                          อัตราแลกแต้ม: {getCurrentTierSettings().points_to_redeem} แต้ม = ฿{getCurrentTierSettings().redeem_value}
                        </div>
                        <div>ขั้นต่ำการแลก: {getMinimumPoints()} แต้ม</div>
                        <div>สามารถใช้ได้สูงสุด: {getMaximumPoints().toLocaleString()} แต้ม</div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="pointsInput">จำนวนแต้มที่ต้องการใช้</Label>
                  <Input
                    id="pointsInput"
                    type="number"
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(e.target.value)}
                    min={getMinimumPoints()}
                    max={getMaximumPoints()}
                    placeholder={`ขั้นต่ำ ${getMinimumPoints()} แต้ม`}
                  />
                  {pointsToUse && (
                    <div className="mt-2 text-sm space-y-1">
                      <div className="text-purple-700 font-medium">
                        แต้มที่ใช้: {parseInt(pointsToUse).toLocaleString()} แต้ม = ฿{calculatePointsValue(parseInt(pointsToUse)).toLocaleString()}
                      </div>
                      <div className="text-orange-700 font-medium">
                        ยอดคงเหลือ: ฿{Math.max(0, getTotalAmount() - calculatePointsValue(parseInt(pointsToUse))).toLocaleString()}
                      </div>
                      <div className="text-gray-600">
                        แต้มคงเหลือ: {(currentUser.points - parseInt(pointsToUse)).toLocaleString()} แต้ม
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPointsToUse(getMaximumPoints().toString())}
                  className="w-full"
                >
                  ใช้แต้มสูงสุด ({getMaximumPoints().toLocaleString()} แต้ม)
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={async () => await playOrderSuccessNotification()}
                variant="outline"
                className="w-full"
              >
                🔊 ทดสอบเสียงแจ้งเตือน
              </Button>

              <Button 
                onClick={generateQRCode}
                className="w-full"
                disabled={!pickupTime}
              >
                <QrCode className="w-4 h-4 mr-2" />
                {paymentMethod === 'qr' ? 'สร้าง QR Code ชำระเงิน' : 'ดำเนินการชำระเงิน'}
              </Button>
            </div>
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
            {paymentMethod === 'qr' && (
              <>
                <div className="text-center">
                  <p className="text-lg font-bold mb-4">
                    ยอดชำระ: ฿{pointsToUse ? 
                      Math.max(0, getTotalAmount() - calculatePointsValue(parseInt(pointsToUse))).toLocaleString() : 
                      getTotalAmount().toLocaleString()
                    }
                  </p>
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
              </>
            )}

            {paymentMethod === 'points' && (
              <div className="text-center">
                <div className="p-4 bg-green-50 rounded-lg border">
                  <div className="text-green-800 space-y-2">
                    <div className="text-lg font-bold">ชำระด้วยแต้มสำเร็จ!</div>
                    <div>ใช้แต้ม: {pointsToUse} แต้ม</div>
                    <div>มูลค่า: ฿{calculatePointsValue(parseInt(pointsToUse || '0')).toLocaleString()}</div>
                    {getTotalAmount() - calculatePointsValue(parseInt(pointsToUse || '0')) > 0 && (
                      <div>ยอดคงเหลือ: ฿{(getTotalAmount() - calculatePointsValue(parseInt(pointsToUse || '0'))).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={submitOrder}
              className="w-full"
              disabled={isProcessing || (paymentMethod === 'qr' && qrCodeUrl && !receiptFile)}
            >
              {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Display Settings Modal */}
      {showDisplaySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                ตั้งค่าการแสดงผล
              </h3>
              <button
                onClick={() => setShowDisplaySettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  จำนวนคอลัมน์ ({gridColumns} คอลัมน์)
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={gridColumns}
                  onChange={(e) => setGridColumns(parseInt(e.target.value))}
                  className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((gridColumns - 1) / 7) * 100}%, #fed7aa ${((gridColumns - 1) / 7) * 100}%, #fed7aa 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                </div>
              </div>

              <button
                onClick={() => setShowDisplaySettings(false)}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

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
