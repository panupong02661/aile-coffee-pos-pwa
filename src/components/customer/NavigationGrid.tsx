
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Gift, Tag, ShoppingBag, Clock, BarChart3 } from 'lucide-react';

interface NavigationGridProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationGrid = ({ activeTab, onTabChange }: NavigationGridProps) => {
  const menuItems = [
    { id: 'profile', label: 'โปรไฟล์', icon: User, color: 'bg-blue-500' },
    { id: 'rewards', label: 'รางวัล', icon: Gift, color: 'bg-purple-500' },
    { id: 'coupons', label: 'คูปอง', icon: Tag, color: 'bg-green-500' },
    { id: 'shop', label: 'สั่งซื้อ', icon: ShoppingBag, color: 'bg-orange-500' },
    { id: 'history', label: 'ประวัติ', icon: Clock, color: 'bg-red-500' },
    { id: 'stats', label: 'สถิติ', icon: BarChart3, color: 'bg-indigo-500' },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Card 
              key={item.id}
              className={`cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'ring-2 ring-orange-500 bg-orange-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className={`text-sm font-medium ${
                  isActive ? 'text-orange-600' : 'text-gray-700'
                }`}>
                  {item.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationGrid;
