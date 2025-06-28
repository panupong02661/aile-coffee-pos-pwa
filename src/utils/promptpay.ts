
export interface PromptPayConfig {
  phoneNumber: string;
  amount?: number;
  reference?: string;
}

export class PromptPayQR {
  private static readonly PAYLOAD_FORMAT_INDICATOR = '00';
  private static readonly POINT_OF_INITIATION_METHOD = '01';
  private static readonly MERCHANT_ACCOUNT_INFORMATION = '29';
  private static readonly MERCHANT_ACCOUNT_INFORMATION_GUI = '0016';
  private static readonly MERCHANT_ACCOUNT_INFORMATION_PHONE = '01';
  private static readonly MERCHANT_ACCOUNT_INFORMATION_RECEIVING_ID = '02';
  private static readonly TRANSACTION_CURRENCY = '53';
  private static readonly TRANSACTION_AMOUNT = '54';
  private static readonly COUNTRY_CODE = '58';
  private static readonly MERCHANT_NAME = '59';
  private static readonly MERCHANT_CITY = '60';
  private static readonly ADDITIONAL_DATA_FIELD_TEMPLATE = '62';
  private static readonly ADDITIONAL_DATA_FIELD_TEMPLATE_BILL_NUMBER = '01';
  private static readonly CRC = '63';

  static generateQRCodeData(config: PromptPayConfig): string {
    const { phoneNumber, amount, reference } = config;
    
    // Format phone number (remove +66 and replace with 0)
    const formatPhoneNumber = (phone: string): string => {
      let formatted = phone.replace(/\D/g, ''); // Remove non-digits
      if (formatted.startsWith('66')) {
        formatted = '0' + formatted.substring(2);
      }
      return formatted;
    };

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Build QR code data
    let qrData = '';
    
    // Payload Format Indicator (00)
    qrData += this.buildTLV(this.PAYLOAD_FORMAT_INDICATOR, '01');
    
    // Point of Initiation Method (01) - Static QR Code
    qrData += this.buildTLV(this.POINT_OF_INITIATION_METHOD, '11');
    
    // Merchant Account Information (29)
    let merchantAccountInfo = '';
    merchantAccountInfo += this.buildTLV(this.MERCHANT_ACCOUNT_INFORMATION_GUI, 'A000000677010111');
    merchantAccountInfo += this.buildTLV(this.MERCHANT_ACCOUNT_INFORMATION_PHONE, formattedPhone);
    
    qrData += this.buildTLV(this.MERCHANT_ACCOUNT_INFORMATION, merchantAccountInfo);
    
    // Transaction Currency (53) - THB
    qrData += this.buildTLV(this.TRANSACTION_CURRENCY, '764');
    
    // Transaction Amount (54) - Optional
    if (amount && amount > 0) {
      qrData += this.buildTLV(this.TRANSACTION_AMOUNT, amount.toFixed(2));
    }
    
    // Country Code (58)
    qrData += this.buildTLV(this.COUNTRY_CODE, 'TH');
    
    // Merchant Name (59)
    qrData += this.buildTLV(this.MERCHANT_NAME, 'Aile Coffee');
    
    // Merchant City (60)
    qrData += this.buildTLV(this.MERCHANT_CITY, 'Bangkok');
    
    // Additional Data Field Template (62) - Optional
    if (reference) {
      const additionalData = this.buildTLV(this.ADDITIONAL_DATA_FIELD_TEMPLATE_BILL_NUMBER, reference);
      qrData += this.buildTLV(this.ADDITIONAL_DATA_FIELD_TEMPLATE, additionalData);
    }
    
    // CRC (63) - Calculate CRC16 checksum
    const crcData = qrData + this.CRC + '04';
    const crc = this.calculateCRC16(crcData);
    qrData += this.buildTLV(this.CRC, crc);
    
    return qrData;
  }

  private static buildTLV(tag: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return tag + length + value;
  }

  private static calculateCRC16(data: string): string {
    const polynomial = 0x1021;
    let crc = 0xFFFF;
    
    for (let i = 0; i < data.length; i++) {
      crc ^= (data.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = ((crc << 1) ^ polynomial) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
}
