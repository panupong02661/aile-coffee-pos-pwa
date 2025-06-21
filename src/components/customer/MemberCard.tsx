
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  birth_date?: string;
  gender?: string;
  tier: string;
  points: number;
  total_spent: number;
}

interface MemberCardProps {
  currentUser: CustomerProfile;
}

const getTierDisplayName = (tier: string): string => {
  switch (tier) {
    case 'bronze': return 'สมาชิกทองแดง';
    case 'silver': return 'สมาชิกเงิน';
    case 'gold': return 'สมาชิกทอง';
    case 'platinum': return 'สมาชิกแพลทินัม';
    default: return 'สมาชิกเงิน';
  }
};

const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600';
    case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600';
    case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    case 'platinum': return 'bg-gradient-to-r from-purple-400 to-purple-600';
    default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};

const MemberCard: React.FC<MemberCardProps> = ({ currentUser }) => {
  return (
    <div className="p-6">
      <div className="relative">
        {/* Card Shadow */}
        <div className="absolute inset-0 bg-black/10 rounded-2xl transform translate-y-2 translate-x-2"></div>
        
        {/* Main Card */}
        <Card className={`relative ${getTierColor(currentUser?.tier || 'silver')} text-white border-0 shadow-2xl rounded-2xl overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-white/20 shadow-lg">
                    <AvatarFallback className="bg-white/90 text-orange-800 text-2xl font-bold">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-orange-800 rounded-full p-1">
                    <Star className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{currentUser?.name}</h2>
                  <p className="text-lg opacity-90 font-medium">{getTierDisplayName(currentUser?.tier || 'silver')}</p>
                  <p className="text-sm opacity-75">สมาชิกตั้งแต่ {new Date().getFullYear()}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-3xl font-bold mb-1">{currentUser?.points || 0}</p>
                <p className="text-sm opacity-75">แต้มสะสม</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold mb-1">฿{(currentUser?.total_spent || 0).toLocaleString()}</p>
                <p className="text-sm opacity-75">ยอดใช้จ่าย</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberCard;
