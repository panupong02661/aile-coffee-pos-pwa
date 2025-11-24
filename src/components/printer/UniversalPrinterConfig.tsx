import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUniversalPrinter } from '@/hooks/useUniversalPrinter';
import { PRINTER_BRANDS, PAPER_SIZES, CONNECTION_TYPES } from '@/utils/escPosCommands';
import { Wifi, Bluetooth, Usb, Printer, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const UniversalPrinterConfig = () => {
  const { config, isConnected, isPrinting, connect, disconnect, testPrint, openCashDrawer, saveConfig } = useUniversalPrinter();

  const [formData, setFormData] = useState({
    brand: config?.brand || '',
    model: config?.model || '',
    connectionType: config?.connectionType || 'network',
    paperSize: config?.paperSize || '80mm',
    ipAddress: config?.ipAddress || '',
    port: config?.port || 9100,
    deviceId: config?.deviceId || '',
    deviceName: config?.deviceName || '',
    vendorId: config?.vendorId || '',
    productId: config?.productId || '',
    autoCut: config?.autoCut !== false,
    cashDrawer: config?.cashDrawer !== false,
    encoding: config?.encoding || 'utf8'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveConfig(formData as any);
      await connect(formData as any);
    } finally {
      setIsSaving(false);
    }
  };

  const getConnectionIcon = () => {
    switch (formData.connectionType) {
      case 'network': return <Wifi className="w-4 h-4" />;
      case 'bluetooth': return <Bluetooth className="w-4 h-4" />;
      case 'usb': return <Usb className="w-4 h-4" />;
      default: return <Printer className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                สถานะการเชื่อมต่อ
              </CardTitle>
              <CardDescription>ตรวจสอบสถานะการเชื่อมต่อกับเครื่องพิมพ์</CardDescription>
            </div>
            {isConnected ? (
              <Badge className="bg-green-500">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                เชื่อมต่อแล้ว
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="w-4 h-4 mr-1" />
                ยังไม่เชื่อมต่อ
              </Badge>
            )}
          </div>
        </CardHeader>
        {config && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ยี่ห้อ:</span>
                <span className="ml-2 font-medium">{PRINTER_BRANDS.find(b => b.id === config.brand)?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ขนาดกระดาษ:</span>
                <span className="ml-2 font-medium">{config.paperSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground">การเชื่อมต่อ:</span>
                <span className="ml-2 font-medium flex items-center gap-1">
                  {getConnectionIcon()}
                  {CONNECTION_TYPES.find(t => t.id === config.connectionType)?.name}
                </span>
              </div>
              {config.connectionType === 'network' && config.ipAddress && (
                <div>
                  <span className="text-muted-foreground">IP:</span>
                  <span className="ml-2 font-medium">{config.ipAddress}:{config.port}</span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Printer Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>ตั้งค่าเครื่องพิมพ์</CardTitle>
          <CardDescription>กำหนดค่าเครื่องพิมพ์ ESC/POS ทุกยี่ห้อ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Printer Brand & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ยี่ห้อเครื่องพิมพ์ *</Label>
              <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกยี่ห้อ" />
                </SelectTrigger>
                <SelectContent>
                  {PRINTER_BRANDS.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>รุ่น (ถ้ามี)</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="เช่น XP-58, RP80"
              />
            </div>
          </div>

          <Separator />

          {/* Connection Type */}
          <div className="space-y-2">
            <Label>ประเภทการเชื่อมต่อ *</Label>
            <Select value={formData.connectionType} onValueChange={(value: any) => setFormData({ ...formData, connectionType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONNECTION_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {type.id === 'network' && <Wifi className="w-4 h-4" />}
                      {type.id === 'bluetooth' && <Bluetooth className="w-4 h-4" />}
                      {type.id === 'usb' && <Usb className="w-4 h-4" />}
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Network Settings */}
          {formData.connectionType === 'network' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wifi className="w-4 h-4" />
                การตั้งค่า WiFi/Network
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>IP Address *</Label>
                  <Input
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="192.168.1.100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    placeholder="9100"
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div>
                  <div>Port มาตรฐานของเครื่องพิมพ์ Network คือ 9100</div>
                  <div>กรุณาตรวจสอบ IP Address จากเครื่องพิมพ์หรือ Router</div>
                </div>
              </div>
            </div>
          )}

          {/* Bluetooth Settings */}
          {formData.connectionType === 'bluetooth' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bluetooth className="w-4 h-4" />
                การตั้งค่า Bluetooth
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div>
                  <div>เมื่อบันทึกการตั้งค่า ระบบจะขอให้คุณเลือกเครื่องพิมพ์ Bluetooth</div>
                  <div>กรุณาเปิด Bluetooth บนเครื่องพิมพ์และอุปกรณ์ของคุณก่อน</div>
                </div>
              </div>
            </div>
          )}

          {/* USB Settings */}
          {formData.connectionType === 'usb' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Usb className="w-4 h-4" />
                การตั้งค่า USB
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div>
                  <div>เมื่อบันทึกการตั้งค่า ระบบจะขอให้คุณเลือกเครื่องพิมพ์ USB</div>
                  <div>กรุณาเสียบสาย USB ระหว่างเครื่องพิมพ์กับอุปกรณ์ของคุณก่อน</div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Paper Size */}
          <div className="space-y-2">
            <Label>ขนาดกระดาษ *</Label>
            <Select value={formData.paperSize} onValueChange={(value: any) => setFormData({ ...formData, paperSize: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_SIZES.map(size => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name} - {size.maxChars} ตัวอักษร
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <Label>ฟีเจอร์</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">ตัดกระดาษอัตโนมัติ</div>
                  <div className="text-sm text-muted-foreground">ตัดกระดาษหลังพิมพ์เสร็จ</div>
                </div>
                <Switch
                  checked={formData.autoCut}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoCut: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">ลิ้นชักเก็บเงิน</div>
                  <div className="text-sm text-muted-foreground">รองรับการเปิดลิ้นชักอัตโนมัติ</div>
                </div>
                <Switch
                  checked={formData.cashDrawer}
                  onCheckedChange={(checked) => setFormData({ ...formData, cashDrawer: checked })}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !formData.brand}
              className="flex-1"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกและเชื่อมต่อ'}
            </Button>
            {isConnected && (
              <Button 
                variant="outline" 
                onClick={disconnect}
              >
                ตัดการเชื่อมต่อ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>ทดสอบการทำงาน</CardTitle>
            <CardDescription>ทดสอบฟีเจอร์ต่างๆ ของเครื่องพิมพ์</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={testPrint} 
              disabled={isPrinting}
              className="w-full"
              variant="outline"
            >
              {isPrinting ? 'กำลังพิมพ์...' : 'ทดสอบพิมพ์ใบเสร็จ'}
            </Button>
            {config?.cashDrawer && (
              <Button 
                onClick={openCashDrawer}
                className="w-full"
                variant="outline"
              >
                ทดสอบเปิดลิ้นชักเก็บเงิน
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UniversalPrinterConfig;
