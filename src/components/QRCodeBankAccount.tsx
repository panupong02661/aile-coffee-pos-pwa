import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Building2, AlertCircle } from 'lucide-react';
import { generatePromptPayQR, validateThaiAccountNumber, formatAccountNumber, THAI_BANKS, PromptPayData } from '@/utils/promptpay';
import QRCode from 'qrcode';

interface QRCodeBankAccountProps {
  amount?: number;
  defaultAccountNumber?: string;
  defaultBankCode?: string;
  onQRGenerated?: (qrData: string) => void;
  compact?: boolean;
  shopLogoUrl?: string;
}

const QRCodeBankAccount = ({ 
  amount, 
  defaultAccountNumber = '', 
  defaultBankCode = '',
  onQRGenerated,
  compact = false,
  shopLogoUrl 
}: QRCodeBankAccountProps) => {
  const [accountNumber, setAccountNumber] = useState(defaultAccountNumber);
  const [bankCode, setBankCode] = useState(defaultBankCode);
  const [qrAmount, setQrAmount] = useState(amount || 0);
  const [qrCode, setQrCode] = useState<string>('');
  const [error, setError] = useState<string>('');

  const selectedBank = THAI_BANKS.find(b => b.code === bankCode);

  const generateQR = async () => {
    setError('');
    
    if (!accountNumber.trim()) {
      if (!compact) setError('กรุณาระบุเลขบัญชีธนาคาร');
      return;
    }

    const formattedAccount = formatAccountNumber(accountNumber);
    
    if (!validateThaiAccountNumber(formattedAccount)) {
      if (!compact) setError('เลขบัญชีไม่ถูกต้อง (ต้องมี 10-15 หลัก)');
      return;
    }
    
    try {
      console.log('✅ Generating PromptPay QR Code (Bank Account)');
      console.log('  🏦 Account:', formattedAccount);
      console.log('  💰 Amount:', qrAmount);
      
      const promptPayData: PromptPayData = {
        accountNumber: formattedAccount,
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
    if (defaultAccountNumber) {
      setAccountNumber(defaultAccountNumber);
    }
  }, [defaultAccountNumber]);

  useEffect(() => {
    if (defaultBankCode) {
      setBankCode(defaultBankCode);
    }
  }, [defaultBankCode]);

  // Auto-generate QR whenever account is valid
  useEffect(() => {
    const formattedAccount = formatAccountNumber(accountNumber);
    if (formattedAccount && validateThaiAccountNumber(formattedAccount)) {
      generateQR();
    }
  }, [accountNumber, qrAmount, shopLogoUrl]);

  // Compact mode - show only QR code
  if (compact) {
    const isInvalidAccount = accountNumber && !validateThaiAccountNumber(formatAccountNumber(accountNumber));
    
    return (
      <div className="text-center space-y-2">
        {qrCode ? (
          <>
            <img src={qrCode} alt="PromptPay QR Code" className="mx-auto" />
            <div className="space-y-1">
              {selectedBank && (
                <p className="text-xs text-gray-600">{selectedBank.name}</p>
              )}
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
            {isInvalidAccount ? (
              <div className="text-center space-y-2 px-4">
                <p className="text-sm font-semibold text-orange-600">
                  เลขบัญชีไม่ถูกต้อง
                </p>
                <p className="text-xs text-gray-600">
                  กรุณาตรวจสอบเลขบัญชีธนาคาร (10-15 หลัก)
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
        <CardTitle className="flex items-center gap-2 text-coffee-800">
          <Building2 className="w-5 h-5" />
          QR Code จากเลขบัญชี
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bank">เลือกธนาคาร</Label>
          <Select value={bankCode} onValueChange={setBankCode}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกธนาคาร" />
            </SelectTrigger>
            <SelectContent>
              {THAI_BANKS.map((bank) => (
                <SelectItem key={bank.code} value={bank.code}>
                  {bank.name} ({bank.shortName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">เลขบัญชีธนาคาร</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="account"
              type="text"
              placeholder="xxx-x-xxxxx-x"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            เลขบัญชี 10-15 หลัก (ไม่ต้องใส่ขีด)
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
          className="w-full bg-coffee-600 hover:bg-coffee-700"
          disabled={!accountNumber.trim()}
        >
          สร้าง QR Code
        </Button>

        {qrCode && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img src={qrCode} alt="PromptPay QR Code" className="mx-auto" />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              {selectedBank && <p><strong>ธนาคาร:</strong> {selectedBank.name}</p>}
              <p><strong>เลขบัญชี:</strong> {formatAccountNumber(accountNumber)}</p>
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

export default QRCodeBankAccount;
