import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { Receipt, Percent, Save } from 'lucide-react';

interface TaxSettings {
  vat_enabled: boolean;
  vat_rate: number;
  vat_included: boolean;
  service_charge_enabled: boolean;
  service_charge_rate: number;
}

const VATServiceChargeSettings = () => {
  const { toast } = useToast();
  const { shopId } = useCurrentShop();
  const [settings, setSettings] = useState<TaxSettings>({
    vat_enabled: false,
    vat_rate: 7,
    vat_included: true,
    service_charge_enabled: false,
    service_charge_rate: 10,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    loadSettings();
  }, [shopId]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('shop_settings')
      .select('vat_enabled, vat_rate, vat_included, service_charge_enabled, service_charge_rate')
      .eq('shop_id', shopId!)
      .maybeSingle();

    if (data) {
      setSettings({
        vat_enabled: data.vat_enabled ?? false,
        vat_rate: Number(data.vat_rate) || 7,
        vat_included: data.vat_included ?? true,
        service_charge_enabled: data.service_charge_enabled ?? false,
        service_charge_rate: Number(data.service_charge_rate) || 10,
      });
    }
  };

  const handleSave = async () => {
    if (!shopId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('shop_settings')
        .update({
          vat_enabled: settings.vat_enabled,
          vat_rate: settings.vat_rate,
          vat_included: settings.vat_included,
          service_charge_enabled: settings.service_charge_enabled,
          service_charge_rate: settings.service_charge_rate,
        })
        .eq('shop_id', shopId);

      if (error) throw error;
      toast({ title: 'บันทึกสำเร็จ', description: 'ตั้งค่าภาษีและค่าบริการเรียบร้อยแล้ว' });
    } catch (error) {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Preview calculation
  const samplePrice = 100;
  let vatAmount = 0;
  let serviceAmount = 0;
  let total = samplePrice;

  if (settings.service_charge_enabled) {
    serviceAmount = samplePrice * (settings.service_charge_rate / 100);
    total += serviceAmount;
  }
  if (settings.vat_enabled) {
    if (settings.vat_included) {
      vatAmount = Math.round((total * settings.vat_rate) / (100 + settings.vat_rate) * 100) / 100;
    } else {
      vatAmount = Math.round(total * (settings.vat_rate / 100) * 100) / 100;
      total += vatAmount;
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            ภาษีมูลค่าเพิ่ม (VAT)
          </CardTitle>
          <CardDescription>เปิดใช้งานและกำหนดอัตราภาษีมูลค่าเพิ่ม</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>เปิดใช้งาน VAT</Label>
            <Switch
              checked={settings.vat_enabled}
              onCheckedChange={v => setSettings(s => ({ ...s, vat_enabled: v }))}
            />
          </div>
          {settings.vat_enabled && (
            <>
              <div>
                <Label>อัตราภาษี (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={settings.vat_rate}
                  onChange={e => setSettings(s => ({ ...s, vat_rate: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>VAT รวมในราคาสินค้า</Label>
                  <p className="text-xs text-muted-foreground">
                    {settings.vat_included
                      ? 'ราคาที่แสดงรวม VAT แล้ว (คำนวณย้อนกลับ)'
                      : 'ราคาที่แสดงยังไม่รวม VAT (บวกเพิ่ม)'}
                  </p>
                </div>
                <Switch
                  checked={settings.vat_included}
                  onCheckedChange={v => setSettings(s => ({ ...s, vat_included: v }))}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            ค่าบริการ (Service Charge)
          </CardTitle>
          <CardDescription>เปิดใช้งานและกำหนดอัตราค่าบริการ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>เปิดใช้งานค่าบริการ</Label>
            <Switch
              checked={settings.service_charge_enabled}
              onCheckedChange={v => setSettings(s => ({ ...s, service_charge_enabled: v }))}
            />
          </div>
          {settings.service_charge_enabled && (
            <div>
              <Label>อัตราค่าบริการ (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={settings.service_charge_rate}
                onChange={e => setSettings(s => ({ ...s, service_charge_rate: parseFloat(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ตัวอย่างการคำนวณ</CardTitle>
          <CardDescription>สมมติราคาสินค้า ฿{samplePrice}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>ราคาสินค้า</span>
              <span>฿{samplePrice.toFixed(2)}</span>
            </div>
            {settings.service_charge_enabled && (
              <div className="flex justify-between text-primary">
                <span>ค่าบริการ {settings.service_charge_rate}%</span>
                <span>฿{serviceAmount.toFixed(2)}</span>
              </div>
            )}
            {settings.vat_enabled && (
              <div className="flex justify-between text-accent-foreground">
                <span>VAT {settings.vat_rate}% {settings.vat_included ? '(รวมในราคา)' : '(เพิ่ม)'}</span>
                <span>฿{vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>ยอดรวม</span>
              <span>฿{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
        <Save className="w-4 h-4" />
        {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
      </Button>
    </div>
  );
};

export default VATServiceChargeSettings;
