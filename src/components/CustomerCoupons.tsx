
import React, { useState } from 'react';
import { Ticket, Clock, CheckCircle, Gift } from 'lucide-react';

interface Coupon {
  id: string;
  title: string;
  description: string;
  discountValue: number;
  discountType: 'percentage' | 'amount';
  minPurchase?: number;
  expiryDate: Date;
  isUsed: boolean;
  isLimited?: boolean;
}

const CustomerCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      title: 'Flash Sale 50% Off!',
      description: 'ลดราคา 50% สำหรับเมนูเครื่องดื่มทุกแก้ว',
      discountValue: 50,
      discountType: 'percentage',
      expiryDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      isUsed: false,
      isLimited: true
    },
    {
      id: '2',
      title: 'ส่วนลด 30 บาท',
      description: 'ส่วนลด 30 บาท เมื่อสั่งซื้อครบ 200 บาท',
      discountValue: 30,
      discountType: 'amount',
      minPurchase: 200,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isUsed: false
    },
    {
      id: '3',
      title: 'ส่วนลด 15%',
      description: 'ส่วนลด 15% สำหรับออเดอร์แรก',
      discountValue: 15,
      discountType: 'percentage',
      minPurchase: 100,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isUsed: true
    }
  ]);

  const getTimeRemaining = (expiryDate: Date) => {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'หมดอายุแล้ว';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `เหลือ ${days} วัน`;
    return `เหลือ ${hours} ชั่วโมง`;
  };

  const isExpired = (expiryDate: Date) => {
    return new Date() > expiryDate;
  };

  const activeCoupons = coupons.filter(c => !c.isUsed && !isExpired(c.expiryDate));
  const usedCoupons = coupons.filter(c => c.isUsed);
  const expiredCoupons = coupons.filter(c => !c.isUsed && isExpired(c.expiryDate));

  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <div className={`relative overflow-hidden rounded-lg border-2 border-dashed ${
      coupon.isUsed 
        ? 'border-gray-300 bg-gray-50' 
        : isExpired(coupon.expiryDate)
        ? 'border-red-300 bg-red-50'
        : coupon.isLimited
        ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50'
        : 'border-orange-300 bg-orange-50'
    }`}>
      {/* Limited Badge */}
      {coupon.isLimited && !coupon.isUsed && !isExpired(coupon.expiryDate) && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
          LIMITED!
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${
              coupon.isUsed 
                ? 'bg-gray-200' 
                : isExpired(coupon.expiryDate)
                ? 'bg-red-200'
                : coupon.isLimited
                ? 'bg-gradient-to-r from-purple-200 to-pink-200'
                : 'bg-orange-200'
            }`}>
              {coupon.isUsed ? (
                <CheckCircle className="h-5 w-5 text-gray-600" />
              ) : coupon.isLimited ? (
                <Gift className="h-5 w-5 text-purple-600" />
              ) : (
                <Ticket className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className={`font-semibold ${
                coupon.isUsed || isExpired(coupon.expiryDate) ? 'text-gray-500' : 'text-gray-800'
              }`}>
                {coupon.title}
              </h3>
              <p className={`text-sm ${
                coupon.isUsed || isExpired(coupon.expiryDate) ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {coupon.description}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold ${
              coupon.isUsed || isExpired(coupon.expiryDate) ? 'text-gray-400' : 
              coupon.isLimited ? 'text-purple-600' : 'text-orange-600'
            }`}>
              {coupon.discountType === 'percentage' 
                ? `${coupon.discountValue}%` 
                : `฿${coupon.discountValue}`
              }
            </div>
            <div className="text-xs text-gray-500">
              {coupon.discountType === 'percentage' ? 'ส่วนลด' : 'ลดเงิน'}
            </div>
          </div>
        </div>

        {coupon.minPurchase && (
          <div className={`text-sm mb-2 ${
            coupon.isUsed || isExpired(coupon.expiryDate) ? 'text-gray-400' : 'text-gray-600'
          }`}>
            ขั้นต่ำ ฿{coupon.minPurchase}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-1 text-sm ${
            isExpired(coupon.expiryDate) ? 'text-red-500' : 'text-gray-500'
          }`}>
            <Clock className="h-4 w-4" />
            <span>{getTimeRemaining(coupon.expiryDate)}</span>
          </div>

          {coupon.isUsed && (
            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
              ใช้แล้ว
            </span>
          )}
          
          {!coupon.isUsed && isExpired(coupon.expiryDate) && (
            <span className="bg-red-200 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
              หมดอายุ
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Ticket className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-800">คูปองของฉัน</h2>
      </div>

      {/* Active Coupons */}
      {activeCoupons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mr-2">
              {activeCoupons.length}
            </span>
            คูปองที่ใช้ได้
          </h3>
          <div className="grid gap-4">
            {activeCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      )}

      {/* Used Coupons */}
      {usedCoupons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm mr-2">
              {usedCoupons.length}
            </span>
            คูปองที่ใช้แล้ว
          </h3>
          <div className="grid gap-4">
            {usedCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      )}

      {/* Expired Coupons */}
      {expiredCoupons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm mr-2">
              {expiredCoupons.length}
            </span>
            คูปองหมดอายุ
          </h3>
          <div className="grid gap-4">
            {expiredCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      )}

      {/* No Coupons */}
      {activeCoupons.length === 0 && usedCoupons.length === 0 && expiredCoupons.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีคูปอง</h3>
          <p className="text-gray-500">คูปองใหม่จะปรากฏที่นี่เมื่อคุณได้รับ</p>
        </div>
      )}
    </div>
  );
};

export default CustomerCoupons;
