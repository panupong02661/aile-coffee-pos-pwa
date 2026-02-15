
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QRCodeGenerator = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();
  
  // Use published URL so customers don't hit Lovable preview auth
  const getPublishedOrigin = () => {
    const host = window.location.hostname;
    // If on preview subdomain, convert to published URL
    if (host.includes('preview--')) {
      const projectSlug = 'aile-coffee-pos-pwa';
      return `https://${projectSlug}.lovable.app`;
    }
    return window.location.origin;
  };
  const registrationUrl = `${getPublishedOrigin()}/customer-mobile-app`;

  useEffect(() => {
    // Generate QR code using QR Server API
    const generateQRCode = () => {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}`;
      setQrCodeUrl(qrUrl);
    };

    generateQRCode();
  }, [registrationUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(registrationUrl);
    toast({ title: 'สำเร็จ', description: 'คัดลอก URL เรียบร้อยแล้ว' });
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'member-registration-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'สำเร็จ', description: 'ดาวน์โหลด QR Code เรียบร้อยแล้ว' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code สำหรับสมัครสมาชิก
        </CardTitle>
        <CardDescription>ให้ลูกค้าแสกน QR Code เพื่อสมัครสมาชิกออนไลน์</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {qrCodeUrl && (
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <img 
                src={qrCodeUrl} 
                alt="QR Code สำหรับสมัครสมาชิก" 
                className="w-64 h-64"
              />
            </div>
          )}
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">URL สำหรับสมัครสมาชิก:</p>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
              {registrationUrl}
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <Button 
              onClick={handleCopyUrl} 
              variant="outline" 
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              คัดลอก URL
            </Button>
            <Button 
              onClick={handleDownloadQR} 
              variant="outline" 
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลด QR
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">วิธีใช้งาน</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>ดาวน์โหลด QR Code หรือคัดลอก URL</li>
            <li>นำไปติดตั้งในร้านหรือแชร์ให้ลูกค้า</li>
            <li>ลูกค้าแสกน QR Code หรือเข้า URL</li>
            <li>ลูกค้ากรอกข้อมูลเพื่อสมัครสมาชิก</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
