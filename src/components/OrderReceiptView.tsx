import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

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
  footer_message?: string;
}

interface OrderItem {
  id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_discount: number;
  selected_addons: any[];
}

interface OrderReceiptViewProps {
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  totalAmount: number;
  billDiscount?: number;
  paymentMethod: string;
  memberName?: string;
  memberPhone?: string;
}

const OrderReceiptView = ({
  orderNumber,
  orderDate,
  items,
  totalAmount,
  billDiscount = 0,
  paymentMethod,
  memberName,
  memberPhone
}: OrderReceiptViewProps) => {
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: shopData } = await supabase
        .from('shop_settings')
        .select('*')
        .limit(1)
        .single();

      const { data: receiptData } = await supabase
        .from('receipt_settings')
        .select('*')
        .limit(1)
        .single();

      setShopSettings(shopData);
      setReceiptSettings(receiptData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'card': return 'บัตรเครดิต';
      case 'mobile_banking': return 'โมบายแบงก์กิ้ง';
      case 'qr': return 'QR Code';
      case 'promptpay': return 'PromptPay';
      case 'points': return 'แลกแต้ม';
      default: return method;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total_price + (item.item_discount || 0), 0);
  const itemDiscountTotal = items.reduce((sum, item) => sum + (item.item_discount || 0), 0);

  // Preload image and convert to base64 for html2canvas compatibility
  const preloadImage = async (): Promise<void> => {
    if (!shopSettings?.logo_url || !receiptSettings?.show_logo) return;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails
      img.src = shopSettings.logo_url + '?t=' + Date.now(); // Cache bust
      // Timeout after 3 seconds
      setTimeout(() => resolve(), 3000);
    });
  };

  // Capture receipt as canvas with image support
  const captureReceipt = async (): Promise<HTMLCanvasElement | null> => {
    if (!receiptRef.current) return null;

    // Preload the logo image first
    await preloadImage();

    // Small delay to ensure image is rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    return html2canvas(receiptRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 5000,
    });
  };

  // Share functionality
  const handleShare = async () => {
    if (!receiptRef.current) return;

    try {
      toast.loading('กำลังสร้างรูปภาพ...');
      const canvas = await captureReceipt();
      toast.dismiss();

      if (!canvas) {
        toast.error('ไม่สามารถสร้างรูปภาพได้');
        return;
      }
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('ไม่สามารถสร้างรูปภาพได้');
          return;
        }

        const file = new File([blob], `receipt-${orderNumber}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `ใบเสร็จ ${orderNumber}`,
              text: `ใบเสร็จจาก ${shopSettings?.shop_name || 'ร้านค้า'}`,
              files: [file]
            });
            toast.success('แชร์สำเร็จ');
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              downloadImage(canvas);
            }
          }
        } else {
          downloadImage(canvas);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.dismiss();
      toast.error('เกิดข้อผิดพลาดในการแชร์');
    }
  };

  const downloadImage = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `receipt-${orderNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('ดาวน์โหลดรูปภาพสำเร็จ');
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    try {
      toast.loading('กำลังสร้างรูปภาพ...');
      const canvas = await captureReceipt();
      toast.dismiss();

      if (!canvas) {
        toast.error('ไม่สามารถสร้างรูปภาพได้');
        return;
      }

      downloadImage(canvas);
    } catch (error) {
      console.error('Error downloading:', error);
      toast.dismiss();
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลด');
    }
  };

  const handleCopyText = () => {
    const textContent = `
ใบเสร็จ - ${shopSettings?.shop_name || 'ร้านค้า'}
${shopSettings?.address || ''}
${shopSettings?.phone ? `โทร: ${shopSettings.phone}` : ''}
${shopSettings?.tax_id ? `เลขประจำตัวผู้เสียภาษี: ${shopSettings.tax_id}` : ''}
--------------------------------
วันที่: ${formatDate(orderDate)}
เลขที่ออเดอร์: ${orderNumber}
${memberName ? `ลูกค้า: ${memberName}` : ''}
${memberPhone ? `โทร: ${memberPhone}` : ''}
--------------------------------
รายการสินค้า:
${items.map(item => `${item.menu_item_name} x${item.quantity} = ฿${item.total_price.toLocaleString()}`).join('\n')}
--------------------------------
ยอดรวม: ฿${subtotal.toLocaleString()}
${itemDiscountTotal > 0 ? `ส่วนลดรายการ: -฿${itemDiscountTotal.toLocaleString()}` : ''}
${billDiscount > 0 ? `ส่วนลดท้ายบิล: -฿${billDiscount.toLocaleString()}` : ''}
--------------------------------
รวมทั้งสิ้น: ฿${totalAmount.toLocaleString()}
ชำระด้วย: ${getPaymentMethodText(paymentMethod)}
--------------------------------
${receiptSettings?.footer_message || 'ขอบคุณที่ใช้บริการ'}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    toast.success('คัดลอกข้อความสำเร็จ');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!shopSettings || !receiptSettings) {
    return (
      <div className="text-center py-4 text-muted-foreground">กำลังโหลดใบเสร็จ...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          แชร์
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          ดาวน์โหลด
        </Button>
        <Button onClick={handleCopyText} variant="outline" size="sm" className="gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
        </Button>
      </div>

      {/* Receipt Preview */}
      <div className="flex justify-center">
        <div 
          ref={receiptRef}
          className="bg-white border-2 border-dashed border-gray-300 font-mono text-sm max-w-[300px] p-4"
        >
          {/* Logo */}
          {receiptSettings.show_logo && shopSettings.logo_url && (
            <div className="text-center mb-3">
              <img
                src={shopSettings.logo_url}
                alt="Logo"
                className="w-14 h-14 mx-auto object-contain"
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Shop Info */}
          {(receiptSettings.show_shop_name || receiptSettings.show_shop_address || receiptSettings.show_shop_phone) && (
            <div className="text-center mb-3">
              {receiptSettings.show_shop_name && (
                <div className="font-bold text-base">{shopSettings.shop_name}</div>
              )}
              {receiptSettings.show_shop_address && shopSettings.address && (
                <div className="text-xs mt-1">{shopSettings.address}</div>
              )}
              {receiptSettings.show_shop_phone && shopSettings.phone && (
                <div className="text-xs">โทร: {shopSettings.phone}</div>
              )}
            </div>
          )}

          {/* Tax ID */}
          {receiptSettings.show_tax_id && shopSettings.tax_id && (
            <div className="text-center text-xs mb-3">
              เลขประจำตัวผู้เสียภาษี: {shopSettings.tax_id}
            </div>
          )}

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Date and Order Number */}
          {receiptSettings.show_date_time && (
            <div className="text-xs mb-1">
              วันที่: {formatDate(orderDate)}
            </div>
          )}

          {receiptSettings.show_order_number && (
            <div className="text-xs mb-2">
              เลขที่ออเดอร์: {orderNumber}
            </div>
          )}

          {/* Customer Info */}
          {receiptSettings.show_customer_info && (memberName || memberPhone) && (
            <div className="text-xs mb-2">
              {memberName && <div>ลูกค้า: {memberName}</div>}
              {memberPhone && <div>โทร: {memberPhone}</div>}
            </div>
          )}

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Item Details */}
          {receiptSettings.show_item_details && items.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-bold mb-1">รายการสินค้า</div>
              {items.map((item, index) => (
                <div key={index} className="mb-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex-1 pr-2">
                      {item.menu_item_name}
                    </div>
                    <div>฿{item.total_price.toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-500 pl-2">
                    จำนวน: {item.quantity} • ราคาต่อหน่วย: ฿{item.unit_price}
                  </div>
                  {(() => {
                    let addons = item.selected_addons;
                    if (typeof addons === 'string') {
                      try { addons = JSON.parse(addons); } catch { addons = []; }
                    }
                    return Array.isArray(addons) && addons.length > 0 ? (
                      <div className="pl-2">
                        {addons.map((addon: any, addonIndex: number) => (
                          <div key={addonIndex} className="flex justify-between text-xs text-gray-500">
                            <div>+ {addon.name}</div>
                            {addon.price > 0 && <div>฿{addon.price}</div>}
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  {item.item_discount > 0 && (
                    <div className="text-xs text-red-600 pl-2">
                      ส่วนลด: -฿{item.item_discount.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Total */}
          {receiptSettings.show_total && (
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span>ยอดรวม:</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              {itemDiscountTotal > 0 && (
                <div className="flex justify-between mb-1 text-red-600">
                  <span>ส่วนลดรายการ:</span>
                  <span>-฿{itemDiscountTotal.toLocaleString()}</span>
                </div>
              )}
              {billDiscount > 0 && (
                <div className="flex justify-between mb-1 text-red-600">
                  <span>ส่วนลดท้ายบิล:</span>
                  <span>-฿{billDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-gray-400 pt-1 mt-1">
                <span>รวมทั้งสิ้น:</span>
                <span>฿{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {receiptSettings.show_payment_method && (
            <div className="text-xs mt-2">
              ชำระด้วย: {getPaymentMethodText(paymentMethod)}
            </div>
          )}

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Footer Message */}
          {receiptSettings.footer_message && (
            <div className="text-center text-xs">
              {receiptSettings.footer_message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptView;
