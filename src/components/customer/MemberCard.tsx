
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Award, Crown, Gem } from 'lucide-react';

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

const MemberCard = ({ currentUser }: MemberCardProps) => {
  const getTierDisplayName = (tier: string): string => {
    switch (tier) {
      case 'bronze': return 'สมาชิกทองแดง';
      case 'silver': return 'สมาชิกเงิน';
      case 'gold': return 'สมาชิกทอง';
      case 'platinum': return 'สมาชิกแพลทินัม';
      default: return 'สมาชิกเงิน';
    }
  };

  const getTierGradient = (tier: string): string => {
    switch (tier) {
      case 'bronze': return 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600';
      case 'silver': return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
      case 'gold': return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500';
      case 'platinum': return 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600';
      default: return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Star className="w-5 h-5" />;
      case 'silver': return <Award className="w-5 h-5" />;
      case 'gold': return <Crown className="w-5 h-5" />;
      case 'platinum': return <Gem className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getAccentColor = (tier: string): string => {
    switch (tier) {
      case 'bronze': return 'from-orange-200 to-orange-300';
      case 'silver': return 'from-gray-200 to-gray-300';
      case 'gold': return 'from-yellow-200 to-yellow-300';
      case 'platinum': return 'from-purple-200 to-purple-300';
      default: return 'from-gray-200 to-gray-300';
    }
  };

  return (
    <div className="p-4">
      <Card className={`${getTierGradient(currentUser?.tier || 'silver')} text-white relative overflow-hidden shadow-2xl rounded-3xl border-0 aspect-[1.6/1] max-w-sm mx-auto`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-white/10"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5"></div>
        </div>
        
        {/* Shine Effect */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent"></div>
        
        <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getAccentColor(currentUser?.tier || 'silver')} text-gray-800 text-xs font-semibold flex items-center gap-1`}>
              {getTierIcon(currentUser?.tier || 'silver')}
              {getTierDisplayName(currentUser?.tier || 'silver')}
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">ID</div>
              <div className="text-sm font-mono">****{currentUser?.phone?.slice(-4) || '0000'}</div>
            </div>
          </div>

          {/* Member Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-3 border-white/30 shadow-lg">
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold backdrop-blur-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1 drop-shadow-sm">{currentUser?.name}</h2>
              <div className="text-sm opacity-90 mb-2">{currentUser?.phone}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="text-2xl font-bold drop-shadow-sm">{currentUser?.points?.toLocaleString() || 0}</div>
              <div className="text-xs opacity-75">แต้มสะสม</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold drop-shadow-sm">฿{currentUser?.total_spent?.toLocaleString() || 0}</div>
              <div className="text-xs opacity-75">ยอดใช้จ่าย</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberCard;
