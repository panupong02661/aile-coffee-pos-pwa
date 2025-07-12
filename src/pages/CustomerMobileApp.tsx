import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/Shell";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

import ProfileSection from '@/components/customer/ProfileSection';
import RewardsSection from '@/components/customer/RewardsSection';
import CouponsSection from '@/components/customer/CouponsSection';
import ShopSection from '@/components/customer/ShopSection';
import HistorySection from '@/components/customer/HistorySection';
import StatsSection from '@/components/customer/StatsSection';
import NavigationGrid from '@/components/customer/NavigationGrid';
import CustomerGoals from '@/components/customer/CustomerGoals';
import MemberCard from '@/components/customer/MemberCard';
import LoginForm from '@/components/customer/LoginForm';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: string;
  points: number;
  total_spent: number;
  birth_date?: string;
  gender?: string;
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  image_url?: string;
  is_active: boolean;
}

const CustomerMobileApp: React.FC = () => {
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<CustomerProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ phone: '', birth_date: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', phone: '', birth_date: '', gender: '' });

  // Mock rewards data
  const [rewards] = useState<Reward[]>([
    {
      id: '1',
      name: 'ส่วนลด 10% ทุกเมนู',
      description: 'รับส่วนลด 10% สำหรับการสั่งซื้อครั้งถัดไป',
      points_required: 100,
      is_active: true
    },
    {
      id: '2',
      name: 'เครื่องดื่มฟรี 1 แก้ว',
      description: 'รับเครื่องดื่มฟรี 1 แก้ว (เฉพาะเมนูที่กำหนด)',
      points_required: 150,
      is_active: true
    },
    {
      id: '3',
      name: 'ส่วนลด 50 บาท',
      description: 'รับส่วนลด 50 บาท เมื่อซื้อครบ 300 บาท',
      points_required: 200,
      is_active: true
    },
    {
      id: '4',
      name: 'จัดส่งฟรี',
      description: 'บริการจัดส่งฟรีสำหรับออเดอร์ถัดไป',
      points_required: 80,
      is_active: true
    }
  ]);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const savedUser = localStorage.getItem('customerAuth');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // In real app, this would validate against Supabase
      // For demo, we'll use mock validation
      if (loginForm.phone && loginForm.birth_date) {
        const mockProfile: CustomerProfile = {
          id: '1',
          name: 'ลูกค้าตัวอย่าง',
          phone: loginForm.phone,
          email: 'customer@example.com',
          tier: 'gold',
          points: 1250,
          total_spent: 8500,
          birth_date: loginForm.birth_date,
          gender: 'male'
        };
        
        setCurrentUser(mockProfile);
        setIsAuthenticated(true);
        localStorage.setItem('customerAuth', JSON.stringify(mockProfile));
        
        toast({
          title: 'เข้าสู่ระบบสำเร็จ!',
          description: 'ยินดีต้อนรับเข้าสู่ระบบ',
        });
      } else {
        toast({
          title: 'ข้อมูลไม่ครบถ้วน',
          description: 'กรุณากรอกเบอร์โทรและวันเดือนปีเกิด',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเข้าสู่ระบบได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      
      if (registerForm.name && registerForm.phone && registerForm.birth_date) {
        const mockProfile: CustomerProfile = {
          id: '1',
          name: registerForm.name,
          phone: registerForm.phone,
          email: '',
          tier: 'silver',
          points: 0,
          total_spent: 0,
          birth_date: registerForm.birth_date,
          gender: registerForm.gender
        };
        
        setCurrentUser(mockProfile);
        setIsAuthenticated(true);
        localStorage.setItem('customerAuth', JSON.stringify(mockProfile));
        
        toast({
          title: 'สมัครสมาชิกสำเร็จ!',
          description: 'ยินดีต้อนรับสู่ระบบสมาชิก',
        });
      } else {
        toast({
          title: 'ข้อมูลไม่ครบถ้วน',
          description: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสมัครสมาชิกได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    
    try {
      // In real app, this would update Supabase
      toast({
        title: 'อัปเดตสำเร็จ!',
        description: 'โปรไฟล์ของคุณได้รับการอัปเดตแล้ว',
      });
      setEditMode(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตโปรไฟล์ได้',
        variant: 'destructive',
      });
    }
  };

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    if (!currentUser) return;
    
    if (currentUser.points < pointsRequired) {
      toast({
        title: 'แต้มไม่เพียงพอ',
        description: `คุณต้องมีแต้มอย่างน้อย ${pointsRequired} แต้ม`,
        variant: 'destructive',
      });
      return;
    }

    try {
      // In real app, this would update the database
      const updatedUser = {
        ...currentUser,
        points: currentUser.points - pointsRequired
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('customerAuth', JSON.stringify(updatedUser));

      toast({
        title: 'แลกรางวัลสำเร็จ!',
        description: `คุณได้รับรางวัลแล้ว ใช้แต้มไป ${pointsRequired} แต้ม`,
      });
    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถแลกรางวัลได้',
        variant: 'destructive',
      });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBackToHome = () => {
    setActiveTab('home');
  };

  const handleLogout = () => {
    // Clear authentication state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('home');
    localStorage.removeItem('customerAuth');
    
    // Reset forms
    setLoginForm({ phone: '', birth_date: '' });
    setRegisterForm({ name: '', phone: '', birth_date: '', gender: '' });
    setIsRegistering(false);
    
    toast({
      title: 'ออกจากระบบแล้ว',
      description: 'คุณได้ออกจากระบบเรียบร้อยแล้ว',
    });
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <Shell>
        <LoginForm
          isRegistering={isRegistering}
          setIsRegistering={setIsRegistering}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          isLoading={isLoading}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </Shell>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-4">
            {/* Member Card */}
            {currentUser && <MemberCard currentUser={currentUser} />}
            
            {/* Navigation Grid */}
            <NavigationGrid activeTab={activeTab} onTabChange={handleTabChange} />
            
            {/* Logout Button */}
            <div className="p-4">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </Button>
            </div>
          </div>
        );
      case 'profile':
        return (
          <ProfileSection 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser}
            editMode={editMode}
            setEditMode={setEditMode}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'rewards':
        return (
          <RewardsSection 
            rewards={rewards}
            currentUser={currentUser} 
            onRedeemReward={handleRedeemReward}
          />
        );
      case 'coupons':
        return <CouponsSection coupons={[]} />;
      case 'shop':
        return <ShopSection currentUser={currentUser} />;
      case 'history':
        return <HistorySection currentUser={currentUser} />;
      case 'stats':
        return <StatsSection currentUser={currentUser} />;
      case 'goals':
        return <CustomerGoals currentUser={currentUser} />;
      default:
        return (
          <div className="space-y-4">
            {/* Member Card */}
            {currentUser && <MemberCard currentUser={currentUser} />}
            
            {/* Navigation Grid */}
            <NavigationGrid activeTab={activeTab} onTabChange={handleTabChange} />
            
            {/* Logout Button */}
            <div className="p-4">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </Button>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <Card className="p-4 text-center">
          <p>กำลังโหลด...</p>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-col h-screen">
        {/* Header with Back Button (shown when not on home) */}
        {activeTab !== 'home' && (
          <div className="p-4 border-b bg-white sticky top-0 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับหน้าแรก
            </Button>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </Shell>
  );
};

export default CustomerMobileApp;
