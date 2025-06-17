
interface QRPaymentInfoProps {
  total: number;
}

const QRPaymentInfo = ({ total }: QRPaymentInfoProps) => {
  return (
    <div className="space-y-2">
      <div className="p-3 bg-blue-50 rounded border text-center">
        <div className="text-sm text-blue-700">
          แสดง QR Code สำหรับการชำระเงิน
        </div>
        <div className="text-lg font-semibold text-blue-800 mt-1">
          ฿{total.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default QRPaymentInfo;
