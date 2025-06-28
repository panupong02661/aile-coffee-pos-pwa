
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { QrCode, Phone } from 'lucide-react';
import { generatePromptPayQR, validateThaiPhoneNumber, PromptPayData } from '@/utils/promptpay';
import QRCode from 'qrcode';

interface QRCodePromptPayProps {
  amount?: number;
  defaultPhoneNumber?: string;
  onQRGenerated?: (qrData: string) => void;
}

const QRCodePromptPay = ({ amount, defaultPhoneNumber = '', onQRGenerated }: QRCodePromptPayProps) => {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [qrAmount, setQrAmount] = useState(amount || 0);
  const [qrCode, setQrCode] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generateQR = async () => {
    setError('');
    
    if (!phoneNumber.trim()) {
      setError('กรุณาระบุหมายเลขโทรศัพท์');
      return;
    }
    
    if (!validateThaiPhoneNumber(phoneNumber)) {
      setError('หมายเลขโทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)');
      return;
    }
    
    try {
      const promptPayData: PromptPayData = {
        phoneNumber: phoneNumber,
        amount: qrAmount > 0 ? qrAmount : undefined
      };
      
      const qrString = generatePromptPayQR(promptPayData);
      setQrData(qrString);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCode(qrCodeDataURL);
      
      if (onQRGenerated) {
        onQRGenerated(qrString);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสร้าง QR Code');
      console.error('QR Code generation error:', err);
    }
  };

  useEffect(() => {
    if (amount !== undefined) {
      setQrAmount(amount);
    }
  }, [amount]);

  useEffect(() => {
    if (defaultPhoneNumber) {
      setPhoneNumber(defaultPhoneNumber);
    }
  }, [defaultPhoneNumber]);

  // Auto-generate QR when amount or phone changes (if both are valid)
  useEffect(() => {
    if (phoneNumber && validateThaiPhoneNumber(phoneNumber) && qrAmount >= 0) {
      generateQR();
    }
  }, [phoneNumber, qrAmount]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-coffee-800">
          <QrCode className="w-5 h-5" />
          QR Code PromptPay
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">หมายเลขโทรศัพท์</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="081-234-5678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={qrAmount || ''}
            onChange={(e) => setQrAmount(parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">
            หากไม่ระบุจำนวนเงิน ผู้ใช้สามารถกรอกจำนวนเงินเองได้
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <Button 
          onClick={generateQR} 
          className="w-full bg-coffee-600 hover:bg-coffee-700"
          disabled={!phoneNumber.trim()}
        >
          สร้าง QR Code
        </Button>

        {qrCode && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img src={qrCode} alt="PromptPay QR Code" className="mx-auto" />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>เบอร์:</strong> {phoneNumber}</p>
              {qrAmount > 0 && <p><strong>จำนวน:</strong> ฿{qrAmount.toLocaleString()}</p>}
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>แสกน QR Code ด้วยแอป Banking หรือ PromptPay</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodePromptPay;
