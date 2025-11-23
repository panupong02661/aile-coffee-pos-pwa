
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

interface ShopSettings {
  shop_name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  logo_url?: string;
}

interface ReceiptSettings {
  show_logo: boolean;
  show_shop_info: boolean;
  show_tax_id: boolean;
  show_date_time: boolean;
  show_order_number: boolean;
  show_item_details: boolean;
  show_total: boolean;
  show_payment_method: boolean;
  show_customer_info: boolean;
  footer_message?: string;
}

interface WiFiVoucher {
  username: string;
  password: string;
  qr_code_url: string | null;
}

const ReceiptPreview = () => {
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings | null>(null);
  const [wifiVoucher, setWifiVoucher] = useState<WiFiVoucher | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

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

      // Fetch a random unused WiFi voucher for preview
      const { data: voucherData } = await supabase
        .from('wifi_vouchers')
        .select('username, password, qr_code_url')
        .eq('is_used', false)
        .limit(1)
        .single();

      setShopSettings(shopData);
      setReceiptSettings(receiptData);
      setWifiVoucher(voucherData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const sampleItems = [
    { name: 'กาแฟอเมริกาโน่', quantity: 1, price: 45 },
    { name: 'คาปูชิโน่', quantity: 2, price: 55 },
    { name: 'ชาเขียวปั่น', quantity: 1, price: 60 }
  ];

  const subtotal = sampleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.07);
  const total = subtotal + tax;

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
      <CardHeader>
        <CardTitle>ตัวอย่างใบเสร็จ</CardTitle>
        <CardDescription>ดูตัวอย่างการแสดงผลใบเสร็จตามการตั้งค่าปัจจุบัน</CardDescription>
      </CardHeader>
      <CardContent>
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
          {receiptSettings.show_order_number && (
            <div className="text-xs mb-4">
              หมายเลขคำสั่งซื้อ: #001234
            </div>
          )}

          {/* Customer Info */}
          {receiptSettings.show_customer_info && (
            <div className="text-xs mb-4">
              ลูกค้า: คุณสมชาย ใจดี<br />
              โทร: 081-234-5678
            </div>
          )}

          <Separator className="my-4" />

          {/* Item Details */}
          {receiptSettings.show_item_details && (
            <div className="mb-4">
              <div className="text-xs font-bold mb-2">รายการสินค้า</div>
              {sampleItems.map((item, index) => (
                <div key={index} className="flex justify-between text-xs mb-1">
                  <div className="flex-1">
                    {item.name} x{item.quantity}
                  </div>
                  <div>{(item.price * item.quantity).toLocaleString()}</div>
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
              <div className="flex justify-between mb-1">
                <span>ภาษี (7%):</span>
                <span>{tax.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>รวมทั้งสิ้น:</span>
                <span>{total.toLocaleString()} บาท</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {receiptSettings.show_payment_method && (
            <div className="text-xs mt-4">
              ชำระด้วย: เงินสด<br />
              รับเงิน: {(total + 50).toLocaleString()} บาท<br />
              เงินทอน: 50 บาท
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
          {wifiVoucher && (
            <>
              <Separator className="my-4" />
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
                {wifiVoucher.qr_code_url && (
                  <div className="flex justify-center mt-2">
                    <img 
                      src={wifiVoucher.qr_code_url} 
                      alt="WiFi QR Code" 
                      className="w-24 h-24"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="text-center text-xs mt-4 text-gray-500">
            *** ใบเสร็จตัวอย่าง ***
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptPreview;
