
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Gift, Tag, ShoppingBag } from 'lucide-react';

interface NavigationGridProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationGrid = ({ activeTab, onTabChange }: NavigationGridProps) => {
  const navigationItems = [
    {
      id: 'profile',
      label: 'โปรไฟล์',
      icon: User,
      gradient: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: Gift,
      gradient: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: Tag,
      gradient: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: ShoppingBag,
      gradient: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Card 
              key={item.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
                isActive 
                  ? 'border-amber-300 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-amber-200'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <CardContent className="p-6">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${item.bgColor} flex items-center justify-center shadow-md`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className={`font-bold text-sm ${isActive ? 'text-amber-600' : 'text-gray-800'}`}>
                    {item.label}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationGrid;
