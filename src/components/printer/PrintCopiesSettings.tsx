import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Printer, Receipt, FileText, Tag } from 'lucide-react';

interface PrintCopiesConfig {
  customerReceiptCopies: number;
  shopReceiptCopies: number;
  stickerEnabled: boolean;
  stickerCopies: number;
  autoShopCopy: boolean;
  autoSticker: boolean;
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
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle>ใบเสร็จสำหรับลูกค้า</CardTitle>
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
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>ใบสำหรับร้าน/ครัว</CardTitle>
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
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle>สติ๊กเกอร์ติดแก้ว</CardTitle>
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
