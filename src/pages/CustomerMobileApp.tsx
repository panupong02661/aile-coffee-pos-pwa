import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Tag, ShoppingBag, Phone, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  convertThaiDateToISO, 
  formatDateToThai, 
  parseThaiDateInput,
  formatDateForDisplay,
  isValidThaiDateFormat,
  cleanPhoneNumber,
  generateDateSearchVariants,
  generatePhoneVariants
} from '@/utils/dateUtils';
import MemberCard from '@/components/customer/MemberCard';
import LoginForm from '@/components/customer/LoginForm';
import NavigationGrid from '@/components/customer/NavigationGrid';
import ProfileSection from '@/components/customer/ProfileSection';
import RewardsSection from '@/components/customer/RewardsSection';
import CouponsSection from '@/components/customer/CouponsSection';
import ShopSection from '@/components/customer/ShopSection';

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

interface Coupon {
  id: string;
  name: string;
  code: string;
  discount_value: number;
  discount_type: string;
  is_used: boolean;
  end_date: string;
}

const CustomerMobileApp = () => {
  const [currentUser, setCurrentUser] = useState<CustomerProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ phone: '', birth_date: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    phone: '', 
    birth_date: '', 
    gender: '' 
  });
  const [editMode, setEditMode] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  const getTierDisplayName = (tier: string): string => {
    switch (tier) {
      case 'bronze': return 'สมาชิกทองแดง';
      case 'silver': return 'สมาชิกเงิน';
      case 'gold': return 'สมาชิกทอง';
      case 'platinum': return 'สมาชิกแพลทินัม';
      default: return 'สมาชิกเงิน';
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'platinum': return 'bg-gradient-to-r from-purple-400 to-purple-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const compareDates = (inputDate: string, storedDate: string): boolean => {
    if (!inputDate || !storedDate) return false;
    
    console.log('=== DATE COMPARISON DEBUG ===');
    console.log('Input date:', inputDate);
    console.log('Stored date:', storedDate);
    
    const inputISODate = parseThaiDateInput(inputDate);
    console.log('Input converted to ISO:', inputISODate);
    
    const inputVariants = generateDateSearchVariants(inputDate);
    const storedVariants = generateDateSearchVariants(storedDate);
    
    console.log('Input variants:', inputVariants);
    console.log('Stored variants:', storedVariants);
    
    const matches = [
      inputDate === storedDate,
      inputISODate === storedDate,
      inputVariants.some(iv => storedVariants.some(sv => iv === sv)),
      inputISODate && new Date(inputISODate).toISOString().split('T')[0] === new Date(storedDate).toISOString().split('T')[0],
      inputDate.replace(/\//g, '-') === storedDate.replace(/\//g, '-'),
      inputDate.replace(/[^0-9]/g, '') === storedDate.replace(/[^0-9]/g, ''),
      inputISODate && storedDate && inputISODate === storedDate,
      inputISODate && storedDate && 
      new Date(inputISODate).getTime() === new Date(storedDate).getTime()
    ];
    
    const isMatch = matches.some(match => match);
    console.log('Match results:', matches);
    console.log('Final match result:', isMatch);
    
    return isMatch;
  };

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

  const fetchCoupons = async () => {
    if (!currentUser) return;
    setCoupons([]);
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.phone || !registerForm.birth_date) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, เบอร์โทร, วันเกิด)', variant: 'destructive' });
      return;
    }

    if (!isValidThaiDateFormat(registerForm.birth_date)) {
      toast({ 
        title: 'รูปแบบวันที่ไม่ถูกต้อง', 
        description: 'กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535)', 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== REGISTER DEBUG INFO ===');
      console.log('Original form data:', registerForm);
      
      const cleanedPhone = cleanPhoneNumber(registerForm.phone);
      console.log('Cleaned phone:', cleanedPhone);
      
      const convertedBirthDate = parseThaiDateInput(registerForm.birth_date);
      console.log('Converted birth date for registration:', convertedBirthDate);

      if (!convertedBirthDate) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถแปลงวันที่ได้ กรุณาตรวจสอบรูปแบบวันที่', variant: 'destructive' });
        return;
      }

      const phoneVariants = generatePhoneVariants(registerForm.phone);
      
      console.log('Phone variants for checking:', phoneVariants);

      let existingMember = false;

      for (const phoneVariant of phoneVariants) {
        const { data: memberData } = await supabase
          .from('members')
          .select('id, phone, birth_date')
          .eq('phone', phoneVariant)
          .maybeSingle();

        if (memberData) {
          console.log('Found existing member:', memberData);
          existingMember = true;
          break;
        }
      }

      if (existingMember) {
        toast({ title: 'ข้อผิดพลาด', description: 'เบอร์โทรนี้ได้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ', variant: 'destructive' });
        return;
      }

      console.log('Creating new member with data:', {
        name: registerForm.name.trim(),
        phone: cleanedPhone,
        birth_date: convertedBirthDate,
        gender: registerForm.gender || null
      });

      const { error: memberError } = await supabase
        .from('members')
        .insert({
          name: registerForm.name.trim(),
          phone: cleanedPhone,
          birth_date: convertedBirthDate,
          gender: registerForm.gender || null,
          tier: 'silver',
          points: 0,
          total_spent: 0
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        if (memberError.code === '23505') {
          toast({ title: 'ข้อผิดพลาด', description: 'หมายเลขโทรศัพท์นี้มีอยู่แล้วในระบบ', variant: 'destructive' });
        } else {
          toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถสร้างโปรไฟล์ได้', variant: 'destructive' });
        }
        return;
      }

      toast({ title: 'สำเร็จ', description: 'สมัครสมาชิกเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ' });
      setIsRegistering(false);
      setRegisterForm({ name: '', phone: '', birth_date: '', gender: '' });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({ title: 'ข้อผิดพลาด', description: `เกิดข้อผิดพลาดในการสมัครสมาชิก: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.phone || !loginForm.birth_date) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกเบอร์โทรและวันเดือนปีเกิด', variant: 'destructive' });
      return;
    }

    if (!isValidThaiDateFormat(loginForm.birth_date)) {
      toast({ 
        title: 'รูปแบบวันที่ไม่ถูกต้อง', 
        description: 'กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535)', 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== LOGIN DEBUG INFO ===');
      console.log('Login form data:', loginForm);
      
      const phoneVariants = generatePhoneVariants(loginForm.phone);
      
      console.log('Phone variants for search:', phoneVariants);
      console.log('Input birth date:', loginForm.birth_date);
      
      let profileData = null;

      console.log('=== SEARCHING IN MEMBERS ===');
      
      for (const phoneVariant of phoneVariants) {
        console.log(`Searching for phone in members: ${phoneVariant}`);
        
        const { data: memberResults, error } = await supabase
          .from('members')
          .select('*')
          .eq('phone', phoneVariant);
        
        if (error) {
          console.error('Error searching members:', error);
          continue;
        }
        
        if (memberResults && memberResults.length > 0) {
          console.log(`Found ${memberResults.length} members with phone ${phoneVariant}:`, memberResults);
          
          for (const member of memberResults) {
            console.log(`Checking member ${member.id}:`);
            console.log(`- Name: ${member.name}`);
            console.log(`- Stored birth_date: "${member.birth_date}"`);
            console.log(`- Input birth_date: "${loginForm.birth_date}"`);
            
            if (compareDates(loginForm.birth_date, member.birth_date)) {
              console.log('*** MEMBER DATE MATCH FOUND ***', member);
              profileData = member;
              break;
            }
          }
          
          if (profileData) break;
        }
      }

      if (!profileData) {
        console.log('=== LOGIN FAILED - DEBUG INFO ===');
        
        const debugMembers = await supabase
          .from('members')
          .select('*')
          .like('phone', `%${loginForm.phone.slice(-8)}%`);
        
        console.log('All members with similar phone:', debugMembers.data);
        
        const allProfiles = debugMembers.data || [];
        console.log('Date comparison details:');
        allProfiles.forEach((profile, index) => {
          const profileBirthDate = profile.birth_date;
          console.log(`Profile ${index + 1}:`);
          console.log(`- Name: ${profile.name}`);
          console.log(`- Phone: ${profile.phone}`);
          console.log(`- Stored birth_date: "${profileBirthDate}"`);
          console.log(`- Input birth_date: "${loginForm.birth_date}"`);
          console.log(`- Date comparison result: ${compareDates(loginForm.birth_date, profileBirthDate)}`);
        });
        
        const hasAnyData = allProfiles.length > 0;
        
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
      setLoginForm({ phone: '', birth_date: '' });
      toast({ title: 'สำเร็จ', description: `ยินดีต้อนรับ ${profileData.name}` });
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ title: 'ข้อผิดพลาด', description: `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setLoginForm({ phone: '', birth_date: '' });
    toast({ title: 'สำเร็จ', description: 'ออกจากระบบเรียบร้อยแล้ว' });
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;

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
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถอัพเดทข้อมูลได้', variant: 'destructive' });
      return;
    }

    setEditMode(false);
    toast({ title: 'สำเร็จ', description: 'อัพเดทข้อมูลเรียบร้อยแล้ว' });
  };

  const redeemReward = async (rewardId: string, pointsRequired: number) => {
    if (!currentUser || currentUser.points < pointsRequired) {
      toast({ title: 'ข้อผิดพลาด', description: 'แต้มไม่เพียงพอ', variant: 'destructive' });
      return;
    }

    toast({ title: 'ฟีเจอร์ยังไม่พร้อม', description: 'ระบบแลกของรางวัลยังอยู่ระหว่างการพัฒนา' });
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCoupons();
    }
  }, [currentUser]);

  if (!isLoggedIn) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">แอปสั่งอาหาร</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            ออกจากระบบ
          </Button>
        </div>
      </div>

      {/* Member Card */}
      <MemberCard currentUser={currentUser} />

      {/* Navigation Grid */}
      <NavigationGrid activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Sections */}
      <div className="p-4">
        {activeTab === 'profile' && (
          <ProfileSection
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            editMode={editMode}
            setEditMode={setEditMode}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsSection
            rewards={rewards}
            currentUser={currentUser}
            onRedeemReward={redeemReward}
          />
        )}

        {activeTab === 'coupons' && (
          <CouponsSection coupons={coupons} />
        )}

        {activeTab === 'shop' && (
          <ShopSection />
        )}
      </div>
    </div>
  );
};

export default CustomerMobileApp;
