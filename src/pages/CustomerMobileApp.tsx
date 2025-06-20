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
  generateDateVariants
} from '@/utils/dateUtils';

interface CustomerProfile {
  id: string;
  full_name: string;
  phone: string;
  birth_date?: string;
  gender?: string;
  tier: string;
  points: number;
  reward_points: number;
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
    full_name: '', 
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
      default: return 'สมาชิกทองแดง';
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'platinum': return 'bg-gradient-to-r from-purple-400 to-purple-600';
      default: return 'bg-gradient-to-r from-orange-400 to-orange-600';
    }
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
    
    const { data, error } = await supabase
      .from('customer_coupons')
      .select(`
        *,
        coupons (
          id,
          name,
          code,
          discount_value,
          discount_type,
          end_date
        )
      `)
      .eq('customer_id', currentUser.id)
      .eq('is_used', false);
    
    if (error) {
      console.error('Error fetching coupons:', error);
      return;
    }
    
    const formattedCoupons = (data || []).map(item => ({
      id: item.id,
      name: item.coupons?.name || '',
      code: item.coupons?.code || '',
      discount_value: item.coupons?.discount_value || 0,
      discount_type: item.coupons?.discount_type || 'amount',
      is_used: item.is_used,
      end_date: item.coupons?.end_date || ''
    }));
    
    setCoupons(formattedCoupons);
  };

  const handleRegister = async () => {
    if (!registerForm.full_name || !registerForm.phone || !registerForm.birth_date) {
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

      // ตรวจสอบว่าเบอร์โทรนี้มีอยู่แล้วหรือไม่ (ทั้งใน customer_profiles และ members)
      const [customerResult, memberResult] = await Promise.all([
        supabase
          .from('customer_profiles')
          .select('id, phone, birth_date')
          .eq('phone', cleanedPhone)
          .maybeSingle(),
        supabase
          .from('members')
          .select('id, phone, birth_date')
          .eq('phone', cleanedPhone)
          .maybeSingle()
      ]);

      console.log('Existing customer check:', customerResult);
      console.log('Existing member check:', memberResult);

      if (customerResult.data || memberResult.data) {
        toast({ title: 'ข้อผิดพลาด', description: 'เบอร์โทรนี้ได้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ', variant: 'destructive' });
        return;
      }

      console.log('Creating new profile with data:', {
        full_name: registerForm.full_name.trim(),
        phone: cleanedPhone,
        birth_date: convertedBirthDate,
        gender: registerForm.gender || null
      });

      // สร้างโปรไฟล์ใหม่
      const { error: profileError } = await supabase
        .from('customer_profiles')
        .insert({
          full_name: registerForm.full_name.trim(),
          phone: cleanedPhone,
          birth_date: convertedBirthDate,
          gender: registerForm.gender || null,
          tier: 'bronze',
          points: 0,
          reward_points: 0,
          total_spent: 0
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: `ไม่สามารถสร้างโปรไฟล์ได้: ${profileError.message}`, 
          variant: 'destructive' 
        });
        return;
      }

      toast({ title: 'สำเร็จ', description: 'สมัครสมาชิกเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ' });
      setIsRegistering(false);
      setRegisterForm({ full_name: '', phone: '', birth_date: '', gender: '' });
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
      
      // ทำความสะอาดเบอร์โทรศัพท์
      const cleanedPhone = cleanPhoneNumber(loginForm.phone);
      console.log('Cleaned phone:', cleanedPhone);
      
      // สร้าง variants ของวันที่สำหรับการค้นหา
      const dateVariants = generateDateVariants(loginForm.birth_date);
      console.log('Date variants for search:', dateVariants);
      
      // ค้นหาจาก customer_profiles ก่อน
      let profileData = null;
      let profileError = null;

      for (const dateVariant of dateVariants) {
        console.log(`Searching customer_profiles with phone: ${cleanedPhone}, birth_date: ${dateVariant}`);
        
        const result = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('phone', cleanedPhone)
          .eq('birth_date', dateVariant)
          .maybeSingle();

        console.log(`Search result for date ${dateVariant}:`, result);

        if (result.data) {
          profileData = result.data;
          break;
        }
        if (result.error && !result.error.message.includes('PGRST116')) {
          profileError = result.error;
        }
      }

      // ถ้าไม่เจอใน customer_profiles ให้ค้นหาใน members และ migrate ข้อมูล
      if (!profileData) {
        console.log('Not found in customer_profiles, searching in members table...');
        
        for (const dateVariant of dateVariants) {
          console.log(`Searching members with phone: ${cleanedPhone}, birth_date: ${dateVariant}`);
          
          const memberResult = await supabase
            .from('members')
            .select('*')
            .eq('phone', cleanedPhone)
            .eq('birth_date', dateVariant)
            .maybeSingle();

          console.log(`Member search result for date ${dateVariant}:`, memberResult);

          if (memberResult.data) {
            const memberData = memberResult.data;
            console.log('Found in members table, migrating to customer_profiles...');
            
            // Migrate ข้อมูลจาก members ไป customer_profiles
            const migrationResult = await supabase
              .from('customer_profiles')
              .insert({
                full_name: memberData.name,
                phone: memberData.phone,
                birth_date: memberData.birth_date,
                gender: memberData.gender,
                tier: memberData.tier || 'bronze',
                points: memberData.points || 0,
                reward_points: 0,
                total_spent: memberData.total_spent || 0
              })
              .select()
              .single();

            if (migrationResult.error) {
              console.error('Migration error:', migrationResult.error);
            } else {
              console.log('Migration successful:', migrationResult.data);
              profileData = migrationResult.data;
              break;
            }
          }
        }
      }

      if (profileError && !profileData) {
        console.error('Login query error:', profileError);
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล กรุณาลองใหม่', 
          variant: 'destructive' 
        });
        return;
      }

      if (!profileData) {
        // Debug: ดูข้อมูลทั้งหมดของเบอร์นี้
        const [customerProfilesWithPhone, membersWithPhone] = await Promise.all([
          supabase
            .from('customer_profiles')
            .select('*')
            .eq('phone', cleanedPhone),
          supabase
            .from('members')
            .select('*')
            .eq('phone', cleanedPhone)
        ]);

        console.log('All customer_profiles with this phone:', customerProfilesWithPhone.data);
        console.log('All members with this phone:', membersWithPhone.data);

        if ((customerProfilesWithPhone.data && customerProfilesWithPhone.data.length > 0) || 
            (membersWithPhone.data && membersWithPhone.data.length > 0)) {
          
          console.log('Found profiles but birth_date mismatch.');
          console.log('Expected date variants:', dateVariants);
          
          if (customerProfilesWithPhone.data) {
            customerProfilesWithPhone.data.forEach((profile, index) => {
              console.log(`Customer Profile ${index + 1} birth_date:`, profile.birth_date);
              console.log(`Customer Profile ${index + 1} birth_date in Thai format:`, formatDateToThai(profile.birth_date));
            });
          }
          
          if (membersWithPhone.data) {
            membersWithPhone.data.forEach((member, index) => {
              console.log(`Member ${index + 1} birth_date:`, member.birth_date);
              console.log(`Member ${index + 1} birth_date in Thai format:`, formatDateToThai(member.birth_date));
            });
          }
          
          toast({ 
            title: 'ข้อมูลไม่ตรงกัน', 
            description: `พบเบอร์โทรในระบบแต่วันเกิดไม่ตรงกัน กรุณาตรวจสอบวันเกิดอีกครั้ง`, 
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

      console.log('Login successful with profile:', profileData);
      setCurrentUser(profileData);
      setIsLoggedIn(true);
      setLoginForm({ phone: '', birth_date: '' });
      toast({ title: 'สำเร็จ', description: `ยินดีต้อนรับ ${profileData.full_name}` });
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
      .from('customer_profiles')
      .update({
        full_name: currentUser.full_name,
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
    if (!currentUser || currentUser.reward_points < pointsRequired) {
      toast({ title: 'ข้อผิดพลาด', description: 'แต้มไม่เพียงพอ', variant: 'destructive' });
      return;
    }

    try {
      // บันทึกการแลกของรางวัล
      const { error: rewardError } = await supabase
        .from('customer_rewards')
        .insert({
          customer_id: currentUser.id,
          reward_id: rewardId,
          is_used: false
        });

      if (rewardError) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถแลกของรางวัลได้', variant: 'destructive' });
        return;
      }

      // หักแต้ม
      const { error: updateError } = await supabase
        .from('customer_profiles')
        .update({
          reward_points: currentUser.reward_points - pointsRequired
        })
        .eq('id', currentUser.id);

      if (updateError) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถหักแต้มได้', variant: 'destructive' });
        return;
      }

      setCurrentUser({
        ...currentUser,
        reward_points: currentUser.reward_points - pointsRequired
      });

      toast({ title: 'สำเร็จ', description: 'แลกของรางวัลเรียบร้อยแล้ว' });
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการแลกของรางวัล', variant: 'destructive' });
    }
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
                      value={registerForm.full_name}
                      onChange={(e) => setRegisterForm({...registerForm, full_name: e.target.value})}
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
      <div className="p-4">
        <Card className={`${getTierColor(currentUser?.tier || 'bronze')} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-2 border-white">
                <AvatarFallback className="bg-white text-gray-800 text-lg font-bold">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{currentUser?.full_name}</h2>
                <p className="text-sm opacity-90">{getTierDisplayName(currentUser?.tier || 'bronze')}</p>
                <div className="flex space-x-4 mt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{currentUser?.reward_points || 0}</p>
                    <p className="text-xs opacity-75">แต้มรางวัล</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{currentUser?.points || 0}</p>
                    <p className="text-xs opacity-75">แต้มสะสม</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">฿{currentUser?.total_spent || 0}</p>
                    <p className="text-xs opacity-75">ยอดใช้จ่าย</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation */}
      <div className="p-4">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
                    value={currentUser?.full_name || ''}
                    onChange={(e) => setCurrentUser(prev => prev ? {...prev, full_name: e.target.value} : null)}
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
                        disabled={(currentUser?.reward_points || 0) < reward.points_required}
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
                <div className="grid gap-4">
                  {coupons.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">ยังไม่มีคูปอง</p>
                  ) : (
                    coupons.map((coupon) => (
                      <div key={coupon.id} className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-pink-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{coupon.name}</h4>
                            <p className="text-sm text-gray-600">รหัส: {coupon.code}</p>
                            <p className="text-lg font-bold text-red-600">
                              ลด {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `฿${coupon.discount_value}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              หมดอายุ: {new Date(coupon.end_date).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <Badge variant="secondary">พร้อมใช้</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
