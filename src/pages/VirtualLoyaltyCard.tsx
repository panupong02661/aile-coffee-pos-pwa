
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
  CreditCard,
  QrCode,
  Star,
  Gift,
  Clock,
  Calendar,
  History,
  Award,
  Smartphone,
  Wifi,
  Download,
  Share2,
  Heart,
  Coffee,
  Crown,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

const VirtualLoyaltyCard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [memberData, setMemberData] = useState({
    id: 'M001234',
    name: 'กาแฟ เลิฟเวอร์',
    phone: '081-234-5678',
    email: 'coffee.lover@example.com',
    points: 2450,
    tier: 'Gold',
    joinDate: '2023-01-15',
    totalSpent: 15750,
    visits: 89,
    favoriteOrder: 'ลาเต้ร้อนไซส์ใหญ่ + ซีรัปวานิลลา'
  });

  const [cardStyle, setCardStyle] = useState('gold');
  const { toast } = useToast();

  const tierInfo = {
    Silver: { minSpent: 0, color: 'bg-gradient-to-r from-gray-300 to-gray-500', benefits: ['ส่วนลด 5%', 'แต้มสะสม 1x'] },
    Gold: { minSpent: 10000, color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', benefits: ['ส่วนลด 10%', 'แต้มสะสม 2x', 'ของแถมพิเศษ'] },
    Platinum: { minSpent: 25000, color: 'bg-gradient-to-r from-purple-400 to-purple-600', benefits: ['ส่วนลด 15%', 'แต้มสะสม 3x', 'บริการพิเศษ', 'คิวด่วน'] }
  };

  const recentTransactions = [
    {
      id: 'T001',
      date: '2024-01-07',
      time: '14:30',
      items: 'ลาเต้ร้อน, ขนมปังเนยสด',
      amount: 185,
      points: 18,
      type: 'purchase'
    },
    {
      id: 'T002',
      date: '2024-01-06',
      time: '09:15',
      items: 'อเมริกาโน่เย็น, คุกกี้',
      amount: 120,
      points: 12,
      type: 'purchase'
    },
    {
      id: 'T003',
      date: '2024-01-05',
      time: '16:45',
      items: 'แลกรางวัล: กาแฟฟรี',
      amount: 0,
      points: -500,
      type: 'redeem'
    },
    {
      id: 'T004',
      date: '2024-01-04',
      time: '11:20',
      items: 'คาปูชิโน่, เค้กช็อกโกแลต',
      amount: 220,
      points: 22,
      type: 'purchase'
    }
  ];

  const availableRewards = [
    {
      id: 'R001',
      title: 'กาแฟฟรี 1 แก้ว',
      description: 'รับกาแฟขนาดปกติฟรี',
      points: 500,
      icon: Coffee,
      available: memberData.points >= 500
    },
    {
      id: 'R002',
      title: 'ส่วนลด 20%',
      description: 'ส่วนลด 20% ครั้งถัดไป',
      points: 300,
      icon: Gift,
      available: memberData.points >= 300
    },
    {
      id: 'R003',
      title: 'อัพเกรดไซส์ฟรี',
      description: 'เปลี่ยนเป็นไซส์ใหญ่ฟรี',
      points: 200,
      icon: TrendingUp,
      available: memberData.points >= 200
    },
    {
      id: 'R004',
      title: 'สิทธิพิเศษ VIP',
      description: 'บริการ VIP 1 สัปดาห์',
      points: 1000,
      icon: Crown,
      available: memberData.points >= 1000
    }
  ];

  const specialOffers = [
    {
      id: 'SO001',
      title: 'Happy Hour',
      description: 'ส่วนลด 30% เวลา 14:00-16:00',
      validUntil: '2024-01-31',
      icon: Clock,
      active: true
    },
    {
      id: 'SO002',
      title: 'วันเกิดพิเศษ',
      description: 'รับกาแฟฟรี 2 แก้วในวันเกิด',
      validUntil: '2024-12-31',
      icon: Gift,
      active: false
    },
    {
      id: 'SO003',
      title: 'สมาชิก Gold',
      description: 'ส่วนลด 10% ตลอดชีพ',
      validUntil: 'ไม่มีวันหมดอายุ',
      icon: Star,
      active: true
    }
  ];

  const generateQRCode = () => {
    toast({
      title: "QR Code พร้อมใช้งาน! 📱",
      description: "แสดง QR Code นี้ที่เคาน์เตอร์เพื่อสะสมแต้ม",
    });
  };

  const shareCard = () => {
    toast({
      title: "แชร์สำเร็จ! 🎉",
      description: "เชิญเพื่อนมาใช้แอปและรับแต้มพิเศษ 100 แต้ม",
    });
  };

  const getTierProgress = () => {
    const nextTier = memberData.tier === 'Silver' ? 'Gold' : 'Platinum';
    const nextTierMinSpent = tierInfo[nextTier as keyof typeof tierInfo]?.minSpent || 25000;
    return (memberData.totalSpent / nextTierMinSpent) * 100;
  };

  const getCardGradient = () => {
    switch (cardStyle) {
      case 'gold': return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600';
      case 'platinum': return 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600';
      case 'dark': return 'bg-gradient-to-br from-gray-800 via-gray-900 to-black';
      default: return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
    }
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
            title="บัตรสมาชิกดิจิทัล"
          />
          
          <div className="p-6 space-y-6">
            {/* Digital Card Display */}
            <Card className="relative overflow-hidden">
              <div className={`${getCardGradient()} p-6 text-white relative`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-12 -mb-12" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Aile Coffee</h2>
                      <p className="text-sm opacity-90">สมาชิกพิเศษ</p>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {memberData.tier}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold">{memberData.name}</p>
                      <p className="text-sm opacity-75">รหัสสมาชิก: {memberData.id}</p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-bold">{memberData.points.toLocaleString()}</p>
                        <p className="text-sm opacity-75">แต้มสะสม</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        onClick={generateQRCode}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{memberData.tier}</p>
                  <p className="text-sm text-muted-foreground">ระดับสมาชิก</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">฿{memberData.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">ยอดซื้อสะสม</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <History className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{memberData.visits}</p>
                  <p className="text-sm text-muted-foreground">ครั้งที่มา</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{Math.floor((Date.now() - new Date(memberData.joinDate).getTime()) / (1000 * 60 * 60 * 24))}</p>
                  <p className="text-sm text-muted-foreground">วันที่เป็นสมาชิก</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="rewards" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="rewards">รางวัล</TabsTrigger>
                <TabsTrigger value="offers">ข้อเสนอ</TabsTrigger>
                <TabsTrigger value="history">ประวัติ</TabsTrigger>
                <TabsTrigger value="benefits">สิทธิพิเศษ</TabsTrigger>
                <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
              </TabsList>

              {/* Rewards Tab */}
              <TabsContent value="rewards" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      รางวัลที่แลกได้
                    </CardTitle>
                    <CardDescription>
                      ใช้แต้มสะสมแลกรับรางวัลสุดพิเศษ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableRewards.map((reward) => (
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

              {/* Special Offers Tab */}
              <TabsContent value="offers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      ข้อเสนอพิเศษ
                    </CardTitle>
                    <CardDescription>
                      โปรโมชั่นและสิทธิพิเศษสำหรับสมาชิก
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {specialOffers.map((offer) => (
                      <div key={offer.id} className={`p-4 border rounded-lg ${
                        offer.active ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <offer.icon className={`w-6 h-6 ${
                              offer.active ? 'text-green-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <h3 className="font-semibold">{offer.title}</h3>
                              <p className="text-sm text-muted-foreground">{offer.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                ใช้ได้ถึง: {offer.validUntil}
                              </p>
                            </div>
                          </div>
                          <Badge variant={offer.active ? "default" : "secondary"}>
                            {offer.active ? 'ใช้ได้' : 'ไม่ใช้ได้'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transaction History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      ประวัติการใช้งาน
                    </CardTitle>
                    <CardDescription>
                      รายการซื้อและการแลกรางวัลล่าสุด
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.items}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString('th-TH')} เวลา {transaction.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {transaction.type === 'purchase' ? `฿${transaction.amount}` : 'แลกรางวัล'}
                            </p>
                            <p className={`text-sm ${
                              transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.points > 0 ? '+' : ''}{transaction.points} แต้ม
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Member Benefits Tab */}
              <TabsContent value="benefits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      สิทธิพิเศษสมาชิก {memberData.tier}
                    </CardTitle>
                    <CardDescription>
                      สิทธิประโยชน์และความคุ้มค่าของการเป็นสมาชิก
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tierInfo[memberData.tier as keyof typeof tierInfo].benefits.map((benefit, index) => (
                        <div key={index} className="p-4 border rounded-lg text-center">
                          <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <p className="font-semibold">{benefit}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>ความคืบหน้าไประดับถัดไป:</span>
                        <span>{Math.round(getTierProgress())}%</span>
                      </div>
                      <Progress value={getTierProgress()} />
                      <p className="text-sm text-muted-foreground">
                        อีก ฿{((memberData.tier === 'Silver' ? 10000 : 25000) - memberData.totalSpent).toLocaleString()} 
                        เพื่อเลื่อนระดับ
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      ตั้งค่าบัตรดิจิทัล
                    </CardTitle>
                    <CardDescription>
                      ปรับแต่งการแสดงผลและการใช้งานบัตร
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">สีธีมบัตร</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'gold', name: 'ทอง', class: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
                          { id: 'platinum', name: 'แพลทินัม', class: 'bg-gradient-to-r from-purple-400 to-purple-600' },
                          { id: 'dark', name: 'ดำ', class: 'bg-gradient-to-r from-gray-800 to-black' },
                          { id: 'blue', name: 'น้ำเงิน', class: 'bg-gradient-to-r from-blue-400 to-blue-600' }
                        ].map((style) => (
                          <button
                            key={style.id}
                            className={`${style.class} p-4 rounded-lg text-white font-medium ${
                              cardStyle === style.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setCardStyle(style.id)}
                          >
                            {style.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full" onClick={shareCard}>
                        <Share2 className="w-4 h-4 mr-2" />
                        เชิญเพื่อน (รับ 100 แต้ม)
                      </Button>
                      
                      <Button variant="outline" className="w-full" onClick={generateQRCode}>
                        <Download className="w-4 h-4 mr-2" />
                        ดาวน์โหลดบัตร
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">ข้อมูลสมาชิก</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>เข้าร่วมเมื่อ: {new Date(memberData.joinDate).toLocaleDateString('th-TH')}</p>
                        <p>เบอร์โทร: {memberData.phone}</p>
                        <p>อีเมล: {memberData.email}</p>
                        <p>เมนูโปรด: {memberData.favoriteOrder}</p>
                      </div>
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

export default VirtualLoyaltyCard;
