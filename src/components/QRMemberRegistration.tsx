
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, CheckCircle } from 'lucide-react';
import { 
  parseThaiDateInput, 
  formatDateToThai,
  isValidThaiDateFormat,
  cleanPhoneNumber 
} from '@/utils/dateUtils';

const QRMemberRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth_date: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shopName, setShopName] = useState('ร้านกาแฟแสนดี');
  const { toast } = useToast();

  useEffect(() => {
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('shop_name')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching shop settings:', error);
        return;
      }

      if (data?.shop_name) {
        setShopName(data.shop_name);
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.birth_date || !formData.gender) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    // ตรวจสอบรูปแบบวันที่
    if (!isValidThaiDateFormat(formData.birth_date)) {
      toast({ 
        title: 'รูปแบบวันที่ไม่ถูกต้อง', 
        description: 'กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535)', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);

    try {
      console.log('=== QR REGISTRATION DEBUG ===');
      console.log('Form data:', formData);

      const cleanedPhone = cleanPhoneNumber(formData.phone);
      const convertedBirthDate = parseThaiDateInput(formData.birth_date);
      
      console.log('Cleaned phone:', cleanedPhone);
      console.log('Converted birth date:', convertedBirthDate);

      if (!convertedBirthDate) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถแปลงวันที่ได้ กรุณาตรวจสอบรูปแบบวันที่', variant: 'destructive' });
        return;
      }

      // ลองเพิ่มในตาราง members ก่อน (เนื่องจากไม่มี RLS)
      const { data: memberResult, error: memberError } = await supabase
        .from('members')
        .insert([{
          name: formData.name.trim(),
          phone: cleanedPhone,
          birth_date: convertedBirthDate,
          gender: formData.gender,
          tier: 'silver',
          points: 0,
          total_spent: 0,
          join_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (memberError) {
        console.error('Member creation error:', memberError);
        if (memberError.code === '23505') {
          toast({ title: 'ข้อผิดพลาด', description: 'หมายเลขโทรศัพท์นี้มีอยู่แล้วในระบบ', variant: 'destructive' });
        } else {
          toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถสมัครสมาชิกได้', variant: 'destructive' });
        }
        return;
      }

      console.log('Member created successfully:', memberResult);

      // ลองสร้าง customer_profiles ด้วย (แต่ไม่ใส่ user_id)
      try {
        const { error: profileError } = await supabase
          .from('customer_profiles')
          .insert([{
            full_name: formData.name.trim(),
            phone: cleanedPhone,
            birth_date: convertedBirthDate,
            gender: formData.gender,
            tier: 'bronze',
            points: 0,
            reward_points: 0,
            total_spent: 0
          }]);

        if (profileError) {
          console.log('Customer profile creation failed (expected):', profileError);
          // ไม่แสดง error เพราะอาจเป็นเรื่องของ RLS
        }
      } catch (profileErr) {
        console.log('Customer profile creation error (expected):', profileErr);
      }

      setSuccess(true);
      toast({ title: 'สำเร็จ', description: 'สมัครสมาชิกเรียบร้อยแล้ว!', variant: 'default' });
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        birth_date: '',
        gender: '',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({ title: 'ข้อผิดพลาด', description: `เกิดข้อผิดพลาดในการสมัครสมาชิก: ${error.message}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">สมัครสมาชิกสำเร็จ!</h2>
          <p className="text-gray-600 mb-4">ยินดีต้อนรับสู่การเป็นสมาชิกระดับเงิน</p>
          <Button 
            onClick={() => setSuccess(false)} 
            className="w-full"
          >
            สมัครสมาชิกคนอื่น
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <UserPlus className="w-6 h-6" />
          สมัครสมาชิก
        </CardTitle>
        <CardDescription>
          สมัครเป็นสมาชิก {shopName} และรับสิทธิประโยชน์
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="กรอกชื่อ-นามสกุล"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">หมายเลขโทรศัพท์ *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="กรอกหมายเลขโทรศัพท์"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">วันเดือนปีเกิด * (รูปแบบไทย พ.ศ.)</Label>
            <Input
              id="birth_date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
              placeholder="22/10/2535"
              required
            />
            <p className="text-xs text-gray-500">
              กรอกรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535) รูปแบบไทย พ.ศ.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">เพศ *</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">สิทธิประโยชน์สมาชิกเงิน</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• รับส่วนลด 5%</li>
              <li>• สะสมแต้ม 1 แต้มต่อ 1 บาท</li>
              <li>• แลกแต้ม 100 แต้ม = 10 บาท</li>
            </ul>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QRMemberRegistration;
