
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { User, Gift, Tag, ShoppingBag, Star, Phone, Calendar, UserCheck } from 'lucide-react';
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

  // ฟังก์ชันสำหรับเปรียบเทียบวันที่แบบละเอียด
  const compareDates = (inputDate: string, storedDate: string): boolean => {
    if (!inputDate || !storedDate) return false;
    
    console.log('=== DATE COMPARISON DEBUG ===');
    console.log('Input date:', inputDate);
    console.log('Stored date:', storedDate);
    
    // แปลง input เป็น ISO format
    const inputISODate = parseThaiDateInput(inputDate);
    console.log('Input converted to ISO:', inputISODate);
    
    // สร้าง variants ของวันที่ทั้งสองแบบ
    const inputVariants = generateDateSearchVariants(inputDate);
    const storedVariants = generateDateSearchVariants(storedDate);
    
    console.log('Input variants:', inputVariants);
    console.log('Stored variants:', storedVariants);
    
    // ตรวจสอบการตรงกันแบบต่างๆ
    const matches = [
      // ตรงกันโดยตรง
      inputDate === storedDate,
      inputISODate === storedDate,
      
      // ตรงกันผ่าน variants
      inputVariants.some(iv => storedVariants.some(sv => iv === sv)),
      
      // เปรียบเทียบแบบ Date object
      inputISODate && new Date(inputISODate).toISOString().split('T')[0] === new Date(storedDate).toISOString().split('T')[0],
      
      // เปรียบเทียบแบบ string ธรรมดา
      inputDate.replace(/\//g, '-') === storedDate.replace(/\//g, '-'),
      
      // เปรียบเทียบแค่ตัวเลข
      inputDate.replace(/[^0-9]/g, '') === storedDate.replace(/[^0-9]/g, ''),

      // เปรียบเทียบแบบ exact match ของ parsed dates
      inputISODate && storedDate && inputISODate === storedDate,
      
      // เปรียบเทียบแบบ loose ขึ้น - ถ้าทั้งสองอันแปลงเป็น Date object แล้วเหมือนกัน
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
    
    // เนื่องจากเราใช้ members table หลัก ตอนนี้ข้ามการโหลด coupons ไปก่อน
    setCoupons([]);
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.phone || !registerForm.birth_date) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, เบอร์โทร, วันเกิด)', variant: 'destructive' });
      return;
    }

    // ตรวจสอบรูปแบบวันที่ก่อน
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
      
      // ทำความสะอาดเบอร์โทรศัพท์
      const cleanedPhone = cleanPhoneNumber(registerForm.phone);
      console.log('Cleaned phone:', cleanedPhone);
      
      // แปลงวันที่ให้ถูกต้อง
      const convertedBirthDate = parseThaiDateInput(registerForm.birth_date);
      console.log('Converted birth date for registration:', convertedBirthDate);

      if (!convertedBirthDate) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถแปลงวันที่ได้ กรุณาตรวจสอบรูปแบบวันที่', variant: 'destructive' });
        return;
      }

      // สร้าง variants สำหรับการตรวจสอบ
      const phoneVariants = generatePhoneVariants(registerForm.phone);
      
      console.log('Phone variants for checking:', phoneVariants);

      // ตรวจสอบว่าเบอร์โทรนี้มีอยู่แล้วหรือไม่ใน members
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

      // สร้างสมาชิกใหม่ใน members table
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

    // ตรวจสอบรูปแบบวันที่ก่อน
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
      
      // สร้าง variants สำหรับการค้นหา
      const phoneVariants = generatePhoneVariants(loginForm.phone);
      
      console.log('Phone variants for search:', phoneVariants);
      console.log('Input birth date:', loginForm.birth_date);
      
      let profileData = null;

      // ค้นหาจาก members table
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
        
        // Debug: ดูข้อมูลทั้งหมดของเบอร์นี้
        const debugMembers = await supabase
          .from('members')
          .select('*')
          .like('phone', `%${loginForm.phone.slice(-8)}%`);
        
        console.log('All members with similar phone:', debugMembers.data);
        
        // ตรวจสอบความตรงกันของวันที่อย่างละเอียด
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

    // ข้ามการแลกของรางวัลไปก่อน เนื่องจากยังไม่มีตารางที่เชื่อมโยง
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">แอปสั่งอาหาร</h1>
            <p className="text-gray-600">ยินดีต้อนรับสู่แอปสั่งอาหารออนไลน์</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isRegistering ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRegistering ? (
                <>
                  <div>
                    <Label htmlFor="register-name">ชื่อ *</Label>
                    <Input
                      id="register-name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                      placeholder="กรอกชื่อ-นามสกุล"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-phone">เบอร์โทร *</Label>
                    <Input
                      id="register-phone"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      placeholder="08xxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-birth">วันเดือนปีเกิด * (รูปแบบไทย พ.ศ.)</Label>
                    <Input
                      id="register-birth"
                      value={registerForm.birth_date}
                      onChange={(e) => setRegisterForm({...registerForm, birth_date: e.target.value})}
                      placeholder="22/10/2535"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      กรอกรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535) รูปแบบไทย พ.ศ.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="register-gender">เพศ</Label>
                    <Select value={registerForm.gender} onValueChange={(value) => setRegisterForm({...registerForm, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ชาย</SelectItem>
                        <SelectItem value="female">หญิง</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleRegister} className="w-full" disabled={isLoading}>
                    {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsRegistering(false)} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    มีบัญชีแล้ว? เข้าสู่ระบบ
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="login-phone">เบอร์โทร</Label>
                    <Input
                      id="login-phone"
                      value={loginForm.phone}
                      onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
                      placeholder="08xxxxxxxx"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-birth">วันเดือนปีเกิด (รูปแบบไทย พ.ศ.)</Label>
                    <Input
                      id="login-birth"
                      value={loginForm.birth_date}
                      onChange={(e) => setLoginForm({...loginForm, birth_date: e.target.value})}
                      placeholder="22/10/2535"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      กรอกรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535) รูปแบบไทย พ.ศ.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleLogin} 
                    className="w-full"
                    disabled={!loginForm.phone || !loginForm.birth_date || isLoading}
                  >
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsRegistering(true)} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    ยังไม่มีบัญชี? สมัครสมาชิก
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>เข้าสู่ระบบด้วยเบอร์โทรและวันเดือนปีเกิด</p>
            <p className="text-xs mt-1">รูปแบบไทย พ.ศ. เช่น 22/10/2535</p>
          </div>
        </div>
      </div>
    );
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
      <div className="p-6">
        <div className="relative">
          {/* Card Shadow */}
          <div className="absolute inset-0 bg-black/10 rounded-2xl transform translate-y-2 translate-x-2"></div>
          
          {/* Main Card */}
          <Card className={`relative ${getTierColor(currentUser?.tier || 'silver')} text-white border-0 shadow-2xl rounded-2xl overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-white/20 shadow-lg">
                      <AvatarFallback className="bg-white/90 text-orange-800 text-2xl font-bold">
                        {(currentUser?.name || currentUser?.full_name)?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-orange-800 rounded-full p-1">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">{currentUser?.name || currentUser?.full_name}</h2>
                    <p className="text-lg opacity-90 font-medium">{getTierDisplayName(currentUser?.tier || 'silver')}</p>
                    <p className="text-sm opacity-75">สมาชิกตั้งแต่ {new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold mb-1">{currentUser?.points || 0}</p>
                  <p className="text-sm opacity-75">แต้มสะสม</p>
                </div>
                <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold mb-1">฿{(currentUser?.total_spent || 0).toLocaleString()}</p>
                  <p className="text-sm opacity-75">ยอดใช้จ่าย</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="p-6 pt-0">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-white/20 rounded-full p-4 inline-block mb-3">
                <User className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg">Member</h3>
              <p className="text-sm opacity-80">จัดการโปรไฟล์</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-white/20 rounded-full p-4 inline-block mb-3">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg">Rewards</h3>
              <p className="text-sm opacity-80">แลกของรางวัล</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-white/20 rounded-full p-4 inline-block mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg">Menu</h3>
              <p className="text-sm opacity-80">สั่งอาหาร</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-white/20 rounded-full p-4 inline-block mb-3">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg">Promotion</h3>
              <p className="text-sm opacity-80">โปรโมชั่น</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="profile">โปรไฟล์</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  ข้อมูลส่วนตัว
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => editMode ? handleUpdateProfile() : setEditMode(true)}
                >
                  {editMode ? 'บันทึก' : 'แก้ไข'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ชื่อ</Label>
                  <Input
                    value={currentUser?.name || ''}
                    onChange={(e) => setCurrentUser(prev => prev ? {...prev, name: e.target.value} : null)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>เบอร์โทร</Label>
                  <Input
                    value={currentUser?.phone || ''}
                    onChange={(e) => setCurrentUser(prev => prev ? {...prev, phone: e.target.value} : null)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>วันเดือนปีเกิด</Label>
                  {editMode ? (
                    <Input
                      value={currentUser?.birth_date ? formatDateForDisplay(currentUser.birth_date) : ''}
                      onChange={(e) => {
                        const convertedDate = parseThaiDateInput(e.target.value);
                        setCurrentUser(prev => prev ? {...prev, birth_date: convertedDate} : null);
                      }}
                      placeholder="22/10/2535"
                    />
                  ) : (
                    <Input
                      value={currentUser?.birth_date ? formatDateToThai(currentUser.birth_date) : ''}
                      disabled={true}
                    />
                  )}
                </div>
                <div>
                  <Label>เพศ</Label>
                  <Select 
                    value={currentUser?.gender || ''} 
                    onValueChange={(value) => setCurrentUser(prev => prev ? {...prev, gender: value} : null)}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเพศ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ชาย</SelectItem>
                      <SelectItem value="female">หญิง</SelectItem>
                      <SelectItem value="other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
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
                  ของรางวัล
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Gift className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{reward.name}</h4>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">{reward.points_required} แต้ม</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => redeemReward(reward.id, reward.points_required)}
                        disabled={(currentUser?.points || 0) < reward.points_required}
                      >
                        แลก
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  คูปองของฉัน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-600 py-8">ยังไม่มีคูปอง</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  สั่งสินค้าในร้าน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">ระบบสั่งอาหารออนไลน์</h3>
                  <p className="text-gray-600 mb-4">
                    สั่งอาหารจากเมนูของร้านและชำระเงินออนไลน์
                  </p>
                  <Button>เริ่มสั่งอาหาร</Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Phone className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <h4 className="font-medium">สั่งผ่านแอป</h4>
                    <p className="text-sm text-gray-600">สะดวก รวดเร็ว</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <UserCheck className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <h4 className="font-medium">รับที่ร้าน</h4>
                    <p className="text-sm text-gray-600">Pick up พร้อมรับ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerMobileApp;
