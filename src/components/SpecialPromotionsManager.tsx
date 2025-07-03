
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Gift, Users, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpecialPromotion {
  id: string;
  title: string;
  description: string;
  discountValue: number;
  discountType: 'percentage' | 'amount';
  maxClaims: number;
  currentClaims: number;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  minPurchase?: number;
}

const SpecialPromotionsManager = () => {
  const [promotions, setPromotions] = useState<SpecialPromotion[]>([
    {
      id: '1',
      title: 'Flash Sale 50% Off!',
      description: 'ลดราคา 50% สำหรับเมนูเครื่องดื่มทุกแก้ว',
      discountValue: 50,
      discountType: 'percentage',
      maxClaims: 100,
      currentClaims: 23,
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      isActive: true
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<SpecialPromotion | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountValue: 0,
    discountType: 'percentage' as 'percentage' | 'amount',
    maxClaims: 1,
    startTime: '',
    endTime: '',
    minPurchase: 0
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.startTime || !formData.endTime) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    const newPromotion: SpecialPromotion = {
      id: editingPromotion?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      discountValue: formData.discountValue,
      discountType: formData.discountType,
      maxClaims: formData.maxClaims,
      currentClaims: editingPromotion?.currentClaims || 0,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      isActive: true,
      minPurchase: formData.minPurchase > 0 ? formData.minPurchase : undefined
    };

    if (editingPromotion) {
      setPromotions(promotions.map(p => p.id === editingPromotion.id ? newPromotion : p));
      toast({ title: 'สำเร็จ', description: 'แก้ไขโปรโมชั่นเรียบร้อย' });
    } else {
      setPromotions([...promotions, newPromotion]);
      toast({ title: 'สำเร็จ', description: 'สร้างโปรโมชั่นใหม่เรียบร้อย' });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountValue: 0,
      discountType: 'percentage',
      maxClaims: 1,
      startTime: '',
      endTime: '',
      minPurchase: 0
    });
    setEditingPromotion(null);
    setShowForm(false);
  };

  const handleEdit = (promotion: SpecialPromotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discountValue: promotion.discountValue,
      discountType: promotion.discountType,
      maxClaims: promotion.maxClaims,
      startTime: promotion.startTime.toISOString().slice(0, 16),
      endTime: promotion.endTime.toISOString().slice(0, 16),
      minPurchase: promotion.minPurchase || 0
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบโปรโมชั่นนี้หรือไม่?')) {
      setPromotions(promotions.filter(p => p.id !== id));
      toast({ title: 'สำเร็จ', description: 'ลบโปรโมชั่นเรียบร้อย' });
    }
  };

  const toggleActive = (id: string) => {
    setPromotions(promotions.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
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
                    value={formData.maxClaims}
                    onChange={(e) => setFormData({...formData, maxClaims: parseInt(e.target.value)})}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discountType">ประเภทส่วนลด</Label>
                  <Select value={formData.discountType} onValueChange={(value: 'percentage' | 'amount') => setFormData({...formData, discountType: value})}>
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
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="minPurchase">ยอดขั้นต่ำ (ถ้ามี)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({...formData, minPurchase: parseFloat(e.target.value)})}
                    placeholder="0 = ไม่มีขั้นต่ำ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">เวลาเริ่มต้น</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">เวลาสิ้นสุด</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  {editingPromotion ? 'บันทึกการแก้ไข' : 'สร้างโปรโมชั่น'}
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
          <Card key={promotion.id} className={`${promotion.isActive ? 'border-l-4 border-l-purple-500' : 'opacity-60'}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{promotion.title}</h3>
                    {promotion.isActive && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        เปิดใช้งาน
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{promotion.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Gift className="h-4 w-4 text-purple-500" />
                      <span>
                        {promotion.discountType === 'percentage' 
                          ? `${promotion.discountValue}% OFF` 
                          : `฿${promotion.discountValue} OFF`
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{promotion.currentClaims}/{promotion.maxClaims}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>{getTimeRemaining(promotion.endTime)}</span>
                    </div>
                    {promotion.minPurchase && (
                      <div className="text-gray-500">
                        ขั้นต่ำ ฿{promotion.minPurchase}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((promotion.currentClaims / promotion.maxClaims) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(promotion.id)}
                  >
                    {promotion.isActive ? 'ปิด' : 'เปิด'}
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
