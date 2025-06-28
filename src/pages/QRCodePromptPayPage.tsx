
import QRCodePromptPay from '@/components/QRCodePromptPay';

const QRCodePromptPayPage = () => {
  return (
    <div className="min-h-screen bg-cream-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-coffee-800 mb-2">
            QR Code PromptPay
          </h1>
          <p className="text-coffee-600">
            สร้าง QR Code PromptPay สำหรับรับชำระเงิน
          </p>
        </div>
        
        <div className="flex justify-center">
          <QRCodePromptPay />
        </div>
      </div>
    </div>
  );
};

export default QRCodePromptPayPage;
