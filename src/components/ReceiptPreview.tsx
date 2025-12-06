
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/types';

interface ShopSettings {
  shop_name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  logo_url?: string;
  wifi_header_text?: string;
  wifi_footer_text?: string;
}

interface ReceiptSettings {
  show_logo: boolean;
  show_shop_info: boolean;
  show_tax_id: boolean;
  show_date_time: boolean;
  show_order_number: boolean;
  show_item_details: boolean;
  show_total: boolean;
  show_tax: boolean;
  show_payment_method: boolean;
  show_customer_info: boolean;
  show_wifi_voucher: boolean;
  show_wifi_qr: boolean;
  footer_message?: string;
}

interface WiFiVoucher {
  username: string;
  password: string;
  qr_code_url: string | null;
}

interface ReceiptPreviewProps {
  cartItems?: CartItem[];
  totalAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  memberName?: string;
  memberPhone?: string;
  orderNumber?: string;
  wifiVoucher?: WiFiVoucher | null;
}

const ReceiptPreview = ({ 
  cartItems = [], 
  totalAmount = 0,
  discountAmount = 0,
  paymentMethod = '',
  memberName,
  memberPhone,
  orderNumber,
  wifiVoucher: propWifiVoucher
}: ReceiptPreviewProps) => {
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings | null>(null);
  const [wifiVoucher, setWifiVoucher] = useState<WiFiVoucher | null>(propWifiVoucher || null);

  useEffect(() => {
    fetchSettings();
  }, [totalAmount, discountAmount, paymentMethod, memberName, memberPhone, orderNumber]);

  useEffect(() => {
    // Update wifi voucher if prop changes
    if (propWifiVoucher) {
      setWifiVoucher(propWifiVoucher);
    }
  }, [propWifiVoucher]);

  const fetchSettings = async () => {
    try {
      // Fetch shop settings
      const { data: shopData } = await supabase
        .from('shop_settings')
        .select('*')
        .limit(1)
        .single();

      // Fetch receipt settings
      const { data: receiptData } = await supabase
        .from('receipt_settings')
        .select('*')
        .limit(1)
        .single();

      // WiFi voucher จะถูกส่งมาจาก prop เท่านั้น ไม่ fetch ใหม่
      // เพื่อให้แสดง voucher ที่ถูกต้องตาม price tier และสถานะที่ใช้ไปแล้ว

      setShopSettings(shopData);
      setReceiptSettings(receiptData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Calculate from actual cart items
  const subtotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.menu_item.price * item.quantity;
    const addonsTotal = (item.selected_addons || []).reduce((addonSum, addon) => 
      addonSum + addon.price, 0
    );
    return sum + itemTotal + addonsTotal;
  }, 0);
  
  const tax = Math.round(subtotal * 0.07);
  const total = totalAmount || (subtotal + tax - discountAmount);

  if (!shopSettings || !receiptSettings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">กำลังโหลดตัวอย่างใบเสร็จ...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="max-w-sm mx-auto bg-white border-2 border-dashed border-gray-300 p-6 font-mono text-sm">
          {/* Logo */}
          {receiptSettings.show_logo && shopSettings.logo_url && (
            <div className="text-center mb-4">
              <img
                src={shopSettings.logo_url}
                alt="Logo"
                className="w-16 h-16 mx-auto object-contain"
              />
            </div>
          )}

          {/* Shop Info */}
          {receiptSettings.show_shop_info && (
            <div className="text-center mb-4">
              <div className="font-bold text-lg">{shopSettings.shop_name}</div>
              {shopSettings.address && (
                <div className="text-xs mt-1">{shopSettings.address}</div>
              )}
              {shopSettings.phone && (
                <div className="text-xs">โทร: {shopSettings.phone}</div>
              )}
              {shopSettings.email && (
                <div className="text-xs">Email: {shopSettings.email}</div>
              )}
            </div>
          )}

          {/* Tax ID */}
          {receiptSettings.show_tax_id && shopSettings.tax_id && (
            <div className="text-center text-xs mb-4">
              เลขประจำตัวผู้เสียภาษี: {shopSettings.tax_id}
            </div>
          )}

          <Separator className="my-4" />

          {/* Date and Time */}
          {receiptSettings.show_date_time && (
            <div className="text-xs mb-2">
              วันที่: {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')}
            </div>
          )}

          {/* Order Number */}
          {receiptSettings.show_order_number && orderNumber && (
            <div className="text-xs mb-4">
              หมายเลขคำสั่งซื้อ: #{orderNumber}
            </div>
          )}

          {/* Customer Info */}
          {receiptSettings.show_customer_info && (memberName || memberPhone) && (
            <div className="text-xs mb-4">
              {memberName && <>ลูกค้า: {memberName}<br /></>}
              {memberPhone && <>โทร: {memberPhone}</>}
            </div>
          )}

          <Separator className="my-4" />

          {/* Item Details */}
          {receiptSettings.show_item_details && cartItems.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold mb-2">รายการสินค้า</div>
              {cartItems.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex-1">
                      {item.menu_item.name} x{item.quantity}
                    </div>
                    <div>{(item.menu_item.price * item.quantity).toLocaleString()}</div>
                  </div>
                  {item.selected_addons && item.selected_addons.length > 0 && (
                    <div className="ml-4">
                      {item.selected_addons.map((addon, addonIndex) => (
                        <div key={addonIndex} className="flex justify-between text-xs text-gray-600 mb-1">
                          <div className="flex-1">+ {addon.name}</div>
                          <div>{addon.price.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Separator className="my-4" />

          {/* Total */}
          {receiptSettings.show_total && (
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span>ยอดรวม:</span>
                <span>{subtotal.toLocaleString()} บาท</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between mb-1 text-red-600">
                  <span>ส่วนลด:</span>
                  <span>-{discountAmount.toLocaleString()} บาท</span>
                </div>
              )}
              {receiptSettings.show_tax && (
                <div className="flex justify-between mb-1">
                  <span>ภาษี (7%):</span>
                  <span>{tax.toLocaleString()} บาท</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>รวมทั้งสิ้น:</span>
                <span>{total.toLocaleString()} บาท</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {receiptSettings.show_payment_method && paymentMethod && (
            <div className="text-xs mt-4">
              ชำระด้วย: {paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'qr' ? 'QR Code' : 'PromptPay'}
            </div>
          )}

          <Separator className="my-4" />

          {/* Footer Message */}
          {receiptSettings.footer_message && (
            <div className="text-center text-xs mt-4">
              {receiptSettings.footer_message}
            </div>
          )}

          {/* WiFi Voucher Section */}
          {wifiVoucher && receiptSettings.show_wifi_voucher && (
            <>
              <Separator className="my-4" />
              {shopSettings?.wifi_header_text && (
                <div className="text-center text-xs mb-2">
                  {shopSettings.wifi_header_text}
                </div>
              )}
              <div className="border-2 border-red-600 rounded-lg p-3 mt-4">
                <div className="text-center text-red-600 font-bold text-sm mb-2">
                  บัตรใช้งานอินเทอร์เน็ต
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="text-red-600">ชื่อผู้ใช้</div>
                  <div className="text-red-600">รหัสผ่าน</div>
                  <div className="font-mono font-bold">{wifiVoucher.username}</div>
                  <div className="font-mono font-bold">{wifiVoucher.password}</div>
                </div>
                {wifiVoucher.qr_code_url && receiptSettings.show_wifi_qr && (
                  <div className="flex justify-center mt-2">
                    <img 
                      src={wifiVoucher.qr_code_url} 
                      alt="WiFi QR Code" 
                      className="w-24 h-24"
                    />
                  </div>
                )}
              </div>
              {shopSettings?.wifi_footer_text && (
                <div className="text-center text-xs mt-2">
                  {shopSettings.wifi_footer_text}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptPreview;
