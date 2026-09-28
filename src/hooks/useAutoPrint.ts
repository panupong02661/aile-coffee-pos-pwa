import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { printOrderReceipt as networkPrintOrderReceipt } from '@/utils/printerUtils';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { buildScopedStorageKey } from '@/utils/storageScope';
import { isNativeApp, printTextViaStar } from '@/utils/nativeStarPrint';

interface OrderItem {
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_addons?: Array<{
    name: string;
    price?: number;
  }>;
}

interface PrintOrder {
  id: string;
  order_number: string;
  total_amount: number;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  order_items: OrderItem[];
  payment_method?: string;
  customer_notes?: string;
}

export const useAutoPrint = () => {
  const { user } = useAuth();
  const { shopId } = useCurrentShop();

  const autoPrintKey = useMemo(
    () => buildScopedStorageKey('autoPrintEnabled', { userId: user?.id, shopId }),
    [user?.id, shopId]
  );

  const printQueueKey = useMemo(
    () => buildScopedStorageKey('printQueue', { userId: user?.id, shopId }),
    [user?.id, shopId]
  );

  const [isAutoPrintEnabled, setIsAutoPrintEnabled] = useState(false);
  const [hasLoadedSetting, setHasLoadedSetting] = useState(false);

  // Load auto print setting by user + shop scope
  useEffect(() => {
    setHasLoadedSetting(false);
    setIsAutoPrintEnabled(localStorage.getItem(autoPrintKey) === 'true');
    setHasLoadedSetting(true);
  }, [autoPrintKey]);

  // Save auto print setting
  useEffect(() => {
    if (!hasLoadedSetting) return;
    localStorage.setItem(autoPrintKey, isAutoPrintEnabled.toString());
  }, [isAutoPrintEnabled, autoPrintKey, hasLoadedSetting]);

  // Generate receipt content for printing
  const generateReceiptContent = (order: PrintOrder): string => {
    const currentDate = new Date(order.created_at).toLocaleString('th-TH');

    let receiptContent = `
═══════════════════════════════
           ใบเสร็จ
═══════════════════════════════
ออเดอร์: ${order.order_number}
วันที่: ${currentDate}
${order.customer_name ? `ลูกค้า: ${order.customer_name}` : ''}
${order.customer_phone ? `โทร: ${order.customer_phone}` : ''}
${order.customer_notes ? `หมายเหตุ: ${order.customer_notes}` : ''}
───────────────────────────────
รายการสินค้า:
`;

    // Add order items with addons
    order.order_items.forEach((item, index) => {
      receiptContent += `\n${index + 1}. ${item.menu_item_name}`;
      receiptContent += `\n   จำนวน: ${item.quantity} x ฿${item.unit_price}`;

      // Add addon details
      if (item.selected_addons && item.selected_addons.length > 0) {
        item.selected_addons.forEach(addon => {
          if (addon.price && addon.price > 0) {
            receiptContent += `\n   + ${addon.name} (+฿${addon.price})`;
          } else {
            receiptContent += `\n   + ${addon.name}`;
          }
        });
      }

      receiptContent += `\n   รวม: ฿${item.total_price}\n`;
    });

    receiptContent += `───────────────────────────────
รวมทั้งหมด: ฿${order.total_amount}
${order.payment_method ? `ชำระโดย: ${order.payment_method}` : ''}
───────────────────────────────
ขอบคุณที่ใช้บริการ
═══════════════════════════════`;

    return receiptContent;
  };

  // Add print job to queue for tracking
  const addToPrintQueue = async (printJob: {
    type: string;
    document: string;
    orderData: PrintOrder;
    status?: 'pending' | 'printing' | 'completed' | 'failed';
  }) => {
    try {
      const queueItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: printJob.type,
        document: printJob.document,
        status: printJob.status ?? 'completed',
        priority: 'normal' as const,
        created_at: new Date().toISOString(),
        copies: 1,
      };

      const existingQueue = JSON.parse(localStorage.getItem(printQueueKey) || '[]');
      existingQueue.unshift(queueItem);
      localStorage.setItem(printQueueKey, JSON.stringify(existingQueue.slice(0, 100)));
      window.dispatchEvent(new Event('print-queue-updated'));
    } catch (error) {
      console.error('Failed to add to print queue:', error);
    }
  };

  // Fallback browser print method
  const browserPrintFallback = async (order: PrintOrder) => {
    try {
      const receiptContent = generateReceiptContent(order);

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=300,height=600');

      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ใบเสร็จ - ${order.order_number}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                margin: 0;
                padding: 10px;
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>${receiptContent}</body>
          </html>
        `);

        printWindow.document.close();

        // Wait for content to load, then print automatically
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Close window after printing
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          }, 500);
        };

        await addToPrintQueue({
          type: 'ใบเสร็จออนไลน์',
          document: `ใบเสร็จ #${order.order_number}`,
          orderData: order,
          status: 'completed'
        });

        toast.success('🖨️ กำลังพิมพ์ใบเสร็จ (Browser)', {
          description: `ออเดอร์ #${order.order_number} ใช้การพิมพ์ผ่าน Browser`
        });

        return true;
      }

      throw new Error('ไม่สามารถเปิดหน้าต่างพิมพ์ได้');
    } catch (error) {
      console.error('❌ Browser print fallback failed:', error);
      toast.error('ไม่สามารถพิมพ์ได้', {
        description: 'กรุณาตรวจสอบการเชื่อมต่อเครื่องพิมพ์'
      });
      return false;
    }
  };

  // Print order receipt using network printer
  const printOrderReceipt = async (order: PrintOrder) => {
    try {
      console.log('🖨️ Auto-printing order receipt:', order.order_number);

      // Native app: print directly to Star USB printer
      if (isNativeApp()) {
        try {
          await printTextViaStar(generateReceiptContent(order));
          await addToPrintQueue({ type: 'ใบเสร็จ', document: `ใบเสร็จ #${order.order_number}`, orderData: order, status: 'completed' });
          toast.success('✅ พิมพ์ใบเสร็จสำเร็จ', { description: `ออเดอร์ #${order.order_number}` });
          return true;
        } catch (e: any) {
          toast.error('พิมพ์ใบเสร็จไม่ได้', { description: e?.message || String(e), duration: 10000 });
          return false;
        }
      }

      // Use network printer
      const success = await networkPrintOrderReceipt(order);

      if (success) {
        await addToPrintQueue({
          type: 'ใบเสร็จออนไลน์',
          document: `ใบเสร็จ #${order.order_number}`,
          orderData: order,
          status: 'completed'
        });

        console.log('✅ Network print command sent successfully');
        return true;
      }

      throw new Error('ไม่สามารถพิมพ์ผ่านเครื่องพิมพ์ network ได้');
    } catch (error) {
      console.error('❌ Auto-print failed:', error);

      // Fallback to browser print
      console.log('🔄 Falling back to browser print...');
      return await browserPrintFallback(order);
    }
  };

  const toggleAutoPrint = () => {
    setIsAutoPrintEnabled((previous) => {
      const nextValue = !previous;

      toast.success(
        nextValue ? '🖨️ เปิดการพิมพ์อัตโนมัติ' : '⏸️ ปิดการพิมพ์อัตโนมัติ',
        {
          description: nextValue
            ? 'ระบบจะพิมพ์ใบเสร็จอัตโนมัติเมื่อมีออเดอร์ออนไลน์ใหม่'
            : 'ระบบจะไม่พิมพ์ใบเสร็จอัตโนมัติ'
        }
      );

      return nextValue;
    });
  };

  return {
    isAutoPrintEnabled,
    printOrderReceipt,
    toggleAutoPrint
  };
};
