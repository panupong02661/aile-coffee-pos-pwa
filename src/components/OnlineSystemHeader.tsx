
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Menu, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OnlineSystemHeaderProps {
  onMenuToggle: (isOpen: boolean) => void;
  isMenuOpen: boolean;
  isOnlineMode: boolean;
  onOnlineModeToggle: (enabled: boolean) => void;
}

const OnlineSystemHeader = ({ 
  onMenuToggle, 
  isMenuOpen, 
  isOnlineMode, 
  onOnlineModeToggle 
}: OnlineSystemHeaderProps) => {
  return (
    <Card className="p-4 bg-primary text-white border-primary">
      <div className="flex items-center justify-between">
        {/* ปุ่มเมนู 3 ขีด */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMenuToggle(!isMenuOpen)}
          className="text-white hover:bg-primary/90 p-2"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>

        {/* หัวข้อ */}
        <h1 className="text-lg font-semibold">ระบบออนไลน์</h1>

        {/* สวิตช์เปิด/ปิดระบบออนไลน์ */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {isOnlineMode ? 'เปิด' : 'ปิด'}
          </span>
          <div className="relative">
            <Switch
              checked={isOnlineMode}
              onCheckedChange={onOnlineModeToggle}
              className={`data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 ${
                isOnlineMode 
                  ? 'data-[state=checked]:bg-green-500' 
                  : 'data-[state=unchecked]:bg-red-500'
              }`}
            />
          </div>
          <div className={`w-2 h-2 rounded-full ${
            isOnlineMode ? 'bg-green-400' : 'bg-red-400'
          }`} />
        </div>
      </div>

      {/* แสดงสถานะระบบ */}
      <div className="mt-3 text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          isOnlineMode 
            ? 'bg-green-500/20 text-green-100' 
            : 'bg-red-500/20 text-red-100'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isOnlineMode ? 'bg-green-400' : 'bg-red-400'
          }`} />
          {isOnlineMode ? 'ระบบออนไลน์เปิดใช้งาน' : 'ระบบออนไลน์ปิดใช้งาน'}
        </div>
      </div>
    </Card>
  );
};

export default OnlineSystemHeader;
