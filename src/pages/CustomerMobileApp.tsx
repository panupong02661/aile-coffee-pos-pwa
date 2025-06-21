
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoginForm from '@/components/customer/LoginForm';
import MemberCard from '@/components/customer/MemberCard';
import NavigationGrid from '@/components/customer/NavigationGrid';
import ProfileSection from '@/components/customer/ProfileSection';
import RewardsSection from '@/components/customer/RewardsSection';
import CouponsSection from '@/components/customer/CouponsSection';
import ShopSection from '@/components/customer/ShopSection';
import { authenticateCustomer, registerCustomer, updateCustomerProfile } from '@/utils/customerUtils';

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

interface Reward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  image_url?: string;
  is_active: boolean;
}

const CustomerMobileApp = () => {
  const [currentUser, setCurrentUser] = useState<CustomerProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_required');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดของรางวัลได้', variant: 'destructive' });
      return;
    }
    setRewards(data || []);
  };

  const handleLogin = async (phone: string, birthDate: string) => {
    setIsLoading(true);
    try {
      const profileData = await authenticateCustomer(phone, birthDate);
      
      if (!profileData) {
        // Debug: ดูข้อมูลทั้งหมดของเบอร์นี้
        const debugMembers = await supabase
          .from('members')
          .select('*')
          .like('phone', `%${phone.slice(-8)}%`);
        
        console.log('All members with similar phone:', debugMembers.data);
        
        const hasAnyData = (debugMembers.data || []).length > 0;
        
        if (hasAnyData) {
          toast({ 
            title: 'ข้อมูลไม่ตรงกัน', 
            description: 'พบเบอร์โทรในระบบแต่วันเกิดไม่ตรงกัน กรุณาตรวจสอบวันเกิดอีกครั้ง', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'ไม่พบข้อมูลผู้ใช้', 
            description: 'ไม่พบเบอร์โทรนี้ในระบบ กรุณาสมัครสมาชิกก่อน', 
            variant: 'destructive' 
          });
        }
        return;
      }

      console.log('*** LOGIN SUCCESSFUL ***');
      console.log('Profile data:', profileData);
      
      setCurrentUser(profileData);
      setIsLoggedIn(true);
      toast({ title: 'สำเร็จ', description: `ยินดีต้อนรับ ${profileData.name}` });
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ title: 'ข้อผิดพลาด', description: `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: { name: string; phone: string; birth_date: string; gender: string }) => {
    setIsLoading(true);
    try {
      await registerCustomer(data);
      toast({ title: 'สำเร็จ', description: 'สมัครสมาชิกเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ' });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({ title: 'ข้อผิดพลาด', description: `เกิดข้อผิดพลาดในการสมัครสมาชิก: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    toast({ title: 'สำเร็จ', description: 'ออกจากระบบเรียบร้อยแล้ว' });
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    try {
      await updateCustomerProfile(currentUser.id, currentUser);
      toast({ title: 'สำเร็จ', description: 'อัพเดทข้อมูลเรียบร้อยแล้ว' });
    } catch (error: any) {
      toast({ title: 'ข้อผิดพลาด', description: error.message, variant: 'destructive' });
    }
  };

  const redeemReward = async (rewardId: string, pointsRequired: number) => {
    if (!currentUser || currentUser.points < pointsRequired) {
      toast({ title: 'ข้อผิดพลาด', description: 'แต้มไม่เพียงพอ', variant: 'destructive' });
      return;
    }

    // ข้ามการแลกของรางวัลไปก่อน เนื่องจากยังไม่มีตารางที่เชื่อมโยง
    toast({ title: 'ฟีเจอร์ยังไม่พร้อม', description: 'ระบบแลกของรางวัลยังอยู่ระหว่างการพัฒนา' });
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  if (!isLoggedIn) {
    return (
      <LoginForm 
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
      />
    );
  }

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">
      {/* Header */}
      <div className="bg-white shadow-lg border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-orange-800">แอปสั่งอาหาร</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            ออกจากระบบ
          </Button>
        </div>
      </div>

      {/* Premium Member Card */}
      <MemberCard currentUser={currentUser} />

      {/* Main Navigation */}
      <NavigationGrid />

      {/* Content Sections */}
      <div className="px-6 space-y-4">
        <ProfileSection 
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onUpdateProfile={handleUpdateProfile}
        />
        
        <RewardsSection 
          rewards={rewards}
          currentUser={currentUser}
          onRedeemReward={redeemReward}
        />
        
        <CouponsSection />
        
        <ShopSection />
      </div>
    </div>
  );
};

export default CustomerMobileApp;
