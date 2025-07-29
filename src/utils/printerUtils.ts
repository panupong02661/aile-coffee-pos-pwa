import { toast } from 'sonner';

interface PrinterConfig {
  ip_address: string;
  port: string;
  paper_width: string;
  auto_cut: boolean;
}

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

// ESC/POS commands for thermal printers
const ESC_POS_COMMANDS = {
  INIT: '\x1B\x40', // Initialize printer
  CENTER: '\x1B\x61\x01', // Center align
  LEFT: '\x1B\x61\x00', // Left align
  BOLD_ON: '\x1B\x45\x01', // Bold on
  BOLD_OFF: '\x1B\x45\x00', // Bold off
  DOUBLE_HEIGHT: '\x1B\x21\x10', // Double height
  NORMAL_SIZE: '\x1B\x21\x00', // Normal size
  CUT_PAPER: '\x1D\x56\x42\x00', // Cut paper
  LINE_FEED: '\x0A', // Line feed
  HORIZONTAL_LINE: '================================',
  SMALL_LINE: '--------------------------------'
};

// Get printer configuration from localStorage
const getPrinterConfig = (): PrinterConfig => {
  const config = localStorage.getItem('printerConfig');
  if (config) {
    return JSON.parse(config);
  }
  
  // Default configuration
  return {
    ip_address: '192.168.1.170',
    port: '9100',
    paper_width: '80',
    auto_cut: true
  };
};

// Save printer configuration to localStorage
export const savePrinterConfig = (config: PrinterConfig): void => {
  localStorage.setItem('printerConfig', JSON.stringify(config));
};

// Generate ESC/POS receipt content
const generateESCPOSReceipt = (order: PrintOrder, config: PrinterConfig): string => {
  const currentDate = new Date(order.created_at).toLocaleString('th-TH');
  const paperWidth = parseInt(config.paper_width);
  const lineLength = paperWidth === 58 ? 32 : 48;
  
  let receipt = '';
  
  // Initialize printer
  receipt += ESC_POS_COMMANDS.INIT;
  
  // Header
  receipt += ESC_POS_COMMANDS.CENTER;
  receipt += ESC_POS_COMMANDS.BOLD_ON;
  receipt += ESC_POS_COMMANDS.DOUBLE_HEIGHT;
  receipt += 'Aile Coffee\n';
  receipt += ESC_POS_COMMANDS.NORMAL_SIZE;
  receipt += ESC_POS_COMMANDS.BOLD_OFF;
  receipt += 'ใบเสร็จรับเงิน\n';
  receipt += ESC_POS_COMMANDS.LEFT;
  
  // Separator
  receipt += ESC_POS_COMMANDS.HORIZONTAL_LINE.substring(0, lineLength) + '\n';
  
  // Order info
  receipt += `ออเดอร์: ${order.order_number}\n`;
  receipt += `วันที่: ${currentDate}\n`;
  
  if (order.customer_name) {
    receipt += `ลูกค้า: ${order.customer_name}\n`;
  }
  
  if (order.customer_phone) {
    receipt += `โทร: ${order.customer_phone}\n`;
  }
  
  if (order.customer_notes) {
    receipt += `หมายเหตุ: ${order.customer_notes}\n`;
  }
  
  receipt += ESC_POS_COMMANDS.SMALL_LINE.substring(0, lineLength) + '\n';
  receipt += 'รายการสินค้า:\n';
  
  // Order items
  order.order_items.forEach((item, index) => {
    receipt += `${index + 1}. ${item.menu_item_name}\n`;
    receipt += `   ${item.quantity} x ${item.unit_price.toFixed(2)}`;
    receipt += ` = ${item.total_price.toFixed(2)}\n`;
    
    // Add addons
    if (item.selected_addons && item.selected_addons.length > 0) {
      item.selected_addons.forEach(addon => {
        if (addon.price && addon.price > 0) {
          receipt += `   + ${addon.name} (+${addon.price.toFixed(2)})\n`;
        } else {
          receipt += `   + ${addon.name}\n`;
        }
      });
    }
    receipt += '\n';
  });
  
  receipt += ESC_POS_COMMANDS.SMALL_LINE.substring(0, lineLength) + '\n';
  
  // Total
  receipt += ESC_POS_COMMANDS.BOLD_ON;
  receipt += `รวมทั้งหมด: ${order.total_amount.toFixed(2)} บาท\n`;
  receipt += ESC_POS_COMMANDS.BOLD_OFF;
  
  if (order.payment_method) {
    receipt += `ชำระโดย: ${order.payment_method}\n`;
  }
  
  receipt += ESC_POS_COMMANDS.SMALL_LINE.substring(0, lineLength) + '\n';
  receipt += ESC_POS_COMMANDS.CENTER;
  receipt += 'ขอบคุณที่ใช้บริการ\n';
  receipt += ESC_POS_COMMANDS.LEFT;
  receipt += ESC_POS_COMMANDS.HORIZONTAL_LINE.substring(0, lineLength) + '\n';
  
  // Auto cut if enabled
  if (config.auto_cut) {
    receipt += '\n\n\n';
    receipt += ESC_POS_COMMANDS.CUT_PAPER;
  }
  
  return receipt;
};

// Send raw data to network printer
const sendToPrinter = async (data: string, config: PrinterConfig): Promise<boolean> => {
  try {
    // Try using WebSocket for network printing
    const ws = new WebSocket(`ws://${config.ip_address}:${config.port}`);
    
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        console.log('🔗 Connected to printer');
        ws.send(data);
        
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 1000);
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        ws.close();
        reject(error);
      };
      
      ws.onclose = () => {
        console.log('🔌 Printer connection closed');
      };
    });
  } catch (error) {
    console.error('❌ Failed to connect to printer:', error);
    return false;
  }
};

// Alternative method using fetch API for HTTP-based printers
const sendToPrinterHTTP = async (data: string, config: PrinterConfig): Promise<boolean> => {
  try {
    const response = await fetch(`http://${config.ip_address}:${config.port}/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: data,
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ HTTP print failed:', error);
    return false;
  }
};

// Test printer connection
export const testPrinterConnection = async (): Promise<boolean> => {
  const config = getPrinterConfig();
  
  try {
    console.log(`🔍 Testing printer connection to ${config.ip_address}:${config.port}`);
    
    // Generate test receipt
    const testData = generateESCPOSReceipt({
      id: 'test',
      order_number: 'TEST-001',
      total_amount: 100,
      created_at: new Date().toISOString(),
      customer_name: 'ทดสอบระบบ',
      order_items: [{
        menu_item_name: 'กาแฟทดสอบ',
        quantity: 1,
        unit_price: 100,
        total_price: 100
      }],
      payment_method: 'เงินสด'
    }, config);
    
    // Try WebSocket first, then HTTP fallback
    let success = await sendToPrinter(testData, config);
    
    if (!success) {
      console.log('📡 WebSocket failed, trying HTTP method...');
      success = await sendToPrinterHTTP(testData, config);
    }
    
    if (success) {
      toast.success('✅ ทดสอบการพิมพ์สำเร็จ', {
        description: `เครื่องพิมพ์ ${config.ip_address} ทำงานปกติ`
      });
    } else {
      toast.error('❌ ทดสอบการพิมพ์ล้มเหลว', {
        description: `ไม่สามารถเชื่อมต่อเครื่องพิมพ์ ${config.ip_address}:${config.port} ได้`
      });
    }
    
    return success;
  } catch (error) {
    console.error('❌ Test print error:', error);
    toast.error('❌ เกิดข้อผิดพลาด', {
      description: 'ไม่สามารถทดสอบการพิมพ์ได้'
    });
    return false;
  }
};

// Print order receipt using network printer
export const printOrderReceipt = async (order: PrintOrder): Promise<boolean> => {
  const config = getPrinterConfig();
  
  try {
    console.log(`🖨️ Printing order ${order.order_number} to ${config.ip_address}:${config.port}`);
    
    const receiptData = generateESCPOSReceipt(order, config);
    
    // Try WebSocket first, then HTTP fallback
    let success = await sendToPrinter(receiptData, config);
    
    if (!success) {
      console.log('📡 WebSocket failed, trying HTTP method...');
      success = await sendToPrinterHTTP(receiptData, config);
    }
    
    if (success) {
      toast.success('✅ พิมพ์ใบเสร็จสำเร็จ', {
        description: `ออเดอร์ #${order.order_number} ถูกส่งไปยังเครื่องพิมพ์แล้ว`
      });
      
      // Log print job
      logPrintJob(order, config, 'success');
    } else {
      toast.error('❌ ไม่สามารถพิมพ์ได้', {
        description: `ไม่สามารถเชื่อมต่อเครื่องพิมพ์ ${config.ip_address}:${config.port} ได้`
      });
      
      // Log failed print job
      logPrintJob(order, config, 'failed');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Print order error:', error);
    toast.error('❌ เกิดข้อผิดพลาด', {
      description: 'ไม่สามารถพิมพ์ใบเสร็จได้'
    });
    
    logPrintJob(order, config, 'error');
    return false;
  }
};

// Log print jobs for history tracking
const logPrintJob = (order: PrintOrder, config: PrinterConfig, status: 'success' | 'failed' | 'error') => {
  const printLog = {
    orderId: order.id,
    orderNumber: order.order_number,
    printerIP: config.ip_address,
    printerPort: config.port,
    status,
    timestamp: new Date().toISOString(),
    totalAmount: order.total_amount
  };
  
  // Store in localStorage for now (could be moved to database)
  const existingLogs = JSON.parse(localStorage.getItem('printLogs') || '[]');
  existingLogs.unshift(printLog);
  
  // Keep only last 100 logs
  if (existingLogs.length > 100) {
    existingLogs.splice(100);
  }
  
  localStorage.setItem('printLogs', JSON.stringify(existingLogs));
};

// Get print history
export const getPrintHistory = () => {
  return JSON.parse(localStorage.getItem('printLogs') || '[]');
};
