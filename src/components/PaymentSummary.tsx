
interface PaymentSummaryProps {
  total: number;
  selectedMember?: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    tier: 'silver' | 'gold' | 'platinum';
    points: number;
    total_spent: number;
  } | null;
  paymentMethod: string;
}

const PaymentSummary = ({ total, selectedMember, paymentMethod }: PaymentSummaryProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>ยอดชำระทั้งหมด:</span>
        <span className="text-green-600">฿{total.toLocaleString()}</span>
      </div>
      {selectedMember && (
        <div className="mt-2 text-sm text-gray-600">
          สมาชิก: {selectedMember.name} ({selectedMember.phone})
          {paymentMethod === 'points' && (
            <div className="text-blue-600">
              แต้มปัจจุบัน: {selectedMember.points} แต้ม
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentSummary;
