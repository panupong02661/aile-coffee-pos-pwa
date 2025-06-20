
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { 
  parseThaiDateInput, 
  formatDateToThai,
  isValidThaiDateFormat,
  cleanPhoneNumber 
} from '@/utils/dateUtils';

interface MemberFormData {
  name: string;
  phone: string;
  birth_date: string;
  gender: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

const MemberForm = () => {
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    phone: '',
    birth_date: '',
    gender: '',
    tier: 'silver',
    points: 0,
    total_spent: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบรูปแบบวันที่ก่อนส่งข้อมูล
    if (formData.birth_date && !isValidThaiDateFormat(formData.birth_date)) {
      toast({ 
        title: 'รูปแบบวันที่ไม่ถูกต้อง', 
        description: 'กรุณากรอกวันที่ในรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535)', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);

    try {
      const cleanedPhone = cleanPhoneNumber(formData.phone);
      const convertedBirthDate = formData.birth_date ? parseThaiDateInput(formData.birth_date) : null;

      console.log('Member form - converted birth date:', convertedBirthDate);

      const { error } = await supabase
        .from('members')
        .insert([{
          name: formData.name,
          phone: cleanedPhone,
          birth_date: convertedBirthDate,
          gender: formData.gender || null,
          tier: formData.tier,
          points: formData.points,
          total_spent: formData.total_spent,
          join_date: new Date().toISOString(),
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'ข้อผิดพลาด', description: 'หมายเลขโทรศัพท์นี้มีอยู่แล้วในระบบ', variant: 'destructive' });
        } else {
          toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถเพิ่มสมาชิกได้', variant: 'destructive' });
        }
        return;
      }

      toast({ title: 'สำเร็จ', description: 'เพิ่มสมาชิกใหม่เรียบร้อยแล้ว' });
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        birth_date: '',
        gender: '',
        tier: 'silver',
        points: 0,
        total_spent: 0,
      });
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดที่ไม่คาดคิด', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof MemberFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          เพิ่มสมาชิกใหม่
        </CardTitle>
        <CardDescription>กรอกข้อมูลสมาชิกใหม่ (วันที่สมัครจะถูกบันทึกอัตโนมัติ)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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

          <div className="space-y-2">
            <Label htmlFor="tier">ระดับสมาชิก</Label>
            <Select value={formData.tier} onValueChange={(value: 'silver' | 'gold' | 'platinum') => handleInputChange('tier', value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกระดับสมาชิก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="silver">เงิน (Silver)</SelectItem>
                <SelectItem value="gold">ทอง (Gold)</SelectItem>
                <SelectItem value="platinum">แพลตินัม (Platinum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">แต้มเริ่มต้น</Label>
            <Input
              id="points"
              type="number"
              min="0"
              value={formData.points}
              onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_spent">ยอดซื้อรวม (บาท)</Label>
            <Input
              id="total_spent"
              type="number"
              min="0"
              step="0.01"
              value={formData.total_spent}
              onChange={(e) => handleInputChange('total_spent', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              📅 วันที่สมัครจะถูกบันทึกอัตโนมัติเป็นวันที่ปัจจุบัน
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'กำลังเพิ่ม...' : 'เพิ่มสมาชิก'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberForm;
