import { Capacitor } from '@capacitor/core';
import { StarPrinter } from '@/plugins/star-printer';
import type { StarPrinter as StarPrinterType } from '@/plugins/star-printer/definitions';

const SAVED_KEY = 'aile-star-printer-selected';

export const isNativeApp = () => Capacitor.isNativePlatform();
export const isStarPluginInstalled = () =>
  isNativeApp() && Capacitor.isPluginAvailable('StarPrinter');

export const NOT_INSTALLED_MSG =
  'แอปนี้ยังไม่ได้ติดตั้งตัวเชื่อมเครื่องพิมพ์ Star — ต้องรัน setup-star-printer ตอนทำแอป (ดูหน้า สร้างแอปมือถือ ขั้นตอนที่ 6)';

export const saveSelectedPrinter = (p: StarPrinterType) => {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(p)); } catch { /* ignore */ }
};
export const getSelectedPrinter = (): StarPrinterType | null => {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || 'null'); } catch { return null; }
};

/** Print plain text receipt via Star USB on native. Throws with a readable Thai message. */
export const printTextViaStar = async (text: string, imageBase64?: string): Promise<void> => {
  if (!isStarPluginInstalled()) throw new Error(NOT_INSTALLED_MSG);
  const saved = getSelectedPrinter();
  if (!saved) throw new Error('ยังไม่ได้เลือกเครื่องพิมพ์ — ไปที่ ระบบเครื่องพิมพ์ → Star Printer → ค้นหา แล้วเลือกเครื่อง');
  const status = await StarPrinter.getStatus().catch(() => ({ connected: false } as any));
  if (!status.connected) {
    const r = await StarPrinter.connect({ connectionType: saved.connectionType, deviceIdentifier: saved.portName });
    if (!r.connected) throw new Error('ไม่พบเครื่องพิมพ์ — ตรวจสาย USB/OTG และเปิดเครื่องพิมพ์');
  }
  const res = await StarPrinter.print({ data: text + '\n\n\n', imageBase64, cutType: 'PartialCut' });
  if (!res.success) throw new Error('เครื่องพิมพ์ไม่ตอบสนอง — ตรวจกระดาษและฝาเครื่อง');
};
