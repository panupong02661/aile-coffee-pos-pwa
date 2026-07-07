import { toast } from 'sonner';
import { buildScopedStorageKey, type StorageScopeOverride } from '@/utils/storageScope';

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
  wifi_voucher?: {
    username: string;
    password: string;
    qr_code_url?: string | null;
  };
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
const getPrinterConfig = (override?: StorageScopeOverride): PrinterConfig => {
  const configKey = buildScopedStorageKey('printerConfig', override);
  const config = localStorage.getItem(configKey);

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
export const savePrinterConfig = (config: PrinterConfig, override?: StorageScopeOverride): void => {
  const configKey = buildScopedStorageKey('printerConfig', override);
  localStorage.setItem(configKey, JSON.stringify(config));
};

// Generate ESC/POS receipt content
const generateESCPOSReceipt = (order: PrintOrder, config: PrinterConfig, shopName?: string): string => {
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
  receipt += (shopName || 'POS') + '\n';
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
  
  // WiFi Voucher Section
  if (order.wifi_voucher) {
    receipt += ESC_POS_COMMANDS.SMALL_LINE.substring(0, lineLength) + '\n';
    receipt += ESC_POS_COMMANDS.CENTER;
    receipt += ESC_POS_COMMANDS.BOLD_ON;
    receipt += 'บัตรใช้งานอินเทอร์เน็ต\n';
    receipt += 'WiFi Voucher\n';
    receipt += ESC_POS_COMMANDS.BOLD_OFF;
    receipt += ESC_POS_COMMANDS.LEFT;
    receipt += `ชื่อผู้ใช้: ${order.wifi_voucher.username}\n`;
    receipt += `รหัสผ่าน: ${order.wifi_voucher.password}\n`;
    receipt += ESC_POS_COMMANDS.CENTER;
    receipt += '(สแกน QR Code บนใบเสร็จ)\n';
    receipt += ESC_POS_COMMANDS.LEFT;
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

// Send raw data to network printer using various methods
const sendToPrinter = async (data: string, config: PrinterConfig): Promise<boolean> => {
  try {
    console.log(`🔗 Attempting to connect to printer ${config.ip_address}:${config.port}`);
    
    // Method 1: Try raw TCP connection (most reliable for thermal printers)
    const success = await sendRawTCP(data, config);
    if (success) return true;
    
    // Method 2: Try fetch with different content types
    const httpSuccess = await sendToPrinterHTTP(data, config);
    if (httpSuccess) return true;
    
    return false;
  } catch (error) {
    console.error('❌ Failed to connect to printer:', error);
    return false;
  }
};

// Raw TCP connection using WebSocket (for port 9100)
const sendRawTCP = async (data: string, config: PrinterConfig): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // สำหรับ thermal printer ส่วนใหญ่จะใช้ raw TCP ผ่าน port 9100
      // แต่เนื่องจาก browser ไม่สามารถทำ raw TCP ได้โดยตรง
      // เราจะใช้วิธีอื่นแทน
      console.log('⚠️ Raw TCP not supported in browser environment');
      resolve(false);
    } catch (error) {
      console.error('❌ Raw TCP error:', error);
      resolve(false);
    }
  });
};

// Alternative methods for HTTP-based printing
const sendToPrinterHTTP = async (data: string, config: PrinterConfig): Promise<boolean> => {
  const commonPaths = ['/print', '/cgi-bin/epostm/tm_direct_print.cgi', '/'];
  
  for (const path of commonPaths) {
    try {
      console.log(`📡 Trying HTTP method: http://${config.ip_address}:${config.port}${path}`);
      
      const response = await fetch(`http://${config.ip_address}:${config.port}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: data,
        mode: 'no-cors' // เพื่อหลีกเลี่ยง CORS issues
      });
      
      console.log(`✅ HTTP request sent successfully to ${path}`);
      return true;
    } catch (error) {
      console.log(`❌ HTTP ${path} failed:`, error);
    }
  }
  
  return false;
};

// Test printer connection with multiple ports and methods
export const testPrinterConnection = async (): Promise<boolean> => {
  const config = getPrinterConfig();
  
  try {
    console.log(`🔍 Testing printer connection to ${config.ip_address}:${config.port}`);
    
    // Test common printer ports if current port fails
    const commonPorts = [config.port, '9100', '515', '631', '80'];
    const uniquePorts = [...new Set(commonPorts)];
    
    for (const port of uniquePorts) {
      console.log(`🔌 Testing port ${port}...`);
      
      const testConfig = { ...config, port };
      const testData = generateTestReceipt();
      
      // Try different connection methods
      const success = await tryConnectionMethods(testData, testConfig);
      
      if (success) {
        toast.success('✅ ทดสอบการพิมพ์สำเร็จ', {
          description: `เครื่องพิมพ์ ${config.ip_address}:${port} ทำงานปกติ`
        });
        
        // Update config with working port
        if (port !== config.port) {
          savePrinterConfig({ ...config, port });
          toast.success('🔧 อัปเดตพอร์ต', {
            description: `ใช้พอร์ต ${port} สำหรับการเชื่อมต่อ`
          });
        }
        
        return true;
      }
    }
    
    // If all ports fail, show detailed error
    toast.error('❌ ทดสอบการพิมพ์ล้มเหลว', {
      description: `ไม่สามารถเชื่อมต่อ ${config.ip_address} ได้ในพอร์ต ${uniquePorts.join(', ')}`
    });
    
    return false;
  } catch (error) {
    console.error('❌ Test print error:', error);
    toast.error('❌ เกิดข้อผิดพลาด', {
      description: 'ไม่สามารถทดสอบการพิมพ์ได้'
    });
    return false;
  }
};

// Generate test receipt data
const generateTestReceipt = () => {
  return generateESCPOSReceipt({
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
  }, getPrinterConfig());
};

// Try different connection methods
// หมายเหตุ: ไม่ใช้ webPrintFallback (window.open) แล้ว เพราะบน Android WebView (APK)
// จะเด้งไปเปิด Chrome เป็น about:blank#blocked ทำให้ผู้ใช้กดอะไรไม่ได้
const tryConnectionMethods = async (data: string, config: PrinterConfig): Promise<boolean> => {
  const methods = [
    () => sendToPrinter(data, config),
    () => pingTest(config.ip_address),
  ];
  
  for (const method of methods) {
    try {
      const result = await method();
      if (result) return true;
    } catch (error) {
      console.log('Method failed, trying next...');
    }
  }
  
  return false;
};

// Simple ping test to check if printer IP is reachable
const pingTest = async (ip: string): Promise<boolean> => {
  try {
    console.log(`🏓 Ping testing ${ip}...`);
    
    // Simple connectivity test using image loading
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      // Try to load a favicon or simple endpoint
      img.src = `http://${ip}/favicon.ico?${Date.now()}`;
    });
  } catch (error) {
    return false;
  }
};

// Web-based print fallback (open print dialog)
const webPrintFallback = async (data: string, config: PrinterConfig): Promise<boolean> => {
  try {
    console.log('🌐 Using web print fallback...');
    
    // Convert ESC/POS to readable text
    const readableText = data
      .replace(/\x1B\x40/g, '') // Remove INIT
      .replace(/\x1B\x61[\x00-\x02]/g, '') // Remove alignment
      .replace(/\x1B\x45[\x00-\x01]/g, '') // Remove bold
      .replace(/\x1B\x21[\x00-\x30]/g, '') // Remove text size
      .replace(/\x1D\x56\x42\x00/g, '') // Remove cut command
      .replace(/\x0A/g, '\n'); // Convert line feeds
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ทดสอบการพิมพ์ - ${config.ip_address}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 20px;
              white-space: pre-wrap;
            }
            .printer-info {
              background: #f0f0f0;
              padding: 10px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            @media print {
              .printer-info { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="printer-info">
            <strong>ข้อมูลเครื่องพิมพ์:</strong><br>
            IP: ${config.ip_address}<br>
            Port: ${config.port}<br>
            กว้างกระดาษ: ${config.paper_width}mm<br><br>
            <em>กรุณากด Ctrl+P หรือ Cmd+P เพื่อพิมพ์</em>
          </div>
          ${readableText}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      toast.success('📄 เปิดหน้าต่างพิมพ์', {
        description: 'กรุณากด Ctrl+P หรือ Cmd+P เพื่อพิมพ์'
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Web print fallback failed:', error);
    return false;
  }
};

// Print order receipt using network printer
export const printOrderReceipt = async (order: PrintOrder): Promise<boolean> => {
  const config = getPrinterConfig();
  
  try {
    console.log(`🖨️ Printing order ${order.order_number} to ${config.ip_address}:${config.port}`);
    
    const receiptData = generateESCPOSReceipt(order, config);
    
    // Try different connection methods
    let success = await sendToPrinter(receiptData, config);
    
    if (!success) {
      console.log('📡 Network print failed, trying web print fallback...');
      success = await webPrintFallback(receiptData, config);
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
  const currentUserRaw = localStorage.getItem('currentUser');
  const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
  const activeShopId = localStorage.getItem('active_shop_id');

  const printLog = {
    orderId: order.id,
    orderNumber: order.order_number,
    printerIP: config.ip_address,
    printerPort: config.port,
    status,
    timestamp: new Date().toISOString(),
    totalAmount: order.total_amount,
    printedBy: currentUser?.username || 'unknown',
    userId: currentUser?.id || null,
    shopId: activeShopId || null
  };

  const printLogsKey = buildScopedStorageKey('printLogs', {
    userId: currentUser?.id || null,
    shopId: activeShopId || null,
  });
  const existingLogs = JSON.parse(localStorage.getItem(printLogsKey) || '[]');
  existingLogs.unshift(printLog);

  if (existingLogs.length > 100) {
    existingLogs.splice(100);
  }

  localStorage.setItem(printLogsKey, JSON.stringify(existingLogs));
};

// Get print history
export const getPrintHistory = (override?: StorageScopeOverride) => {
  const printLogsKey = buildScopedStorageKey('printLogs', override);
  return JSON.parse(localStorage.getItem(printLogsKey) || '[]');
};
