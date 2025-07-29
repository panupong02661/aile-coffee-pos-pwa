
import { useState } from 'react';
import { useDevice } from './useDevice';
import { toast } from 'sonner';

interface PrinterSettings {
  connectionType: 'usb' | 'bluetooth' | 'network';
  deviceId?: string;
  deviceName?: string;
  ipAddress?: string;
  port?: number;
}

interface ReceiptData {
  orderNumber: string;
  items: any[];
  total: number;
  payment: string;
  member?: any;
  shop: any;
}

export const useMobilePrinter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>({
    connectionType: 'usb',
  });
  const { deviceInfo } = useDevice();

  const connectPrinter = async (settings: PrinterSettings) => {
    try {
      setIsPrinting(true);
      
      // Mock printer connection for demo
      // In real app, use Star SDK or similar
      if (deviceInfo?.platform === 'android') {
        // Android USB/Bluetooth connection logic
        console.log('Connecting to Android printer:', settings);
      } else if (deviceInfo?.platform === 'ios') {
        // iOS MFi certified printer connection
        console.log('Connecting to iOS printer:', settings);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate connection
      
      setPrinterSettings(settings);
      setIsConnected(true);
      toast.success('เชื่อมต่อเครื่องพิมพ์สำเร็จ');
      
      return true;
    } catch (error) {
      console.error('Printer connection error:', error);
      toast.error('เชื่อมต่อเครื่องพิมพ์ไม่สำเร็จ');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  const printReceipt = async (receiptData: ReceiptData) => {
    if (!isConnected) {
      toast.error('กรุณาเชื่อมต่อเครื่องพิมพ์ก่อน');
      return false;
    }

    try {
      setIsPrinting(true);
      
      // Generate receipt text
      const receiptText = generateReceiptText(receiptData);
      
      // Mock printing process
      console.log('Printing receipt:', receiptText);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate printing
      
      toast.success('พิมพ์ใบเสร็จสำเร็จ');
      return true;
    } catch (error) {
      console.error('Printing error:', error);
      toast.error('เกิดข้อผิดพลาดในการพิมพ์');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  const printReport = async (reportData: any) => {
    if (!isConnected) {
      toast.error('กรุณาเชื่อมต่อเครื่องพิมพ์ก่อน');
      return false;
    }

    try {
      setIsPrinting(true);
      
      // Generate report text
      const reportText = generateReportText(reportData);
      
      // Mock printing process
      console.log('Printing report:', reportText);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('พิมพ์รายงานสำเร็จ');
      return true;
    } catch (error) {
      console.error('Report printing error:', error);
      toast.error('เกิดข้อผิดพลาดในการพิมพ์รายงาน');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  const disconnectPrinter = () => {
    setIsConnected(false);
    toast.success('ตัดการเชื่อมต่อเครื่องพิมพ์แล้ว');
  };

  const generateReceiptText = (data: ReceiptData) => {
    let text = '';
    text += `${data.shop.name}\n`;
    text += `${data.shop.address}\n`;
    text += `โทร: ${data.shop.phone}\n`;
    text += `================================\n`;
    text += `เลขที่: ${data.orderNumber}\n`;
    text += `วันที่: ${new Date().toLocaleString('th-TH')}\n`;
    text += `================================\n`;
    
    data.items.forEach(item => {
      text += `${item.name} x${item.quantity}\n`;
      text += `  ${item.total.toFixed(2)} บาท\n`;
    });
    
    text += `================================\n`;
    text += `รวม: ${data.total.toFixed(2)} บาท\n`;
    text += `การชำระ: ${data.payment}\n`;
    
    if (data.member) {
      text += `สมาชิก: ${data.member.name}\n`;
      text += `แต้มสะสม: ${data.member.points}\n`;
    }
    
    text += `================================\n`;
    text += `ขอบคุณที่ใช้บริการ\n`;
    
    return text;
  };

  const generateReportText = (data: any) => {
    let text = '';
    text += `รายงานยอดขาย\n`;
    text += `================================\n`;
    text += `วันที่: ${new Date().toLocaleDateString('th-TH')}\n`;
    text += `ยอดขายรวม: ${data.totalSales?.toFixed(2) || '0.00'} บาท\n`;
    text += `จำนวนออเดอร์: ${data.totalOrders || 0}\n`;
    text += `================================\n`;
    
    return text;
  };

  return {
    isConnected,
    isPrinting,
    printerSettings,
    connectPrinter,
    printReceipt,
    printReport,
    disconnectPrinter,
  };
};
