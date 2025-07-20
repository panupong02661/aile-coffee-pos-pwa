
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Copy, Calendar, Users, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLimitedRewards, useCreateLimitedReward } from '@/hooks/useLimitedRewards';

const SpecialPromotionsManager = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reward_type: 'discount',
    discount_type: 'percent',
    discount_value: 0,
    max_claims: 1,
    start_date: '',
    end_date: '',
    target_month: new Date().getMonth() + 1,
    reward_code: ''
  });

  const { data: rewards = [], refetch } = useLimitedRewards();
  const createReward = useCreateLimitedReward();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณากรอกข้อมูลที่จำเป็น',
        variant: 'destructive'
      });
      return;
    }

    const rewardData = {
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      is_active: true,
      current_claims: 0
    };

    try {
      await createReward.mutateAsync(rewardData);
      setFormData({
        name: '',
        description: '',
        reward_type: 'discount',
        discount_type: 'percent',
        discount_value: 0,
        max_claims: 1,
        start_date: '',
        end_date: '',
        target_month: new Date().getMonth() + 1,
        reward_code: ''
      });
      refetch();
    } catch (error) {
      console.error('Error creating reward:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('limited_rewards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'ลบของรางวัลสำเร็จ'
      });
      refetch();
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถลบของรางวัลได้',
        variant: 'destructive'
      });
    }
  };

  const copyCodeFromPromotions = async () => {
    try {
      // ดึงโค้ดจากตาราง limited_promotions
      const { data: promotions, error } = await supabase
        .from('limited_promotions')
        .select('promo_code, title, description, discount_value, discount_type, start_date, end_date, max_claims')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (promotions && promotions.length > 0) {
        const latestPromotion = promotions[0];
        
        // แปลงข้อมูลจาก promotion เป็น reward format
        setFormData({
          name: latestPromotion.title,
          description: latestPromotion.description || '',
          reward_type: 'discount',
          discount_type: latestPromotion.discount_type || 'percent',
          discount_value: latestPromotion.discount_value,
          max_claims: latestPromotion.max_claims,
          start_date: new Date(latestPromotion.start_date).toISOString().split('T')[0],
          end_date: new Date(latestPromotion.end_date).toISOString().split('T')[0],
          target_month: new Date().getMonth() + 1,
          reward_code: latestPromotion.promo_code || ''
        });

        toast({
          title: 'สำเร็จ',
          description: `คัดลอกโค้ด ${latestPromotion.promo_code} จากหน้าโปรโมชั่นแล้ว`
        });
      } else {
        toast({
          title: 'ไม่พบข้อมูล',
          description: 'ไม่พบโปรโมชั่นที่ใช้งานอยู่',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error copying code:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถคัดลอกโค้ดได้',
        variant: 'destructive'
      });
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, reward_code: result });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            สร้างของรางวัลพิเศษ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">ชื่อของรางวัล</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น ส่วนลดพิเศษ"
                  required
                />
              </div>
              <div>
                <Label htmlFor="reward_code">รหัสคูปอง</Label>
                <div className="flex gap-2">
                  <Input
                    id="reward_code"
                    value={formData.reward_code}
                    onChange={(e) => setFormData({ ...formData, reward_code: e.target.value.toUpperCase() })}
                    placeholder="SAVE30"
                    maxLength={10}
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    สุ่ม
                  </Button>
                  <Button type="button" variant="outline" onClick={copyCodeFromPromotions}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายรายละเอียดของรางวัล"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="discount_type">ประเภทส่วนลด</Label>
                <Select value={formData.discount_type} onValueChange={(value) => setFormData({ ...formData, discount_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">เปอร์เซ็นต์</SelectItem>
                    <SelectItem value="amount">จำนวนเงิน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount_value">ค่าส่วนลด</Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="max_claims">จำนวนที่รับได้</Label>
                <Input
                  id="max_claims"
                  type="number"
                  value={formData.max_claims}
                  onChange={(e) => setFormData({ ...formData, max_claims: Number(e.target.value) })}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">วันที่เริ่ม</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">วันที่สิ้นสุด</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={createReward.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              {createReward.isPending ? 'กำลังสร้าง...' : 'สร้างของรางวัล'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            ของรางวัลพิเศษที่สร้างแล้ว
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards.length === 0 ? (
              <p className="text-center text-gray-500">ยังไม่มีของรางวัลพิเศษ</p>
            ) : (
              rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{reward.name}</h4>
                      {reward.reward_code && (
                        <Badge variant="secondary" className="font-mono">
                          {reward.reward_code}
                        </Badge>
                      )}
                      <Badge variant={reward.is_active ? "default" : "secondary"}>
                        {reward.is_active ? 'ใช้งาน' : 'ปิด'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(reward.start_date).toLocaleDateString('th-TH')} - {new Date(reward.end_date).toLocaleDateString('th-TH')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {reward.current_claims}/{reward.max_claims}
                      </span>
                      <span>
                        ส่วนลด: {reward.discount_value}{reward.discount_type === 'percent' ? '%' : '฿'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reward.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialPromotionsManager;
