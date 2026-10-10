import { isNativeApp, printTextViaStar } from '@/utils/nativeStarPrint';
import { toast } from 'sonner';

export interface PrintableItem {
  name: string;
  quantity: number;
  total: number;
  addons?: string[];
}

export interface PrintableOrder {
  orderNumber: string;
  shopName?: string;
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
export interface PrintDoc { kind: DocKind; text: string }

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

const escapeHtml = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));

const browserPrint = (docs: PrintDoc[]) => {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(iframe);
  const html = docs.map(d => `<pre class="doc">${escapeHtml(d.text)}</pre>`).join('');
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<html><head><style>@page{size:80mm auto;margin:0}body{margin:0;width:72mm;font-family:sans-serif;font-size:12px}.doc{white-space:pre-wrap;font-family:inherit;margin:2mm;page-break-after:always}</style></head><body>${html}</body></html>`);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 60000);
  }, 300);
};

const printedOrders = new Set<string>();

export const printOrderDocuments = async (o: PrintableOrder, opts: { reprint?: boolean } = {}) => {
  if (!opts.reprint) {
    if (printedOrders.has(o.orderNumber)) return;
    printedOrders.add(o.orderNumber);
  }
  const docs = buildPrintDocs(o, readPrintCopiesConfig(), opts);
  if (docs.length === 0) return;
  try {
    if (isNativeApp()) {
      for (const d of docs) await printTextViaStar(d.text);
    } else {
      browserPrint(docs);
    }
  } catch (e: any) {
    toast.error('พิมพ์ใบเสร็จไม่ได้', { description: e?.message || String(e), duration: 10000 });
  }
};
