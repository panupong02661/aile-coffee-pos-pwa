import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Printer, Receipt, FileText, Tag, Eye } from 'lucide-react';
import ReceiptTemplatePreview from './ReceiptTemplatePreview';

interface PrintCopiesConfig {
  customerReceiptCopies: number;
  shopReceiptCopies: number;
  stickerEnabled: boolean;
  stickerCopies: number;
  autoShopCopy: boolean;
  autoSticker: boolean;
  customerFontSize: number;
  shopFontSize: number;
  stickerFontSize: number;
  customerPaperWidth: number;
  shopPaperWidth: number;
  stickerPaperWidth: number;
}

const PrintCopiesSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<PrintCopiesConfig>({
    customerReceiptCopies: 1,
    shopReceiptCopies: 1,
    stickerEnabled: false,
    stickerCopies: 1,
    autoShopCopy: true,
    autoSticker: false,
    customerFontSize: 12,
    shopFontSize: 14,
    stickerFontSize: 10,
    customerPaperWidth: 80,
    shopPaperWidth: 80,
    stickerPaperWidth: 60,
  });

  useEffect(() => {
    // Load saved config
    const savedConfig = localStorage.getItem('printCopiesConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading print copies config:', error);
      }
    }
  }, []);

  const saveConfig = () => {
    try {
      localStorage.setItem('printCopiesConfig', JSON.stringify(config));
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกการตั้งค่าจำนวนการพิมพ์แล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    }
  };

  const updateConfig = (key: keyof PrintCopiesConfig, value: number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Customer Receipt Copies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle>ใบเสร็จสำหรับลูกค้า</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  ดูตัวอย่าง
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>ตัวอย่างใบเสร็จลูกค้า</DialogTitle>
                  <DialogDescription>
                    แก้ไขขนาดและรูปแบบตามต้องการ
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ขนาดตัวอักษร: {config.customerFontSize}px</Label>
                    <Slider
                      value={[config.customerFontSize]}
                      onValueChange={(value) => updateConfig('customerFontSize', value[0])}
                      min={8}
                      max={20}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ความกว้างกระดาษ: {config.customerPaperWidth}mm</Label>
                    <Slider
                      value={[config.customerPaperWidth]}
                      onValueChange={(value) => updateConfig('customerPaperWidth', value[0])}
                      min={58}
                      max={80}
                      step={1}
                    />
                  </div>
                  <ReceiptTemplatePreview 
                    type="customer" 
                    fontSize={config.customerFontSize}
                    paperWidth={config.customerPaperWidth}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            กำหนดจำนวนใบเสร็จที่จะพิมพ์ให้ลูกค้า
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="customerCopies" className="min-w-[120px]">
              จำนวนใบเสร็จ
            </Label>
            <Input
              id="customerCopies"
              type="number"
              min="1"
              max="10"
              value={config.customerReceiptCopies}
              onChange={(e) => updateConfig('customerReceiptCopies', parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">ใบ</span>
          </div>
        </CardContent>
      </Card>

      {/* Shop/Kitchen Copy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>ใบสำหรับร้าน/ครัว</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  ดูตัวอย่าง
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>ตัวอย่างใบร้าน/ครัว</DialogTitle>
                  <DialogDescription>
                    แก้ไขขนาดและรูปแบบตามต้องการ
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ขนาดตัวอักษร: {config.shopFontSize}px</Label>
                    <Slider
                      value={[config.shopFontSize]}
                      onValueChange={(value) => updateConfig('shopFontSize', value[0])}
                      min={10}
                      max={24}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ความกว้างกระดาษ: {config.shopPaperWidth}mm</Label>
                    <Slider
                      value={[config.shopPaperWidth]}
                      onValueChange={(value) => updateConfig('shopPaperWidth', value[0])}
                      min={58}
                      max={80}
                      step={1}
                    />
                  </div>
                  <ReceiptTemplatePreview 
                    type="shop" 
                    fontSize={config.shopFontSize}
                    paperWidth={config.shopPaperWidth}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            ใบเสร็จสำหรับเก็บไว้ดูในร้านหรือส่งครัว
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoShopCopy">พิมพ์อัตโนมัติ</Label>
              <p className="text-sm text-muted-foreground">
                พิมพ์ใบร้านทุกครั้งที่มีการชำระเงิน
              </p>
            </div>
            <Switch
              id="autoShopCopy"
              checked={config.autoShopCopy}
              onCheckedChange={(checked) => updateConfig('autoShopCopy', checked)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Label htmlFor="shopCopies" className="min-w-[120px]">
              จำนวนใบร้าน
            </Label>
            <Input
              id="shopCopies"
              type="number"
              min="1"
              max="10"
              value={config.shopReceiptCopies}
              onChange={(e) => updateConfig('shopReceiptCopies', parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">ใบ</span>
          </div>
        </CardContent>
      </Card>

      {/* Sticker Labels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>สติ๊กเกอร์ติดแก้ว</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  ดูตัวอย่าง
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>ตัวอย่างสติ๊กเกอร์</DialogTitle>
                  <DialogDescription>
                    แก้ไขขนาดและรูปแบบตามต้องการ
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ขนาดตัวอักษร: {config.stickerFontSize}px</Label>
                    <Slider
                      value={[config.stickerFontSize]}
                      onValueChange={(value) => updateConfig('stickerFontSize', value[0])}
                      min={8}
                      max={16}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ความกว้างกระดาษ: {config.stickerPaperWidth}mm</Label>
                    <Slider
                      value={[config.stickerPaperWidth]}
                      onValueChange={(value) => updateConfig('stickerPaperWidth', value[0])}
                      min={40}
                      max={80}
                      step={1}
                    />
                  </div>
                  <ReceiptTemplatePreview 
                    type="sticker" 
                    fontSize={config.stickerFontSize}
                    paperWidth={config.stickerPaperWidth}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            พิมพ์สติ๊กเกอร์ข้อมูลออเดอร์เพื่อติดข้างแก้ว
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stickerEnabled">เปิดใช้งานสติ๊กเกอร์</Label>
              <p className="text-sm text-muted-foreground">
                พิมพ์สติ๊กเกอร์สำหรับติดแก้ว
              </p>
            </div>
            <Switch
              id="stickerEnabled"
              checked={config.stickerEnabled}
              onCheckedChange={(checked) => updateConfig('stickerEnabled', checked)}
            />
          </div>

          {config.stickerEnabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSticker">พิมพ์อัตโนมัติ</Label>
                  <p className="text-sm text-muted-foreground">
                    พิมพ์สติ๊กเกอร์ทุกครั้งที่มีการชำระเงิน
                  </p>
                </div>
                <Switch
                  id="autoSticker"
                  checked={config.autoSticker}
                  onCheckedChange={(checked) => updateConfig('autoSticker', checked)}
                />
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="stickerCopies" className="min-w-[120px]">
                  จำนวนสติ๊กเกอร์
                </Label>
                <Input
                  id="stickerCopies"
                  type="number"
                  min="1"
                  max="10"
                  value={config.stickerCopies}
                  onChange={(e) => updateConfig('stickerCopies', parseInt(e.target.value) || 1)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">ดวง</span>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">รูปแบบสติ๊กเกอร์</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  สติ๊กเกอร์จะแสดงข้อมูล:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>เลขที่ออเดอร์</li>
                  <li>รายการสินค้า</li>
                  <li>ตัวเลือก/ท็อปปิ้ง (ถ้ามี)</li>
                  <li>หมายเหตุพิเศษ (ถ้ามี)</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} size="lg" className="gap-2">
          <Printer className="h-4 w-4" />
          บันทึกการตั้งค่า
        </Button>
      </div>

      {/* Current Settings Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">สรุปการตั้งค่า</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ใบเสร็จลูกค้า:</span>
            <span className="font-medium">{config.customerReceiptCopies} ใบ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ใบร้าน:</span>
            <span className="font-medium">
              {config.shopReceiptCopies} ใบ {config.autoShopCopy && '(อัตโนมัติ)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">สติ๊กเกอร์:</span>
            <span className="font-medium">
              {config.stickerEnabled 
                ? `${config.stickerCopies} ดวง ${config.autoSticker ? '(อัตโนมัติ)' : ''}`
                : 'ปิดใช้งาน'
              }
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintCopiesSettings;
