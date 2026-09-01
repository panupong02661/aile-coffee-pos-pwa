import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Building, FileText, Users, Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BusinessSettings = () => {
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    // General
    business_name: '',
    business_type: '',
    business_description: '',
    established_date: '',
    employee_count: 0,
    // Legal
    tax_id: '',
    business_registration: '',
    vat_registration: '',
    social_security: '',
    registered_address: '',
    // Contact
    phone: '',
    mobile: '',
    email: '',
    website: '',
    contact_address: '',
    facebook: '',
    line_id: '',
    // Advanced
    fiscal_year: '',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    language: 'ไทย',
    business_hours: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          business_name: data.business_name || '',
          business_type: data.business_type || '',
          business_description: data.business_description || '',
          established_date: data.established_date || '',
          employee_count: data.employee_count || 0,
          tax_id: data.tax_id || '',
          business_registration: data.business_registration || '',
          vat_registration: data.vat_registration || '',
          social_security: data.social_security || '',
          registered_address: data.registered_address || '',
          phone: data.phone || '',
          mobile: data.mobile || '',
          email: data.email || '',
          website: data.website || '',
          contact_address: data.contact_address || '',
          facebook: data.facebook || '',
          line_id: data.line_id || '',
          fiscal_year: data.fiscal_year || '',
          currency: data.currency || 'THB',
          timezone: data.timezone || 'Asia/Bangkok',
          language: data.language || 'ไทย',
          business_hours: data.business_hours || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลได้',
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { data: existing } = await supabase
        .from('business_settings')
        .select('id')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('business_settings')
          .update(formData)
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_settings')
          .insert([formData]);
        
        if (error) throw error;
      }

      toast({
        title: 'บันทึกสำเร็จ ✅',
        description: 'บันทึกการตั้งค่าธุรกิจเรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-background flex">
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
          
          <div className="max-w-5xl mx-auto mt-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="w-8 h-8 text-primary" />
                ตั้งค่าธุรกิจ
              </h1>
              <p className="text-gray-600 mt-2">จัดการข้อมูลธุรกิจและการตั้งค่าองค์กร</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  ข้อมูลทั่วไป
                </TabsTrigger>
                <TabsTrigger value="legal" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  เอกสารทางกฎหมาย
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  ข้อมูลติดต่อ
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  ขั้นสูง
                </TabsTrigger>
              </TabsList>

              {/* ข้อมูลทั่วไป */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>ข้อมูลธุรกิจทั่วไป</CardTitle>
                    <CardDescription>ข้อมูลพื้นฐานเกี่ยวกับธุรกิจของคุณ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-name">ชื่อธุรกิจ</Label>
                        <Input 
                          id="business-name" 
                          placeholder="ชื่อธุรกิจ"
                          value={formData.business_name}
                          onChange={(e) => handleInputChange('business_name', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-type">ประเภทธุรกิจ</Label>
                        <Input 
                          id="business-type" 
                          placeholder="เช่น ร้านกาแฟ, ร้านอาหาร"
                          value={formData.business_type}
                          onChange={(e) => handleInputChange('business_type', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-description">รายละเอียดธุรกิจ</Label>
                      <Textarea 
                        id="business-description" 
                        placeholder="อธิบายเกี่ยวกับธุรกิจของคุณ"
                        rows={4}
                        value={formData.business_description}
                        onChange={(e) => handleInputChange('business_description', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="established-date">วันที่ก่อตั้ง</Label>
                        <Input 
                          id="established-date" 
                          type="date"
                          value={formData.established_date}
                          onChange={(e) => handleInputChange('established_date', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee-count">จำนวนพนักงาน</Label>
                        <Input 
                          id="employee-count" 
                          type="number" 
                          placeholder="0"
                          value={formData.employee_count}
                          onChange={(e) => handleInputChange('employee_count', parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* เอกสารทางกฎหมาย */}
              <TabsContent value="legal">
                <Card>
                  <CardHeader>
                    <CardTitle>เอกสารและข้อมูลทางกฎหมาย</CardTitle>
                    <CardDescription>เลขทะเบียนและเอกสารสำคัญของธุรกิจ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tax-id">เลขประจำตัวผู้เสียภาษี</Label>
                        <Input 
                          id="tax-id" 
                          placeholder="0-0000-00000-00-0"
                          value={formData.tax_id}
                          onChange={(e) => handleInputChange('tax_id', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-registration">เลขทะเบียนการค้า</Label>
                        <Input 
                          id="business-registration" 
                          placeholder="เลขทะเบียน"
                          value={formData.business_registration}
                          onChange={(e) => handleInputChange('business_registration', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vat-registration">เลขที่จดทะเบียน VAT</Label>
                        <Input 
                          id="vat-registration" 
                          placeholder="หากจดทะเบียน VAT"
                          value={formData.vat_registration}
                          onChange={(e) => handleInputChange('vat_registration', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social-security">เลขที่ประกันสังคม</Label>
                        <Input 
                          id="social-security" 
                          placeholder="เลขที่ประกันสังคม"
                          value={formData.social_security}
                          onChange={(e) => handleInputChange('social_security', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registered-address">ที่อยู่จดทะเบียน</Label>
                      <Textarea 
                        id="registered-address" 
                        placeholder="ที่อยู่จดทะเบียนธุรกิจ"
                        rows={3}
                        value={formData.registered_address}
                        onChange={(e) => handleInputChange('registered_address', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ข้อมูลติดต่อ */}
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>ข้อมูลติดต่อ</CardTitle>
                    <CardDescription>ช่องทางการติดต่อธุรกิจ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="02-XXX-XXXX"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile">มือถือ</Label>
                        <Input 
                          id="mobile" 
                          type="tel" 
                          placeholder="08X-XXX-XXXX"
                          value={formData.mobile}
                          onChange={(e) => handleInputChange('mobile', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">อีเมล</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="contact@business.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">เว็บไซต์</Label>
                        <Input 
                          id="website" 
                          type="url" 
                          placeholder="https://www.business.com"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-address">ที่อยู่สำหรับติดต่อ</Label>
                      <Textarea 
                        id="contact-address" 
                        placeholder="ที่อยู่ที่ใช้ติดต่อ"
                        rows={3}
                        value={formData.contact_address}
                        onChange={(e) => handleInputChange('contact_address', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input 
                          id="facebook" 
                          placeholder="facebook.com/yourbusiness"
                          value={formData.facebook}
                          onChange={(e) => handleInputChange('facebook', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="line">LINE ID</Label>
                        <Input 
                          id="line" 
                          placeholder="@yourbusiness"
                          value={formData.line_id}
                          onChange={(e) => handleInputChange('line_id', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* การตั้งค่าขั้นสูง */}
              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle>การตั้งค่าขั้นสูง</CardTitle>
                    <CardDescription>การตั้งค่าเพิ่มเติมสำหรับธุรกิจ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fiscal-year">ปีบัญชี</Label>
                        <Input 
                          id="fiscal-year" 
                          placeholder="เช่น 1 มกราคม - 31 ธันวาคม"
                          value={formData.fiscal_year}
                          onChange={(e) => handleInputChange('fiscal_year', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">สกุลเงิน</Label>
                        <Input 
                          id="currency" 
                          placeholder="THB (บาท)"
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">เขตเวลา</Label>
                        <Input 
                          id="timezone" 
                          placeholder="Asia/Bangkok"
                          value={formData.timezone}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">ภาษา</Label>
                        <Input 
                          id="language" 
                          placeholder="ไทย"
                          value={formData.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-hours">เวลาทำการ</Label>
                      <Textarea 
                        id="business-hours" 
                        placeholder="เช่น จันทร์-ศุกร์ 09:00-18:00, เสาร์-อาทิตย์ 10:00-17:00"
                        rows={3}
                        value={formData.business_hours}
                        onChange={(e) => handleInputChange('business_hours', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
