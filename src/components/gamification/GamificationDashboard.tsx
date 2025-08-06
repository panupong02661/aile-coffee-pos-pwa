
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Gift, Target, Award, Zap } from 'lucide-react';

const GamificationDashboard = () => {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);

  const playerStats = {
    level: 15,
    xp: 2450,
    nextLevelXP: 3000,
    totalPoints: 15420,
    badges: 12,
    completedQuests: 45
  };

  const badges = [
    { id: 1, name: 'Coffee Lover', description: 'สั่งกาแฟ 50 แก้ว', earned: true, icon: '☕' },
    { id: 2, name: 'VIP Member', description: 'เป็นสมาชิก VIP', earned: true, icon: '👑' },
    { id: 3, name: 'Early Bird', description: 'สั่งก่อน 8 โมงเช้า 10 ครั้ง', earned: true, icon: '🌅' },
    { id: 4, name: 'Social Butterfly', description: 'แชร์ 20 ครั้ง', earned: false, icon: '🦋' },
    { id: 5, name: 'Review Master', description: 'รีวิว 25 ครั้ง', earned: false, icon: '⭐' },
  ];

  const dailyQuests = [
    { id: 1, title: 'สั่งกาแฟ 2 แก้ว', reward: '50 XP', progress: 1, total: 2, completed: false },
    { id: 2, title: 'แชร์โพสต์', reward: '25 XP', progress: 0, total: 1, completed: false },
    { id: 3, title: 'รีวิวสินค้า', reward: '100 XP', progress: 1, total: 1, completed: true },
  ];

  const weeklyQuests = [
    { id: 1, title: 'ใช้จ่าย 1,000 บาท', reward: '200 XP', progress: 750, total: 1000, completed: false },
    { id: 2, title: 'มาร้าน 5 วัน', reward: '300 XP', progress: 3, total: 5, completed: false },
    { id: 3, title: 'ลอง 3 เมนูใหม่', reward: '150 XP', progress: 2, total: 3, completed: false },
  ];

  const leaderboard = [
    { rank: 1, name: 'คุณสมชาย', level: 28, points: 45200 },
    { rank: 2, name: 'คุณสมหญิง', level: 25, points: 38900 },
    { rank: 3, name: 'คุณสมศักดิ์', level: 22, points: 32100 },
    { rank: 4, name: 'คุณผู้ใช้', level: 15, points: 15420 },
    { rank: 5, name: 'คุณสมปอง', level: 18, points: 28400 },
  ];

  return (
    <div className="space-y-6">
      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {playerStats.level}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{playerStats.level}</p>
                <div className="mt-2">
                  <Progress value={(playerStats.xp / playerStats.nextLevelXP) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {playerStats.xp} / {playerStats.nextLevelXP} XP
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">แต้มรวม</p>
                <p className="text-2xl font-bold">{playerStats.totalPoints.toLocaleString()}</p>
                <Badge variant="secondary" className="mt-2">
                  <Trophy className="h-3 w-3 mr-1" />
                  อันดับ 4
                </Badge>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">เหรียญรางวัล</p>
                <p className="text-2xl font-bold">{playerStats.badges}</p>
                <p className="text-xs text-muted-foreground">เก็บสะสม {playerStats.completedQuests} ภารกิจ</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quests">ภารกิจ</TabsTrigger>
          <TabsTrigger value="badges">เหรียญรางวัล</TabsTrigger>
          <TabsTrigger value="leaderboard">อันดับ</TabsTrigger>
          <TabsTrigger value="rewards">รางวัล</TabsTrigger>
        </TabsList>

        <TabsContent value="quests" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  ภารกิจรายวัน
                </CardTitle>
                <CardDescription>รีเซ็ตทุกวันเที่ยงคืน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyQuests.map((quest) => (
                  <div key={quest.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{quest.title}</h3>
                      {quest.completed ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Zap className="h-3 w-3 mr-1" />
                          สำเร็จ
                        </Badge>
                      ) : (
                        <Badge variant="outline">{quest.reward}</Badge>
                      )}
                    </div>
                    <Progress value={(quest.progress / quest.total) * 100} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {quest.progress} / {quest.total}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  ภารกิจรายสัปดาห์
                </CardTitle>
                <CardDescription>รีเซ็ททุกวันจันทร์</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyQuests.map((quest) => (
                  <div key={quest.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{quest.title}</h3>
                      <Badge variant="outline">{quest.reward}</Badge>
                    </div>
                    <Progress value={(quest.progress / quest.total) * 100} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {quest.progress} / {quest.total}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>คอลเลกชันเหรียญรางวัล</CardTitle>
              <CardDescription>เก็บสะสมเหรียญรางวัลจากการทำภารกิจ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 border rounded-lg text-center transition-all hover:shadow-md ${
                      badge.earned ? 'bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-200' : 'opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h3 className="font-medium text-sm">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    {badge.earned && (
                      <Badge variant="secondary" className="mt-2 bg-yellow-200 text-yellow-800">
                        สำเร็จแล้ว
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>อันดับผู้เล่น</CardTitle>
              <CardDescription>อันดับ 100 อันดับแรกประจำเดือนนี้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.name === 'คุณผู้ใช้' 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        player.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : 'bg-gray-200'
                      }`}>
                        {player.rank}
                      </div>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">Level {player.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{player.points.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">แต้ม</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'ส่วนลด 10%', cost: 500, available: true },
              { name: 'กาแฟฟรี 1 แก้ว', cost: 800, available: true },
              { name: 'ขนมฟรี', cost: 300, available: true },
              { name: 'ส่วนลด 20%', cost: 1000, available: false },
              { name: 'เค้กฟรี', cost: 1500, available: false },
              { name: 'บัตร VIP 1 เดือน', cost: 2000, available: false },
            ].map((reward, index) => (
              <Card key={index} className={!reward.available ? 'opacity-50' : ''}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    <h3 className="font-medium">{reward.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{reward.cost} แต้ม</p>
                    <Button 
                      disabled={!reward.available || playerStats.totalPoints < reward.cost}
                      className="w-full"
                    >
                      {reward.available ? 'แลกรางวัล' : 'ไม่เพียงพอ'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationDashboard;
