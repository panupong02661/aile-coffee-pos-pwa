import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
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

interface Profile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: string;
  points: number;
}

const CustomerMobileApp: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.email) {
        try {
          setIsLoading(true);
          const { data: profile, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (error) {
            throw error;
          }

          setCurrentUser(profile);
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
      }
    };

    fetchProfile();
  }, [session, toast]);

  const handleUpdateProfile = async (updatedProfile: Profile) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .update(updatedProfile)
        .eq('id', updatedProfile.id)
        .single();

      if (error) {
        throw error;
      }

      setCurrentUser(data);
      toast({
        title: 'อัปเดตสำเร็จ!',
        description: 'โปรไฟล์ของคุณได้รับการอัปเดตแล้ว',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตโปรไฟล์ได้',
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
        return <ProfileSection currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
      case 'rewards':
        return <RewardsSection currentUser={currentUser} />;
      case 'coupons':
        return <CouponsSection currentUser={currentUser} />;
      case 'shop':
        return <ShopSection currentUser={currentUser} />;
      case 'history':
        return <HistorySection currentUser={currentUser} />;
      case 'stats':
        return <StatsSection currentUser={currentUser} />;
    case 'goals':
      return <CustomerGoals currentUser={currentUser} />;
    default:
      return <ProfileSection currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
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
          <Button variant="destructive" className="w-full" onClick={() => signOut()}>
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </Shell>
  );
};

export default CustomerMobileApp;
