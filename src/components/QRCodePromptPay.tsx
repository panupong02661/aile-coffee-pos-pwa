
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { QrCode, Phone, AlertCircle } from 'lucide-react';
import { generatePromptPayQR, validateThaiPhoneNumber, PromptPayData } from '@/utils/promptpay';
import QRCode from 'qrcode';

interface QRCodePromptPayProps {
  amount?: number;
  defaultPhoneNumber?: string;
  onQRGenerated?: (qrData: string) => void;
  compact?: boolean;
  shopLogoUrl?: string; // Logo to overlay on QR center
}

const QRCodePromptPay = ({ 
  amount, 
  defaultPhoneNumber = '', 
  onQRGenerated,
  compact = false,
  shopLogoUrl 
}: QRCodePromptPayProps) => {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [qrAmount, setQrAmount] = useState(amount || 0);
  const [qrCode, setQrCode] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generateQR = async () => {
    setError('');
    
    if (!phoneNumber.trim()) {
      console.error('❌ No phone number provided');
      if (!compact) setError('กรุณาระบุหมายเลขโทรศัพท์');
      return;
    }
    
    if (!validateThaiPhoneNumber(phoneNumber)) {
      console.error('❌ Invalid Thai phone number:', phoneNumber);
      if (!compact) setError('หมายเลขโทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)');
      return;
    }
    
    try {
      console.log('✅ Generating PromptPay QR Code');
      console.log('  📱 Phone:', phoneNumber);
      console.log('  💰 Amount:', qrAmount);
      
      const promptPayData: PromptPayData = {
        phoneNumber: phoneNumber,
        amount: qrAmount > 0 ? qrAmount : undefined
      };
      
      console.log('📦 PromptPay Data:', promptPayData);
      
      const qrString = generatePromptPayQR(promptPayData);
      setQrData(qrString);
      
      console.log('✅ QR String generated (length:', qrString.length, ')');
      console.log('   First 50 chars:', qrString.substring(0, 50));
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: compact ? 200 : 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // If we have a shop logo, overlay it on the QR code
      if (shopLogoUrl) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create QR image
          const qrImg = new Image();
          qrImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            qrImg.onload = resolve;
            qrImg.onerror = reject;
            qrImg.src = qrCodeDataURL;
          });
          
          // Set canvas size to QR code size
          canvas.width = qrImg.width;
          canvas.height = qrImg.height;
          
          // Draw QR code
          ctx.drawImage(qrImg, 0, 0);
          
          // Load and draw logo in center
          const logo = new Image();
          logo.crossOrigin = 'anonymous';
          
          try {
            await new Promise((resolve, reject) => {
              logo.onload = resolve;
              logo.onerror = reject;
              logo.src = shopLogoUrl;
            });
            
            // Calculate logo size (about 20% of QR code)
            const logoSize = Math.floor(canvas.width * 0.2);
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;
            
            // Draw white background circle for logo
            const bgRadius = logoSize / 2 + 4;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, bgRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw logo with rounded corners
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            ctx.restore();
            
            // Convert canvas to data URL
            const finalQR = canvas.toDataURL('image/png');
            setQrCode(finalQR);
            console.log('✅ QR Code with logo overlay generated successfully');
          } catch (logoErr) {
            console.warn('⚠️ Could not load logo, using plain QR:', logoErr);
            setQrCode(qrCodeDataURL);
          }
        } else {
          setQrCode(qrCodeDataURL);
        }
      } else {
        setQrCode(qrCodeDataURL);
      }
      
      console.log('✅ QR Code image generated successfully');
      
      if (onQRGenerated) {
        onQRGenerated(qrString);
      }
    } catch (err) {
      console.error('❌ QR Code generation error:', err);
      if (!compact) setError('เกิดข้อผิดพลาดในการสร้าง QR Code');
    }
  };

  useEffect(() => {
    console.log('📊 Amount prop changed:', amount);
    if (amount !== undefined) {
      setQrAmount(amount);
    }
  }, [amount]);

  useEffect(() => {
    if (defaultPhoneNumber) {
      setPhoneNumber(defaultPhoneNumber);
    }
  }, [defaultPhoneNumber]);

  // Auto-generate QR whenever phone is valid (amount or logo optional)
  useEffect(() => {
    if (phoneNumber && validateThaiPhoneNumber(phoneNumber)) {
      console.log('🔄 Auto-generating QR (amount/logo optional):', qrAmount, shopLogoUrl);
      generateQR();
    }
  }, [phoneNumber, qrAmount, shopLogoUrl]);

  // Compact mode - show only QR code
  if (compact) {
    // Check if phone number is invalid
    const isInvalidPhone = phoneNumber && !validateThaiPhoneNumber(phoneNumber);
    
    return (
      <div className="text-center space-y-2">
        {qrCode ? (
          <>
            <img src={qrCode} alt="PromptPay QR Code" className="mx-auto" />
            <div className="space-y-1">
              {qrAmount > 0 && (
                <p className="text-sm font-semibold text-orange-600">
                  ยอดชำระ: ฿{qrAmount.toLocaleString()}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="w-[200px] h-[200px] bg-orange-50 rounded flex items-center justify-center mx-auto border-2 border-orange-200">
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
            {isInvalidPhone ? (
              <div className="text-center space-y-2 px-4">
                <p className="text-sm font-semibold text-orange-600">
                  ยังไม่ได้ตั้งค่าเบอร์โทรศัพท์ PromptPay
                </p>
                <p className="text-xs text-gray-600">
                  กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าเบอร์มือถือ PromptPay
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  (เบอร์ปัจจุบัน: {phoneNumber})
                </p>
                <p className="text-xs text-gray-500">
                  ต้องเป็นเบอร์มือถือที่ขึ้นต้นด้วย 08x หรือ 09x เท่านั้น
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">กำลังโหลด QR Code...</p>
                {phoneNumber && (
                  <p className="text-xs text-gray-400 font-mono">📱 {phoneNumber}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full mode - show complete card interface
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <QrCode className="w-5 h-5" />
          QR Code PromptPay
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">หมายเลขโทรศัพท์ PromptPay (มือถือเท่านั้น)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="08x-xxx-xxxx หรือ 09x-xxx-xxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-orange-600">
            * ต้องเป็นเบอร์มือถือที่ขึ้นต้นด้วย 08 หรือ 09 เท่านั้น (ไม่รองรับเบอร์บ้าน)
          </p>
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
          className="w-full bg-primary hover:bg-primary/90"
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
