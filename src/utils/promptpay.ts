
// PromptPay QR Code Generator ตามมาตรฐาน EMVCo
export interface PromptPayData {
  phoneNumber?: string;
  nationalId?: string;      // เลขบัตรประชาชน 13 หลัก
  taxId?: string;           // เลขประจำตัวผู้เสียภาษี
  eWalletId?: string;       // e-Wallet ID
  bankAccount?: {           // บัญชีธนาคาร
    bankCode: string;       // รหัสธนาคาร 3 หลัก
    accountNumber: string;  // เลขบัญชี
  };
  amount?: number;
}

// Thai Bank codes for PromptPay
export const THAI_BANKS = [
  { code: '002', name: 'ธนาคารกรุงเทพ', shortName: 'BBL' },
  { code: '004', name: 'ธนาคารกสิกรไทย', shortName: 'KBANK' },
  { code: '006', name: 'ธนาคารกรุงไทย', shortName: 'KTB' },
  { code: '011', name: 'ธนาคารทหารไทยธนชาต', shortName: 'TTB' },
  { code: '014', name: 'ธนาคารไทยพาณิชย์', shortName: 'SCB' },
  { code: '017', name: 'ธนาคารซิตี้แบงก์', shortName: 'CITI' },
  { code: '020', name: 'ธนาคารสแตนดาร์ดชาร์เตอร์ด', shortName: 'SCBT' },
  { code: '022', name: 'ธนาคารซีไอเอ็มบีไทย', shortName: 'CIMBT' },
  { code: '024', name: 'ธนาคารยูโอบี', shortName: 'UOBT' },
  { code: '025', name: 'ธนาคารกรุงศรีอยุธยา', shortName: 'BAY' },
  { code: '030', name: 'ธนาคารออมสิน', shortName: 'GSB' },
  { code: '033', name: 'ธนาคารอาคารสงเคราะห์', shortName: 'GHB' },
  { code: '034', name: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร', shortName: 'BAAC' },
  { code: '066', name: 'ธนาคารอิสลามแห่งประเทศไทย', shortName: 'ISBT' },
  { code: '067', name: 'ธนาคารทิสโก้', shortName: 'TISCO' },
  { code: '069', name: 'ธนาคารเกียรตินาคินภัทร', shortName: 'KKP' },
  { code: '070', name: 'ธนาคารไอซีบีซี (ไทย)', shortName: 'ICBCT' },
  { code: '071', name: 'ธนาคารไทยเครดิต', shortName: 'TCD' },
  { code: '073', name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์', shortName: 'LHFG' },
] as const;

export type BankCode = typeof THAI_BANKS[number]['code'];

// CRC16-CCITT calculation for EMVCo
function crc16(data: string): string {
  let crc = 0xFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Format phone number for PromptPay
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If already in 0066XXXXXXXXX format
  if (digits.startsWith('0066')) {
    return digits;
  }
  
  // If starts with 0, replace with 0066
  if (digits.startsWith('0')) {
    return `0066${digits.substring(1)}`;
  }
  
  // If already starts with 66, add 00
  if (digits.startsWith('66')) {
    return `00${digits}`;
  }
  
  // If starts with +66, replace + with 00
  if (phoneNumber.startsWith('+66')) {
    return `0066${digits.substring(2)}`;
  }
  
  // Fallback: prefix with 0066
  return `0066${digits}`;
}

// Generate EMVCo compliant PromptPay QR Code data
export function generatePromptPayQR(data: PromptPayData): string {
  // Helper to build TLV fields
  const tlv = (id: string, value: string) => id + value.length.toString().padStart(2, '0') + value;

  // Point of Initiation: 11 = static, 12 = dynamic (use dynamic when amount is specified)
  const poiMethod = data.amount && data.amount > 0 ? '12' : '11';

  let merchantAccountInfo: string;
  const guid = tlv('00', 'A000000677010111');

  if (data.bankAccount) {
    // Bank Account mode (ID 04 in sub-field)
    // Format: bank code (3 digits) + account number
    const bankAccountId = data.bankAccount.bankCode + data.bankAccount.accountNumber.replace(/\D/g, '');
    const account = tlv('04', bankAccountId);
    merchantAccountInfo = tlv('29', guid + account);
  } else if (data.nationalId) {
    // National ID mode (ID 02 in sub-field) - 13 digits
    const nationalIdClean = data.nationalId.replace(/\D/g, '');
    const account = tlv('02', nationalIdClean);
    merchantAccountInfo = tlv('29', guid + account);
  } else if (data.taxId) {
    // Tax ID mode (ID 02 in sub-field) - 13 digits with prefix
    const taxIdClean = data.taxId.replace(/\D/g, '');
    const account = tlv('02', taxIdClean);
    merchantAccountInfo = tlv('29', guid + account);
  } else if (data.eWalletId) {
    // E-Wallet mode (ID 03 in sub-field)
    const account = tlv('03', data.eWalletId);
    merchantAccountInfo = tlv('29', guid + account);
  } else if (data.phoneNumber) {
    // Phone number mode (ID 01 in sub-field)
    const formattedPhone = formatPhoneNumber(data.phoneNumber);
    const account = tlv('01', formattedPhone);
    merchantAccountInfo = tlv('29', guid + account);
  } else {
    throw new Error('At least one identifier (phone, nationalId, taxId, eWalletId, or bankAccount) is required');
  }

  // Build payload
  let qrData = '';
  qrData += '000201';                 // Payload Format Indicator
  qrData += tlv('01', poiMethod);     // Point of Initiation Method
  qrData += merchantAccountInfo;      // Merchant Account Information (PromptPay)
  qrData += tlv('53', '764');         // Transaction Currency: THB (764)

  // Optional fixed amount
  if (data.amount && data.amount > 0) {
    const amountStr = data.amount.toFixed(2);
    qrData += tlv('54', amountStr);   // Transaction Amount
  }

  qrData += tlv('58', 'TH');          // Country Code: TH

  // CRC (63) - append placeholder then calculate
  qrData += '6304';
  const checksum = crc16(qrData);
  qrData += checksum;

  return qrData;
}

// Validate Thai bank account number (10-15 digits depending on bank)
export function validateThaiAccountNumber(accountNumber: string): boolean {
  const digits = accountNumber.replace(/\D/g, '');
  // Most Thai bank accounts are 10-12 digits, some can be up to 15
  return digits.length >= 10 && digits.length <= 15;
}

// Format account number for PromptPay (remove non-digits)
export function formatAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/\D/g, '');
}

// Validate Thai phone number
export function validateThaiPhoneNumber(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Local format: 06/08/09 + 8 digits (total 10)
  if (digits.length === 10 && (digits.startsWith('06') || digits.startsWith('08') || digits.startsWith('09'))) {
    return true;
  }

  // International formats: 6606/6608/6609 + 8 digits (total 11)
  if (digits.length === 11 && (digits.startsWith('6606') || digits.startsWith('6608') || digits.startsWith('6609'))) {
    return true;
  }

  // With international call prefix: 006606/006608/006609 + 8 digits (total 12)
  if (digits.length === 12 && (digits.startsWith('006606') || digits.startsWith('006608') || digits.startsWith('006609'))) {
    return true;
  }
  
  return false;
}
