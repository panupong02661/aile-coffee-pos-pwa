
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
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                isActive 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto ${
                isActive 
                  ? item.id === 'rewards' ? 'bg-purple-500' :
                    item.id === 'coupons' ? 'bg-green-500' :
                    item.id === 'history' ? 'bg-blue-500' :
                    item.id === 'shop' ? 'bg-orange-500' : 'bg-blue-500'
                  : 'bg-gray-100'
              }`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationGrid;
