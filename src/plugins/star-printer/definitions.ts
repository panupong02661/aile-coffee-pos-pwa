
import { PluginListenerHandle } from '@capacitor/core';

export interface StarPrinterPlugin {
  // เชื่อมต่อเครื่องพิมพ์
  connect(options: { connectionType: 'USB' | 'Bluetooth' | 'LAN', deviceIdentifier?: string }): Promise<{ connected: boolean }>;
  
  // ตัดการเชื่อมต่อ
  disconnect(): Promise<{ disconnected: boolean }>;
  
  // ตรวจสอบสถานะการเชื่อมต่อ
  getStatus(): Promise<{ connected: boolean, deviceName?: string }>;
  
  // ค้นหาเครื่องพิมพ์ที่ใช้ได้
  searchPrinters(): Promise<{ printers: StarPrinter[] }>;
  
  // พิมพ์ข้อมูล
  print(options: { data: string, cutType?: 'NoCut' | 'PartialCut' | 'FullCut' }): Promise<{ success: boolean }>;
  
  // เปิด Cash Drawer
  openCashDrawer(): Promise<{ opened: boolean }>;
  
  // ตั้งค่าเครื่องพิมพ์
  configure(options: StarPrinterConfig): Promise<{ configured: boolean }>;
  
  // ฟังเหตุการณ์
  addListener(eventName: 'printerStatusChanged', listenerFunc: (status: StarPrinterStatus) => void): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export interface StarPrinter {
  portName: string;
  macAddress?: string;
  modelName: string;
  connectionType: 'USB' | 'Bluetooth' | 'LAN';
}

export interface StarPrinterConfig {
  paperWidth: number; // 48, 58, 80mm
  encoding: string;
  language: string;
  cashDrawerOpenActiveHigh?: boolean;
}

export interface StarPrinterStatus {
  connected: boolean;
  online: boolean;
  coverOpen?: boolean;
  cutterError?: boolean;
  paperEmpty?: boolean;
  drawerOpen?: boolean;
}
