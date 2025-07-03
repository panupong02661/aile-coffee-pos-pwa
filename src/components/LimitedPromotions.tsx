
import React, { useState, useEffect } from 'react';
import { Gift, Clock, Users, Zap } from 'lucide-react';

interface LimitedPromotion {
  id: string;
  title: string;
  description: string;
  discountValue: number;
  discountType: 'percentage' | 'amount';
  maxClaims: number;
  currentClaims: number;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
}

const LimitedPromotions = () => {
  const [promotions, setPromotions] = useState<LimitedPromotion[]>([
    {
      id: '1',
      title: 'Flash Sale 50% Off!',
      description: 'ลดราคา 50% สำหรับเมนูเครื่องดื่มทุกแก้ว',
      discountValue: 50,
      discountType: 'percentage',
      maxClaims: 100,
      currentClaims: 23,
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 ชั่วโมง
      isActive: true
    },
    {
      id: '2',
      title: 'ลด 30 บาท ทันที!',
      description: 'ส่วนลด 30 บาท เมื่อสั่งซื้อครบ 200 บาท',
      discountValue: 30,
      discountType: 'amount',
      maxClaims: 50,
      currentClaims: 12,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 ชั่วโมง
      isActive: true
    }
  ]);

  const [claimedPromotions, setClaimedPromotions] = useState<string[]>([]);

  const claimPromotion = (promotionId: string) => {
    if (claimedPromotions.includes(promotionId)) {
      alert('คุณได้รับคูปองนี้แล้ว');
      return;
    }

    const promotion = promotions.find(p => p.id === promotionId);
    if (!promotion) return;

    if (promotion.currentClaims >= promotion.maxClaims) {
      alert('คูปองหมดแล้ว');
      return;
    }

    // อัปเดตจำนวนการรับคูปอง
    setPromotions(promotions.map(p => 
      p.id === promotionId 
        ? { ...p, currentClaims: p.currentClaims + 1 }
        : p
    ));

    // เพิ่มลงในรายการที่รับแล้ว
    setClaimedPromotions([...claimedPromotions, promotionId]);
    
    alert('รับคูปองสำเร็จ! ไปดูในหน้า Coupons');
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'หมดเวลา';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `เหลือ ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">โปรโมชั่นพิเศษ</h2>
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">
          Limited Time!
        </span>
      </div>

      {promotions.filter(p => p.isActive).map(promotion => (
        <div key={promotion.id} className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-1">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{promotion.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{promotion.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{getTimeRemaining(promotion.endTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{promotion.maxClaims - promotion.currentClaims} ใบเหลือ</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold mb-2">
                  {promotion.discountType === 'percentage' 
                    ? `${promotion.discountValue}% OFF` 
                    : `฿${promotion.discountValue} OFF`
                  }
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>รับไปแล้ว {promotion.currentClaims}/{promotion.maxClaims}</span>
                <span>{Math.round(getProgressPercentage(promotion.currentClaims, promotion.maxClaims))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(promotion.currentClaims, promotion.maxClaims)}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => claimPromotion(promotion.id)}
              disabled={
                claimedPromotions.includes(promotion.id) || 
                promotion.currentClaims >= promotion.maxClaims ||
                new Date() > promotion.endTime
              }
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                claimedPromotions.includes(promotion.id)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : promotion.currentClaims >= promotion.maxClaims || new Date() > promotion.endTime
                  ? 'bg-red-300 text-red-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {claimedPromotions.includes(promotion.id)
                ? '✓ รับแล้ว'
                : promotion.currentClaims >= promotion.maxClaims
                ? 'หมดแล้ว'
                : new Date() > promotion.endTime
                ? 'หมดเวลา'
                : '🎁 รับคูปอง'
              }
            </button>
          </div>
        </div>
      ))}

      {promotions.filter(p => p.isActive).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>ไม่มีโปรโมชั่นพิเศษในขณะนี้</p>
        </div>
      )}
    </div>
  );
};

export default LimitedPromotions;
