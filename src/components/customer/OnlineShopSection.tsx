import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock,
  CreditCard,
  Coins,
  QrCode,
  Upload,
  CheckCircle
} from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_available: boolean;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  addon_group_id: string;
}

interface AddonGroup {
  id: string;
  name: string;
  is_required: boolean;
  max_selections: number;
  addons: Addon[];
}

interface CartItem {
  id: string;
  menu_item: MenuItem;
  quantity: number;
  selected_addons: Addon[];
  total_price: number;
}

interface ShopSettings {
  phone?: string;
}

const OnlineShopSection = ({ currentUser }: { currentUser?: any }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [pickupTime, setPickupTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'points' | 'transfer'>('cash');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [notes, setNotes] = useState('');
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [shopSettings, setShopSettings] = useState<ShopSettings>({});
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: 'Error',
          description: 'Failed to load menu items.',
          variant: 'destructive',
        });
      } else {
        setMenuItems(data || []);
      }
    };

    fetchMenuItems();
  }, [toast]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories.',
          variant: 'destructive',
        });
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    const fetchAddonGroups = async () => {
      const { data: addonGroupsData, error: addonGroupsError } = await supabase
        .from('addon_groups')
        .select(`
          *,
          addons (*)
        `);

      if (addonGroupsError) {
        console.error('Error fetching addon groups:', addonGroupsError);
        toast({
          title: 'Error',
          description: 'Failed to load addon groups.',
          variant: 'destructive',
        });
      } else {
        setAddonGroups(addonGroupsData || []);
      }
    };

    fetchAddonGroups();
  }, [toast]);

  useEffect(() => {
    const fetchShopSettings = async () => {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching shop settings:', error);
      } else {
        setShopSettings(data || {});
      }
    };

    fetchShopSettings();
  }, []);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching customer profile:', error);
        } else {
          setCustomerProfile(data || null);
        }
      }
    };

    fetchCustomerProfile();
  }, [user]);

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedAddons([]);

    const itemAddonGroups = addonGroups.filter(group => {
      return item.id === group.id;
    });

    if (itemAddonGroups.length > 0) {
      setShowAddonModal(true);
    } else {
      const newItem: CartItem = {
        id: `${item.id}_${Date.now()}_${Math.random()}`,
        menu_item: item,
        quantity: 1,
        selected_addons: [],
        item_discount: 0,
        item_discount_type: 'amount',
        total_price: item.price
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  const handleCloseAddonModal = () => {
    setSelectedItem(null);
    setSelectedAddons([]);
    setShowAddonModal(false);
  };

  const handleConfirmAddons = () => {
    if (!selectedItem) return;

    const addonPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = selectedItem.price + addonPrice;

    const newItem: CartItem = {
      id: `${selectedItem.id}_${Date.now()}_${Math.random()}`,
      menu_item: selectedItem,
      quantity: 1,
      selected_addons: selectedAddons,
      item_discount: 0,
      item_discount_type: 'amount',
      total_price: totalPrice
    };

    setCartItems(prev => [...prev, newItem]);
    handleCloseAddonModal();
  };

  const handleIncrement = (itemId: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: item.quantity + 1,
          total_price: (item.menu_item.price + item.selected_addons.reduce((sum, addon) => sum + addon.price, 0)) * (item.quantity + 1)
        };
      }
      return item;
    }));
  };

  const handleDecrement = (itemId: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId && item.quantity > 1) {
        return {
          ...item,
          quantity: item.quantity - 1,
          total_price: (item.menu_item.price + item.selected_addons.reduce((sum, addon) => sum + addon.price, 0)) * (item.quantity - 1)
        };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTotal = () => {
    let subtotal = calculateSubtotal();
    if (paymentMethod === 'points') {
      subtotal = Math.max(0, subtotal - pointsToUse);
    }
    return subtotal;
  };

  const handleUsePointsChange = (checked: boolean) => {
    setUsePoints(checked);
    if (!checked) {
      setPointsToUse(0);
    }
  };

  const handlePointsToUseChange = (value: number) => {
    if (!customerProfile) return;

    const maxPoints = customerProfile.points;
    const subtotal = calculateSubtotal();
    const availablePoints = Math.min(maxPoints, subtotal);

    const parsedValue = parseInt(value.toString());
    if (isNaN(parsedValue)) {
      setPointsToUse(0);
    } else {
      setPointsToUse(Math.min(parsedValue, availablePoints));
    }
  };

  const handleConfirmOrder = async () => {
    if (!user || !customerProfile) {
      toast({
        title: 'กรุณาเข้าสู่ระบบ',
        description: 'คุณต้องเข้าสู่ระบบก่อนทำการสั่งซื้อ',
        variant: 'destructive'
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'ตะกร้าสินค้าว่าง',
        description: 'กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ',
        variant: 'destructive'
      });
      return;
    }

    if (!pickupTime) {
      toast({
        title: 'กรุณาเลือกเวลารับสินค้า',
        description: 'คุณต้องเลือกเวลาที่ต้องการรับสินค้า',
        variant: 'destructive'
      });
      return;
    }

    if (paymentMethod === 'transfer' && !paymentSlip) {
      toast({
        title: 'กรุณาแนบสลิปการโอน',
        description: 'คุณต้องแนบสลิปการโอนเงินสำหรับการชำระผ่านโอนเงิน',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // สร้างเลขออเดอร์
      const orderNumber = `ON${Date.now()}`;
      
      // คำนวณยอดรวม
      const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
      const pointDiscount = paymentMethod === 'points' ? pointsToUse : 0;
      const totalAmount = Math.max(0, subtotal - pointDiscount);

      // อัพโหลดสลิปถ้ามี
      let slipUrl = null;
      if (paymentSlip) {
        const fileExt = paymentSlip.name.split('.').pop();
        const fileName = `${orderNumber}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, paymentSlip);

        if (uploadError) throw uploadError;
        slipUrl = uploadData.path;
      }

      // บันทึกออเดอร์
      const orderData = {
        order_number: orderNumber,
        customer_id: customerProfile.id,
        items: cartItems.map(item => ({
          id: item.id,
          menu_item_id: item.menu_item.id,
          name: item.menu_item.name,
          quantity: item.quantity,
          unit_price: item.menu_item.price,
          selected_addons: item.selected_addons,
          total_price: item.total_price
        })),
        subtotal,
        discount_amount: pointDiscount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'transfer' ? 'pending' : 'completed',
        order_status: 'pending',
        delivery_type: 'pickup',
        notes: notes || null,
        pickup_time: pickupTime,
        payment_slip_url: slipUrl
      };

      const { data: order, error: orderError } = await supabase
        .from('customer_orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // อัพเดตแต้มลูกค้า
      if (paymentMethod === 'points' && pointsToUse > 0) {
        const { error: pointsError } = await supabase
          .from('customer_profiles')
          .update({ 
            points: customerProfile.points - pointsToUse,
            total_spent: customerProfile.total_spent + totalAmount
          })
          .eq('id', customerProfile.id);

        if (pointsError) throw pointsError;

        // บันทึกประวัติการใช้แต้ม
        await supabase
          .from('customer_transactions')
          .insert({
            customer_id: customerProfile.id,
            order_id: order.id,
            amount: totalAmount,
            points_change: -pointsToUse,
            transaction_type: 'points_redemption',
            payment_method: paymentMethod,
            description: `ใช้แต้มแลกส่วนลด ออเดอร์ #${orderNumber}`
          });
      } else {
        // อัพเดตยอดซื้อรวม
        const { error: updateError } = await supabase
          .from('customer_profiles')
          .update({ 
            total_spent: customerProfile.total_spent + totalAmount
          })
          .eq('id', customerProfile.id);

        if (updateError) throw updateError;

        // บันทึกประวัติการทำธุรกรรม
        await supabase
          .from('customer_transactions')
          .insert({
            customer_id: customerProfile.id,
            order_id: order.id,
            amount: totalAmount,
            points_change: 0,
            transaction_type: 'purchase',
            payment_method: paymentMethod,
            description: `การสั่งซื้อออนไลน์ ออเดอร์ #${orderNumber}`
          });
      }

      // ส่งการแจ้งเตือนไปยัง 4 แพลตฟอร์ม
      const notificationData = {
        orderNumber,
        customerName: customerProfile.full_name,
        totalAmount,
        items: cartItems.map(item => ({
          name: item.menu_item.name,
          quantity: item.quantity,
          total: item.total_price
        })),
        createdAt: new Date().toISOString()
      };

      // เรียก edge function เพื่อส่งการแจ้งเตือน
      try {
        const { error: notificationError } = await supabase.functions.invoke('send-notifications', {
          body: {
            type: 'order',
            data: notificationData
          }
        });

        if (notificationError) {
          console.error('Notification error:', notificationError);
        }
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
        // ไม่ให้ error การแจ้งเตือนทำให้การสั่งซื้อล้มเหลว
      }

      // ล้างตะกร้าและรีเซ็ตฟอร์ม
      setCartItems([]);
      setPickupTime('');
      setPaymentMethod('cash');
      setUsePoints(false);
      setPointsToUse(0);
      setNotes('');
      setPaymentSlip(null);
      setShowQRCode(false);

      toast({
        title: 'สั่งซื้อสำเร็จ! 🎉',
        description: `ออเดอร์ #${orderNumber} ได้รับการยืนยันแล้ว กรุณารับสินค้าตามเวลาที่กำหนด`,
      });

      // รีเฟรชข้อมูลลูกค้า
      const { data: updatedProfile } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (updatedProfile) {
        setCustomerProfile(updatedProfile);
      }

    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentSlip(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>รายการอาหาร</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="category">เลือกหมวดหมู่:</Label>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="ทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {menuItems
              .filter(item => selectedCategory === 'all' || item.category_id === selectedCategory)
              .map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow duration-200">
                  <div className="relative">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    {!item.is_available && (
                      <Badge className="absolute top-2 left-2" variant="destructive">
                        ไม่พร้อมจำหน่าย
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                    <p className="text-gray-500">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xl font-bold">฿{item.price}</span>
                      <Button onClick={() => handleAddToCart(item)} disabled={!item.is_available}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        ใส่ตะกร้า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {showAddonModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>เลือก Add-ons สำหรับ {selectedItem.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addonGroups.filter(group => group.id === selectedItem.id).map(group => (
                <div key={group.id} className="space-y-2">
                  <Label>{group.name} {group.is_required && <span className="text-red-500">*</span>}</Label>
                  {group.addons.map(addon => (
                    <div key={addon.id} className="flex items-center justify-between">
                      <Label htmlFor={`addon-${addon.id}`} className="flex items-center space-x-2">
                        <Input
                          type="checkbox"
                          id={`addon-${addon.id}`}
                          checked={selectedAddons.some(a => a.id === addon.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddons(prev => [...prev, addon]);
                            } else {
                              setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
                            }
                          }}
                        />
                        <span>{addon.name} (+฿{addon.price})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={handleCloseAddonModal}>ยกเลิก</Button>
                <Button onClick={handleConfirmAddons}>ยืนยัน</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ตะกร้าสินค้า</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.length === 0 ? (
            <p>ไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.menu_item.image_url}
                      alt={item.menu_item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-semibold">{item.menu_item.name}</p>
                      {item.selected_addons.length > 0 && (
                        <div className="text-sm text-gray-500">
                          Add-ons: {item.selected_addons.map(addon => addon.name).join(', ')}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Button variant="outline" size="icon" onClick={() => handleDecrement(item.id)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => handleIncrement(item.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold">฿{item.total_price}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFromCart(item.id)}>
                      ลบ
                    </Button>
                  </div>
                </div>
              ))}
              <div className="font-bold text-xl">
                รวมทั้งหมด: ฿{calculateSubtotal()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดการสั่งซื้อ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pickup-time">เวลารับสินค้า:</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="time"
                id="pickup-time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">หมายเหตุ (ถ้ามี):</Label>
            <Textarea
              id="notes"
              placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ต้องการช้อนส้อมเพิ่ม"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <Label>วิธีการชำระเงิน:</Label>
            <div className="flex items-center space-x-4 mt-2">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
              >
                <Coins className="w-4 h-4 mr-2" />
                เงินสด
              </Button>
              {customerProfile?.points > 0 && (
                <Button
                  variant={paymentMethod === 'points' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('points')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  ใช้แต้ม ({customerProfile.points} แต้ม)
                </Button>
              )}
              <Button
                variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('transfer')}
              >
                <Upload className="w-4 h-4 mr-2" />
                โอนเงิน
              </Button>
            </div>
          </div>

          {paymentMethod === 'points' && customerProfile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-points">ใช้แต้มสะสม:</Label>
                <Input
                  type="number"
                  id="use-points"
                  placeholder="จำนวนแต้มที่ต้องการใช้"
                  value={pointsToUse}
                  onChange={(e) => handlePointsToUseChange(e.target.value)}
                  max={customerProfile.points}
                />
              </div>
              <p className="text-sm text-gray-500">
                คุณมี {customerProfile.points} แต้ม สามารถใช้ได้สูงสุด {Math.min(customerProfile.points, calculateSubtotal())} แต้ม
              </p>
              <div className="font-bold">
                ยอดรวมหลังหักแต้ม: ฿{calculateTotal()}
              </div>
            </div>
          )}

          {paymentMethod === 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="payment-slip">แนบสลิปการโอนเงิน:</Label>
              <Input
                type="file"
                id="payment-slip"
                accept="image/*"
                onChange={handlePaymentSlipChange}
              />
              {paymentSlip && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{paymentSlip.name}</span>
                </div>
              )}
              <Button variant="secondary" onClick={() => setShowQRCode(true)}>
                <QrCode className="w-4 h-4 mr-2" />
                แสดง QR Code
              </Button>
            </div>
          )}

          {showQRCode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle>QR Code สำหรับการโอนเงิน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QRCodeGenerator phoneNumber={shopSettings.phone || '0888888888'} amount={calculateTotal()} />
                  <p className="text-sm text-gray-500">
                    สแกน QR Code นี้เพื่อชำระเงินผ่าน Mobile Banking
                  </p>
                  <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => setShowQRCode(false)}>ปิด</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      
      {cartItems.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <Button 
              onClick={handleConfirmOrder}
              disabled={loading || !pickupTime || (paymentMethod === 'transfer' && !paymentSlip)}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  กำลังยืนยันออเดอร์...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  ยืนยันการสั่งซื้อ (ส่งแจ้งเตือนทันที)
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 text-center mt-2">
              การยืนยันจะส่งการแจ้งเตือนไปยัง LINE, Discord, Telegram และ Instagram
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnlineShopSection;
