
// PromptPay QR Code Generator ตามมาตรฐาน EMVCo
export interface PromptPayData {
  phoneNumber: string;
  amount?: number;
}

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
  const formattedPhone = formatPhoneNumber(data.phoneNumber);

  // Helper to build TLV fields
  const tlv = (id: string, value: string) => id + value.length.toString().padStart(2, '0') + value;

  // Point of Initiation: 11 = static, 12 = dynamic (use dynamic when amount is specified)
  const poiMethod = data.amount && data.amount > 0 ? '12' : '11';

  // Merchant Account Information for PromptPay (ID 29)
  // Sub-fields:
  // 00: GUID "A000000677010111"
  // 01: Mobile number in 0066XXXXXXXXX format
  const guid = tlv('00', 'A000000677010111');
  const account = tlv('01', formattedPhone);
  const merchantAccountInfo = tlv('29', guid + account);

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
