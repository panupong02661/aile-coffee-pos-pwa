import React from 'react';
import { Home, ShoppingBag, Clock, BarChart3, Target, User, PartyPopper } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const menuItems = [
    { id: 'home', label: 'หน้าหลัก', icon: Home },
    { id: 'shop', label: 'สั่งอาหาร', icon: ShoppingBag },
    { id: 'engagement', label: 'กิจกรรม', icon: PartyPopper },
    { id: 'history', label: 'ประวัติ', icon: Clock },
    { id: 'stats', label: 'สถิติ', icon: BarChart3 },
    { id: 'profile', label: 'โปรไฟล์', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-screen-xl mx-auto px-1">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
