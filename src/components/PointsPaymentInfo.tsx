
interface PointsPaymentInfoProps {
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
}

const PointsPaymentInfo = ({ total, selectedMember }: PointsPaymentInfoProps) => {
  return (
    <div className="space-y-2">
      <div className="p-3 bg-purple-50 rounded border">
        <div className="text-sm text-purple-700">
          <div>ต้องใช้แต้ม: {Math.ceil(total)} แต้ม</div>
          {selectedMember && (
            <div>แต้มคงเหลือหลังใช้: {selectedMember.points - Math.ceil(total)} แต้ม</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsPaymentInfo;
