
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Copy, Check } from 'lucide-react';
import { PromptPayQR } from '@/utils/promptpay';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface QRCodePromptPayProps {
  initialAmount?: number;
  onClose?: () => void;
}

const QRCodePromptPay = ({ initialAmount = 0, onClose }: QRCodePromptPayProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(initialAmount);
  const [reference, setReference] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "กรุณาใส่เบอร์โทรศัพท์",
        description: "เบอร์โทรศัพท์เป็นข้อมูลที่จำเป็นสำหรับ PromptPay",
        variant: "destructive"
      });
      return;
    }

    try {
      const config = {
        phoneNumber: phoneNumber.trim(),
        amount: amount > 0 ? amount : undefined,
        reference: reference.trim() || undefined
      };

      const qrData = PromptPayQR.generateQRCodeData(config);
      setQrCodeData(qrData);

      // Generate QR Code image
      const qrImageDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeImage(qrImageDataUrl);

      toast({
        title: "สร้าง QR Code สำเร็จ",
        description: "QR Code PromptPay ถูกสร้างเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้าง QR Code ได้",
        variant: "destructive"
      });
    }
  };

  const copyQRData = () => {
    if (qrCodeData) {
      navigator.clipboard.writeText(qrCodeData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "คัดลอกแล้ว",
        description: "ข้อมูล QR Code ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code PromptPay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone">เบอร์โทรศัพท์ PromptPay</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="0xxxxxxxxx หรือ +66xxxxxxxxx"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="reference">เลขอ้างอิง (ไม่บังคับ)</Label>
          <Input
            id="reference"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="เลขอ้างอิง"
            className="mt-1"
          />
        </div>

        <Button 
          onClick={generateQRCode} 
          className="w-full bg-coffee-600 hover:bg-coffee-700"
        >
          สร้าง QR Code
        </Button>

        {qrCodeImage && (
          <div className="space-y-3">
            <div className="text-center">
              <img 
                src={qrCodeImage} 
                alt="PromptPay QR Code" 
                className="mx-auto border rounded-lg"
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                แสกน QR Code เพื่อชำระเงิน
              </p>
              {amount > 0 && (
                <p className="text-lg font-semibold text-coffee-600">
                  ฿{amount.toLocaleString()}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              onClick={copyQRData}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  คัดลอกข้อมูล QR
                </>
              )}
            </Button>
          </div>
        )}

        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full">
            ปิด
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodePromptPay;
