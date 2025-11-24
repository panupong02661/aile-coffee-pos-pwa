
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReceiptSettingsForm {
  show_logo: boolean;
  show_shop_info: boolean;
  show_tax_id: boolean;
  show_date_time: boolean;
  show_order_number: boolean;
  show_item_details: boolean;
  show_total: boolean;
  show_tax: boolean;
  show_payment_method: boolean;
  show_customer_info: boolean;
  show_wifi_voucher: boolean;
  show_wifi_qr: boolean;
  footer_message: string;
}

const ReceiptSettings = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch } = useForm<ReceiptSettingsForm>();

  // Watch all switch values
  const showLogo = watch('show_logo');
  const showShopInfo = watch('show_shop_info');
  const showTaxId = watch('show_tax_id');
  const showDateTime = watch('show_date_time');
  const showOrderNumber = watch('show_order_number');
  const showItemDetails = watch('show_item_details');
  const showTotal = watch('show_total');
  const showTax = watch('show_tax');
  const showPaymentMethod = watch('show_payment_method');
  const showCustomerInfo = watch('show_customer_info');
  const showWifiVoucher = watch('show_wifi_voucher');
  const showWifiQr = watch('show_wifi_qr');

  useEffect(() => {
    fetchReceiptSettings();
  }, []);

  const fetchReceiptSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('receipt_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setValue('show_logo', data.show_logo);
        setValue('show_shop_info', data.show_shop_info);
        setValue('show_tax_id', data.show_tax_id);
        setValue('show_date_time', data.show_date_time);
        setValue('show_order_number', data.show_order_number);
        setValue('show_item_details', data.show_item_details);
        setValue('show_total', data.show_total);
        setValue('show_tax', data.show_tax ?? true);
        setValue('show_payment_method', data.show_payment_method);
        setValue('show_customer_info', data.show_customer_info);
        setValue('show_wifi_voucher', data.show_wifi_voucher ?? true);
        setValue('show_wifi_qr', data.show_wifi_qr ?? true);
        setValue('footer_message', data.footer_message || '');
      }
    } catch (error) {
      console.error('Error fetching receipt settings:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดการตั้งค่าใบเสร็จได้',
        variant: 'destructive'
      });
    }
  };

  const onSubmit = async (data: ReceiptSettingsForm) => {
    setLoading(true);
    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('receipt_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('receipt_settings')
          .update(data)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('receipt_settings')
          .insert([data]);

        if (error) throw error;
      }

      toast({
        title: 'บันทึกสำเร็จ',
        description: 'การตั้งค่าใบเสร็จได้ถูกบันทึกเรียบร้อยแล้ว'
      });
    } catch (error) {
      console.error('Error saving receipt settings:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const SwitchField = ({ 
    label, 
    name, 
    description,
    checked,
    onCheckedChange 
  }: { 
    label: string; 
    name: keyof ReceiptSettingsForm;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
      <div className="flex-1">
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <Switch
        id={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>การแสดงผลในใบเสร็จ</CardTitle>
          <CardDescription>เลือกข้อมูลที่ต้องการแสดงในใบเสร็จ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            name="show_logo"
            label="แสดงโลโก้"
            description="แสดงโลโก้ร้านในใบเสร็จ"
            checked={showLogo}
            onCheckedChange={(checked) => setValue('show_logo', checked)}
          />

          <SwitchField
            name="show_shop_info"
            label="แสดงข้อมูลร้าน"
            description="แสดงชื่อร้าน ที่อยู่ และเบอร์โทรศัพท์"
            checked={showShopInfo}
            onCheckedChange={(checked) => setValue('show_shop_info', checked)}
          />

          <SwitchField
            name="show_tax_id"
            label="แสดงเลขประจำตัวผู้เสียภาษี"
            description="แสดงเลขประจำตัวผู้เสียภาษีในใบเสร็จ"
            checked={showTaxId}
            onCheckedChange={(checked) => setValue('show_tax_id', checked)}
          />

          <SwitchField
            name="show_date_time"
            label="แสดงวันที่และเวลา"
            description="แสดงวันที่และเวลาที่ออกใบเสร็จ"
            checked={showDateTime}
            onCheckedChange={(checked) => setValue('show_date_time', checked)}
          />

          <SwitchField
            name="show_order_number"
            label="แสดงหมายเลขคำสั่งซื้อ"
            description="แสดงหมายเลขคำสั่งซื้อในใบเสร็จ"
            checked={showOrderNumber}
            onCheckedChange={(checked) => setValue('show_order_number', checked)}
          />

          <SwitchField
            name="show_item_details"
            label="แสดงรายละเอียดสินค้า"
            description="แสดงรายการสินค้าที่สั่งซื้อ"
            checked={showItemDetails}
            onCheckedChange={(checked) => setValue('show_item_details', checked)}
          />

          <SwitchField
            name="show_total"
            label="แสดงยอดรวม"
            description="แสดงยอดรวมในใบเสร็จ"
            checked={showTotal}
            onCheckedChange={(checked) => setValue('show_total', checked)}
          />

          <SwitchField
            name="show_tax"
            label="แสดงภาษี"
            description="แสดงภาษีมูลค่าเพิ่ม 7% ในใบเสร็จ"
            checked={showTax}
            onCheckedChange={(checked) => setValue('show_tax', checked)}
          />

          <SwitchField
            name="show_payment_method"
            label="แสดงวิธีการชำระเงิน"
            description="แสดงวิธีการชำระเงินในใบเสร็จ"
            checked={showPaymentMethod}
            onCheckedChange={(checked) => setValue('show_payment_method', checked)}
          />

          <SwitchField
            name="show_customer_info"
            label="แสดงข้อมูลลูกค้า"
            description="แสดงข้อมูลลูกค้าในใบเสร็จ (หากมี)"
            checked={showCustomerInfo}
            onCheckedChange={(checked) => setValue('show_customer_info', checked)}
          />

          <SwitchField
            name="show_wifi_voucher"
            label="แสดง WiFi Voucher"
            description="แสดงบัตรใช้งานอินเทอร์เน็ตในใบเสร็จ"
            checked={showWifiVoucher}
            onCheckedChange={(checked) => setValue('show_wifi_voucher', checked)}
          />

          <SwitchField
            name="show_wifi_qr"
            label="แสดง QR Code ของ WiFi"
            description="แสดง QR Code สำหรับเชื่อมต่อ WiFi ในส่วน WiFi Voucher"
            checked={showWifiQr}
            onCheckedChange={(checked) => setValue('show_wifi_qr', checked)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อความท้ายใบเสร็จ</CardTitle>
          <CardDescription>ข้อความที่จะแสดงที่ท้ายใบเสร็จ</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="footer_message">ข้อความท้ายใบเสร็จ</Label>
            <Textarea
              id="footer_message"
              {...register('footer_message')}
              placeholder="เช่น ขอบคุณที่ใช้บริการ"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="bg-coffee-600 hover:bg-coffee-700">
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>
    </form>
  );
};

export default ReceiptSettings;
