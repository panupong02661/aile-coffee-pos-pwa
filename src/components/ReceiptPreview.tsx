
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/types';
import { ReceiptDocument, DEFAULT_RECEIPT_SETTINGS, ShopSettings, ReceiptSettings, WiFiVoucher } from './ReceiptDocument';
import { cacheReceiptSettings } from '@/utils/receiptSettingsCache';

interface ReceiptPreviewProps {
  cartItems?: CartItem[];
  totalAmount?: number;
  discountAmount?: number;
  itemDiscountAmount?: number;
  paymentMethod?: string;
  memberName?: string;
  memberPhone?: string;
  orderNumber?: string;
  queueNumber?: number | null;
  wifiVoucher?: WiFiVoucher | null;
  compact?: boolean;
}

const ReceiptPreview = ({ 
  cartItems = [], 
  totalAmount = 0,
  discountAmount = 0,
  itemDiscountAmount = 0,
  paymentMethod = '',
  memberName,
  memberPhone,
  orderNumber,
  queueNumber,
  wifiVoucher: propWifiVoucher,
  compact = false
}: ReceiptPreviewProps) => {
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wifiVoucher, setWifiVoucher] = useState<WiFiVoucher | null>(propWifiVoucher || null);
  const { shopId, currentShop, loading: shopLoading } = useCurrentShop();

  useEffect(() => {
    if (shopLoading) return;
    if (!shopId) {
      // ไม่มีสาขา: ใช้ค่าเริ่มต้น ไม่ดึงข้อมูลข้ามสาขา
      setShopSettings(null);
      setReceiptSettings(null);
      setIsLoading(false);
      return;
    }
    fetchSettings();
  }, [shopId, shopLoading, totalAmount, discountAmount, paymentMethod, memberName, memberPhone, orderNumber]);

  useEffect(() => {
    // Update wifi voucher if prop changes
    if (propWifiVoucher) {
      setWifiVoucher(propWifiVoucher);
    }
  }, [propWifiVoucher]);

  const fetchSettings = async () => {
    if (!shopId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      // Fetch shop settings filtered by shop_id
      const { data: shopData, error: shopErr } = await supabase
        .from('shop_settings')
        .select('*')
        .eq('shop_id', shopId)
        .limit(1)
        .maybeSingle();

      // Fetch receipt settings filtered by shop_id
      const { data: receiptData, error: receiptErr } = await supabase
        .from('receipt_settings')
        .select('*')
        .eq('shop_id', shopId)
        .limit(1)
        .maybeSingle();

      if (shopErr || receiptErr) {
        setLoadError(shopErr?.message || receiptErr?.message || null);
      }

      // WiFi voucher จะถูกส่งมาจาก prop เท่านั้น ไม่ fetch ใหม่
      setShopSettings(shopData as any);
      setReceiptSettings(receiptData as any);
      if (!shopErr && !receiptErr) cacheReceiptSettings(shopId, { shopSettings: shopData || { shop_name: currentShop?.shop_name || '' }, receiptSettings: { ...DEFAULT_RECEIPT_SETTINGS, ...receiptData } });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      setLoadError(error?.message || 'ไม่สามารถโหลดการตั้งค่าใบเสร็จได้');
    } finally {
      setIsLoading(false);
    }
  };

  // ใช้ค่าเริ่มต้นเมื่อสาขานี้ยังไม่ได้ตั้งค่า (ไม่ดึงของสาขาอื่น)
  const effectiveReceiptSettings: ReceiptSettings = receiptSettings || DEFAULT_RECEIPT_SETTINGS;
  const effectiveShopSettings: ShopSettings = shopSettings || {
    shop_name: currentShop?.shop_name || '',
  };
  const usingDefaults = !receiptSettings || !shopSettings;

  if (shopLoading || isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">กำลังโหลดตัวอย่างใบเสร็จ...</div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className={compact ? "border-0 shadow-none" : ""}>
      <CardContent className={compact ? "p-2" : "pt-6"}>
        {(usingDefaults || loadError) && (
          <div className="mx-auto mb-2 max-w-sm rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            {loadError
              ? 'โหลดการตั้งค่าใบเสร็จไม่สำเร็จ กำลังแสดงรูปแบบเริ่มต้น'
              : 'สาขานี้ยังไม่ได้ตั้งค่าใบเสร็จ กำลังแสดงรูปแบบเริ่มต้น'}
          </div>
        )}
        <div className={compact ? "mx-auto max-w-[280px]" : "mx-auto max-w-sm"}>
          <ReceiptDocument cartItems={cartItems} totalAmount={totalAmount} discountAmount={discountAmount}
            itemDiscountAmount={itemDiscountAmount} paymentMethod={paymentMethod} memberName={memberName}
            memberPhone={memberPhone} orderNumber={orderNumber} queueNumber={queueNumber} wifiVoucher={wifiVoucher}
            shopSettings={effectiveShopSettings} receiptSettings={effectiveReceiptSettings} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptPreview;
