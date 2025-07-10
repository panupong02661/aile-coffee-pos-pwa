
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

interface ShopSectionProps {
  currentUser: any;
  onPaymentButtonClick?: () => void;
}

const ShopSection = ({ currentUser, onPaymentButtonClick }: ShopSectionProps) => {
  const handlePaymentClick = async () => {
    // เรียกใช้ฟังก์ชันเล่นเสียงแจ้งเตือน
    if (onPaymentButtonClick) {
      await onPaymentButtonClick();
    }
    
    // ดำเนินการชำระเงินต่อ (ถ้ามี)
    console.log('Processing payment...');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          ร้านค้า
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">ร้านค้าออนไลน์</p>
          <p className="text-sm text-gray-500 mb-6">
            สั่งซื้อสินค้าและอาหารออนไลน์ได้ที่นี่
          </p>
          
          {/* ปุ่มตัวอย่าง */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handlePaymentClick}
            >
              ดำเนินการชำระเงิน
            </Button>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handlePaymentClick}
            >
              ยืนยันการชำระเงิน
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            กดปุ่มเพื่อทดสอบเสียงแจ้งเตือน
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopSection;
