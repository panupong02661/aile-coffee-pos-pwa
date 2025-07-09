import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Clock, Upload, QrCode, Settings, X } from 'lucide-react';
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
  
  const [gridColumns, setGridColumns] = useState(5);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  
  const { toast } = useToast();

  // Function to play gentle beep notification sound for 5 seconds
  const playOrderSuccessBeep = async () => {
    try {
      console.log('🔊 Playing order success beep for 5 seconds...');
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const totalDuration = 5; // 5 seconds
      const beepFrequency = 600; // Gentle frequency
      const beepInterval = 0.7; // Interval between beeps
      const beepDuration = 0.12; // Duration of each beep
      
      // Gentle volume
      const volume = 0.3;
      
      let currentTime = audioContext.currentTime;
      const endTime = currentTime + totalDuration;
      
      console.log(`🔊 Playing gentle beeps for ${totalDuration} seconds`);
      
      // Create continuous gentle beeps for 5 seconds
      while (currentTime < endTime) {
        const beepOscillator = audioContext.createOscillator();
        const beepGainNode = audioContext.createGain();
        
        // Use low-pass filter for softer sound
        const lowPassFilter = audioContext.createBiquadFilter();
        lowPassFilter.type = 'lowpass';
        lowPassFilter.frequency.value = 1200;
        
        beepOscillator.connect(lowPassFilter);
        lowPassFilter.connect(beepGainNode);
        beepGainNode.connect(audioContext.destination);
        
        beepOscillator.frequency.setValueAtTime(beepFrequency, currentTime);
        beepOscillator.type = 'sine'; // Sine wave for gentle sound
        
        // Smooth envelope for gentle sound
        beepGainNode.gain.setValueAtTime(0, currentTime);
        beepGainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.02);
        beepGainNode.gain.setValueAtTime(volume, currentTime + beepDuration - 0.02);
        beepGainNode.gain.linearRampToValueAtTime(0, currentTime + beepDuration);
        
        beepOscillator.start(currentTime);
        beepOscillator.stop(currentTime + beepDuration);
        
        currentTime += beepInterval;
      }
      
      console.log(`✅ Gentle order success beep played for ${totalDuration} seconds`);
    } catch (error) {
      console.error('Order success beep failed:', error);
    }
  };

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
      const receiptUrl = await uploadReceipt(receiptFile);
      if (!receiptUrl) {
        throw new Error('ไม่สามารถอัปโหลดสลีปได้');
      }

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

      const pointsEarned = Math.floor(totalAmount);
      await supabase
        .from('members')
        .update({
          points: currentUser.points + pointsEarned,
          total_spent: currentUser.total_spent + totalAmount
        })
        .eq('id', currentUser.id);

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

      // Play gentle notification sound for 5 seconds when order is successful
      try {
        await playOrderSuccessBeep();
      } catch (soundError) {
        console.log('เสียงแจ้งเตือนเล่นไม่ได้:', soundError);
      }

      setCartItems([]);
      setPickupTime('');
      setCustomerNotes('');
      setReceiptFile(null);
      setShowPayment(false);
      setQrCodeUrl('');
      
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

            <div className="space-y-3">
              <Button 
                onClick={async () => await playOrderSuccessBeep()}
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
                สร้าง QR Code ชำระเงิน
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
