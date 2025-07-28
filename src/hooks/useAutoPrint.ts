import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [isAutoPrintEnabled, setIsAutoPrintEnabled] = useState(() => {
    return localStorage.getItem('autoPrintEnabled') === 'true';
  });

  // Save auto print setting to localStorage
  useEffect(() => {
    localStorage.setItem('autoPrintEnabled', isAutoPrintEnabled.toString());
  }, [isAutoPrintEnabled]);

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

  // Print order receipt
  const printOrderReceipt = async (order: PrintOrder) => {
    try {
      console.log('🖨️ Auto-printing order receipt:', order.order_number);
      
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

        // Add to print queue for tracking
        await addToPrintQueue({
          type: 'ใบเสร็จออนไลน์',
          document: `ใบเสร็จ #${order.order_number}`,
          orderData: order
        });

        toast.success('🖨️ กำลังพิมพ์ใบเสร็จ', {
          description: `ออเดอร์ #${order.order_number} ส่งไปยังเครื่องพิมพ์แล้ว`
        });

        console.log('✅ Print command sent successfully');
        return true;
      } else {
        throw new Error('ไม่สามารถเปิดหน้าต่างพิมพ์ได้');
      }
    } catch (error) {
      console.error('❌ Auto-print failed:', error);
      toast.error('ไม่สามารถพิมพ์ได้', {
        description: 'กรุณาตรวจสอบการเชื่อมต่อเครื่องพิมพ์'
      });
      return false;
    }
  };

  // Add print job to queue for tracking
  const addToPrintQueue = async (printJob: {
    type: string;
    document: string;
    orderData: PrintOrder;
  }) => {
    try {
      // This could be stored in a database table for proper print queue management
      // For now, we'll just log it
      console.log('📋 Added to print queue:', {
        ...printJob,
        timestamp: new Date().toISOString(),
        status: 'printing'
      });
    } catch (error) {
      console.error('Failed to add to print queue:', error);
    }
  };

  const toggleAutoPrint = () => {
    setIsAutoPrintEnabled(!isAutoPrintEnabled);
    
    toast.success(
      !isAutoPrintEnabled ? '🖨️ เปิดการพิมพ์อัตโนมัติ' : '⏸️ ปิดการพิมพ์อัตโนมัติ',
      {
        description: !isAutoPrintEnabled 
          ? 'ระบบจะพิมพ์ใบเสร็จอัตโนมัติเมื่อมีออเดอร์ออนไลน์ใหม่' 
          : 'ระบบจะไม่พิมพ์ใบเสร็จอัตโนมัติ'
      }
    );
  };

  return {
    isAutoPrintEnabled,
    printOrderReceipt,
    toggleAutoPrint
  };
};