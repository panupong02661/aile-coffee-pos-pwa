import { useState } from 'react';
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

const BusinessSettings = () => {
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSave = () => {
    toast({
      title: 'บันทึกสำเร็จ',
      description: 'บันทึกการตั้งค่าธุรกิจเรียบร้อยแล้ว',
    });
  };

  return (
    <div className="h-screen bg-cream-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
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
                        <Input id="business-name" placeholder="ชื่อธุรกิจ" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-type">ประเภทธุรกิจ</Label>
                        <Input id="business-type" placeholder="เช่น ร้านกาแฟ, ร้านอาหาร" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-description">รายละเอียดธุรกิจ</Label>
                      <Textarea 
                        id="business-description" 
                        placeholder="อธิบายเกี่ยวกับธุรกิจของคุณ"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="established-date">วันที่ก่อตั้ง</Label>
                        <Input id="established-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee-count">จำนวนพนักงาน</Label>
                        <Input id="employee-count" type="number" placeholder="0" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        บันทึกข้อมูล
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
                        <Input id="tax-id" placeholder="0-0000-00000-00-0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-registration">เลขทะเบียนการค้า</Label>
                        <Input id="business-registration" placeholder="เลขทะเบียน" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vat-registration">เลขที่จดทะเบียน VAT</Label>
                        <Input id="vat-registration" placeholder="หากจดทะเบียน VAT" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social-security">เลขที่ประกันสังคม</Label>
                        <Input id="social-security" placeholder="เลขที่ประกันสังคม" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registered-address">ที่อยู่จดทะเบียน</Label>
                      <Textarea 
                        id="registered-address" 
                        placeholder="ที่อยู่จดทะเบียนธุรกิจ"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        บันทึกข้อมูล
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
                        <Input id="phone" type="tel" placeholder="02-XXX-XXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile">มือถือ</Label>
                        <Input id="mobile" type="tel" placeholder="08X-XXX-XXXX" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">อีเมล</Label>
                        <Input id="email" type="email" placeholder="contact@business.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">เว็บไซต์</Label>
                        <Input id="website" type="url" placeholder="https://www.business.com" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">ที่อยู่สำหรับติดต่อ</Label>
                      <Textarea 
                        id="address" 
                        placeholder="ที่อยู่ที่ใช้ติดต่อ"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input id="facebook" placeholder="facebook.com/yourbusiness" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="line">LINE ID</Label>
                        <Input id="line" placeholder="@yourbusiness" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        บันทึกข้อมูล
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
                        <Input id="fiscal-year" placeholder="เช่น 1 มกราคม - 31 ธันวาคม" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">สกุลเงิน</Label>
                        <Input id="currency" placeholder="THB (บาท)" defaultValue="THB" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">เขตเวลา</Label>
                        <Input id="timezone" placeholder="Asia/Bangkok" defaultValue="Asia/Bangkok" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">ภาษา</Label>
                        <Input id="language" placeholder="ไทย" defaultValue="ไทย" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-hours">เวลาทำการ</Label>
                      <Textarea 
                        id="business-hours" 
                        placeholder="เช่น จันทร์-ศุกร์ 09:00-18:00, เสาร์-อาทิตย์ 10:00-17:00"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        บันทึกข้อมูล
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
