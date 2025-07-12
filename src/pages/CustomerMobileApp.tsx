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
import ConnectionDiagnostic from '@/components/customer/ConnectionDiagnostic';
import { generateDateSearchVariants, generatePhoneVariants } from '@/utils/dateUtils';

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
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Enhanced database connection test
  const testDatabaseConnection = async (): Promise<boolean> => {
    try {
      console.log('Testing database connection...');
      setConnectionStatus('checking');
      
      // Test basic connection with a simple query
      const { data, error } = await supabase
        .from('members')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        setConnectionStatus('error');
        return false;
      } else {
        console.log('Database connection successful');
        setConnectionStatus('connected');
        return true;
      }
    } catch (error: any) {
      console.error('Database connection error:', error);
      setConnectionStatus('error');
      return false;
    }
  };

  // Load rewards from database
  const loadRewards = async () => {
    try {
      console.log('Loading rewards...');
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) {
        console.error('Error loading rewards:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดรางวัลได้',
          variant: 'destructive',
        });
        return;
      }

      console.log('Rewards loaded successfully:', data?.length || 0, 'items');
      setRewards(data || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดรางวัลได้',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      const isConnected = await testDatabaseConnection();
      
      if (isConnected) {
        const savedUser = localStorage.getItem('customerAuth');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setCurrentUser(userData);
            setIsAuthenticated(true);
            await loadCustomerData(userData.phone);
          } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('customerAuth');
          }
        }
        
        await loadRewards();
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const loadCustomerData = async (phone: string) => {
    try {
      console.log('Loading customer data for phone:', phone);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) {
        console.error('Error loading customer data:', error);
        return;
      }

      if (data) {
        const customerProfile: CustomerProfile = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email || '',
          tier: data.tier,
          points: data.points,
          total_spent: data.total_spent,
          birth_date: data.birth_date,
          gender: data.gender
        };
        
        console.log('Customer data loaded successfully:', customerProfile);
        setCurrentUser(customerProfile);
        localStorage.setItem('customerAuth', JSON.stringify(customerProfile));
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        setIsLoading(false);
        return;
      }
      
      if (!loginForm.phone || !loginForm.birth_date) {
        toast({
          title: 'ข้อมูลไม่ครบถ้วน',
          description: 'กรุณากรอกเบอร์โทรและวันเดือนปีเกิด',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('Attempting login with:', { phone: loginForm.phone, birth_date: loginForm.birth_date });
      
      // Generate search variants for phone and date
      const phoneVariants = generatePhoneVariants(loginForm.phone);
      const dateVariants = generateDateSearchVariants(loginForm.birth_date);
      
      console.log('Phone variants:', phoneVariants);
      console.log('Date variants:', dateVariants);
      
      let foundMember = null;
      
      // Search through phone variants
      for (const phoneVariant of phoneVariants) {
        const { data: phoneMatches, error: phoneError } = await supabase
          .from('members')
          .select('*')
          .eq('phone', phoneVariant);

        if (phoneError) {
          console.error('Phone search error:', phoneError);
          continue;
        }

        if (phoneMatches && phoneMatches.length > 0) {
          console.log(`Phone matches found for ${phoneVariant}:`, phoneMatches);
          
          // Check each phone match against date variants
          for (const member of phoneMatches) {
            if (member.birth_date) {
              // Generate variants for stored birth_date
              const storedDateVariants = generateDateSearchVariants(member.birth_date);
              
              // Check if any input date variant matches any stored date variant
              const hasDateMatch = dateVariants.some(inputDate => 
                storedDateVariants.some(storedDate => {
                  // Compare normalized dates (remove spaces, convert to same format)
                  const normalizedInput = inputDate.replace(/[\s-]/g, '');
                  const normalizedStored = storedDate.replace(/[\s-]/g, '');
                  return normalizedInput === normalizedStored;
                })
              );
              
              if (hasDateMatch) {
                console.log('Date match found!');
                foundMember = member;
                break;
              }
            }
          }
        }
        
        if (foundMember) break;
      }

      if (!foundMember) {
        console.log('No member found with provided credentials');
        toast({
          title: 'ข้อมูลไม่ถูกต้อง',
          description: 'ไม่พบข้อมูลสมาชิกหรือเบอร์โทรและวันเกิดไม่ตรงกัน กรุณาตรวจสอบข้อมูลอีกครั้ง',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('Login successful for member:', foundMember);

      const customerProfile: CustomerProfile = {
        id: foundMember.id,
        name: foundMember.name,
        phone: foundMember.phone,
        email: foundMember.email || '',
        tier: foundMember.tier,
        points: foundMember.points,
        total_spent: foundMember.total_spent,
        birth_date: foundMember.birth_date,
        gender: foundMember.gender
      };
      
      setCurrentUser(customerProfile);
      setIsAuthenticated(true);
      localStorage.setItem('customerAuth', JSON.stringify(customerProfile));
      
      toast({
        title: 'เข้าสู่ระบบสำเร็จ!',
        description: `ยินดีต้อนรับ ${foundMember.name}`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      
      // Test connection before registration
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        setIsLoading(false);
        return;
      }
      
      if (registerForm.name && registerForm.phone && registerForm.birth_date) {
        // Check if phone already exists
        const { data: existingMember } = await supabase
          .from('members')
          .select('phone')
          .eq('phone', registerForm.phone)
          .single();

        if (existingMember) {
          toast({
            title: 'เบอร์โทรนี้มีอยู่แล้ว',
            description: 'กรุณาใช้เบอร์โทรอื่นหรือเข้าสู่ระบบ',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Create new member
        const { data, error } = await supabase
          .from('members')
          .insert({
            name: registerForm.name,
            phone: registerForm.phone,
            birth_date: registerForm.birth_date,
            gender: registerForm.gender || null,
            tier: 'silver',
            points: 0,
            total_spent: 0
          })
          .select()
          .single();

        if (error) {
          console.error('Registration error:', error);
          toast({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถสมัครสมาชิกได้',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const customerProfile: CustomerProfile = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email || '',
          tier: data.tier,
          points: data.points,
          total_spent: data.total_spent,
          birth_date: data.birth_date,
          gender: data.gender
        };
        
        setCurrentUser(customerProfile);
        setIsAuthenticated(true);
        localStorage.setItem('customerAuth', JSON.stringify(customerProfile));
        
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
      console.error('Registration error:', error);
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
      const { error } = await supabase
        .from('members')
        .update({
          name: currentUser.name,
          phone: currentUser.phone,
          birth_date: currentUser.birth_date,
          gender: currentUser.gender
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถอัปเดตโปรไฟล์ได้',
          variant: 'destructive',
        });
        return;
      }

      // Update local storage
      localStorage.setItem('customerAuth', JSON.stringify(currentUser));
      
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
      // Update member points
      const { error: memberError } = await supabase
        .from('members')
        .update({ 
          points: currentUser.points - pointsRequired 
        })
        .eq('id', currentUser.id);

      if (memberError) {
        console.error('Error updating member points:', memberError);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถแลกรางวัลได้',
          variant: 'destructive',
        });
        return;
      }

      // Log point transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          member_id: currentUser.id,
          points_change: -pointsRequired,
          transaction_type: 'redeem',
          description: `แลกรางวัล - รางวัล ID: ${rewardId}`
        });

      if (transactionError) {
        console.error('Error logging transaction:', transactionError);
      }

      // Update local state
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

  // Show connection error with diagnostic option
  if (connectionStatus === 'error') {
    return (
      <Shell>
        <Card className="p-6 text-center max-w-md mx-auto mt-8">
          <div className="space-y-4">
            <div className="text-red-500 text-xl font-bold">
              ไม่สามารถเชื่อมต่อฐานข้อมูลได้
            </div>
            <p className="text-gray-600">
              กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ<br/>
              หรือลองใหม่อีกครั้งในอีกสักครู่
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                ลองใหม่อีกครั้ง
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowDiagnostic(true)} 
                className="w-full"
              >
                ตรวจสอบระบบ
              </Button>
            </div>
          </div>
        </Card>
        
        {showDiagnostic && (
          <div className="mt-6">
            <ConnectionDiagnostic />
            <div className="text-center mt-4">
              <Button 
                variant="ghost"
                onClick={() => setShowDiagnostic(false)}
              >
                ปิด
              </Button>
            </div>
          </div>
        )}
      </Shell>
    );
  }

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
          {connectionStatus === 'checking' && (
            <p className="text-sm text-gray-500 mt-2">กำลังตรวจสอบการเชื่อมต่อฐานข้อมูล...</p>
          )}
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
