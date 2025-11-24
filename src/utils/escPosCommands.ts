// ESC/POS Commands Builder for Universal Printer Support
// Supports: Xprinter, Hoin, Rongta, Epson TM-series, EasyPrint

export interface PrinterBrand {
  id: string;
  name: string;
  models?: string[];
}

export const PRINTER_BRANDS: PrinterBrand[] = [
  { id: 'xprinter', name: 'Xprinter', models: ['XP-58', 'XP-80', 'XP-Q200', 'XP-Q260'] },
  { id: 'hoin', name: 'Hoin', models: ['HOP-E58', 'HOP-E801', 'HOP-H58'] },
  { id: 'rongta', name: 'Rongta', models: ['RP58', 'RP80', 'RP326', 'RP850'] },
  { id: 'epson', name: 'Epson TM-series', models: ['TM-T20', 'TM-T82', 'TM-U220', 'TM-m30'] },
  { id: 'easyprint', name: 'EasyPrint', models: ['EP-58', 'EP-80'] },
  { id: 'star', name: 'Star Micronics', models: ['TSP100', 'TSP143', 'TSP650'] },
  { id: 'other', name: 'อื่นๆ (ESC/POS Compatible)' }
];

export const PAPER_SIZES = [
  { id: '58mm', name: '58mm (Small)', width: 32, maxChars: 32 },
  { id: '80mm', name: '80mm (Standard)', width: 48, maxChars: 48 }
];

export const CONNECTION_TYPES = [
  { id: 'network', name: 'WiFi/Network', icon: 'Wifi' },
  { id: 'bluetooth', name: 'Bluetooth', icon: 'Bluetooth' },
  { id: 'usb', name: 'USB', icon: 'Usb' }
];

// ESC/POS Control Commands
export const ESC = '\x1B';
export const GS = '\x1D';
export const FS = '\x1C';

export class ESCPOSCommandBuilder {
  private commands: string[] = [];
  private paperWidth: number = 48; // Default 80mm

  constructor(paperSize: '58mm' | '80mm' = '80mm') {
    const size = PAPER_SIZES.find(s => s.id === paperSize);
    this.paperWidth = size?.maxChars || 48;
  }

  // Initialize printer
  init(): this {
    this.commands.push(ESC + '@'); // Initialize printer
    return this;
  }

  // Text alignment
  align(alignment: 'left' | 'center' | 'right'): this {
    const alignCodes = { left: 0, center: 1, right: 2 };
    this.commands.push(ESC + 'a' + String.fromCharCode(alignCodes[alignment]));
    return this;
  }

  // Text size
  textSize(width: number, height: number): this {
    const size = ((width - 1) << 4) | (height - 1);
    this.commands.push(GS + '!' + String.fromCharCode(size));
    return this;
  }

  // Bold text
  bold(enable: boolean = true): this {
    this.commands.push(ESC + 'E' + (enable ? '\x01' : '\x00'));
    return this;
  }

  // Underline
  underline(mode: 0 | 1 | 2 = 1): this {
    this.commands.push(ESC + '-' + String.fromCharCode(mode));
    return this;
  }

  // Line spacing
  lineSpacing(dots: number = 30): this {
    this.commands.push(ESC + '3' + String.fromCharCode(dots));
    return this;
  }

  // Add text
  text(content: string): this {
    this.commands.push(content);
    return this;
  }

  // Add line
  line(content: string = ''): this {
    this.commands.push(content + '\n');
    return this;
  }

  // Add separator line
  separator(char: string = '-'): this {
    this.commands.push(char.repeat(this.paperWidth) + '\n');
    return this;
  }

  // Add horizontal line with padding
  horizontalLine(leftText: string, rightText: string): this {
    const totalLen = this.paperWidth;
    const spacing = totalLen - leftText.length - rightText.length;
    const line = leftText + ' '.repeat(Math.max(0, spacing)) + rightText;
    this.commands.push(line + '\n');
    return this;
  }

  // Feed lines
  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.commands.push('\n');
    }
    return this;
  }

  // QR Code
  qrCode(data: string, size: number = 6): this {
    // QR Code model
    this.commands.push(GS + '(k' + String.fromCharCode(4, 0, 49, 65, 50, 0));
    
    // QR Code size
    this.commands.push(GS + '(k' + String.fromCharCode(3, 0, 49, 67, size));
    
    // QR Code error correction level (L=48, M=49, Q=50, H=51)
    this.commands.push(GS + '(k' + String.fromCharCode(3, 0, 49, 69, 49));
    
    // Store QR Code data
    const len = data.length + 3;
    const pL = len % 256;
    const pH = Math.floor(len / 256);
    this.commands.push(GS + '(k' + String.fromCharCode(pL, pH, 49, 80, 48) + data);
    
    // Print QR Code
    this.commands.push(GS + '(k' + String.fromCharCode(3, 0, 49, 81, 48));
    
    return this;
  }

  // Barcode (CODE128)
  barcode(data: string, type: number = 73): this {
    this.commands.push(GS + 'h' + String.fromCharCode(80)); // Height
    this.commands.push(GS + 'w' + String.fromCharCode(2)); // Width
    this.commands.push(GS + 'H' + String.fromCharCode(2)); // Text position (below)
    this.commands.push(GS + 'k' + String.fromCharCode(type, data.length) + data);
    return this;
  }

  // Cut paper
  cut(mode: 'full' | 'partial' = 'full'): this {
    if (mode === 'full') {
      this.commands.push(GS + 'V' + '\x00'); // Full cut
    } else {
      this.commands.push(GS + 'V' + '\x01'); // Partial cut
    }
    return this;
  }

  // Open cash drawer
  openDrawer(pin: number = 0): this {
    // pin 0 = drawer 1, pin 1 = drawer 2
    if (pin === 0) {
      this.commands.push(ESC + 'p' + '\x00' + '\x19' + '\xFA');
    } else {
      this.commands.push(ESC + 'p' + '\x01' + '\x19' + '\xFA');
    }
    return this;
  }

  // Beep/buzzer
  beep(times: number = 1, duration: number = 5): this {
    this.commands.push(ESC + 'B' + String.fromCharCode(times, duration));
    return this;
  }

  // Build final command string
  build(): string {
    return this.commands.join('');
  }

  // Build as Uint8Array for binary printing
  buildBytes(): Uint8Array {
    const str = this.commands.join('');
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }
}

// Helper function to create receipt
export interface ReceiptData {
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  taxId?: string;
  orderNumber: string;
  date: string;
  cashier?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  payment: {
    method: string;
    amount: number;
    change?: number;
  };
  member?: {
    name: string;
    points?: number;
    pointsEarned?: number;
  };
  footer?: string;
}

export function buildReceipt(data: ReceiptData, paperSize: '58mm' | '80mm' = '80mm'): string {
  const builder = new ESCPOSCommandBuilder(paperSize);

  builder.init();

  // Header
  if (data.shopName) {
    builder.align('center')
      .textSize(2, 2)
      .bold(true)
      .line(data.shopName)
      .textSize(1, 1)
      .bold(false);
  }

  if (data.shopAddress) {
    builder.line(data.shopAddress);
  }

  if (data.shopPhone) {
    builder.line('Tel: ' + data.shopPhone);
  }

  if (data.taxId) {
    builder.line('Tax ID: ' + data.taxId);
  }

  builder.separator('=')
    .align('left')
    .bold(true)
    .line('ใบเสร็จรับเงิน / RECEIPT')
    .bold(false);

  // Order info
  builder.horizontalLine('เลขที่:', data.orderNumber)
    .horizontalLine('วันที่:', data.date);

  if (data.cashier) {
    builder.horizontalLine('พนักงาน:', data.cashier);
  }

  if (data.member) {
    builder.horizontalLine('สมาชิก:', data.member.name);
    if (data.member.points !== undefined) {
      builder.horizontalLine('คะแนน:', data.member.points.toString());
    }
  }

  builder.separator('-');

  // Items
  data.items.forEach(item => {
    builder.line(`${item.name}`)
      .horizontalLine(
        `  ${item.quantity} x ${item.price.toFixed(2)}`,
        item.total.toFixed(2)
      );
  });

  builder.separator('-');

  // Summary
  builder.horizontalLine('รวมเงิน:', data.subtotal.toFixed(2));

  if (data.discount) {
    builder.horizontalLine('ส่วนลด:', '-' + data.discount.toFixed(2));
  }

  if (data.tax) {
    builder.horizontalLine('ภาษี:', data.tax.toFixed(2));
  }

  builder.bold(true)
    .textSize(2, 2)
    .horizontalLine('ยอดชำระ:', data.total.toFixed(2))
    .textSize(1, 1)
    .bold(false);

  // Payment
  builder.separator('-')
    .horizontalLine('ชำระด้วย:', data.payment.method)
    .horizontalLine('รับเงิน:', data.payment.amount.toFixed(2));

  if (data.payment.change) {
    builder.horizontalLine('เงินทอน:', data.payment.change.toFixed(2));
  }

  if (data.member?.pointsEarned) {
    builder.separator('-')
      .horizontalLine('คะแนนที่ได้รับ:', '+' + data.member.pointsEarned.toString());
  }

  // Footer
  builder.separator('=')
    .align('center')
    .line(data.footer || 'ขอบคุณที่ใช้บริการ')
    .line('Thank you!')
    .feed(2);

  return builder.build();
}

// Test receipt generator
export function generateTestReceipt(paperSize: '58mm' | '80mm' = '80mm'): string {
  const testData: ReceiptData = {
    shopName: 'ร้านทดสอบ',
    shopAddress: '123 ถ.ทดสอบ กรุงเทพฯ',
    shopPhone: '02-123-4567',
    taxId: '1234567890123',
    orderNumber: 'TEST-001',
    date: new Date().toLocaleString('th-TH'),
    cashier: 'Admin',
    items: [
      { name: 'กาแฟเย็น', quantity: 2, price: 50, total: 100 },
      { name: 'ชาเขียว', quantity: 1, price: 45, total: 45 }
    ],
    subtotal: 145,
    discount: 0,
    tax: 0,
    total: 145,
    payment: {
      method: 'เงินสด',
      amount: 200,
      change: 55
    },
    footer: '** ใบเสร็จทดสอบระบบ **'
  };

  return buildReceipt(testData, paperSize);
}
