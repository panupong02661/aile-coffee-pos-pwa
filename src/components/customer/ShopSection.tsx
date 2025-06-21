
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Phone, UserCheck } from 'lucide-react';

const ShopSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          สั่งสินค้าในร้าน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">ระบบสั่งอาหารออนไลน์</h3>
          <p className="text-gray-600 mb-4">
            สั่งอาหารจากเมนูของร้านและชำระเงินออนไลน์
          </p>
          <Button>เริ่มสั่งอาหาร</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-4 border rounded-lg">
            <Phone className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <h4 className="font-medium">สั่งผ่านแอป</h4>
            <p className="text-sm text-gray-600">สะดวก รวดเร็ว</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <UserCheck className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <h4 className="font-medium">รับที่ร้าน</h4>
            <p className="text-sm text-gray-600">Pick up พร้อมรับ</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopSection;
