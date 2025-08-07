
import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Trophy,
  Target,
  Star,
  Gift,
  Coins,
  Calendar,
  Users,
  Award,
  Flame,
  CheckCircle,
  Clock,
  TrendingUp,
  Crown,
  Zap,
  Heart,
  Coffee,
  ShoppingCart,
  Share2
} from 'lucide-react';

const GamificationSystem = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(2450);
  const [userLevel, setUserLevel] = useState(12);
  const [dailyStreak, setDailyStreak] = useState(5);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(['first_purchase', 'coffee_lover', 'streak_master']);
  const { toast } = useToast();

  const dailyMissions = [
    {
      id: 'daily_coffee',
      title: 'ดื่มกาแฟ 1 แก้ว',
      description: 'สั่งและดื่มกาแฟอย่างน้อย 1 แก้วในวันนี้',
      points: 50,
      progress: 1,
      target: 1,
      icon: Coffee,
      completed: completedMissions.includes('daily_coffee')
    },
    {
      id: 'share_social',
      title: 'แชร์โซเชียล',
      description: 'แชร์ร้านกาแฟในโซเชียลมีเดีย',
      points: 100,
      progress: 0,
      target: 1,
      icon: Share2,
      completed: completedMissions.includes('share_social')
    },
    {
      id: 'invite_friend',
      title: 'เชิญเพื่อน',
      description: 'เชิญเพื่อนมาใช้แอป',
      points: 200,
      progress: 0,
      target: 1,
      icon: Users,
      completed: completedMissions.includes('invite_friend')
    },
    {
      id: 'order_value',
      title: 'ยอดซื้อ 300 บาท',
      description: 'สั่งสินค้ารวมมูลค่า 300 บาทขึ้นไป',
      points: 150,
      progress: 250,
      target: 300,
      icon: ShoppingCart,
      completed: completedMissions.includes('order_value')
    }
  ];

  const achievements = [
    {
      id: 'first_purchase',
      title: 'การซื้อครั้งแรก',
      description: 'ทำการสั่งซื้อครั้งแรก',
      icon: ShoppingCart,
      points: 100,
      unlocked: unlockedAchievements.includes('first_purchase')
    },
    {
      id: 'coffee_lover',
      title: 'คนรักกาแฟ',
      description: 'สั่งกาแฟครบ 10 แก้ว',
      icon: Coffee,
      points: 500,
      unlocked: unlockedAchievements.includes('coffee_lover')
    },
    {
      id: 'streak_master',
      title: 'นักรักษาสาย',
      description: 'เข้าใช้แอปต่อเนื่อง 7 วัน',
      icon: Flame,
      points: 300,
      unlocked: unlockedAchievements.includes('streak_master')
    },
    {
      id: 'social_butterfly',
      title: 'นักแชร์',
      description: 'แชร์ใน Social Media 5 ครั้ง',
      icon: Share2,
      points: 200,
      unlocked: false
    },
    {
      id: 'vip_customer',
      title: 'ลูกค้า VIP',
      description: 'ยอดซื้อสะสมครบ 10,000 บาท',
      icon: Crown,
      points: 1000,
      unlocked: false
    },
    {
      id: 'friend_master',
      title: 'นักเชิญเพื่อน',
      description: 'เชิญเพื่อนมาใช้แอปครบ 10 คน',
      icon: Users,
      points: 800,
      unlocked: false
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'กาแฟ มาสเตอร์', points: 8750, avatar: '☕', level: 25 },
    { rank: 2, name: 'ลาเต้ เลิฟเวอร์', points: 7200, avatar: '🥛', level: 22 },
    { rank: 3, name: 'เอสเพรสโซ่ คิง', points: 6800, avatar: '👑', level: 20 },
    { rank: 4, name: 'คุณ (You)', points: userPoints, avatar: '👤', level: userLevel },
    { rank: 5, name: 'มอคค่า ควีน', points: 5100, avatar: '🍫', level: 18 },
    { rank: 6, name: 'คาปูชิโน่ โปร', points: 4900, avatar: '🎯', level: 17 },
    { rank: 7, name: 'อเมริกาโน่ เอ็กซ์เพิร์ต', points: 4200, avatar: '⭐', level: 15 }
  ];

  const rewards = [
    {
      id: 'free_coffee',
      title: 'กาแฟฟรี 1 แก้ว',
      description: 'รับกาแฟขนาดปกติฟรี 1 แก้ว',
      points: 500,
      icon: Coffee,
      available: userPoints >= 500
    },
    {
      id: 'discount_20',
      title: 'ส่วนลด 20%',
      description: 'ส่วนลด 20% สำหรับการซื้อครั้งถัดไป',
      points: 300,
      icon: Gift,
      available: userPoints >= 300
    },
    {
      id: 'free_pastry',
      title: 'เบเกอรี่ฟรี',
      description: 'รับขนมเบเกอรี่ฟรี 1 ชิ้น',
      points: 400,
      icon: Heart,
      available: userPoints >= 400
    },
    {
      id: 'upgrade_size',
      title: 'อัพเกรดไซส์ฟรี',
      description: 'อัพเกรดเป็นไซส์ใหญ่ฟรี',
      points: 200,
      icon: TrendingUp,
      available: userPoints >= 200
    },
    {
      id: 'vip_access',
      title: 'สิทธิ์ VIP 1 เดือน',
      description: 'เข้าถึงโปรโมชั่นพิเศษและคิวด่วน',
      points: 2000,
      icon: Crown,
      available: userPoints >= 2000
    }
  ];

  const completeMission = (missionId: string) => {
    if (!completedMissions.includes(missionId)) {
      const mission = dailyMissions.find(m => m.id === missionId);
      if (mission) {
        setCompletedMissions([...completedMissions, missionId]);
        setUserPoints(prev => prev + mission.points);
        toast({
          title: "ภารกิจสำเร็จ! 🎉",
          description: `คุณได้รับ ${mission.points} แต้ม จากภารกิจ "${mission.title}"`,
        });
      }
    }
  };

  const redeemReward = (reward: typeof rewards[0]) => {
    if (reward.available) {
      setUserPoints(prev => prev - reward.points);
      toast({
        title: "แลกรางวัลสำเร็จ! 🎁",
        description: `คุณได้แลก "${reward.title}" เรียบร้อยแล้ว`,
      });
    }
  };

  const getLevelProgress = () => {
    const pointsForNextLevel = userLevel * 200;
    const currentLevelPoints = userPoints % 200;
    return (currentLevelPoints / pointsForNextLevel) * 100;
  };

  const getStreakColor = () => {
    if (dailyStreak >= 7) return 'text-orange-500';
    if (dailyStreak >= 3) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <Shell>
      <div className="h-screen bg-background flex">
        <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
        }`}>
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            title="ระบบเกมมิฟิเคชั่น"
          />
          
          <div className="p-6 space-y-6">
            {/* User Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">แต้มสะสม</p>
                      <p className="text-2xl font-bold text-primary">{userPoints.toLocaleString()}</p>
                    </div>
                    <Coins className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">เลเวล</p>
                      <p className="text-2xl font-bold text-primary">{userLevel}</p>
                    </div>
                    <Star className="w-8 h-8 text-blue-500" />
                  </div>
                  <Progress value={getLevelProgress()} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">สตรีคต่อเนื่อง</p>
                      <p className={`text-2xl font-bold ${getStreakColor()}`}>{dailyStreak} วัน</p>
                    </div>
                    <Flame className={`w-8 h-8 ${getStreakColor()}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ความสำเร็จ</p>
                      <p className="text-2xl font-bold text-primary">{unlockedAchievements.length}/{achievements.length}</p>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="missions" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="missions">ภารกิจ</TabsTrigger>
                <TabsTrigger value="achievements">ความสำเร็จ</TabsTrigger>
                <TabsTrigger value="leaderboard">อันดับ</TabsTrigger>
                <TabsTrigger value="rewards">รางวัล</TabsTrigger>
                <TabsTrigger value="profile">โปรไฟล์</TabsTrigger>
              </TabsList>

              {/* Daily Missions Tab */}
              <TabsContent value="missions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      ภารกิจประจำวัน
                    </CardTitle>
                    <CardDescription>
                      ทำภารกิจเหล่านี้ให้สำเร็จเพื่อรับแต้มและของรางวัล
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dailyMissions.map((mission) => (
                      <div key={mission.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <mission.icon className="w-6 h-6 text-primary" />
                            <div>
                              <h3 className="font-semibold">{mission.title}</h3>
                              <p className="text-sm text-muted-foreground">{mission.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={mission.completed ? "default" : "secondary"}>
                              {mission.points} แต้ม
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <Progress 
                              value={(mission.progress / mission.target) * 100} 
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {mission.progress}/{mission.target}
                            </p>
                          </div>
                          
                          {mission.completed ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              สำเร็จ
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => completeMission(mission.id)}
                              disabled={mission.progress < mission.target}
                            >
                              ทำให้สำเร็จ
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      ความสำเร็จ
                    </CardTitle>
                    <CardDescription>
                      รางวัลพิเศษสำหรับการทำภารกิจต่าง ๆ ให้สำเร็จ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className={`p-4 border rounded-lg ${
                          achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3 mb-2">
                            <achievement.icon className={`w-8 h-8 ${
                              achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <h3 className={`font-semibold ${
                                achievement.unlocked ? 'text-green-800' : 'text-gray-600'
                              }`}>
                                {achievement.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                              {achievement.points} แต้ม
                            </Badge>
                            {achievement.unlocked && (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                ปลดล็อกแล้ว
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      กระดานอันดับ
                    </CardTitle>
                    <CardDescription>
                      อันดับของผู้เล่นทั้งหมดตามแต้มสะสม
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {leaderboard.map((user) => (
                        <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg border ${
                          user.name === 'คุณ (You)' ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              user.rank === 1 ? 'bg-yellow-500' :
                              user.rank === 2 ? 'bg-gray-400' :
                              user.rank === 3 ? 'bg-orange-600' : 'bg-blue-500'
                            }`}>
                              {user.rank <= 3 ? (
                                user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'
                              ) : user.rank}
                            </div>
                            <Avatar>
                              <AvatarFallback>{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-muted-foreground">Level {user.level}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{user.points.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">แต้ม</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rewards Tab */}
              <TabsContent value="rewards" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      ร้านรางวัล
                    </CardTitle>
                    <CardDescription>
                      ใช้แต้มสะสมแลกรับรางวัลพิเศษ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rewards.map((reward) => (
                        <div key={reward.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <reward.icon className="w-8 h-8 text-primary" />
                            <div>
                              <h3 className="font-semibold">{reward.title}</h3>
                              <p className="text-sm text-muted-foreground">{reward.description}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              {reward.points} แต้ม
                            </Badge>
                            <Button 
                              size="sm"
                              onClick={() => redeemReward(reward)}
                              disabled={!reward.available}
                              variant={reward.available ? "default" : "secondary"}
                            >
                              {reward.available ? 'แลกรางวัล' : 'แต้มไม่พอ'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      โปรไฟล์เกม
                    </CardTitle>
                    <CardDescription>
                      ข้อมูลสถิติและความก้าวหน้าของคุณ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                      <Avatar className="w-20 h-20 mx-auto">
                        <AvatarFallback className="text-2xl">👤</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">คุณ (You)</h3>
                        <p className="text-muted-foreground">Level {userLevel} Coffee Master</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">แต้มทั้งหมด</p>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
                        <p className="text-sm text-muted-foreground">ความสำเร็จ</p>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <Flame className={`w-8 h-8 mx-auto mb-2 ${getStreakColor()}`} />
                        <p className={`text-2xl font-bold ${getStreakColor()}`}>{dailyStreak}</p>
                        <p className="text-sm text-muted-foreground">วันต่อเนื่อง</p>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <Star className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{userLevel}</p>
                        <p className="text-sm text-muted-foreground">เลเวล</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">ความก้าวหน้าเลเวล</h4>
                      <Progress value={getLevelProgress()} />
                      <p className="text-sm text-muted-foreground">
                        อีก {(userLevel * 200) - (userPoints % 200)} แต้ม เพื่อเลเวล {userLevel + 1}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default GamificationSystem;
