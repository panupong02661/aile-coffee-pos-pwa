import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit, Trash2, Gift, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BirthdayGiftManager from '@/components/BirthdayGiftManager';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'amount';
  discount_value: number;
  max_claims: number;
  current_claims: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  promo_code?: string;
  min_purchase?: number;
}

const Promotions = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'amount',
    discount_value: 0,
    max_claims: 100,
    start_date: '',
    end_date: '',
    promo_code: '',
    min_purchase: 0
  });
  const { toast } = useToast();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('limited_promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching promotions:', error);
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดโปรโมชั่นได้', variant: 'destructive' });
        return;
      }

      // Transform the data to match our interface
      const transformedPromotions: Promotion[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        discount_type: item.discount_type as 'percentage' | 'amount',
        discount_value: item.discount_value,
        max_claims: item.max_claims,
        current_claims: item.current_claims,
        start_date: item.start_date,
        end_date: item.end_date,
        is_active: item.is_active,
        promo_code: item.promo_code,
        min_purchase: item.min_purchase
      }));

      setPromotions(transformedPromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการโหลดโปรโมชั่น', variant: 'destructive' });
    }
  };

  const handleCreatePromotion = async () => {
    try {
      // ตรวจสอบข้อมูลก่อนบันทึก
      if (!formData.title.trim()) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อโปรโมชั่น', variant: 'destructive' });
        return;
      }

      if (!formData.start_date || !formData.end_date) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด', variant: 'destructive' });
        return;
      }

      if (formData.discount_value <= 0) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกจำนวนส่วนลด', variant: 'destructive' });
        return;
      }

      console.log('Creating promotion with data:', formData);

      const { data, error } = await supabase
        .from('limited_promotions')
        .insert([{
          title: formData.title.trim(),
          description: formData.description.trim(),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          max_claims: formData.max_claims,
          current_claims: 0,
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_active: true,
          promo_code: formData.promo_code.trim().toUpperCase() || null,
          min_purchase: formData.min_purchase || 0
        }])
        .select();

      if (error) {
        console.error('Error creating promotion:', error);
        toast({ title: 'ข้อผิดพลาด', description: `ไม่สามารถสร้างโปรโมชั่นได้: ${error.message}`, variant: 'destructive' });
        return;
      }

      console.log('Promotion created successfully:', data);

      // Transform new data and add to state
      const newPromotions = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        discount_type: item.discount_type as 'percentage' | 'amount',
        discount_value: item.discount_value,
        max_claims: item.max_claims,
        current_claims: item.current_claims,
        start_date: item.start_date,
        end_date: item.end_date,
        is_active: item.is_active,
        promo_code: item.promo_code,
        min_purchase: item.min_purchase
      }));

      setPromotions([...newPromotions, ...promotions]);
      setIsFormOpen(false);
      setFormData({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        max_claims: 100,
        start_date: '',
        end_date: '',
        promo_code: '',
        min_purchase: 0
      });
      toast({ title: 'สำเร็จ', description: 'สร้างโปรโมชั่นเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการสร้างโปรโมชั่น', variant: 'destructive' });
    }
  };

  const handleUpdatePromotion = async () => {
    if (!editingPromotion) return;

    try {
      const { error } = await supabase
        .from('limited_promotions')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          max_claims: formData.max_claims,
          start_date: formData.start_date,
          end_date: formData.end_date,
          promo_code: formData.promo_code.trim().toUpperCase() || null,
          min_purchase: formData.min_purchase || 0
        })
        .eq('id', editingPromotion.id);

      if (error) {
        console.error('Error updating promotion:', error);
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถแก้ไขโปรโมชั่นได้', variant: 'destructive' });
        return;
      }

      setPromotions(promotions.map(promo =>
        promo.id === editingPromotion.id ? { 
          ...promo, 
          title: formData.title,
          description: formData.description,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          max_claims: formData.max_claims,
          start_date: formData.start_date,
          end_date: formData.end_date,
          promo_code: formData.promo_code.toUpperCase() || null,
          min_purchase: formData.min_purchase
        } : promo
      ));
      setIsFormOpen(false);
      setEditingPromotion(null);
      setFormData({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        max_claims: 100,
        start_date: '',
        end_date: '',
        promo_code: '',
        min_purchase: 0
      });
      toast({ title: 'สำเร็จ', description: 'แก้ไขโปรโมชั่นเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการแก้ไขโปรโมชั่น', variant: 'destructive' });
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('limited_promotions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting promotion:', error);
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบโปรโมชั่นได้', variant: 'destructive' });
        return;
      }

      setPromotions(promotions.filter(promo => promo.id !== id));
      toast({ title: 'สำเร็จ', description: 'ลบโปรโมชั่นเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการลบโปรโมชั่น', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="min-h-screen bg-coffee-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar} 
      />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="p-4">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h1 className="text-3xl font-bold">จัดการแอปลูกค้า</h1>
              <Button variant="outline" onClick={() => navigate('/menu-promotions')}>
                <Tag className="w-4 h-4 mr-2" />
                โปรโมชั่นตามเมนู/หมวดหมู่
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Promotion Management */}
              <div className="lg:col-span-2 space-y-6">
                {/* Limited Promotions Section */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        สร้างของรางวัลพิเศษใหม่
                      </CardTitle>
                      <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มโปรโมชั่น
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Form for creating/editing promotions */}
                    {isFormOpen && (
                      <div className="space-y-4 p-4 border rounded-lg mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">ชื่อรางวัล *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              placeholder="เช่น ส่วนลด 20% พิเศษ"
                            />
                          </div>
                          <div>
                            <Label htmlFor="promo_code">รหัสคูปอง *</Label>
                            <Input
                              id="promo_code"
                              value={formData.promo_code}
                              onChange={(e) => setFormData({...formData, promo_code: e.target.value.toUpperCase()})}
                              placeholder="เช่น SAVE30"
                              maxLength={10}
                            />
                            <p className="text-xs text-gray-500 mt-1">รหัสนี้จะใช้สำหรับลูกค้าใส่ในระบบ POS</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="discount_type">ประเภทส่วนลด</Label>
                            <Select
                        value={formData.discount_type} 
                        onValueChange={(value: 'percentage' | 'amount') => 
                          setFormData({...formData, discount_type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.discount_type === 'percentage' ? 'เปอร์เซ็นต์ (%)' : 'จำนวนเงิน (บาท)'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">เปอร์เซ็นต์ (%)</SelectItem>
                          <SelectItem value="amount">จำนวนเงิน (บาท)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="discount_value">จำนวนส่วนลดหรือมูลค่า *</Label>
                      <Input
                        id="discount_value"
                        type="number"
                        value={formData.discount_value.toString()}
                        onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})}
                        placeholder="30"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_claims">จำนวนคนที่รับได้สูงสุด *</Label>
                      <Input
                        id="max_claims"
                        type="number"
                        value={formData.max_claims.toString()}
                        onChange={(e) => setFormData({...formData, max_claims: parseInt(e.target.value) || 0})}
                        placeholder="50"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_purchase">ยอดสั่งซื้อขั้นต่ำ (บาท)</Label>
                      <Input
                        id="min_purchase"
                        type="number"
                        value={formData.min_purchase.toString()}
                        onChange={(e) => setFormData({...formData, min_purchase: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">วันเริ่ม *</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">วันสิ้นสุด *</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">คำอธิบาย</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="อธิบายเงื่อนไขและรายละเอียดของรางวัล..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => {
                      setIsFormOpen(false);
                      setEditingPromotion(null);
                      setFormData({
                        title: '',
                        description: '',
                        discount_type: 'percentage',
                        discount_value: 0,
                        max_claims: 100,
                        start_date: '',
                        end_date: '',
                        promo_code: '',
                        min_purchase: 0
                      });
                    }} variant="outline">
                      ยกเลิก
                    </Button>
                    <Button onClick={() => {
                      if (editingPromotion) {
                        handleUpdatePromotion();
                      } else {
                        handleCreatePromotion();
                      }
                    }}>
                      {editingPromotion ? 'บันทึกการแก้ไข' : 'สร้างรางวัล'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Promotions List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">รายการของรางวัลพิเศษ</h3>
                {promotions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีโปรโมชั่น</p>
                ) : (
                  promotions.map(promotion => (
                    <div key={promotion.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{promotion.title}</h4>
                          {promotion.promo_code && (
                            <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-2">
                              โค้ด: {promotion.promo_code}
                            </div>
                          )}
                          <p className="text-sm text-gray-600">{promotion.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>ส่วนลด: {promotion.discount_value}{promotion.discount_type === 'percentage' ? '%' : '฿'}</span>
                            <span>รับแล้ว: {promotion.current_claims}/{promotion.max_claims}</span>
                            {promotion.min_purchase && promotion.min_purchase > 0 && (
                              <span>ยอดขั้นต่ำ: {promotion.min_purchase}฿</span>
                            )}
                            <span className={promotion.is_active ? 'text-green-600' : 'text-red-600'}>
                              {promotion.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setIsFormOpen(true);
                            setEditingPromotion(promotion);
                            setFormData({
                              title: promotion.title,
                              description: promotion.description || '',
                              discount_type: promotion.discount_type,
                              discount_value: promotion.discount_value,
                              max_claims: promotion.max_claims,
                              start_date: promotion.start_date,
                              end_date: promotion.end_date,
                              promo_code: promotion.promo_code || '',
                              min_purchase: promotion.min_purchase || 0
                            });
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeletePromotion(promotion.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Birthday Gift Manager */}
          <div className="space-y-6">
            <BirthdayGiftManager />
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
