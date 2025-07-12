
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/Shell";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

import ProfileSection from '@/components/customer/ProfileSection';
import RewardsSection from '@/components/customer/RewardsSection';
import CouponsSection from '@/components/customer/CouponsSection';
import ShopSection from '@/components/customer/ShopSection';
import HistorySection from '@/components/customer/HistorySection';
import StatsSection from '@/components/customer/StatsSection';
import NavigationGrid from '@/components/customer/NavigationGrid';
import CustomerGoals from '@/components/customer/CustomerGoals';

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
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

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
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // For demo purposes, using mock data. In real app, this would fetch from Supabase
        const mockProfile: CustomerProfile = {
          id: '1',
          name: 'ลูกค้าตัวอย่าง',
          phone: '0812345678',
          email: 'customer@example.com',
          tier: 'gold',
          points: 1250,
          total_spent: 8500,
          birth_date: '1990-01-01',
          gender: 'male'
        };
        
        setCurrentUser(mockProfile);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

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

  const renderContent = () => {
    switch (activeTab) {
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
          <ProfileSection 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser}
            editMode={editMode}
            setEditMode={setEditMode}
            onUpdateProfile={handleUpdateProfile}
          />
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
        {/* Navigation Grid */}
        <NavigationGrid activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Content Section */}
        <div className="flex-grow overflow-y-auto p-4">
          {renderContent()}
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <Button variant="destructive" className="w-full">
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </Shell>
  );
};

export default CustomerMobileApp;
