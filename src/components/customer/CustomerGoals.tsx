
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Star, Zap } from 'lucide-react';

interface CustomerGoalsProps {
  currentUser: any;
}

const CustomerGoals = ({ currentUser }: CustomerGoalsProps) => {
  const currentTier = currentUser?.tier || 'silver';
  const currentSpent = currentUser?.total_spent || 0;
  const currentPoints = currentUser?.points || 0;

  // Tier upgrade thresholds
  const tierThresholds = {
    silver: { min: 0, max: 5000, next: 'gold' },
    gold: { min: 5000, max: 15000, next: 'platinum' },
    platinum: { min: 15000, max: Infinity, next: null }
  };

  const currentTierInfo = tierThresholds[currentTier as keyof typeof tierThresholds];
  const progressToNext = currentTierInfo.next ? 
    Math.min(100, ((currentSpent - currentTierInfo.min) / (currentTierInfo.max - currentTierInfo.min)) * 100) : 100;
  const remainingToUpgrade = currentTierInfo.next ? 
    Math.max(0, currentTierInfo.max - currentSpent) : 0;

  const monthlyGoals = [
    {
      title: 'เป้าหมายประจำเดือน',
      description: 'สั่งซื้อ 10 ครั้ง',
      current: 7,
      target: 10,
      icon: Target,
      color: 'bg-blue-500'
    },
    {
      title: 'แต้มประจำเดือน',
      description: 'สะสมแต้ม 500 แต้ม',
      current: 350,
      target: 500,
      icon: Star,
      color: 'bg-yellow-500'
    },
    {
      title: 'ลองเมนูใหม่',
      description: 'ลองเมนูใหม่ 3 รายการ',
      current: 1,
      target: 3,
      icon: Zap,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tier Progress */}
      {currentTierInfo.next && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              เส้นทางสู่สมาชิก{currentTierInfo.next === 'gold' ? 'ทอง' : 'แพลทินัม'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">ยอดใช้จ่ายปัจจุบัน</p>
                <p className="text-lg font-bold">฿{currentSpent.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">เป้าหมาย</p>
                <p className="text-lg font-bold">฿{currentTierInfo.max.toLocaleString()}</p>
              </div>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <p className="text-sm text-center text-gray-600">
              อีก ฿{remainingToUpgrade.toLocaleString()} เพื่อเลื่อนระดับ
            </p>
          </CardContent>
        </Card>
      )}

      {/* Monthly Goals */}
      <Card>
        <CardHeader>
          <CardTitle>เป้าหมายประจำเดือน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {monthlyGoals.map((goal, index) => {
            const progress = Math.min(100, (goal.current / goal.target) * 100);
            const isCompleted = goal.current >= goal.target;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${goal.color} rounded-lg flex items-center justify-center`}>
                      <goal.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-800">สำเร็จ</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="flex-1 h-2" />
                  <span className="text-sm text-gray-600 min-w-0">
                    {goal.current}/{goal.target}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>ความสำเร็จ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-yellow-600">ลูกค้าใหม่</p>
              <p className="text-sm font-bold text-yellow-700">สมัครสมาชิก</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-blue-600">นักช้อป</p>
              <p className="text-sm font-bold text-blue-700">10 ออเดอร์</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg text-center opacity-50">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500">ผู้สะสม</p>
              <p className="text-sm font-bold text-gray-600">1,000 แต้ม</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg text-center opacity-50">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500">นักรบ</p>
              <p className="text-sm font-bold text-gray-600">100 ออเดอร์</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerGoals;
