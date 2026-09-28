
import { useState, useEffect, useCallback } from 'react';
import { StarPrinter, StarPrinterStatus } from '@/plugins/star-printer';
import type { StarPrinter as StarPrinterType } from '@/plugins/star-printer/definitions';
import { useDevice } from './useDevice';
import { toast } from 'sonner';
import { isNativeApp, isStarPluginInstalled, NOT_INSTALLED_MSG, saveSelectedPrinter, getSelectedPrinter } from '@/utils/nativeStarPrint';

interface PrinterConnection {
  connected: boolean;
  deviceName?: string;
  portName?: string;
  modelName?: string;
  connectionType?: 'USB' | 'Bluetooth' | 'LAN';
}

interface ReceiptData {
  orderNumber: string;
  items: any[];
  total: number;
  payment: string;
  member?: any;
  shop: any;
}

export const useStarPrinter = () => {
  const [connection, setConnection] = useState<PrinterConnection>({ connected: false });
  const [availablePrinters, setAvailablePrinters] = useState<StarPrinterType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<StarPrinterStatus | null>(null);
  const { deviceInfo, isMobile } = useDevice();

  // ค้นหาเครื่องพิมพ์ที่ใช้ได้
  const searchPrinters = useCallback(async () => {
    if (isNativeApp() && !isStarPluginInstalled()) {
      toast.error(NOT_INSTALLED_MSG, { duration: 10000 });
      return;
    }
    setIsSearching(true);
    try {
      const result = await StarPrinter.searchPrinters();
      setAvailablePrinters(result.printers);
      if (result.printers.length === 0) {
        toast.error('ไม่พบเครื่องพิมพ์ — ตรวจสาย USB/OTG, เปิดเครื่องพิมพ์ และกด "อนุญาต" เมื่อแอปขอใช้ USB');
      } else {
        toast.success(`พบเครื่องพิมพ์ ${result.printers.length} เครื่อง`);
      }
    } catch (error) {
      console.error('Search printers error:', error);
      toast.error(`ไม่สามารถค้นหาเครื่องพิมพ์ได้: ${(error as any)?.message || error}`);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // เชื่อมต่อเครื่องพิมพ์
  const connectPrinter = useCallback(async (printer: StarPrinterType) => {
    try {
      const result = await StarPrinter.connect({
        connectionType: printer.connectionType,
        deviceIdentifier: printer.portName
      });

      if (result.connected) {
        saveSelectedPrinter(printer);
        setConnection({
          connected: true,
          deviceName: printer.modelName,
          portName: printer.portName,
          modelName: printer.modelName,
          connectionType: printer.connectionType
        });

        // กำหนดค่าเครื่องพิมพ์
        await StarPrinter.configure({
          paperWidth: 80, // TSP100III ใช้กระดาษ 80mm
          encoding: 'UTF-8',
          language: 'th-TH'
        });

        toast.success(`เชื่อมต่อ ${printer.modelName} สำเร็จ`);
      }
    } catch (error) {
      console.error('Connect printer error:', error);
      toast.error(`ไม่สามารถเชื่อมต่อเครื่องพิมพ์ได้: ${(error as any)?.message || error}`);
    }
  }, []);

  // ตัดการเชื่อมต่อ
  const disconnectPrinter = useCallback(async () => {
    try {
      await StarPrinter.disconnect();
      setConnection({ connected: false });
      toast.success('ตัดการเชื่อมต่อเครื่องพิมพ์แล้ว');
    } catch (error) {
      console.error('Disconnect printer error:', error);
    }
  }, []);

  // พิมพ์ใบเสร็จ
  const printReceipt = useCallback(async (receiptData: ReceiptData) => {
    if (!connection.connected) {
      toast.error('กรุณาเชื่อมต่อเครื่องพิมพ์ก่อน');
      return false;
    }

    setIsPrinting(true);
    try {
      // สร้างข้อมูลใบเสร็จในรูปแบบ Star commands
      const receiptText = generateStarCommands(receiptData);
      
      const result = await StarPrinter.print({
        data: receiptText,
        cutType: 'PartialCut'
      });

      if (result.success) {
        toast.success('พิมพ์ใบเสร็จสำเร็จ');
        return true;
      } else {
        throw new Error('Print failed');
      }
    } catch (error) {
      console.error('Print receipt error:', error);
      toast.error(`เกิดข้อผิดพลาดในการพิมพ์: ${(error as any)?.message || error}`);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [connection.connected]);

  // ทดสอบการพิมพ์
  const testPrint = useCallback(async () => {
    const testData = {
      orderNumber: 'TEST-001',
      items: [
        { name: 'ทดสอบการพิมพ์', quantity: 1, total: 0 }
      ],
      total: 0,
      payment: 'ทดสอบ',
      shop: {
        name: 'ร้านกาแฟทดสอบ',
        address: '123 ถนนทดสอบ',
        phone: '02-123-4567'
      }
    };

    return await printReceipt(testData);
  }, [printReceipt]);

  // เปิด Cash Drawer
  const openCashDrawer = useCallback(async () => {
    if (!connection.connected) {
      toast.error('กรุณาเชื่อมต่อเครื่องพิมพ์ก่อน');
      return false;
    }

    try {
      const result = await StarPrinter.openCashDrawer();
      if (result.opened) {
        toast.success('เปิดลิ้นชักเก็บเงินแล้ว');
        return true;
      }
    } catch (error) {
      console.error('Open cash drawer error:', error);
      toast.error('ไม่สามารถเปิดลิ้นชักได้');
    }
    return false;
  }, [connection.connected]);

  // ตรวจสอบสถานะเครื่องพิมพ์
  const checkStatus = useCallback(async () => {
    try {
      if (!isStarPluginInstalled()) return;
      let status = await StarPrinter.getStatus();
      const saved = getSelectedPrinter();
      if (!status.connected && saved) {
        const r = await StarPrinter.connect({ connectionType: saved.connectionType, deviceIdentifier: saved.portName }).catch(() => ({ connected: false }));
        if (r.connected) status = { connected: true, deviceName: saved.modelName };
      }
      setConnection(prev => ({
        ...prev,
        connected: status.connected,
        deviceName: status.deviceName
      }));
    } catch (error) {
      console.error('Check status error:', error);
    }
  }, []);

  // สร้าง Star printer commands
  const generateStarCommands = (data: ReceiptData): string => {
    let commands = '';
    
    // Initialize printer
    commands += '\x1B\x40'; // ESC @
    
    // Center alignment
    commands += '\x1B\x61\x01'; // ESC a 1
    
    // Bold on
    commands += '\x1B\x45'; // ESC E
    commands += `${data.shop.name}\n`;
    commands += '\x1B\x46'; // ESC F (bold off)
    
    // Normal alignment
    commands += '\x1B\x61\x00'; // ESC a 0
    commands += `${data.shop.address}\n`;
    commands += `โทร: ${data.shop.phone}\n`;
    commands += '================================\n';
    commands += `เลขที่: ${data.orderNumber}\n`;
    commands += `วันที่: ${new Date().toLocaleString('th-TH')}\n`;
    commands += '================================\n';
    
    // Items
    data.items.forEach(item => {
      commands += `${item.name} x${item.quantity}\n`;
      commands += `  ${item.total.toFixed(2)} บาท\n`;
    });
    
    commands += '================================\n';
    // Bold total
    commands += '\x1B\x45'; // ESC E
    commands += `รวม: ${data.total.toFixed(2)} บาท\n`;
    commands += '\x1B\x46'; // ESC F
    commands += `การชำระ: ${data.payment}\n`;
    
    if (data.member) {
      commands += `สมาชิก: ${data.member.name}\n`;
      commands += `แต้มสะสม: ${data.member.points}\n`;
    }
    
    commands += '================================\n';
    commands += '\x1B\x61\x01'; // Center
    commands += 'ขอบคุณที่ใช้บริการ\n';
    commands += '\x1B\x61\x00'; // Left align
    
    // Feed and cut
    commands += '\n\n\n';
    
    return commands;
  };

  // Setup listeners
  useEffect(() => {
    if (!isMobile || !isStarPluginInstalled()) return;

    const setupListeners = async () => {
      await StarPrinter.addListener('printerStatusChanged', (status) => {
        setPrinterStatus(status);
        setConnection(prev => ({
          ...prev,
          connected: status.connected
        }));
      });
    };

    setupListeners();

    return () => {
      StarPrinter.removeAllListeners();
    };
  }, [isMobile]);

  // Check initial status
  useEffect(() => {
    if (isMobile) {
      checkStatus();
    }
  }, [isMobile, checkStatus]);

  return {
    // Connection state
    connection,
    availablePrinters,
    printerStatus,
    
    // Loading states
    isSearching,
    isPrinting,
    
    // Actions
    searchPrinters,
    connectPrinter,
    disconnectPrinter,
    printReceipt,
    testPrint,
    openCashDrawer,
    checkStatus,
    
    // Utilities
    isReady: connection.connected && isMobile,
    pluginInstalled: isStarPluginInstalled(),
    isNative: isNativeApp(),
    requiresNativeApp: !isMobile
  };
};
