import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import QRCodePromptPay from '@/components/QRCodePromptPay';
import { ShoppingCart, Receipt } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addons?: { name: string; price: number }[];
  discount?: number;
  discountType?: 'percent' | 'amount';
}

interface DisplayData {
  cartItems: CartItem[];
  totalAmount: number;
  billDiscount: number;
  billDiscountType: 'percent' | 'amount';
}

const CustomerDisplay = () => {
  const [displayData, setDisplayData] = useState<DisplayData>({
    cartItems: [],
    totalAmount: 0,
    billDiscount: 0,
    billDiscountType: 'amount'
  });
  const [promptPayPhone, setPromptPayPhone] = useState('');
  const [shopLogo, setShopLogo] = useState<string | undefined>();
  const [shopName, setShopName] = useState('');

  // Fetch shop settings
  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        // Get PromptPay phone from edge function
        const { data: phoneData } = await supabase.functions.invoke('get-promptpay-phone');
        if (phoneData?.phone) {
          setPromptPayPhone(phoneData.phone);
        }
        if (phoneData?.logo_url) {
          setShopLogo(phoneData.logo_url);
        }

        // Get shop name
        const { data: shopData } = await supabase
          .from('shop_settings')
          .select('shop_name, logo_url')
          .limit(1)
          .single();

        if (shopData) {
          setShopName(shopData.shop_name || 'ร้านค้า');
          if (!phoneData?.logo_url && shopData.logo_url) {
            setShopLogo(shopData.logo_url);
          }
        }
      } catch (error) {
        console.error('Error fetching shop settings:', error);
      }
    };

    fetchShopSettings();
  }, []);

  // Listen for cart updates via BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('customer-display');
    
    channel.onmessage = (event) => {
      console.log('📺 Customer Display received:', event.data);
      if (event.data.type === 'CART_UPDATE') {
        setDisplayData(event.data.payload);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Calculate item total including addons
  const calculateItemTotal = (item: CartItem) => {
    const addonsTotal = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
    const baseTotal = (item.price + addonsTotal) * item.quantity;
    
    if (item.discount && item.discount > 0) {
      if (item.discountType === 'percent') {
        return baseTotal * (1 - item.discount / 100);
      } else {
        return baseTotal - item.discount;
      }
    }
    return baseTotal;
  };

  // Calculate subtotal before bill discount
  const subtotal = displayData.cartItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  // Calculate final total after bill discount
  const finalTotal = displayData.billDiscount > 0
    ? displayData.billDiscountType === 'percent'
      ? subtotal * (1 - displayData.billDiscount / 100)
      : subtotal - displayData.billDiscount
    : subtotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        {shopLogo && (
          <img 
            src={shopLogo} 
            alt={shopName} 
            className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-4 border-white shadow-lg"
          />
        )}
        <h1 className="text-3xl font-bold text-coffee-800">{shopName}</h1>
        <p className="text-coffee-600 text-sm">รายการสินค้าของคุณ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Cart Items Section */}
        <Card className="border-coffee-200 shadow-lg">
          <CardHeader className="bg-coffee-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              รายการสินค้า ({displayData.cartItems.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {displayData.cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-coffee-400">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">ยังไม่มีสินค้าในตะกร้า</p>
                </div>
              ) : (
                <div className="divide-y divide-coffee-100">
                  {displayData.cartItems.map((item, index) => (
                    <div key={item.id || index} className="p-4 hover:bg-coffee-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-coffee-800 text-lg">
                            {item.name}
                          </h3>
                          <p className="text-coffee-600 text-sm">
                            ฿{item.price.toLocaleString()} x {item.quantity}
                          </p>
                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-1 text-xs text-coffee-500">
                              + {item.addons.map(a => `${a.name} (฿${a.price})`).join(', ')}
                            </div>
                          )}
                          {item.discount && item.discount > 0 && (
                            <div className="mt-1 text-xs text-red-500">
                              ส่วนลด: {item.discountType === 'percent' ? `${item.discount}%` : `฿${item.discount}`}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-coffee-800 text-lg">
                            ฿{calculateItemTotal(item).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="border-coffee-200 shadow-lg">
            <CardHeader className="bg-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                สรุปยอดชำระ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-coffee-700">
                <span>ยอดรวม</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              
              {displayData.billDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>ส่วนลด</span>
                  <span>
                    -{displayData.billDiscountType === 'percent' 
                      ? `${displayData.billDiscount}%` 
                      : `฿${displayData.billDiscount.toLocaleString()}`}
                  </span>
                </div>
              )}
              
              <div className="border-t border-coffee-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-coffee-800">ยอดที่ต้องชำระ</span>
                  <span className="text-3xl font-bold text-orange-600">
                    ฿{Math.max(0, finalTotal).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Payment */}
          <Card className="border-coffee-200 shadow-lg">
            <CardHeader className="bg-green-600 text-white rounded-t-lg">
              <CardTitle className="text-center">สแกนเพื่อชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <QRCodePromptPay
                amount={Math.max(0, finalTotal)}
                defaultPhoneNumber={promptPayPhone}
                compact={true}
                shopLogoUrl={shopLogo}
              />
              <p className="text-center text-sm text-coffee-600 mt-4">
                สแกน QR Code ด้วยแอป Banking หรือ PromptPay
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-coffee-500 text-sm">
        <p>ขอบคุณที่ใช้บริการ {shopName}</p>
      </div>
    </div>
  );
};

export default CustomerDisplay;
