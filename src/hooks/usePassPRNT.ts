import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getPassPRNTConfig,
  savePassPRNTConfig,
  printReceiptViaPassPRNT,
  printTextViaPassPRNT,
  openDrawerViaPassPRNT,
  isPassPRNTAvailable,
  getPassPRNTDownloadLink,
  type PassPRNTConfig,
  type PassPRNTPrintOptions,
} from '@/utils/passPrntUtils';

/**
 * usePassPRNT - React hook สำหรับจัดการ PassPRNT
 * 
 * ใช้สำหรับส่งข้อมูลพิมพ์ไปยังแอป PassPRNT ของ Star Micronics
 * ซึ่งทำหน้าที่เป็นตัวกลางระหว่าง Web/PWA กับเครื่องพิมพ์
 * 
 * ข้อดี:
 * - ไม่ต้องเขียน native code
 * - รองรับทั้ง iOS และ Android
 * - ผู้ใช้ติดตั้งแอป PassPRNT แล้วตั้งค่าเครื่องพิมพ์ได้เลย
 * 
 * ข้อจำกัด:
 * - ต้องติดตั้งแอป PassPRNT บนอุปกรณ์
 * - จะเปิดแอป PassPRNT ทุกครั้งที่พิมพ์ (สลับแอป)
 */
export function usePassPRNT() {
  const { toast } = useToast();
  const [config, setConfig] = useState<PassPRNTConfig>(getPassPRNTConfig);
  const [isPrinting, setIsPrinting] = useState(false);

  /** ตรวจสอบว่า PassPRNT พร้อมใช้งานหรือไม่ */
  const isAvailable = isPassPRNTAvailable();

  /** อัปเดตการตั้งค่า */
  const updateConfig = useCallback((updates: Partial<PassPRNTConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    savePassPRNTConfig(newConfig);
  }, [config]);

  /** เปิด/ปิด PassPRNT */
  const toggleEnabled = useCallback(() => {
    updateConfig({ enabled: !config.enabled });
  }, [config.enabled, updateConfig]);

  /** พิมพ์ใบเสร็จ (ESC/POS) */
  const printReceipt = useCallback(async (
    receiptData: string,
    options?: Partial<PassPRNTPrintOptions>
  ): Promise<boolean> => {
    if (!config.enabled) {
      toast({
        title: 'PassPRNT ไม่ได้เปิดใช้งาน',
        description: 'กรุณาเปิดใช้งาน PassPRNT ในการตั้งค่าเครื่องพิมพ์',
        variant: 'destructive',
      });
      return false;
    }

    if (!isAvailable) {
      toast({
        title: 'ไม่รองรับ',
        description: 'PassPRNT ใช้งานได้บน iOS และ Android เท่านั้น',
        variant: 'destructive',
      });
      return false;
    }

    setIsPrinting(true);

    try {
      const success = await printReceiptViaPassPRNT(receiptData, {
        paperWidth: config.defaultPaperWidth,
        ...options,
      });

      if (success) {
        toast({
          title: 'ส่งไปยัง PassPRNT แล้ว',
          description: 'กำลังเปิดแอป PassPRNT เพื่อพิมพ์...',
        });
      } else {
        toast({
          title: 'ไม่พบแอป PassPRNT',
          description: 'กรุณาติดตั้งแอป PassPRNT จาก App Store / Play Store',
          variant: 'destructive',
        });
      }

      return success;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถส่งข้อมูลไปยัง PassPRNT ได้',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [config, isAvailable, toast]);

  /** พิมพ์ข้อความธรรมดา */
  const printText = useCallback(async (
    text: string,
    options?: Partial<PassPRNTPrintOptions>
  ): Promise<boolean> => {
    if (!config.enabled || !isAvailable) return false;

    setIsPrinting(true);
    try {
      const success = await printTextViaPassPRNT(text, {
        paperWidth: config.defaultPaperWidth,
        ...options,
      });
      return success;
    } finally {
      setIsPrinting(false);
    }
  }, [config, isAvailable]);

  /** เปิดลิ้นชักเก็บเงิน */
  const openDrawer = useCallback(async (): Promise<boolean> => {
    if (!config.enabled || !isAvailable) return false;

    try {
      const success = await openDrawerViaPassPRNT();
      if (success) {
        toast({
          title: 'ส่งคำสั่งเปิดลิ้นชักแล้ว',
          description: 'กำลังเปิดแอป PassPRNT...',
        });
      }
      return success;
    } catch (error: any) {
      toast({
        title: 'เปิดลิ้นชักไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [config, isAvailable, toast]);

  /** ดึง link ดาวน์โหลดแอป PassPRNT */
  const downloadLink = getPassPRNTDownloadLink();

  return {
    config,
    isAvailable,
    isPrinting,
    updateConfig,
    toggleEnabled,
    printReceipt,
    printText,
    openDrawer,
    downloadLink,
  };
}
