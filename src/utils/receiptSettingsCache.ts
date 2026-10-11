import type { ReceiptSettings, ShopSettings } from '@/components/ReceiptDocument';

export interface ReceiptSettingsSnapshot {
  shopSettings: ShopSettings;
  receiptSettings: ReceiptSettings;
}

export const cacheReceiptSettings = (shopId: string, settings: ReceiptSettingsSnapshot) => {
  try { localStorage.setItem(`receipt-print-settings:${shopId}`, JSON.stringify(settings)); } catch { /* storage unavailable */ }
};

export const readCachedReceiptSettings = (shopId?: string): ReceiptSettingsSnapshot | null => {
  if (!shopId) return null;
  try { return JSON.parse(localStorage.getItem(`receipt-print-settings:${shopId}`) || 'null'); } catch { return null; }
};