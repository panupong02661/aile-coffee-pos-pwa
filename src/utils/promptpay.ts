
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
  
  // If starts with 0, replace with +66
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
  
  return `0066${digits}`;
}

// Generate EMVCo compliant PromptPay QR Code data
export function generatePromptPayQR(data: PromptPayData): string {
  const formattedPhone = formatPhoneNumber(data.phoneNumber);
  
  // EMVCo QR Code data structure
  let qrData = '';
  
  // Payload Format Indicator (00)
  qrData += '000201';
  
  // Point of Initiation Method (01) - Static QR Code
  qrData += '010212';
  
  // Merchant Account Information (30)
  let merchantInfo = '';
  merchantInfo += 'A000000677'; // PromptPay Application ID
  merchantInfo += '01'; // Length of next field
  merchantInfo += '13'; // PromptPay Identifier
  merchantInfo += formattedPhone.length.toString().padStart(2, '0');
  merchantInfo += formattedPhone;
  
  qrData += '30' + merchantInfo.length.toString().padStart(2, '0') + merchantInfo;
  
  // Transaction Currency (53) - Thai Baht (764)
  qrData += '5303764';
  
  // Transaction Amount (54) - if specified
  if (data.amount && data.amount > 0) {
    const amountStr = data.amount.toFixed(2);
    qrData += '54' + amountStr.length.toString().padStart(2, '0') + amountStr;
  }
  
  // Country Code (58) - Thailand
  qrData += '5802TH';
  
  // Additional Data Field Template (62)
  const additionalData = '07PromptPay'; // Bill Number
  qrData += '62' + (additionalData.length + 4).toString().padStart(2, '0') + '05' + additionalData.length.toString().padStart(2, '0') + additionalData;
  
  // CRC (63) - placeholder for now
  qrData += '6304';
  
  // Calculate and append CRC
  const checksum = crc16(qrData);
  qrData += checksum;
  
  return qrData;
}

// Validate Thai phone number
export function validateThaiPhoneNumber(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Thai mobile numbers: 08x-xxx-xxxx or 09x-xxx-xxxx (10 digits starting with 0)
  // Or international format: +668x-xxx-xxxx or +669x-xxx-xxxx
  if (digits.length === 10 && (digits.startsWith('08') || digits.startsWith('09'))) {
    return true;
  }
  
  if (digits.length === 11 && digits.startsWith('668') || digits.startsWith('669')) {
    return true;
  }
  
  return false;
}
