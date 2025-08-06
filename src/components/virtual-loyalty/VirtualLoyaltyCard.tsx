
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, Crown, Diamond, Gift, CreditCard } from 'lucide-react';

interface LoyaltyCardProps {
  memberData: {
    id: string;
    name: string;
    phone: string;
    tier: 'silver' | 'gold' | 'platinum';
    points: number;
    totalSpent: number;
    joinDate: string;
  };
}

const VirtualLoyaltyCard = ({ memberData }: LoyaltyCardProps) => {
  const [cardFlipped, setCardFlipped] = useState(false);

  const tierConfig = {
    silver: {
      color: 'from-gray-400 to-gray-600',
      icon: Star,
      name: 'Silver',
      nextTier: 'Gold',
      nextTierRequirement: 5000,
      benefits: ['ส่วนลด 5%', 'แต้มพิเศษ 2x']
    },
    gold: {
      color: 'from-yellow-400 to-yellow-600',
      icon: Crown,
      name: 'Gold',
      nextTier: 'Platinum',
      nextTierRequirement: 15000,
      benefits: ['ส่วนลด 10%', 'แต้มพิเศษ 3x', 'ของแถมพิเศษ']
    },
    platinum: {
      color: 'from-purple-400 to-purple-600',
      icon: Diamond,
      name: 'Platinum',
      nextTier: null,
      nextTierRequirement: null,
      benefits: ['ส่วนลด 15%', 'แต้มพิเศษ 5x', 'ของแถมพิเศษ', 'เครื่องดื่มฟรี']
    }
  };

  const currentTier = tierConfig[memberData.tier];
  const TierIcon = currentTier.icon;
  const progressToNext = currentTier.nextTierRequirement 
    ? (memberData.totalSpent / currentTier.nextTierRequirement) * 100 
    : 100;

  // Simple QR code placeholder component
  const QRCodePlaceholder = ({ value, size }: { value: string; size: number }) => (
    <div 
      className="bg-black flex items-center justify-center text-white text-xs font-mono"
      style={{ width: size, height: size }}
    >
      QR:{value.slice(-6)}
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <div 
        className={`relative w-full h-56 cursor-pointer transition-transform duration-700 preserve-3d ${
          cardFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setCardFlipped(!cardFlipped)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <Card className={`h-full bg-gradient-to-br ${currentTier.color} text-white border-none shadow-xl`}>
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-6 w-6" />
                  <span className="font-bold">Loyalty Card</span>
                </div>
                <TierIcon className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{memberData.name}</h2>
                <p className="text-sm opacity-90">{memberData.phone}</p>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  {currentTier.name} Member
                </Badge>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm opacity-90">Points</p>
                  <p className="text-2xl font-bold">{memberData.points.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-90">Member Since</p>
                  <p className="text-sm">{new Date(memberData.joinDate).getFullYear()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="h-full bg-white shadow-xl">
            <CardContent className="p-6 h-full flex flex-col justify-center items-center space-y-4">
              <QRCodePlaceholder 
                value={`LOYALTY:${memberData.id}`} 
                size={120}
              />
              <div className="text-center">
                <p className="font-medium">สแกนเพื่อใช้แต้ม</p>
                <p className="text-sm text-muted-foreground">ID: {memberData.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Card Benefits */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            สิทธิประโยชน์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentTier.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Tier */}
      {currentTier.nextTier && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">อัพเกรดสู่ {currentTier.nextTier}</CardTitle>
            <CardDescription>
              ใช้จ่ายเพิ่มอีก ฿{(currentTier.nextTierRequirement! - memberData.totalSpent).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(progressToNext, 100)} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>฿{memberData.totalSpent.toLocaleString()}</span>
              <span>฿{currentTier.nextTierRequirement!.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Button variant="outline" className="w-full">
          ประวัติการใช้แต้ม
        </Button>
        <Button className="w-full">
          แลกแต้ม
        </Button>
      </div>
    </div>
  );
};

export default VirtualLoyaltyCard;
