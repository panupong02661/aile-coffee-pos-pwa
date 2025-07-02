
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Gift, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LimitedReward {
  id: string;
  name: string;
  description?: string;
  reward_type: 'discount' | 'voucher' | 'item';
  discount_value: number;
  discount_type: 'percent' | 'amount';
  reward_code?: string;
  max_claims: number;
  current_claims: number;
  start_date: string;
  end_date: string;
  target_month?: number;
  is_active: boolean;
  created_at: string;
}

const LimitedRewardsManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<LimitedReward | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reward_type: 'discount' as 'discount' | 'voucher' | 'item',
    discount_value: 0,
    discount_type: 'percent' as 'percent' | 'amount',
    reward_code: '',
    max_claims: 100,
    start_date: '',
    end_date: '',
    target_month: 0,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['admin-limited-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('limited_rewards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LimitedReward[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('limited_rewards')
        .insert([{
          ...data,
          target_month: data.target_month || null
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('สร้างรางวัลสำเร็จ!');
      queryClient.invalidateQueries({ queryKey: ['admin-limited-rewards'] });
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating reward:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างรางวัล');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('limited_rewards')
        .update({
          ...data,
          target_month: data.target_month || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('อัปเดตรางวัลสำเร็จ!');
      queryClient.invalidateQueries({ queryKey: ['admin-limited-rewards'] });
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating reward:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตรางวัล');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('limited_rewards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('ลบรางวัลสำเร็จ!');
      queryClient.invalidateQueries({ queryKey: ['admin-limited-rewards'] });
    },
    onError: (error) => {
      console.error('Error deleting reward:', error);
      toast.error('เกิดข้อผิดพลาดในการลบรางวัล');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      reward_type: 'discount',
      discount_value: 0,
      discount_type: 'percent',
      reward_code: '',
      max_claims: 100,
      start_date: '',
      end_date: '',
      target_month: 0,
      is_active: true
    });
    setEditingReward(null);
    setShowForm(false);
  };

  const handleEdit = (reward: LimitedReward) => {
    setFormData({
      name: reward.name,
      description: reward.description || '',
      reward_type: reward.reward_type,
      discount_value: reward.discount_value,
      discount_type: reward.discount_type,
      reward_code: reward.reward_code || '',
      max_claims: reward.max_claims,
      start_date: new Date(reward.start_date).toISOString().slice(0, 16),
      end_date: new Date(reward.end_date).toISOString().slice(0, 16),
      target_month: reward.target_month || 0,
      is_active: reward.is_active
    });
    setEditingReward(reward);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    if (editingReward) {
      updateMutation.mutate({ id: editingReward.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (reward: LimitedReward) => {
    const now = new Date();
    const start = new Date(reward.start_date);
    const end = new Date(reward.end_date);
    
    if (!reward.is_active) {
      return <Badge variant="secondary">ปิดใช้งาน</Badge>;
    } else if (now < start) {
      return <Badge className="bg-blue-500">รอเริ่ม</Badge>;
    } else if (now > end) {
      return <Badge variant="destructive">หมดเวลา</Badge>;
    } else if (reward.current_claims >= reward.max_claims) {
      return <Badge variant="destructive">เต็มแล้ว</Badge>;
    } else {
      return <Badge className="bg-green-500">กำลังใช้งาน</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'ทุกเดือน', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return months[month] || 'ทุกเดือน';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              จัดการรางวัลพิเศษ
            </CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              สร้างรางวัลใหม่
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Form */}
          {showForm && (
            <Card className="mb-6 border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingReward ? 'แก้ไขรางวัล' : 'สร้างรางวัลใหม่'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">ชื่อรางวัล *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="เช่น ส่วนลด 20% พิเศษ"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reward_type">ประเภทรางวัล</Label>
                      <Select
                        value={formData.reward_type}
                        onValueChange={(value: 'discount' | 'voucher' | 'item') => 
                          setFormData(prev => ({ ...prev, reward_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">ส่วนลด</SelectItem>
                          <SelectItem value="voucher">คูปอง</SelectItem>
                          <SelectItem value="item">ของแถม</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="discount_value">มูลค่า</Label>
                      <Input
                        id="discount_value"
                        type="number"
                        min="0"
                        value={formData.discount_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="discount_type">ประเภทส่วนลด</Label>
                      <Select
                        value={formData.discount_type}
                        onValueChange={(value: 'percent' | 'amount') => 
                          setFormData(prev => ({ ...prev, discount_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">เปอร์เซ็นต์ (%)</SelectItem>
                          <SelectItem value="amount">จำนวนเงิน (บาท)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="max_claims">จำนวนสิทธิ์ทั้งหมด</Label>
                      <Input
                        id="max_claims"
                        type="number"
                        min="1"
                        value={formData.max_claims}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_claims: Number(e.target.value) }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="target_month">เดือนเป้าหมาย (วันเกิด)</Label>
                      <Select
                        value={formData.target_month.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, target_month: Number(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">ทุกเดือน</SelectItem>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {getMonthName(i + 1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="start_date">วันที่เริ่ม *</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date">วันที่สิ้นสุด *</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">คำอธิบาย</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="อธิบายเงื่อนไขและรายละเอียดของรางวัล"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reward_code">รหัสคูปอง (ถ้ามี)</Label>
                    <Input
                      id="reward_code"
                      value={formData.reward_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, reward_code: e.target.value }))}
                      placeholder="เช่น SPECIAL20"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      ยกเลิก
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingReward ? 'อัปเดต' : 'สร้าง'}รางวัล
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Rewards List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>ยังไม่มีรางวัล</p>
              </div>
            ) : (
              rewards.map((reward) => (
                <Card key={reward.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{reward.name}</h3>
                          {getStatusBadge(reward)}
                          {reward.target_month && reward.target_month > 0 && (
                            <Badge variant="outline" className="bg-pink-50">
                              <Calendar className="w-3 h-3 mr-1" />
                              {getMonthName(reward.target_month)}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">มูลค่า:</span>
                            <p className="font-semibold">
                              {reward.discount_type === 'percent' ? `${reward.discount_value}%` : `${reward.discount_value}฿`}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">ใช้แล้ว/ทั้งหมด:</span>
                            <p className="font-semibold text-orange-600">
                              {reward.current_claims}/{reward.max_claims}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">เริ่ม:</span>
                            <p className="font-semibold">
                              {new Date(reward.start_date).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">สิ้นสุด:</span>
                            <p className="font-semibold">
                              {new Date(reward.end_date).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>

                        {reward.description && (
                          <p className="text-sm text-gray-600 mt-2">{reward.description}</p>
                        )}

                        {reward.reward_code && (
                          <div className="mt-2">
                            <Badge variant="outline" className="font-mono">
                              รหัส: {reward.reward_code}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(reward)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('คุณแน่ใจหรือไม่ที่จะลบรางวัลนี้?')) {
                              deleteMutation.mutate(reward.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LimitedRewardsManagement;
