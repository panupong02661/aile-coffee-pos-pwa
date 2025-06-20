
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gift, CreditCard, ShoppingBag, User, Star, Crown, Diamond, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  image_url?: string;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  min_purchase: number;
  end_date: string;
}

interface CustomerAuth {
  user: any;
  session: any;
}

const CustomerApp = () => {
  const [auth, setAuth] = useState<CustomerAuth>({ user: null, session: null });
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth({ user: session?.user || null, session });
      if (session?.user) {
        loadCustomerProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuth({ user: session?.user || null, session });
        if (session?.user) {
          loadCustomerProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (auth.user) {
      loadRewards();
      loadCoupons();
      loadMenuItems();
    }
  }, [auth.user]);

  const loadCustomerProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setPhone(data.phone);
        setBirthDate(data.birth_date || '');
        setGender(data.gender || '');
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required');

      if (error) throw error;
      setRewards(data || []);
    } catch (error: any) {
      console.error('Error loading rewards:', error);
    }
  };

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      console.error('Error loading coupons:', error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (name)
        `)
        .eq('is_available', true);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleAuth = async () => {
    try {
      setLoading(true);
      
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เข้าสู่ระบบเรียบร้อยแล้ว' });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/customer`,
          }
        });
        
        if (error) throw error;
        
        // Create customer profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('customer_profiles')
            .insert({
              user_id: data.user.id,
              full_name: fullName,
              phone: phone,
              birth_date: birthDate || null,
              gender: gender || null,
            });
          
          if (profileError) throw profileError;
        }
        
        toast({ title: 'สำเร็จ', description: 'สมัครสมาชิกเรียบร้อยแล้ว' });
      }
    } catch (error: any) {
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: 'สำเร็จ', description: 'ออกจากระบบเรียบร้อยแล้ว' });
    } catch (error: any) {
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  };

  const updateProfile = async () => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          full_name: fullName,
          phone: phone,
          birth_date: birthDate || null,
          gender: gender || null,
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await loadCustomerProfile(auth.user.id);
      toast({ title: 'สำเร็จ', description: 'อัพเดทข้อมูลเรียบร้อยแล้ว' });
    } catch (error: any) {
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="w-8 h-8 text-amber-600" />;
      case 'silver': return <Star className="w-8 h-8 text-gray-400" />;
      case 'gold': return <Crown className="w-8 h-8 text-yellow-500" />;
      case 'platinum': return <Diamond className="w-8 h-8 text-blue-500" />;
      default: return <Award className="w-8 h-8 text-amber-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-500 to-amber-700';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-blue-400 to-blue-600';
      default: return 'from-amber-500 to-amber-700';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'สมาชิกทองแดง';
      case 'silver': return 'สมาชิกเงิน';
      case 'gold': return 'สมาชิกทอง';
      case 'platinum': return 'สมาชิกแพลทินัม';
      default: return 'สมาชิกทองแดง';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-cream-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-coffee-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-coffee-800">
              {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="กรอกชื่อ-นามสกุล"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">วันเกิด</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">เพศ</Label>
                  <Select value={gender} onValueChange={setGender}>
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
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="กรอกอีเมล"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>
            
            <Button 
              onClick={handleAuth} 
              className="w-full bg-coffee-600 hover:bg-coffee-700"
              disabled={loading}
            >
              {loading ? 'กำลังดำเนินการ...' : (isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full"
            >
              {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-coffee-800">Aile Coffee</h1>
          <Button variant="ghost" onClick={handleLogout} size="sm">
            ออกจากระบบ
          </Button>
        </div>
      </div>

      {/* Member Card */}
      {profile && (
        <div className="p-4">
          <Card className={`bg-gradient-to-r ${getTierColor(profile.tier)} text-white shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    {getTierIcon(profile.tier)}
                    <div>
                      <h2 className="text-xl font-bold">{profile.full_name}</h2>
                      <p className="text-sm opacity-90">{getTierName(profile.tier)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-6">
                    <div>
                      <p className="text-sm opacity-90">แต้มสะสม</p>
                      <p className="text-2xl font-bold">{profile.points.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90">ยอดซื้อรวม</p>
                      <p className="text-lg font-semibold">฿{profile.total_spent.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex flex-col space-y-1">
            <User className="w-4 h-4" />
            <span className="text-xs">ข้อมูล</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex flex-col space-y-1">
            <Gift className="w-4 h-4" />
            <span className="text-xs">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex flex-col space-y-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs">Coupons</span>
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex flex-col space-y-1">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs">Shop</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แก้ไขข้อมูลส่วนตัว</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editFullName">ชื่อ-นามสกุล</Label>
                <Input
                  id="editFullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPhone">เบอร์โทรศัพท์</Label>
                <Input
                  id="editPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editBirthDate">วันเกิด</Label>
                <Input
                  id="editBirthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editGender">เพศ</Label>
                <Select value={gender} onValueChange={setGender}>
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
              
              <Button onClick={updateProfile} className="w-full bg-coffee-600 hover:bg-coffee-700">
                บันทึกข้อมูล
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          {rewards.map((reward) => (
            <Card key={reward.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-coffee-100 rounded-lg flex items-center justify-center">
                    <Gift className="w-8 h-8 text-coffee-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-coffee-800">{reward.name}</h3>
                    <p className="text-sm text-coffee-600">{reward.description}</p>
                    <Badge variant="secondary" className="mt-2">
                      {reward.points_required} แต้ม
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-coffee-600 hover:bg-coffee-700"
                    disabled={!profile || profile.points < reward.points_required}
                  >
                    แลก
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-coffee-800">{coupon.name}</h3>
                    <p className="text-sm text-coffee-600">{coupon.description}</p>
                    <div className="flex space-x-2 mt-2">
                      <Badge variant="outline">รหัส: {coupon.code}</Badge>
                      <Badge variant="secondary">
                        {coupon.discount_type === 'percent' 
                          ? `${coupon.discount_value}%` 
                          : `฿${coupon.discount_value}`}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    เก็บ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-coffee-100 rounded-lg flex items-center justify-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-coffee-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-coffee-800">{item.name}</h3>
                      <p className="text-sm text-coffee-600">{item.description}</p>
                      <p className="text-lg font-bold text-coffee-800 mt-1">
                        ฿{item.price}
                      </p>
                    </div>
                    <Button size="sm" className="bg-coffee-600 hover:bg-coffee-700">
                      สั่ง
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerApp;
