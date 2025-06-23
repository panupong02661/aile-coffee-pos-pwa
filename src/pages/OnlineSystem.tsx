
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OnlineSystemHeader from '@/components/OnlineSystemHeader';
import OnlineStatsCard from '@/components/OnlineStatsCard';

const OnlineSystem = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(true);

  const handleMenuToggle = (isOpen: boolean) => {
    setIsMenuOpen(isOpen);
  };

  const handleOnlineModeToggle = (enabled: boolean) => {
    setIsOnlineMode(enabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-100">
      <div className="container mx-auto p-4 space-y-6">
        <OnlineSystemHeader
          onMenuToggle={handleMenuToggle}
          isMenuOpen={isMenuOpen}
          isOnlineMode={isOnlineMode}
          onOnlineModeToggle={handleOnlineModeToggle}
        />

        <div className="grid gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-coffee-800 text-xl">
                ระบบจัดการออนไลน์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-coffee-600 mb-4">
                จัดการและติดตามระบบออนไลน์ของร้าน รวมถึงแอปมือถือสำหรับลูกค้าและการจัดการลูกค้า
              </p>
              
              <OnlineStatsCard />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnlineSystem;
