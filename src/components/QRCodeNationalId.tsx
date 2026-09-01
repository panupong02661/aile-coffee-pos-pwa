import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IdCard, AlertCircle } from 'lucide-react';
import { generatePromptPayQR, PromptPayData } from '@/utils/promptpay';
import QRCode from 'qrcode';

interface QRCodeNationalIdProps {
  amount?: number;
  defaultNationalId?: string;
  onQRGenerated?: (qrData: string) => void;
  compact?: boolean;
  shopLogoUrl?: string;
}

// Validate Thai National ID (13 digits with checksum)
function validateNationalId(id: string): boolean {
  const digits = id.replace(/\D/g, '');
  if (digits.length !== 13) return false;
  
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  
  return parseInt(digits[12]) === checkDigit;
}

const QRCodeNationalId = ({ 
  amount, 
  defaultNationalId = '', 
  onQRGenerated,
  compact = false,
  shopLogoUrl 
}: QRCodeNationalIdProps) => {
  const [nationalId, setNationalId] = useState(defaultNationalId);
  const [qrAmount, setQrAmount] = useState(amount || 0);
  const [qrCode, setQrCode] = useState<string>('');
  const [error, setError] = useState<string>('');

  const formatNationalId = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 1) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
    if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
  };

  const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNationalId(e.target.value);
    setNationalId(formatted);
  };

  const generateQR = async () => {
    setError('');
    
    const cleanId = nationalId.replace(/\D/g, '');
    
    if (!cleanId) {
      if (!compact) setError('กรุณาระบุเลขบัตรประชาชน');
      return;
    }

    if (cleanId.length !== 13) {
      if (!compact) setError('เลขบัตรประชาชนต้องมี 13 หลัก');
      return;
    }

    if (!validateNationalId(cleanId)) {
      if (!compact) setError('เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ตรง)');
      return;
    }
    
    try {
      console.log('✅ Generating PromptPay QR Code (National ID)');
      console.log('  🆔 National ID:', cleanId);
      console.log('  💰 Amount:', qrAmount);
      
      const promptPayData: PromptPayData = {
        nationalId: cleanId,
        amount: qrAmount > 0 ? qrAmount : undefined
      };
      
      const qrString = generatePromptPayQR(promptPayData);
      
      console.log('✅ QR String generated (length:', qrString.length, ')');
      
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
          const qrImg = new Image();
          qrImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            qrImg.onload = resolve;
            qrImg.onerror = reject;
            qrImg.src = qrCodeDataURL;
          });
          
          canvas.width = qrImg.width;
          canvas.height = qrImg.height;
          ctx.drawImage(qrImg, 0, 0);
          
          const logo = new Image();
          logo.crossOrigin = 'anonymous';
          
          try {
            await new Promise((resolve, reject) => {
              logo.onload = resolve;
              logo.onerror = reject;
              logo.src = shopLogoUrl;
            });
            
            const logoSize = Math.floor(canvas.width * 0.2);
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;
            
            const bgRadius = logoSize / 2 + 4;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, bgRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            ctx.restore();
            
            const finalQR = canvas.toDataURL('image/png');
            setQrCode(finalQR);
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
    if (amount !== undefined) {
      setQrAmount(amount);
    }
  }, [amount]);

  useEffect(() => {
    if (defaultNationalId) {
      setNationalId(formatNationalId(defaultNationalId));
    }
  }, [defaultNationalId]);

  // Auto-generate QR whenever national ID is valid
  useEffect(() => {
    const cleanId = nationalId.replace(/\D/g, '');
    if (cleanId.length === 13 && validateNationalId(cleanId)) {
      generateQR();
    }
  }, [nationalId, qrAmount, shopLogoUrl]);

  // Compact mode - show only QR code
  if (compact) {
    const cleanId = nationalId.replace(/\D/g, '');
    const isInvalidId = cleanId.length === 13 && !validateNationalId(cleanId);
    
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
            {isInvalidId ? (
              <div className="text-center space-y-2 px-4">
                <p className="text-sm font-semibold text-orange-600">
                  เลขบัตรประชาชนไม่ถูกต้อง
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">กำลังโหลด QR Code...</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full mode - show complete card interface
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <IdCard className="w-5 h-5" />
          QR Code จากเลขบัตรประชาชน
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="national-id">เลขบัตรประชาชน 13 หลัก</Label>
          <div className="relative">
            <IdCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="national-id"
              type="text"
              placeholder="x-xxxx-xxxxx-xx-x"
              value={nationalId}
              onChange={handleNationalIdChange}
              className="pl-10 font-mono"
              maxLength={17}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            เลขบัตรประชาชน 13 หลักที่ลงทะเบียน PromptPay
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
          disabled={!nationalId.trim()}
        >
          สร้าง QR Code
        </Button>

        {qrCode && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img src={qrCode} alt="PromptPay QR Code" className="mx-auto" />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>เลขบัตรประชาชน:</strong> {nationalId}</p>
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

export default QRCodeNationalId;
