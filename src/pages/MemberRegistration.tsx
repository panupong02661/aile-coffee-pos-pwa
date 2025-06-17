
import QRMemberRegistration from '@/components/QRMemberRegistration';

const MemberRegistration = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-coffee-800 mb-2">ร้านกาแฟแสนดี</h1>
          <p className="text-coffee-600">สมัครสมาชิกเพื่อรับสิทธิประโยชน์พิเศษ</p>
        </div>
        <QRMemberRegistration />
      </div>
    </div>
  );
};

export default MemberRegistration;
