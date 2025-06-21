
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Gift, Tag, ShoppingBag } from 'lucide-react';

const NavigationGrid: React.FC = () => {
  return (
    <div className="p-6 pt-0">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-white/20 rounded-full p-4 inline-block mb-3">
              <User className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">Member</h3>
            <p className="text-sm opacity-80">จัดการโปรไฟล์</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-white/20 rounded-full p-4 inline-block mb-3">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">Rewards</h3>
            <p className="text-sm opacity-80">แลกของรางวัล</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-white/20 rounded-full p-4 inline-block mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">Menu</h3>
            <p className="text-sm opacity-80">สั่งอาหาร</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="bg-white/20 rounded-full p-4 inline-block mb-3">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">Promotion</h3>
            <p className="text-sm opacity-80">โปรโมชั่น</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NavigationGrid;
