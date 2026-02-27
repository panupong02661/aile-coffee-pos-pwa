import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Ticket, QrCode, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

const CouponManagement = () => {
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase: 0,
    max_discount: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage_limit: 100,
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลคูปองได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const generateCouponCode = () => {
    const code = 'COUPON' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSaveCoupon = async () => {
    try {
      if (!formData.code || !formData.name) {
        toast({
          title: 'กรุณากรอกข้อมูล',
          description: 'กรุณากรอกรหัสคูปองและชื่อคูปอง',
          variant: 'destructive',
        });
        return;
      }

      if (selectedCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(formData)
          .eq('id', selectedCoupon.id);

        if (error) throw error;
        toast({ title: 'อัปเดตคูปองสำเร็จ ✅' });
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([{ ...formData, used_count: 0 }]);

        if (error) throw error;
        toast({ title: 'สร้างคูปองสำเร็จ ✅' });
      }

      setIsDialogOpen(false);
      setSelectedCoupon(null);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกคูปองได้',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'ลบคูปองสำเร็จ ✅' });
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบคูปองได้',
        variant: 'destructive',
      });
    }
  };

  const generateQRCode = async (coupon: Coupon) => {
    try {
      const qrData = JSON.stringify({
        code: coupon.code,
        name: coupon.name,
        discount: `${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : '฿' + coupon.discount_value}`,
      });
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
      });
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้าง QR Code ได้',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase: 0,
      max_discount: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usage_limit: 100,
      is_active: true,
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase: coupon.min_purchase || 0,
      max_discount: coupon.max_discount || 0,
      start_date: coupon.start_date.split('T')[0],
      end_date: coupon.end_date.split('T')[0],
      usage_limit: coupon.usage_limit || 100,
      is_active: coupon.is_active,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="h-screen bg-cream-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
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
          
          <div className="max-w-7xl mx-auto mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Ticket className="w-8 h-8 text-primary" />
                  จัดการคูปอง/ส่วนลด
                </h1>
                <p className="text-gray-600 mt-2">สร้างและจัดการคูปองส่วนลด</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setSelectedCoupon(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างคูปองใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedCoupon ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}</DialogTitle>
                    <DialogDescription>กรอกข้อมูลคูปองส่วนลด</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>รหัสคูปอง</Label>
                        <Input
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="SUMMER2024"
                        />
                      </div>
                      <Button onClick={generateCouponCode} variant="outline" className="mt-8">
                        สุ่มรหัส
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>ชื่อคูปอง</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ส่วนลดฤดูร้อน"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>คำอธิบาย</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="รายละเอียดคูปอง"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ประเภทส่วนลด</Label>
                        <Select
                          value={formData.discount_type}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">เปอร์เซ็นต์ (%)</SelectItem>
                            <SelectItem value="fixed">จำนวนเงิน (฿)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>มูลค่าส่วนลด</Label>
                        <Input
                          type="number"
                          value={formData.discount_value}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ยอดซื้อขั้นต่ำ (฿)</Label>
                        <Input
                          type="number"
                          value={formData.min_purchase}
                          onChange={(e) => setFormData(prev => ({ ...prev, min_purchase: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>ส่วนลดสูงสุด (฿)</Label>
                        <Input
                          type="number"
                          value={formData.max_discount}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_discount: Number(e.target.value) }))}
                          placeholder="0 = ไม่จำกัด"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>วันที่เริ่มต้น</Label>
                        <Input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>วันที่สิ้นสุด</Label>
                        <Input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>จำนวนครั้งที่ใช้ได้</Label>
                      <Input
                        type="number"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: Number(e.target.value) }))}
                        placeholder="100"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        ยกเลิก
                      </Button>
                      <Button onClick={handleSaveCoupon}>
                        {selectedCoupon ? 'อัปเดต' : 'สร้างคูปอง'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-3 text-center py-8">กำลังโหลด...</div>
              ) : coupons.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  ยังไม่มีคูปอง คลิก "สร้างคูปองใหม่" เพื่อเริ่มต้น
                </div>
              ) : (
                coupons.map((coupon) => (
                  <Card key={coupon.id} className={!coupon.is_active ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{coupon.name}</CardTitle>
                          <CardDescription className="font-mono font-semibold text-primary">
                            {coupon.code}
                          </CardDescription>
                        </div>
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                          {coupon.is_active ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-2xl font-bold text-primary">
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}%` 
                            : `฿${coupon.discount_value}`}
                        </p>
                        {coupon.description && (
                          <p className="text-sm text-gray-600">{coupon.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          ใช้แล้ว: {coupon.used_count} / {coupon.usage_limit} ครั้ง
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(coupon.start_date).toLocaleDateString('th-TH')} - {new Date(coupon.end_date).toLocaleDateString('th-TH')}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => generateQRCode(coupon)}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>QR Code - {coupon.code}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4">
                              {qrCodeUrl && (
                                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                              )}
                              <p className="text-center text-sm text-gray-600">
                                สแกน QR Code เพื่อใช้คูปอง
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;
