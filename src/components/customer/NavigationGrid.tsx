
import React from 'react';
import { User, Gift, Tag, ShoppingBag, History } from 'lucide-react';

interface NavigationGridProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationGrid: React.FC<NavigationGridProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'profile', label: 'โปรไฟล์', icon: User },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'history', label: 'ประวัติ', icon: History },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* ปรับให้เป็นแถวเดียว 5 ปุ่ม responsive */}
        <div className="flex justify-center space-x-1 md:space-x-2 lg:space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center px-2 py-2 md:px-3 md:py-3 lg:px-4 lg:py-3 rounded-lg transition-all flex-1 min-w-0 ${
                  isActive 
                    ? 'bg-yellow-50 border-2 border-yellow-400 shadow-sm' 
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className={`p-1.5 md:p-2 rounded-lg mb-1 md:mb-2 ${
                  isActive 
                    ? item.id === 'rewards' ? 'bg-purple-500' :
                      item.id === 'coupons' ? 'bg-green-500' :
                      item.id === 'history' ? 'bg-blue-500' :
                      item.id === 'shop' ? 'bg-orange-500' : 'bg-blue-500'
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span className={`text-xs md:text-sm font-medium truncate w-full text-center ${
                  isActive ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavigationGrid;
