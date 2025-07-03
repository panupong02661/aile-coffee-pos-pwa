import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Gift, Users, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SpecialPromotion {
  id: string;
  title: string;
  description: string;
  discount_value: number;
  discount_type: 'percentage' | 'amount';
  max_claims: number;
  current_claims: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  min_purchase?: number;
  promo_code?: string;
}

const SpecialPromotionsManager = () => {
  const queryClient = useQueryClient();

  // ดึงข้อมูลโปรโมชั่นจากฐานข้อมูล
  const { data: promotions = [], refetch } = useQuery({
    queryKey: ['special-promotions-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('limited_promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<SpecialPromotion | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_value: 0,
    discount_type: 'percentage' as 'percentage' | 'amount',
    max_claims: 1,
    start_date: '',
    end_date: '',
    min_purchase: 0,
    promo_code: ''
  });

  // Mutation สำหรับสร้างโปรโมชั่นใหม่
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('limited_promotions')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('สำเร็จ - สร้างโปรโมชั่นใหม่เรียบร้อย');
      refetch();
      resetForm();
    },
    onError: (error: any) => {
      toast.error('ข้อผิดพลาด: ' + error.message);
    },
  });

  // Mutation สำหรับแก้ไขโปรโมชั่น
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('limited_promotions')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('สำเร็จ - แก้ไขโปรโมชั่นเรียบร้อย');
      refetch();
      resetForm();
    },
    onError: (error: any) => {
      toast.error('ข้อผิดพลาด: ' + error.message);
    },
  });

  // Mutation สำหรับลบโปรโมชั่น
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('limited_promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('สำเร็จ - ลบโปรโมชั่นเรียบร้อย');
      refetch();
    },
    onError: (error: any) => {
      toast.error('ข้อผิดพลาด: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const promotionData = {
      title: formData.title,
      description: formData.description,
      discount_value: formData.discount_value,
      discount_type: formData.discount_type,
      max_claims: formData.max_claims,
      start_date: formData.start_date,
      end_date: formData.end_date,
      min_purchase: formData.min_purchase > 0 ? formData.min_purchase : 0,
      promo_code: formData.promo_code || null,
      is_active: true
    };

    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, data: promotionData });
    } else {
      createMutation.mutate(promotionData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_value: 0,
      discount_type: 'percentage',
      max_claims: 1,
      start_date: '',
      end_date: '',
      min_purchase: 0,
      promo_code: ''
    });
    setEditingPromotion(null);
    setShowForm(false);
  };

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discount_value: promotion.discount_value,
      discount_type: promotion.discount_type as 'percentage' | 'amount',
      max_claims: promotion.max_claims,
      start_date: new Date(promotion.start_date).toISOString().slice(0, 16),
      end_date: new Date(promotion.end_date).toISOString().slice(0, 16),
      min_purchase: promotion.min_purchase || 0,
      promo_code: promotion.promo_code || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบโปรโมชั่นนี้หรือไม่?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('limited_promotions')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('ข้อผิดพลาด: ' + error.message);
    } else {
      refetch();
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'หมดเวลา';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `เหลือ ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-800">จัดการโปรโมชั่นพิเศษ</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Plus className="w-4 h-4 mr-2" />
          สร้างโปรโมชั่น
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <span>{editingPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">ชื่อโปรโมชั่น</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="เช่น Flash Sale 50% Off!"
                  />
                </div>
                <div>
                  <Label htmlFor="maxClaims">จำนวนที่แจกได้</Label>
                  <Input
                    id="maxClaims"
                    type="number"
                    min="1"
                    value={formData.max_claims}
                    onChange={(e) => setFormData({...formData, max_claims: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="อธิบายเงื่อนไขและรายละเอียดของโปรโมชั่น"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="discountType">ประเภทส่วนลด</Label>
                  <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'amount') => setFormData({...formData, discount_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">เปอร์เซ็นต์ (%)</SelectItem>
                      <SelectItem value="amount">จำนวนเงิน (฿)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discountValue">ค่าส่วนลด</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="minPurchase">ยอดขั้นต่ำ (ถ้ามี)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    min="0"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({...formData, min_purchase: parseFloat(e.target.value)})}
                    placeholder="0 = ไม่มีขั้นต่ำ"
                  />
                </div>
                <div>
                  <Label htmlFor="promoCode">โค้ดโปรโมชั่น (ถ้ามี)</Label>
                  <Input
                    id="promoCode"
                    value={formData.promo_code}
                    onChange={(e) => setFormData({...formData, promo_code: e.target.value.toUpperCase()})}
                    placeholder="เช่น FLASH50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">เวลาเริ่มต้น</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">เวลาสิ้นสุด</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'กำลังบันทึก...' : (editingPromotion ? 'บันทึกการแก้ไข' : 'สร้างโปรโมชั่น')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promotions List */}
      <div className="grid gap-4">
        {promotions.map(promotion => (
          <Card key={promotion.id} className={`${promotion.is_active ? 'border-l-4 border-l-purple-500' : 'opacity-60'}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{promotion.title}</h3>
                    {promotion.is_active && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        เปิดใช้งาน
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{promotion.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Gift className="h-4 w-4 text-purple-500" />
                      <span>
                        {promotion.discount_type === 'percentage' 
                          ? `${promotion.discount_value}% OFF` 
                          : `฿${promotion.discount_value} OFF`
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{promotion.current_claims}/{promotion.max_claims}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>{getTimeRemaining(promotion.end_date)}</span>
                    </div>
                    {promotion.min_purchase > 0 && (
                      <div className="text-gray-500">
                        ขั้นต่ำ ฿{promotion.min_purchase}
                      </div>
                    )}
                    {promotion.promo_code && (
                      <div className="font-mono text-purple-600">
                        โค้ด: {promotion.promo_code}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((promotion.current_claims / promotion.max_claims) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(promotion.id, promotion.is_active)}
                  >
                    {promotion.is_active ? 'ปิด' : 'เปิด'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promotion)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(promotion.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {promotions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีโปรโมชั่นพิเศษ</h3>
              <p className="text-gray-500 mb-4">สร้างโปรโมชั่น Limited Time เพื่อเพิ่มยอดขาย</p>
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                สร้างโปรโมชั่นแรก
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SpecialPromotionsManager;
