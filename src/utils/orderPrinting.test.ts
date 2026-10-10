import { describe, it, expect } from 'vitest';
import { buildPrintDocs, PrintableOrder } from './orderPrinting';

const order: PrintableOrder = {
  orderNumber: 'ORD1', total: 120,
  items: [{ name: 'Latte', quantity: 2, total: 100 }, { name: 'Tea', quantity: 1, total: 20 }],
};
const count = (docs: any[], k: string) => docs.filter(d => d.kind === k).length;

describe('buildPrintDocs', () => {
  it('prints customer copies per setting', () => {
    expect(count(buildPrintDocs(order, { customerReceiptCopies: 2, autoShopCopy: false }), 'customer')).toBe(2);
  });
  it('skips kitchen when auto shop copy off', () => {
    expect(count(buildPrintDocs(order, { autoShopCopy: false }), 'kitchen')).toBe(0);
  });
  it('prints kitchen when on', () => {
    expect(count(buildPrintDocs(order, { autoShopCopy: true, shopReceiptCopies: 1 }), 'kitchen')).toBe(1);
  });
  it('skips stickers unless enabled and auto', () => {
    expect(count(buildPrintDocs(order, { stickerEnabled: true, autoSticker: false }), 'sticker')).toBe(0);
  });
  it('one sticker per cup', () => {
    expect(count(buildPrintDocs(order, { stickerEnabled: true, autoSticker: true, stickerCopies: 1 }), 'sticker')).toBe(3);
  });
  it('reprint gives one customer copy only', () => {
    const d = buildPrintDocs(order, { customerReceiptCopies: 3, stickerEnabled: true, autoSticker: true }, { reprint: true });
    expect(d.length).toBe(1);
    expect(d[0].text).toContain('สำเนา');
  });
});
