
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, Clock, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import QRCodePromptPay from '@/components/QRCodePromptPay';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ShopSectionProps {
  currentUser: any;
  onOrderPlaced?: (orderData: any) => void;
}

interface CartItem {
  id: string;
  menu_item: any;
  quantity: number;
  selected_addons: any[];
  total_price: number;
}

interface AddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: any;
  addons: any[];
  onAddToCart: (menuItem: any, selectedAddons: any[]) => void;
}

const AddonModal: React.FC<AddonModalProps> = ({ isOpen, onClose, menuItem, addons, onAddToCart }) => {
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  if (!menuItem) return null;

  // Group addons by addon group
  const addonGroups = [...new Set(addons.map(addon => addon.addon_groups?.name).filter(Boolean))];

  const handleAddonToggle = (addon: any, groupName: string) => {
    const groupAddons = addons.filter(a => a.addon_groups?.name === groupName);
    const allowMultiple = groupAddons[0]?.addon_groups?.allow_multiple || false;

    if (allowMultiple) {
      setSelectedAddons(prev => 
        prev.find(a => a.id === addon.id)
          ? prev.filter(a => a.id !== addon.id)
          : [...prev, addon]
      );
    } else {
      setSelectedAddons(prev => [
        ...prev.filter(a => a.addon_groups?.name !== groupName),
        addon
      ]);
    }
  };

  const isAddonSelected = (addon: any) => {
    return selectedAddons.some(a => a.id === addon.id);
  };

  const handleAddToCart = () => {
    onAddToCart(menuItem, selectedAddons);
    setSelectedAddons([]);
    onClose();
  };

  const totalPrice = menuItem.price + selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">เลือกตัวเลือกสำหรับ {menuItem.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addonGroups.map(groupName => {
              if (!groupName) return null;
              const groupAddons = addons.filter(addon => addon.addon_groups?.name === groupName);
              const allowMultiple = groupAddons[0]?.addon_groups?.allow_multiple || false;
              const isRequired = groupAddons[0]?.addon_groups?.is_required || false;
              
              return (
                <div key={groupName} className="space-y-3">
                  <h3 className="font-bold text-lg text-coffee-800">
                    {groupName} {isRequired && <span className="text-red-500">*</span>}
                  </h3>
                  
                  <div className="space-y-2">
                    {groupAddons.map(addon => (
                      <Button
                        key={addon.id}
                        variant={isAddonSelected(addon) ? "default" : "outline"}
                        className={`w-full h-auto text-left justify-between p-2 text-sm ${
                          isAddonSelected(addon) 
                            ? 'bg-coffee-600 hover:bg-coffee-700 text-white' 
                            : 'hover:bg-coffee-50'
                        }`}
                        onClick={() => handleAddonToggle(addon, groupName)}
                      >
                        <span className="flex-1 text-left truncate pr-2">{addon.name}</span>
                        {Number(addon.price) > 0 && (
                          <span className="text-orange-600 font-medium flex-shrink-0">
                            +฿{Number(addon.price)}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">ราคารวม:</span>
              <span className="text-2xl font-bold text-coffee-600">฿{totalPrice}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 font-bold text-lg h-12"
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={handleAddToCart} 
                className="flex-1 bg-coffee-600 hover:bg-coffee-700 font-bold text-lg h-12"
              >
                เพิ่มลงตะกร้า
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ShopSection: React.FC<ShopSectionProps> = ({ currentUser, onOrderPlaced }) => {
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [addons, setAddons] = useState([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  
  // Payment and pickup states
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  // PromptPay settings
  const [promptPayPhone, setPromptPayPhone] = useState('');

  useEffect(() => {
    loadProducts();
    loadAddons();
    loadPromptPaySettings();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);

      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAddons = async () => {
    try {
      const { data, error } = await supabase
        .from('addons')
        .select(`
          *,
          addon_groups (
            id,
            name,
            is_required,
            allow_multiple
          )
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading addons:', error);
        return;
      }

      setAddons(data || []);
    } catch (error) {
      console.error('Error loading addons:', error);
    }
  };

  const loadPromptPaySettings = async () => {
    // Load PromptPay phone number from settings or use default
    const savedPhone = localStorage.getItem('promptpay-default-phone');
    if (savedPhone) {
      setPromptPayPhone(savedPhone);
    }
  };

  const getAddonGroupsForMenuItem = (menuItemId: string) => {
    // Get addon groups for this specific menu item
    return [];
  };

  const getAddonGroupsForCategory = (categoryId: string) => {
    // Get addon groups for the category
    return [];
  };

  const handleMenuItemClick = (menuItem: any) => {
    console.log('Menu item clicked:', menuItem);
    
    // Get relevant addons (simplified for now - you may want to add more complex logic)
    const relevantAddons = addons.filter(addon => addon.is_active);
    
    if (relevantAddons.length > 0) {
      setSelectedMenuItem(menuItem);
      setAvailableAddons(relevantAddons);
      setIsAddonModalOpen(true);
    } else {
      addToCart(menuItem, []);
    }
  };

  const addToCart = (menuItem: any, selectedAddons: any[]) => {
    const addonPrice = selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
    const totalPrice = menuItem.price + addonPrice;

    const newItem: CartItem = {
      id: `${menuItem.id}_${Date.now()}_${Math.random()}`,
      menu_item: menuItem,
      quantity: 1,
      selected_addons: selectedAddons,
      total_price: totalPrice
    };

    setCart(prev => [...prev, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const basePrice = item.menu_item.price + 
          item.selected_addons.reduce((sum, addon) => sum + Number(addon.price), 0);
        
        return {
          ...item,
          quantity: newQuantity,
          total_price: basePrice * newQuantity
        };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.total_price, 0);
  };

  const calculatePointsDiscount = () => {
    if (!usePoints || !currentUser) return 0;
    
    // Get member tier discount rules
    const maxPointsToRedeem = Math.min(pointsToUse, currentUser.points || 0);
    const discountValue = maxPointsToRedeem * 0.1; // 10 points = 1 baht
    
    return Math.min(discountValue, calculateSubtotal());
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const pointsDiscount = calculatePointsDiscount();
    return Math.max(0, subtotal - pointsDiscount);
  };

  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(startTime.getTime() + i * 30 * 60000); // Every 30 minutes
      const timeString = time.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      const dateString = time.toLocaleDateString('th-TH');
      times.push({
        value: time.toISOString(),
        label: `${dateString} ${timeString}`
      });
    }
    
    return times;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      setReceiptFile(file);
    }
  };

  const uploadReceiptToStorage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);

      if (!pickupTime) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'กรุณาเลือกเวลารับสินค้า',
          variant: 'destructive',
        });
        return;
      }

      if (paymentMethod === 'promptpay' && !receiptFile) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'กรุณาอัพโหลดสลิปการโอนเงิน',
          variant: 'destructive',
        });
        return;
      }

      let receiptUrl = null;
      if (receiptFile) {
        receiptUrl = await uploadReceiptToStorage(receiptFile);
      }

      const orderNumber = `ONL-${Date.now()}`;
      const subtotal = calculateSubtotal();
      const pointsDiscount = calculatePointsDiscount();
      const totalAmount = calculateTotal();

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('customer_orders')
        .insert({
          customer_id: currentUser?.id,
          order_number: orderNumber,
          items: cart,
          subtotal: subtotal,
          discount_amount: pointsDiscount,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'promptpay' ? 'pending' : 'completed',
          order_status: 'pending',
          delivery_type: 'pickup',
          notes: notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Update customer points if used
      if (usePoints && pointsToUse > 0 && currentUser) {
        const { error: pointsError } = await supabase
          .from('customer_profiles')
          .update({ 
            points: currentUser.points - Math.floor(pointsDiscount * 10)
          })
          .eq('id', currentUser.id);

        if (pointsError) {
          console.error('Error updating points:', pointsError);
        }
      }

      // Clear cart and close modal
      setCart([]);
      setIsCheckoutModalOpen(false);
      setReceiptFile(null);
      setNotes('');
      setPickupTime('');
      setUsePoints(false);
      setPointsToUse(0);

      // Send notification
      if (onOrderPlaced && orderData) {
        onOrderPlaced({
          order_number: orderData.order_number,
          customer_name: currentUser?.full_name || 'ลูกค้า',
          total: orderData.total_amount,
          items: cart.map(item => ({
            name: item.menu_item.name,
            quantity: item.quantity,
            price: item.total_price
          }))
        });
      }

      toast({
        title: 'สั่งซื้อสำเร็จ!',
        description: `หมายเลขออเดอร์: ${orderNumber}`,
      });

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสั่งซื้อได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pickupTimes = generatePickupTimes();

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Products Grid */}
      <Card>
        <CardHeader>
          <CardTitle>สินค้า</CardTitle>
          <CardDescription>เลือกสินค้าที่คุณต้องการ</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <Card key={product.id} className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => handleMenuItemClick(product)}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {product.image_url && (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    )}
                    <p className="text-coffee-600 font-bold text-lg mt-2">฿{product.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Shopping Cart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ตะกร้าสินค้า</CardTitle>
            <Badge variant="secondary">{cart.length} รายการ</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">ไม่มีสินค้าในตะกร้า</p>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.menu_item.name}</h4>
                      {item.selected_addons.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          เพิ่ม: {item.selected_addons.map(addon => addon.name).join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-medium">฿{item.total_price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>ยอดรวมย่อย:</span>
                  <span>฿{calculateSubtotal()}</span>
                </div>
                
                {usePoints && (
                  <div className="flex justify-between text-green-600">
                    <span>ส่วนลดจากแต้ม:</span>
                    <span>-฿{calculatePointsDiscount()}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg">
                  <span>ยอดชำระสุทธิ:</span>
                  <span className="text-coffee-600">฿{calculateTotal()}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => setIsCheckoutModalOpen(true)}
                disabled={cart.length === 0}
              >
                ดำเนินการสั่งซื้อ
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Addon Modal */}
      <AddonModal
        isOpen={isAddonModalOpen}
        onClose={() => {
          setIsAddonModalOpen(false);
          setSelectedMenuItem(null);
          setAvailableAddons([]);
        }}
        menuItem={selectedMenuItem}
        addons={availableAddons}
        onAddToCart={(menuItem, selectedAddons) => {
          addToCart(menuItem, selectedAddons);
          setIsAddonModalOpen(false);
          setSelectedMenuItem(null);
          setAvailableAddons([]);
        }}
      />

      {/* Checkout Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ยืนยันการสั่งซื้อ</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Pickup Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="pickup-time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                เลือกเวลารับสินค้า
              </Label>
              <Select value={pickupTime} onValueChange={setPickupTime}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเวลารับสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {pickupTimes.map(time => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>วิธีการชำระเงิน</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cash"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Label htmlFor="cash">เงินสด (ชำระเมื่อรับสินค้า)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="promptpay"
                    name="payment"
                    value="promptpay"
                    checked={paymentMethod === 'promptpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Label htmlFor="promptpay">โอนเงินผ่าน PromptPay</Label>
                </div>
              </div>
            </div>

            {/* Points Redemption */}
            {currentUser?.points > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-points"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                  />
                  <Label htmlFor="use-points">
                    ใช้แต้มสะสม (มีแต้ม {currentUser.points} แต้ม)
                  </Label>
                </div>
                
                {usePoints && (
                  <div className="space-y-2">
                    <Label htmlFor="points-input">จำนวนแต้มที่ต้องการใช้</Label>
                    <Input
                      id="points-input"
                      type="number"
                      min="0"
                      max={Math.min(currentUser.points, calculateSubtotal() * 10)}
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(Number(e.target.value))}
                      placeholder="กรอกจำนวนแต้ม"
                    />
                    <p className="text-sm text-muted-foreground">
                      10 แต้ม = 1 บาท (สูงสุด {Math.min(currentUser.points, calculateSubtotal() * 10)} แต้ม)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PromptPay QR Code */}
            {paymentMethod === 'promptpay' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">สแกน QR Code เพื่อชำระเงิน</h3>
                  <QRCodePromptPay 
                    amount={calculateTotal()} 
                    defaultPhoneNumber={promptPayPhone}
                    compact={true}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    ยอดที่ต้องชำระ: ฿{calculateTotal()}
                  </p>
                </div>

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <Label htmlFor="receipt-upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    อัพโหลดสลิปการโอนเงิน
                  </Label>
                  <Input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  {receiptFile && (
                    <p className="text-sm text-green-600">
                      ไฟล์ที่เลือก: {receiptFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">หมายเหตุเพิ่มเติม (ถ้ามี)</Label>
              <Textarea
                id="notes"
                placeholder="ระบุข้อมูลเพิ่มเติม..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>ยอดรวมย่อย:</span>
                <span>฿{calculateSubtotal()}</span>
              </div>
              {usePoints && pointsToUse > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>ส่วนลดจากแต้ม:</span>
                  <span>-฿{calculatePointsDiscount()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>ยอดชำระสุทธิ:</span>
                <span className="text-coffee-600">฿{calculateTotal()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={isLoading || !pickupTime || (paymentMethod === 'promptpay' && !receiptFile)}
                className="flex-1 bg-coffee-600 hover:bg-coffee-700"
              >
                {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopSection;
