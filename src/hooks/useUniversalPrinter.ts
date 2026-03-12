import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { buildReceipt, generateTestReceipt, type ReceiptData } from '@/utils/escPosCommands';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { buildScopedStorageKey } from '@/utils/storageScope';

export interface PrinterConfig {
  brand: string;
  model?: string;
  connectionType: 'network' | 'bluetooth' | 'usb';
  paperSize: '58mm' | '80mm';
  // Network settings
  ipAddress?: string;
  port?: number;
  // Bluetooth settings
  deviceId?: string;
  deviceName?: string;
  // USB settings
  vendorId?: string;
  productId?: string;
  // Features
  autoCut: boolean;
  cashDrawer: boolean;
  encoding: 'utf8' | 'gb18030' | 'big5';
}

interface PrintJob {
  id: string;
  timestamp: Date;
  status: 'pending' | 'printing' | 'success' | 'failed';
  data: string;
  error?: string;
}

export function useUniversalPrinter() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { shopId } = useCurrentShop();

  const configStorageKey = useMemo(
    () => buildScopedStorageKey('universal_printer_config', { userId: user?.id, shopId }),
    [user?.id, shopId]
  );

  const historyStorageKey = useMemo(
    () => buildScopedStorageKey('printer_history', { userId: user?.id, shopId }),
    [user?.id, shopId]
  );

  const [config, setConfig] = useState<PrinterConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printQueue, setPrintQueue] = useState<PrintJob[]>([]);
  const [currentDevice, setCurrentDevice] = useState<any>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem(configStorageKey);
    setConfig(savedConfig ? JSON.parse(savedConfig) : null);

    const history = JSON.parse(localStorage.getItem(historyStorageKey) || '[]') as Array<{
      id: string;
      status: 'pending' | 'printing' | 'success' | 'failed';
      data: string;
      error?: string;
      timestamp: string;
    }>;

    setPrintQueue(
      history.map((job) => ({
        ...job,
        timestamp: new Date(job.timestamp),
      }))
    );

    setIsConnected(false);
    setCurrentDevice(null);
  }, [configStorageKey, historyStorageKey]);

  // Save config to localStorage
  const saveConfig = useCallback((newConfig: PrinterConfig) => {
    setConfig(newConfig);
    localStorage.setItem(configStorageKey, JSON.stringify(newConfig));
  }, [configStorageKey]);

  // Network printing via HTTP
  const printViaNetwork = async (data: string, ipAddress: string, port: number = 9100): Promise<void> => {
    try {
      // Try different endpoints
      const endpoints = [
        `http://${ipAddress}:${port}/`,
        `http://${ipAddress}:${port}/print`,
        `http://${ipAddress}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000`
      ];

      for (const endpoint of endpoints) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            body: data,
            mode: 'no-cors' // Required for cross-origin printer requests
          });

          // no-cors mode doesn't allow reading the response, so we assume success
          return;
        } catch (err) {
          console.log(`Failed to print via ${endpoint}:`, err);
          continue;
        }
      }

      throw new Error('ไม่สามารถเชื่อมต่อกับเครื่องพิมพ์ได้');
    } catch (error) {
      throw error;
    }
  };

  // Bluetooth printing via Web Bluetooth API
  const printViaBluetooth = async (data: string, deviceId?: string): Promise<void> => {
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('เบราว์เซอร์ไม่รองรับ Bluetooth');
      }

      let device = currentDevice;

      if (!device) {
        // Request Bluetooth device
        device = await nav.bluetooth.requestDevice({
          filters: [
            { services: ['000018f0-0000-1000-8000-00805f9b34fb'] } // Generic printer service
          ],
          optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // Serial port service
        });

        const server = await device.gatt?.connect();
        if (!server) throw new Error('ไม่สามารถเชื่อมต่อกับเครื่องพิมพ์ได้');

        setCurrentDevice(device);
      }

      // Get characteristic for writing
      const service = await device.gatt.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      // Convert string to bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(data);

      // Send data in chunks (Bluetooth has packet size limits)
      const chunkSize = 512;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
        await characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between chunks
      }

    } catch (error) {
      throw error;
    }
  };

  // USB printing via WebUSB API
  const printViaUSB = async (data: string): Promise<void> => {
    try {
      const nav = navigator as any;
      if (!nav.usb) {
        throw new Error('เบราว์เซอร์ไม่รองรับ USB');
      }

      let device = currentDevice;

      if (!device) {
        // Request USB device
        device = await nav.usb.requestDevice({
          filters: [
            { classCode: 7 } // Printer class
          ]
        });

        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(0);

        setCurrentDevice(device);
      }

      // Convert string to bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(data);

      // Send to printer (endpoint 1 is typically the printer endpoint)
      await device.transferOut(1, bytes);

    } catch (error) {
      throw error;
    }
  };

  // Connect to printer
  const connect = useCallback(async (printerConfig: PrinterConfig): Promise<boolean> => {
    try {
      saveConfig(printerConfig);

      // Test connection based on type
      if (printerConfig.connectionType === 'network') {
        if (!printerConfig.ipAddress) {
          throw new Error('กรุณาระบุ IP Address');
        }
        // Try to ping or connect
        toast({
          title: 'กำลังเชื่อมต่อ',
          description: `กำลังเชื่อมต่อกับ ${printerConfig.ipAddress}:${printerConfig.port || 9100}`,
        });
      } else if (printerConfig.connectionType === 'bluetooth') {
        toast({
          title: 'กำลังค้นหาเครื่องพิมพ์',
          description: 'โปรดเลือกเครื่องพิมพ์ Bluetooth',
        });
      } else if (printerConfig.connectionType === 'usb') {
        toast({
          title: 'กำลังค้นหาเครื่องพิมพ์',
          description: 'โปรดเลือกเครื่องพิมพ์ USB',
        });
      }

      setIsConnected(true);

      toast({
        title: 'เชื่อมต่อสำเร็จ',
        description: `เชื่อมต่อกับเครื่องพิมพ์ ${printerConfig.brand} แล้ว`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'เชื่อมต่อไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
      setIsConnected(false);
      return false;
    }
  }, [saveConfig, toast]);

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      if (currentDevice) {
        if (config?.connectionType === 'usb' && currentDevice.close) {
          await currentDevice.close();
        } else if (config?.connectionType === 'bluetooth' && currentDevice.gatt) {
          currentDevice.gatt.disconnect();
        }
        setCurrentDevice(null);
      }

      setIsConnected(false);
      toast({
        title: 'ตัดการเชื่อมต่อแล้ว',
        description: 'ตัดการเชื่อมต่อกับเครื่องพิมพ์แล้ว',
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [config, currentDevice, toast]);

  // Print receipt
  const printReceipt = useCallback(async (receiptData: ReceiptData): Promise<boolean> => {
    if (!config) {
      toast({
        title: 'ไม่พบการตั้งค่า',
        description: 'กรุณาตั้งค่าเครื่องพิมพ์ก่อน',
        variant: 'destructive',
      });
      return false;
    }

    setIsPrinting(true);

    try {
      // Generate receipt command
      const printData = buildReceipt(receiptData, config.paperSize);

      // Add cut command if enabled
      const finalData = config.autoCut ? printData + '\x1D\x56\x00' : printData;

      // Print based on connection type
      if (config.connectionType === 'network' && config.ipAddress) {
        await printViaNetwork(finalData, config.ipAddress, config.port || 9100);
      } else if (config.connectionType === 'bluetooth') {
        await printViaBluetooth(finalData, config.deviceId);
      } else if (config.connectionType === 'usb') {
        await printViaUSB(finalData);
      } else {
        throw new Error('ประเภทการเชื่อมต่อไม่ถูกต้อง');
      }

      // Add to print history
      const job: PrintJob = {
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'success',
        data: finalData
      };
      setPrintQueue(prev => [job, ...prev.slice(0, 49)]); // Keep last 50 jobs

      // Save to localStorage
      const history = JSON.parse(localStorage.getItem(historyStorageKey) || '[]');
      history.unshift({
        ...job,
        timestamp: job.timestamp.toISOString()
      });
      localStorage.setItem(historyStorageKey, JSON.stringify(history.slice(0, 50)));

      toast({
        title: 'พิมพ์สำเร็จ',
        description: 'พิมพ์ใบเสร็จเรียบร้อยแล้ว',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'พิมพ์ไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });

      // Log error
      const job: PrintJob = {
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'failed',
        data: '',
        error: error.message
      };
      setPrintQueue(prev => [job, ...prev.slice(0, 49)]);

      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [config, historyStorageKey, toast]);

  // Test print
  const testPrint = useCallback(async (): Promise<boolean> => {
    if (!config) {
      toast({
        title: 'ไม่พบการตั้งค่า',
        description: 'กรุณาตั้งค่าเครื่องพิมพ์ก่อน',
        variant: 'destructive',
      });
      return false;
    }

    setIsPrinting(true);

    try {
      const testData = generateTestReceipt(config.paperSize);
      const finalData = config.autoCut ? testData + '\x1D\x56\x00' : testData;

      if (config.connectionType === 'network' && config.ipAddress) {
        await printViaNetwork(finalData, config.ipAddress, config.port || 9100);
      } else if (config.connectionType === 'bluetooth') {
        await printViaBluetooth(finalData, config.deviceId);
      } else if (config.connectionType === 'usb') {
        await printViaUSB(finalData);
      }

      toast({
        title: 'ทดสอบสำเร็จ',
        description: 'พิมพ์ใบเสร็จทดสอบเรียบร้อยแล้ว',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'ทดสอบไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [config, toast]);

  // Open cash drawer
  const openCashDrawer = useCallback(async (): Promise<boolean> => {
    if (!config || !config.cashDrawer) {
      toast({
        title: 'ฟีเจอร์ไม่พร้อมใช้งาน',
        description: 'กรุณาเปิดใช้งานลิ้นชักเก็บเงินในการตั้งค่า',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // ESC/POS command to open drawer
      const drawerCommand = '\x1B\x70\x00\x19\xFA';

      if (config.connectionType === 'network' && config.ipAddress) {
        await printViaNetwork(drawerCommand, config.ipAddress, config.port || 9100);
      } else if (config.connectionType === 'bluetooth') {
        await printViaBluetooth(drawerCommand, config.deviceId);
      } else if (config.connectionType === 'usb') {
        await printViaUSB(drawerCommand);
      }

      toast({
        title: 'เปิดลิ้นชักสำเร็จ',
        description: 'เปิดลิ้นชักเก็บเงินแล้ว',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'เปิดลิ้นชักไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [config, toast]);

  return {
    config,
    isConnected,
    isPrinting,
    printQueue,
    connect,
    disconnect,
    printReceipt,
    testPrint,
    openCashDrawer,
    saveConfig
  };
}
