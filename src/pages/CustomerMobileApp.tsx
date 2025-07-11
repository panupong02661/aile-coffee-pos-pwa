import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Tag, ShoppingBag, Phone, UserCheck, Copy } from 'lucide-react';
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
import HistorySection from '@/components/customer/HistorySection';
import StatsSection from '@/components/customer/StatsSection';

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

interface CustomerGift {
  id: string;
  gift_type: string;
  gift_name: string;
  gift_description?: string;
  gift_value: number;
  expires_at?: string;
  is_used: boolean;
  used_at?: string;
  gift_code?: string;
  message?: string;
  created_at: string;
  image_url?: string;
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
  const [customerGifts, setCustomerGifts] = useState<CustomerGift[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Check for saved login on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('customerLoginData');
    const loginExpiry = localStorage.getItem('customerLoginExpiry');
    
    if (savedUser && loginExpiry) {
      const expiryTime = new Date(loginExpiry);
      const now = new Date();
      
      // Check if login is still valid (within 24 hours)
      if (now < expiryTime) {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        setIsLoggedIn(true);
        console.log('Restored login session for user:', userData.name);
      } else {
        // Login expired, clear stored data
        localStorage.removeItem('customerLoginData');
        localStorage.removeItem('customerLoginExpiry');
        console.log('Login session expired, cleared stored data');
      }
    }
  }, []);

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

  const fetchCustomerGifts = async () => {
    if (!currentUser) return;
    
    const { data, error } = await supabase
      .from('customer_gifts')
      .select('*')
      .eq('customer_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching customer gifts:', error);
      return;
    }
    
    setCustomerGifts(data || []);
  };

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleUseGift = async (gift: CustomerGift) => {
    // ถ้ามีโค้ดแล้ว ให้คัดลอกโค้ดเดิม
    if (gift.gift_code) {
      navigator.clipboard.writeText(gift.gift_code);
      toast({ 
        title: 'คัดลอกแล้ว', 
        description: `โค้ด ${gift.gift_code} ถูกคัดลอกแล้ว` 
      });
      return;
    }

    // ตรวจสอบว่าหมดอายุหรือไม่
    if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
      toast({ title: 'ข้อผิดพลาด', description: 'ของขวัญนี้หมดอายุแล้ว', variant: 'destructive' });
      return;
    }

    try {
      let uniqueCode = '';
      let isUnique = false;
      
      // สร้างโค้ดที่ไม่ซ้ำ
      while (!isUnique) {
        uniqueCode = generateUniqueCode();
        const { data: existingGift } = await supabase
          .from('customer_gifts')
          .select('id')
          .eq('gift_code', uniqueCode)
          .maybeSingle();
        
        if (!existingGift) {
          isUnique = true;
        }
      }

      // อัปเดตเฉพาะ gift_code เท่านั้น ไม่อัปเดต is_used หรือ used_at
      const { error } = await supabase
        .from('customer_gifts')
        .update({
          gift_code: uniqueCode
        })
        .eq('id', gift.id);

      if (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถสร้างโค้ดได้', variant: 'destructive' });
        return;
      }

      // แสดงโค้ดให้ผู้ใช้
      navigator.clipboard.writeText(uniqueCode);
      toast({ 
        title: 'สำเร็จ!', 
        description: `โค้ดของคุณ: ${uniqueCode} (คัดลอกแล้ว)`,
        duration: 10000
      });

      // รีเฟรชข้อมูลของขวัญเพื่อแสดงโค้ดที่สร้างขึ้น
      fetchCustomerGifts();
    } catch (error) {
      console.error('Error generating gift code:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการสร้างโค้ด', variant: 'destructive' });
    }
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
      
      // Save login data to localStorage with 24-hour expiry
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24); // 24 hours from now
      
      localStorage.setItem('customerLoginData', JSON.stringify(profileData));
      localStorage.setItem('customerLoginExpiry', expiryTime.toISOString());
      
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
    // Clear stored login data
    localStorage.removeItem('customerLoginData');
    localStorage.removeItem('customerLoginExpiry');
    
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
      fetchCustomerGifts();
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
          <>
            <RewardsSection
              rewards={rewards}
              currentUser={currentUser}
              onRedeemReward={redeemReward}
            />
            
            {/* Customer Gifts Section - Updated for mobile 1 column layout */}
            {customerGifts.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    ของรางวัล
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerGifts.map((gift) => {
                    const isVoucher = gift.gift_type === 'voucher' || 
                                    gift.gift_name.toLowerCase().includes('voucher') || 
                                    gift.gift_name.toLowerCase().includes('คูปอง') || 
                                    gift.gift_name.toLowerCase().includes('บาท');
                    
                    return (
                      <div key={gift.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Gift Card Design - Single Column Layout */}
                        <div className="relative">
                          {/* Content Section */}
                          <div className="p-0">
                            {isVoucher ? (
                              // Voucher Design
                              <div className="bg-white p-4 relative">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-600 font-medium mb-1">CASH VOUCHER</div>
                                    <div className="text-3xl font-bold text-gray-800 mb-1">
                                      {gift.gift_value}
                                      <span className="text-lg font-medium">THB</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {gift.gift_value === 100 ? 'ONE HUNDRED BAHT' : 
                                       gift.gift_value === 200 ? 'TWO HUNDRED BAHT' : 
                                       `${gift.gift_value} BAHT`}
                                    </div>
                                  </div>
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-xs text-gray-500 transform rotate-90">COUPON</div>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-700 mb-2">
                                  {gift.gift_name}
                                </div>
                              </div>
                            ) : (
                              // Menu Item Design with Image
                              <div className="relative">
                                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                  {gift.image_url ? (
                                    <img 
                                      src={gift.image_url} 
                                      alt={gift.gift_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                      <Gift className="w-12 h-12 text-orange-400" />
                                    </div>
                                  )}
                                  {/* REDEEM Badge */}
                                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    REDEEM
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                                    {gift.gift_name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    ประเภท: เมนูอาหาร มูลค่า: {gift.gift_value}฿
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Dotted line separator */}
                            <div className="border-t-2 border-dashed border-gray-300 mx-4"></div>

                            {/* Code Section */}
                            <div className="bg-purple-50 p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                                  <Gift className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700 mb-1">โค้ด:</p>
                                  <p className="text-lg font-bold text-purple-800">
                                    {gift.gift_code || 'กำลังสร้างโค้ด...'}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                  onClick={() => {
                                    if (gift.gift_code) {
                                      navigator.clipboard.writeText(gift.gift_code);
                                      toast({ title: 'คัดลอกแล้ว', description: `โค้ด ${gift.gift_code} ถูกคัดลอกแล้ว` });
                                    }
                                  }}
                                  disabled={!gift.gift_code}
                                >
                                  <Copy className="w-4 h-4 mr-1" />
                                  คัดลอก
                                </Button>
                              </div>
                              
                              <p className="text-xs text-purple-600 mb-3">
                                สถานะ: {gift.used_at ? 'ใช้แล้ว' : 'พร้อมใช้งาน (ยังไม่ได้ชำระเงิน)'}
                              </p>

                              {gift.expires_at && (
                                <p className="text-xs text-red-500 mb-3">
                                  หมดอายุ: {new Date(gift.expires_at).toLocaleDateString('th-TH')}
                                </p>
                              )}

                              {/* Action Button */}
                              <Button 
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => handleUseGift(gift)}
                                disabled={gift.expires_at && new Date(gift.expires_at) < new Date()}
                              >
                                คัดลอกโค้ด
                              </Button>

                              {gift.message && (
                                <div className="mt-3 p-3 bg-white rounded-lg">
                                  <p className="text-xs text-gray-600 italic">
                                    "{gift.message}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'coupons' && (
          <CouponsSection coupons={coupons} />
        )}

        {activeTab === 'history' && (
          <HistorySection currentUser={currentUser} />
        )}

        {activeTab === 'shop' && (
          <ShopSection currentUser={currentUser} />
        )}

        {activeTab === 'stats' && (
          <StatsSection currentUser={currentUser} />
        )}
      </div>
    </div>
  );
};

export default CustomerMobileApp;
