
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, CheckCircle } from 'lucide-react';

const QRMemberRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('members')
        .insert([{
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          tier: 'silver',
          points: 0,
          total_spent: 0,
          join_date: new Date().toISOString(),
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'ข้อผิดพลาด', description: 'หมายเลขโทรศัพท์นี้มีอยู่แล้วในระบบ', variant: 'destructive' });
        } else {
          toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถสมัครสมาชิกได้', variant: 'destructive' });
        }
        return;
      }

      setSuccess(true);
      toast({ title: 'สำเร็จ', description: 'สมัครสมาชิกเรียบร้อยแล้ว!', variant: 'default' });
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
      });
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดที่ไม่คาดคิด', variant: 'destructive' });
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
        <CardDescription>กรอกข้อมูลเพื่อเป็นสมาชิกและรับสิทธิประโยชน์</CardDescription>
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
