
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Copy, Calendar, Users, Gift, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface SpecialPromotionsManagerProps {
  onPromotionCreated?: () => void;
}

const SpecialPromotionsManager = ({ onPromotionCreated }: SpecialPromotionsManagerProps) => {
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
    reward_code: '',
    min_purchase: 0
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch limited promotions from limited_promotions table
  const { data: promotions = [] } = useQuery({
    queryKey: ['limited-promotions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('limited_promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

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

    const promotionData = {
      title: formData.name,
      promo_code: formData.reward_code,
      description: formData.description,
      discount_type: formData.discount_type === 'percent' ? 'percentage' : 'amount',
      discount_value: formData.discount_value,
      max_claims: formData.max_claims,
      min_purchase: formData.min_purchase || 0,
      current_claims: 0,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      is_active: true
    };

    try {
      if (editingId) {
        // Update existing promotion
        const { error } = await supabase
          .from('limited_promotions')
          .update(promotionData)
          .eq('id', editingId);
        
        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'แก้ไขของรางวัลพิเศษสำเร็จ'
        });
        setEditingId(null);
      } else {
        // Create new promotion
        const { error } = await supabase
          .from('limited_promotions')
          .insert([promotionData]);
        
        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'สร้างของรางวัลพิเศษสำเร็จ'
        });

        // Call callback to switch tabs
        if (onPromotionCreated) {
          onPromotionCreated();
        }
      }

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
        reward_code: '',
        min_purchase: 0
      });

      queryClient.invalidateQueries({ queryKey: ['limited-promotions-list'] });
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: editingId ? 'ไม่สามารถแก้ไขของรางวัลได้' : 'ไม่สามารถสร้างของรางวัลได้',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (promotion: any) => {
    setEditingId(promotion.id);
    setFormData({
      name: promotion.title,
      description: promotion.description || '',
      reward_type: 'discount',
      discount_type: promotion.discount_type === 'percentage' ? 'percent' : 'amount',
      discount_value: promotion.discount_value,
      max_claims: promotion.max_claims,
      start_date: new Date(promotion.start_date).toISOString().split('T')[0],
      end_date: new Date(promotion.end_date).toISOString().split('T')[0],
      target_month: new Date().getMonth() + 1,
      reward_code: promotion.promo_code || '',
      min_purchase: promotion.min_purchase || 0
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
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
      reward_code: '',
      min_purchase: 0
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบของรางวัลนี้?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('limited_promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'ลบของรางวัลสำเร็จ'
      });

      queryClient.invalidateQueries({ queryKey: ['limited-promotions-list'] });
    } catch (error) {
      console.error('Error deleting promotion:', error);
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
        .select('promo_code, title, description, discount_value, discount_type, start_date, end_date, max_claims, min_purchase')
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
          reward_code: latestPromotion.promo_code || '',
          min_purchase: latestPromotion.min_purchase || 0
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {editingId ? 'แก้ไขของรางวัลพิเศษ' : 'สร้างของรางวัลพิเศษ'}
            </div>
            {editingId && (
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                ยกเลิกการแก้ไข
              </Button>
            )}
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

            <div>
              <Label htmlFor="min_purchase">ยอดสั่งซื้อขั้นต่ำ (บาท)</Label>
              <Input
                id="min_purchase"
                type="number"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: Number(e.target.value) })}
                min="0"
                step="0.01"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">ยอดขั้นต่ำที่ต้องซื้อเพื่อใช้รางวัลนี้</p>
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

            <Button type="submit" className="w-full">
              {editingId ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  บันทึกการแก้ไข
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างของรางวัล
                </>
              )}
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
            {promotions.length === 0 ? (
              <p className="text-center text-gray-500">ยังไม่มีของรางวัลพิเศษ</p>
            ) : (
              promotions.map((promotion) => (
                <div key={promotion.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{promotion.title}</h4>
                      {promotion.promo_code && (
                        <Badge variant="secondary" className="font-mono">
                          {promotion.promo_code}
                        </Badge>
                      )}
                      <Badge variant={promotion.is_active ? "default" : "secondary"}>
                        {promotion.is_active ? 'ใช้งาน' : 'ปิด'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{promotion.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(promotion.start_date).toLocaleDateString('th-TH')} - {new Date(promotion.end_date).toLocaleDateString('th-TH')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {promotion.current_claims}/{promotion.max_claims}
                      </span>
                      <span>
                        ส่วนลด: {promotion.discount_value}{promotion.discount_type === 'percentage' ? '%' : '฿'}
                      </span>
                      {promotion.min_purchase && promotion.min_purchase > 0 && (
                        <span>
                          ยอดขั้นต่ำ: {promotion.min_purchase}฿
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(promotion)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(promotion.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
