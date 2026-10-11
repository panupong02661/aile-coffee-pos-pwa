import { isNativeApp, printTextViaStar } from '@/utils/nativeStarPrint';
import { toast } from 'sonner';
import type { CartItem } from '@/types';

export interface PrintableItem {
  name: string;
  quantity: number;
  total: number;
  addons?: string[];
  unitPrice?: number;
  addonDetails?: { name: string; price: number }[];
  itemDiscount?: number;
  itemDiscountType?: 'percent' | 'amount';
}

export interface PrintableOrder {
  orderNumber: string;
  shopName?: string;
  shopId?: string;
  cartItems?: CartItem[];
  itemDiscountAmount?: number;
  memberName?: string;
  memberPhone?: string;
  wifiVoucher?: { username: string; password: string; qr_code_url: string | null } | null;
  createdAt?: string | Date;
  orderType?: string;
  items: PrintableItem[];
  discount?: number;
  total: number;
  paymentMethod?: string;
  cashReceived?: number;
  change?: number;
  queueNumber?: number | null;
}

export interface PrintCopiesLike {
  customerReceiptCopies?: number;
  shopReceiptCopies?: number;
  autoShopCopy?: boolean;
  stickerEnabled?: boolean;
  autoSticker?: boolean;
  stickerCopies?: number;
}

export type DocKind = 'customer' | 'kitchen' | 'sticker';
export interface PrintDoc { kind: DocKind; text: string; image?: string }

export const printableCartItems = (o: PrintableOrder): CartItem[] => o.cartItems || o.items.map((item, index) => ({
  id: String(index),
  menu_item: { id: String(index), name: item.name, price: item.unitPrice ?? item.total / Math.max(1, item.quantity), category_id: '', is_available: true },
  quantity: item.quantity,
  selected_addons: (item.addonDetails || (item.addons || []).map(name => ({ name, price: 0 }))).map((addon, i) => ({
    id: `${index}:${i}`, name: addon.name, price: addon.price, category: 'other' as const, is_required: false, allow_multiple: true,
  })),
  item_discount: item.itemDiscount || 0,
  item_discount_type: item.itemDiscountType || 'amount',
  total_price: item.total,
}));

const TYPE_LABEL: Record<string, string> = { dine_in: 'ทานที่ร้าน', takeaway: 'นำกลับบ้าน', delivery: 'จัดส่ง' };
const PAY_LABEL: Record<string, string> = { cash: 'เงินสด', promptpay: 'พร้อมเพย์', qr: 'QR', points: 'แต้ม', card: 'บัตร', transfer: 'โอน' };
const LINE = '--------------------------------';

export const readPrintCopiesConfig = (): PrintCopiesLike => {
  try { return JSON.parse(localStorage.getItem('printCopiesConfig') || '{}'); } catch { return {}; }
};

const fmtDate = (d?: string | Date) => new Date(d || Date.now()).toLocaleString('th-TH');

export const customerReceiptText = (o: PrintableOrder, reprint = false) => {
  const out: string[] = [];
  if (o.shopName) out.push(o.shopName);
  if (reprint) out.push(`*** สำเนา (พิมพ์ซ้ำ) ${fmtDate()} ***`);
  out.push(`เลขที่: ${o.orderNumber}`, `วันที่: ${fmtDate(o.createdAt)}`);
  if (o.queueNumber) out.push(`คิว: #${String(o.queueNumber).padStart(3, '0')}`);
  if (o.orderType) out.push(TYPE_LABEL[o.orderType] || o.orderType);
  out.push(LINE);
  o.items.forEach(i => {
    out.push(`${i.name} x${i.quantity}   ${i.total.toFixed(2)}`);
    (i.addons || []).forEach(a => out.push(`  + ${a}`));
  });
  out.push(LINE);
  if (o.discount) out.push(`ส่วนลด: -${o.discount.toFixed(2)}`);
  out.push(`รวมทั้งสิ้น: ${o.total.toFixed(2)} บาท`);
  if (o.paymentMethod) out.push(`ชำระโดย: ${PAY_LABEL[o.paymentMethod] || o.paymentMethod}`);
  if (o.cashReceived != null && o.paymentMethod === 'cash') {
    out.push(`รับเงิน: ${o.cashReceived.toFixed(2)}`, `เงินทอน: ${(o.change ?? 0).toFixed(2)}`);
  }
  out.push(LINE, 'ขอบคุณที่ใช้บริการ', '', '');
  return out.join('\n');
};

export const kitchenText = (o: PrintableOrder) => {
  const out = ['ใบสั่งครัว', `#${o.orderNumber}`, fmtDate(o.createdAt)];
  if (o.queueNumber) out.push(`คิว #${String(o.queueNumber).padStart(3, '0')}`);
  if (o.orderType) out.push(TYPE_LABEL[o.orderType] || o.orderType);
  out.push(LINE);
  o.items.forEach(i => {
    out.push(`${i.name}  x${i.quantity}`);
    (i.addons || []).forEach(a => out.push(`  + ${a}`));
  });
  out.push(LINE, `รวม ${o.items.reduce((s, i) => s + i.quantity, 0)} รายการ`, '', '');
  return out.join('\n');
};

export const stickerTexts = (o: PrintableOrder): string[] => {
  const totalCups = o.items.reduce((s, i) => s + i.quantity, 0);
  const res: string[] = [];
  let n = 0;
  o.items.forEach(i => {
    for (let q = 0; q < i.quantity; q++) {
      n++;
      res.push([`#${o.orderNumber}  (${n}/${totalCups})`, i.name, ...(i.addons || []).map(a => `+ ${a}`), ''].join('\n'));
    }
  });
  return res;
};

/** เลือกเอกสารที่จะพิมพ์ตามค่าตั้ง "จำนวนการพิมพ์" */
export const buildPrintDocs = (o: PrintableOrder, cfg: PrintCopiesLike, opts: { reprint?: boolean } = {}): PrintDoc[] => {
  if (opts.reprint) return [{ kind: 'customer', text: customerReceiptText(o, true) }];
  const docs: PrintDoc[] = [];
  const cust = Math.max(0, cfg.customerReceiptCopies ?? 1);
  for (let i = 0; i < cust; i++) docs.push({ kind: 'customer', text: customerReceiptText(o) });
  if (cfg.autoShopCopy ?? true) {
    const k = Math.max(0, cfg.shopReceiptCopies ?? 1);
    for (let i = 0; i < k; i++) docs.push({ kind: 'kitchen', text: kitchenText(o) });
  }
  if (cfg.stickerEnabled && cfg.autoSticker) {
    const copies = Math.max(1, cfg.stickerCopies ?? 1);
    const stickers = stickerTexts(o);
    for (let c = 0; c < copies; c++) stickers.forEach(t => docs.push({ kind: 'sticker', text: t }));
  }
  return docs;
};

const escapeHtml = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));

const browserPrint = async (docs: PrintDoc[]) => {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(iframe);
  const html = docs.map(d => d.image ? `<div class="doc"><img src="${d.image}" /></div>` : `<pre class="doc">${escapeHtml(d.text)}</pre>`).join('');
  const doc = iframe.contentDocument;
  if (!doc) { iframe.remove(); throw new Error('เปิดหน้าพิมพ์ไม่ได้'); }
  doc.open();
  doc.write(`<html><head><title>ใบเสร็จ</title><style>@page{size:80mm auto;margin:0}body{margin:0;width:72mm;font-family:sans-serif;font-size:12px}.doc{white-space:pre-wrap;font-family:inherit;margin:0;break-after:page}.doc:last-child{break-after:auto}img{display:block;width:100%;height:auto}</style></head><body>${html}</body></html>`);
  doc.close();
  try {
    await Promise.all(Array.from(doc.images).map(img => img.decode()));
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  } finally { setTimeout(() => iframe.remove(), 60000); }
};

const printedOrders = new Set<string>();

export const printOrderDocuments = async (o: PrintableOrder, opts: { reprint?: boolean } = {}) => {
  const key = `${o.shopId || ''}:${o.orderNumber}`;
  if (!opts.reprint) {
    if (printedOrders.has(key)) return;
    printedOrders.add(key);
  }
  const docs = buildPrintDocs(o, readPrintCopiesConfig(), opts);
  if (docs.length === 0) return;
  try {
    const { renderReceiptImage } = await import('./receiptPrintRenderer');
    const images = new Map<DocKind, string>();
    for (const d of docs) {
      if (d.kind === 'sticker') continue;
      let image = images.get(d.kind);
      if (!image) {
        image = await renderReceiptImage(o, d.kind, opts.reprint);
        images.set(d.kind, image);
      }
      d.image = image;
    }
    if (isNativeApp()) {
      for (const d of docs) await printTextViaStar(d.text, d.image);
    } else {
      await browserPrint(docs);
    }
  } catch (e: any) {
    printedOrders.delete(key);
    toast.error('พิมพ์ใบเสร็จไม่ได้', { description: e?.message || String(e), duration: 10000 });
  }
};
