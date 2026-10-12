import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/types';
import QRCode from 'qrcode';

export interface ShopSettings {
  shop_name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  logo_url?: string;
  wifi_header_text?: string;
  wifi_footer_text?: string;
}

export interface ReceiptSettings {
  show_logo: boolean;
  show_shop_info: boolean;
  show_shop_name: boolean;
  show_shop_address: boolean;
  show_shop_phone: boolean;
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
  show_queue_number: boolean;
  show_queue_qr: boolean;
  footer_message?: string;
}

export interface WiFiVoucher {
  username: string;
  password: string;
  qr_code_url: string | null;
}

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  show_logo: true,
  show_shop_info: true,
  show_shop_name: true,
  show_shop_address: true,
  show_shop_phone: true,
  show_tax_id: false,
  show_date_time: true,
  show_order_number: true,
  show_item_details: true,
  show_total: true,
  show_tax: false,
  show_payment_method: true,
  show_customer_info: true,
  show_wifi_voucher: true,
  show_wifi_qr: true,
  show_queue_number: true,
  show_queue_qr: false,
  footer_message: 'ขอบคุณที่ใช้บริการ',
};

export interface ReceiptDocumentProps {
  cartItems: CartItem[];
  totalAmount: number;
  discountAmount?: number;
  itemDiscountAmount?: number;
  paymentMethod?: string;
  memberName?: string;
  memberPhone?: string;
  orderNumber?: string;
  queueNumber?: number | null;
  wifiVoucher?: WiFiVoucher | null;
  shopSettings: ShopSettings;
  receiptSettings: ReceiptSettings;
  createdAt?: string | Date;
  reprint?: boolean;
}

export const shouldShowQueueNumber = (settings: ReceiptSettings, queueNumber?: number | null) =>
  settings.show_queue_number && Boolean(queueNumber);

export const shouldShowQueueQr = (settings: ReceiptSettings, queueNumber?: number | null) =>
  settings.show_queue_qr && Boolean(queueNumber);

export const ReceiptDocument = ({ cartItems, totalAmount, discountAmount = 0, itemDiscountAmount = 0,
  paymentMethod = '', memberName, memberPhone, orderNumber, queueNumber, wifiVoucher,
  shopSettings: effectiveShopSettings, receiptSettings: effectiveReceiptSettings, createdAt, reprint,
}: ReceiptDocumentProps) => {
  const date = new Date(createdAt || Date.now());
  const subtotal = cartItems.reduce((sum, item) => sum + item.menu_item.price * item.quantity +
    (item.selected_addons || []).reduce((sum, addon) => sum + addon.price, 0), 0);
  const tax = Math.round(subtotal * 0.07);
  const total = totalAmount;
  return <div data-receipt-document className="receipt-paper mx-auto w-full p-3 font-mono text-sm">
    {reprint && <div className="mb-2 text-center text-xs font-bold">สำเนา (พิมพ์ซ้ำ) {new Date().toLocaleString('th-TH')}</div>}
          {/* Logo */}
          {effectiveReceiptSettings.show_logo && effectiveShopSettings.logo_url && (
            <div className="text-center mb-4">
              <img
                src={effectiveShopSettings.logo_url}
                alt="Logo"
                className="w-24 h-24 mx-auto object-contain"
              />
            </div>
          )}

          {/* Shop Info */}
          {(effectiveReceiptSettings.show_shop_name || effectiveReceiptSettings.show_shop_address || effectiveReceiptSettings.show_shop_phone) && (
            <div className="text-center mb-4">
              {effectiveReceiptSettings.show_shop_name && (
                <div className="font-bold text-lg">{effectiveShopSettings.shop_name}</div>
              )}
              {effectiveReceiptSettings.show_shop_address && effectiveShopSettings.address && (
                <div className="text-xs mt-1">{effectiveShopSettings.address}</div>
              )}
              {effectiveReceiptSettings.show_shop_phone && effectiveShopSettings.phone && (
                <div className="text-xs">โทร: {effectiveShopSettings.phone}</div>
              )}
              {effectiveReceiptSettings.show_shop_name && effectiveShopSettings.email && (
                <div className="text-xs">Email: {effectiveShopSettings.email}</div>
              )}
            </div>
          )}

          {/* Tax ID */}
          {effectiveReceiptSettings.show_tax_id && effectiveShopSettings.tax_id && (
            <div className="text-center text-xs mb-4">
              เลขประจำตัวผู้เสียภาษี: {effectiveShopSettings.tax_id}
            </div>
          )}

          <Separator className="my-4" />

          {/* Date and Time */}
          {effectiveReceiptSettings.show_date_time && (
            <div className="text-xs mb-2">
              วันที่: {date.toLocaleDateString('th-TH')} {date.toLocaleTimeString('th-TH')}
            </div>
          )}

          {/* Order Number */}
          {effectiveReceiptSettings.show_order_number && orderNumber && (
            <div className="text-xs mb-2">
              หมายเลขคำสั่งซื้อ: #{orderNumber}
            </div>
          )}

          {/* Queue Number */}
          {shouldShowQueueNumber(effectiveReceiptSettings, queueNumber) && (
            <div className="text-center mb-4">
              <div className="inline-block border-2 border-dashed border-border rounded-lg px-4 py-2">
                <div className="text-xs text-muted-foreground">คิวของคุณ</div>
                <div className="text-2xl font-black">{String(queueNumber).padStart(3, '0')}</div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          {effectiveReceiptSettings.show_customer_info && (memberName || memberPhone) && (
            <div className="text-xs mb-4">
              {memberName && <>ลูกค้า: {memberName}<br /></>}
              {memberPhone && <>โทร: {memberPhone}</>}
            </div>
          )}

          <Separator className="my-4" />

          {/* Item Details */}
          {effectiveReceiptSettings.show_item_details && cartItems.length > 0 && (
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
                        <div key={addonIndex} className="flex justify-between text-xs text-muted-foreground mb-1">
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
          {effectiveReceiptSettings.show_total && (
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span>ยอดรวม:</span>
                <span>{subtotal.toLocaleString()} บาท</span>
              </div>
              {itemDiscountAmount > 0 && (
                <div className="flex justify-between mb-1 text-destructive">
                  <span>ส่วนลดรายการ:</span>
                  <span>-{itemDiscountAmount.toLocaleString()} บาท</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between mb-1 text-destructive">
                  <span>ส่วนลดท้ายบิล:</span>
                  <span>-{discountAmount.toLocaleString()} บาท</span>
                </div>
              )}
              {effectiveReceiptSettings.show_tax && (
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
          {effectiveReceiptSettings.show_payment_method && paymentMethod && (
            <div className="text-xs mt-4">
              ชำระด้วย: {paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'qr' ? 'QR Code' : 'PromptPay'}
            </div>
          )}

          <Separator className="my-4" />

          {/* Footer Message */}
          {effectiveReceiptSettings.footer_message && (
            <div className="text-center text-xs mt-4">
              {effectiveReceiptSettings.footer_message}
            </div>
          )}

          {/* WiFi Voucher Section */}
          {wifiVoucher && effectiveReceiptSettings.show_wifi_voucher && (
            <>
              <Separator className="my-4" />
              {effectiveShopSettings?.wifi_header_text && (
                <div className="text-center text-xs mb-2">
                  {effectiveShopSettings.wifi_header_text}
                </div>
              )}
              <div className="border-2 border-destructive rounded-lg p-3 mt-4">
                <div className="text-center text-destructive font-bold text-sm mb-2">
                  บัตรใช้งานอินเทอร์เน็ต
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="text-destructive">ชื่อผู้ใช้</div>
                  <div className="text-destructive">รหัสผ่าน</div>
                  <div className="font-mono font-bold">{wifiVoucher.username}</div>
                  <div className="font-mono font-bold">{wifiVoucher.password}</div>
                </div>
                {wifiVoucher.qr_code_url && effectiveReceiptSettings.show_wifi_qr && (
                  <div className="flex justify-center mt-2">
                    <img 
                      src={wifiVoucher.qr_code_url} 
                      alt="WiFi QR Code" 
                      className="w-24 h-24"
                    />
                  </div>
                )}
              </div>
              {effectiveShopSettings?.wifi_footer_text && (
                <div className="text-center text-xs mt-2">
                  {effectiveShopSettings.wifi_footer_text}
                </div>
              )}
            </>
          )}

          {/* Queue QR Code */}
          {shouldShowQueueQr(effectiveReceiptSettings, queueNumber) && (
            <QueueQRSection queueNumber={queueNumber as number} />
          )}
  </div>;
};

const QueueQRSection = ({ queueNumber }: { queueNumber: number }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  
  useEffect(() => {
    const url = `${window.location.origin}/queue-tracker?q=${queueNumber}`;
    QRCode.toDataURL(url, { width: 120, margin: 1 })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [queueNumber]);

  if (!qrDataUrl) return null;

  return (
    <>
      <Separator className="my-4" />
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-2">แสกน QR เพื่อติดตามคิว</div>
        <img src={qrDataUrl} alt="Queue QR" className="w-24 h-24 mx-auto" />
        <div className="text-[10px] text-muted-foreground mt-1">คิวที่ {String(queueNumber).padStart(3, '0')}</div>
      </div>
    </>
  );
};
