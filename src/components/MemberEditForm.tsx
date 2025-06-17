
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

interface MemberEditFormProps {
  member: Member;
  onSuccess: () => void;
}

const MemberEditForm = ({ member, onSuccess }: MemberEditFormProps) => {
  const [formData, setFormData] = useState({
    name: member.name,
    phone: member.phone,
    email: member.email || '',
    tier: member.tier,
    points: member.points,
    total_spent: member.total_spent,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('members')
        .update(formData)
        .eq('id', member.id);

      if (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถแก้ไขข้อมูลได้', variant: 'destructive' });
        return;
      }

      toast({ title: 'สำเร็จ', description: 'แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว' });
      onSuccess();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดที่ไม่คาดคิด', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">ชื่อ-นามสกุล</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-phone">หมายเลขโทรศัพท์</Label>
        <Input
          id="edit-phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-email">อีเมล</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-tier">ระดับสมาชิก</Label>
        <Select value={formData.tier} onValueChange={(value) => handleInputChange('tier', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="silver">เงิน (Silver)</SelectItem>
            <SelectItem value="gold">ทอง (Gold)</SelectItem>
            <SelectItem value="platinum">แพลตินัม (Platinum)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-points">แต้ม</Label>
        <Input
          id="edit-points"
          type="number"
          min="0"
          value={formData.points}
          onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-total-spent">ยอดซื้อรวม (บาท)</Label>
        <Input
          id="edit-total-spent"
          type="number"
          min="0"
          step="0.01"
          value={formData.total_spent}
          onChange={(e) => handleInputChange('total_spent', parseFloat(e.target.value) || 0)}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
      </Button>
    </form>
  );
};

export default MemberEditForm;
