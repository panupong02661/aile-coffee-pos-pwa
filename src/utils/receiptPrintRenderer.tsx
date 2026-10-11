import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import html2canvas from 'html2canvas';
import { ReceiptDocument, DEFAULT_RECEIPT_SETTINGS } from '@/components/ReceiptDocument';
import KitchenReceiptPreview from '@/components/KitchenReceiptPreview';
import { supabase } from '@/integrations/supabase/client';
import { cacheReceiptSettings, readCachedReceiptSettings } from './receiptSettingsCache';
import { printableCartItems, type PrintableOrder } from './orderPrinting';

const loadSettings = async (order: PrintableOrder) => {
  const cached = readCachedReceiptSettings(order.shopId);
  if (cached) return cached;
  const fallback = { shopSettings: { shop_name: order.shopName || '' }, receiptSettings: DEFAULT_RECEIPT_SETTINGS };
  if (!order.shopId || !navigator.onLine) return fallback;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const [shop, receipt] = await Promise.all([
      supabase.from('shop_settings').select('*').eq('shop_id', order.shopId).limit(1).abortSignal(controller.signal).maybeSingle(),
      supabase.from('receipt_settings').select('*').eq('shop_id', order.shopId).limit(1).abortSignal(controller.signal).maybeSingle(),
    ]);
    if (shop.error || receipt.error) return fallback;
    const settings = { shopSettings: shop.data || fallback.shopSettings, receiptSettings: { ...DEFAULT_RECEIPT_SETTINGS, ...receipt.data } };
    cacheReceiptSettings(order.shopId, settings);
    return settings;
  } catch { return fallback; } finally { clearTimeout(timeout); }
};

/** Capture the same React document shown in checkout, not a separately formatted text receipt. */
export const renderReceiptImage = async (order: PrintableOrder, kind: 'customer' | 'kitchen', reprint = false) => {
  const settings = await loadSettings(order);
  const host = document.createElement('div');
  host.className = 'receipt-paper';
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:288px;pointer-events:none';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    const cartItems = printableCartItems(order);
    flushSync(() => root.render(kind === 'customer'
      ? <ReceiptDocument {...settings} cartItems={cartItems} totalAmount={order.total}
          discountAmount={order.discount} itemDiscountAmount={order.itemDiscountAmount}
          paymentMethod={order.paymentMethod} memberName={order.memberName} memberPhone={order.memberPhone}
          orderNumber={order.orderNumber} queueNumber={order.queueNumber} wifiVoucher={order.wifiVoucher}
          createdAt={order.createdAt} reprint={reprint} />
      : <KitchenReceiptPreview cartItems={cartItems} orderType={order.orderType === 'takeaway' || order.orderType === 'delivery' ? order.orderType : 'dine_in'} createdAt={order.createdAt} />));
    await document.fonts.ready;
    // Allow QR effects and image loading to settle before rasterizing.
    await new Promise(resolve => setTimeout(resolve, 150));
    await Promise.race([
      Promise.all(Array.from(host.querySelectorAll('img')).map(img => img.decode().catch(() => undefined))),
      new Promise(resolve => setTimeout(resolve, 5000)),
    ]);
    const target = host.querySelector<HTMLElement>('[data-receipt-document]');
    if (!target) throw new Error('ไม่พบรูปแบบใบเสร็จ');
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, logging: false, imageTimeout: 5000,
      backgroundColor: getComputedStyle(host).backgroundColor });
    return canvas.toDataURL('image/png');
  } finally { root.unmount(); host.remove(); }
};