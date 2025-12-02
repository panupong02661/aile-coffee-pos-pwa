import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Printer, Receipt, FileText, Tag, Eye, Settings2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  // Shop Receipt Advanced Settings
  shopOrientation: 'portrait' | 'landscape';
  shopPaddingTop: number;
  shopPaddingBottom: number;
  shopPaddingLeft: number;
  shopPaddingRight: number;
  shopItemSpacing: number;
  shopHeaderSize: number;
  shopOrderNumberSize: number;
  shopItemNameSize: number;
  shopAddonSize: number;
  shopShowBorder: boolean;
  shopBorderThickness: number;
  // Sticker Advanced Settings
  stickerOrientation: 'portrait' | 'landscape';
  stickerPaddingTop: number;
  stickerPaddingBottom: number;
  stickerPaddingLeft: number;
  stickerPaddingRight: number;
  stickerItemSpacing: number;
  stickerHeaderSize: number;
  stickerItemNameSize: number;
  stickerAddonSize: number;
  stickerShowBorder: boolean;
  stickerBorderThickness: number;
  stickerHeight: number;
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
    // Shop Receipt Advanced Settings
    shopOrientation: 'portrait',
    shopPaddingTop: 8,
    shopPaddingBottom: 8,
    shopPaddingLeft: 8,
    shopPaddingRight: 8,
    shopItemSpacing: 12,
    shopHeaderSize: 20,
    shopOrderNumberSize: 18,
    shopItemNameSize: 16,
    shopAddonSize: 14,
    shopShowBorder: true,
    shopBorderThickness: 2,
    // Sticker Advanced Settings
    stickerOrientation: 'portrait',
    stickerPaddingTop: 4,
    stickerPaddingBottom: 4,
    stickerPaddingLeft: 4,
    stickerPaddingRight: 4,
    stickerItemSpacing: 8,
    stickerHeaderSize: 14,
    stickerItemNameSize: 12,
    stickerAddonSize: 10,
    stickerShowBorder: true,
    stickerBorderThickness: 1,
    stickerHeight: 80,
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

  const updateConfig = (key: keyof PrintCopiesConfig, value: number | boolean | string) => {
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
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>ตัวอย่างใบร้าน/ครัว</DialogTitle>
                  <DialogDescription>
                    แก้ไขขนาดและรูปแบบตามต้องการ
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">ตัวอย่าง</TabsTrigger>
                    <TabsTrigger value="settings">การตั้งค่าละเอียด</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="space-y-4">
                    <ReceiptTemplatePreview 
                      type="shop" 
                      fontSize={config.shopFontSize}
                      paperWidth={config.shopPaperWidth}
                      orientation={config.shopOrientation}
                      paddingTop={config.shopPaddingTop}
                      paddingBottom={config.shopPaddingBottom}
                      paddingLeft={config.shopPaddingLeft}
                      paddingRight={config.shopPaddingRight}
                      itemSpacing={config.shopItemSpacing}
                      headerSize={config.shopHeaderSize}
                      orderNumberSize={config.shopOrderNumberSize}
                      itemNameSize={config.shopItemNameSize}
                      addonSize={config.shopAddonSize}
                      showBorder={config.shopShowBorder}
                      borderThickness={config.shopBorderThickness}
                    />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-6">
                        {/* Orientation */}
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">การวางแนว</Label>
                          <RadioGroup
                            value={config.shopOrientation}
                            onValueChange={(value) => updateConfig('shopOrientation', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="portrait" id="shop-portrait" />
                              <Label htmlFor="shop-portrait">แนวตั้ง (Portrait)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="landscape" id="shop-landscape" />
                              <Label htmlFor="shop-landscape">แนวนอน (Landscape)</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Paper Width */}
                        <div className="space-y-2">
                          <Label>ความกว้างกระดาษ: {config.shopPaperWidth}mm</Label>
                          <Slider
                            value={[config.shopPaperWidth]}
                            onValueChange={(value) => updateConfig('shopPaperWidth', value[0])}
                            min={58}
                            max={120}
                            step={1}
                          />
                        </div>

                        {/* Padding Section */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">ระยะขอบ (Padding)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">บน: {config.shopPaddingTop}px</Label>
                              <Slider
                                value={[config.shopPaddingTop]}
                                onValueChange={(value) => updateConfig('shopPaddingTop', value[0])}
                                min={0}
                                max={30}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ล่าง: {config.shopPaddingBottom}px</Label>
                              <Slider
                                value={[config.shopPaddingBottom]}
                                onValueChange={(value) => updateConfig('shopPaddingBottom', value[0])}
                                min={0}
                                max={30}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ซ้าย: {config.shopPaddingLeft}px</Label>
                              <Slider
                                value={[config.shopPaddingLeft]}
                                onValueChange={(value) => updateConfig('shopPaddingLeft', value[0])}
                                min={0}
                                max={30}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ขวา: {config.shopPaddingRight}px</Label>
                              <Slider
                                value={[config.shopPaddingRight]}
                                onValueChange={(value) => updateConfig('shopPaddingRight', value[0])}
                                min={0}
                                max={30}
                                step={1}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Font Sizes Section */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">ขนาดตัวอักษร</Label>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-sm">หัวเรื่อง: {config.shopHeaderSize}px</Label>
                              <Slider
                                value={[config.shopHeaderSize]}
                                onValueChange={(value) => updateConfig('shopHeaderSize', value[0])}
                                min={12}
                                max={36}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">เลขออเดอร์: {config.shopOrderNumberSize}px</Label>
                              <Slider
                                value={[config.shopOrderNumberSize]}
                                onValueChange={(value) => updateConfig('shopOrderNumberSize', value[0])}
                                min={10}
                                max={32}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ชื่อเมนู: {config.shopItemNameSize}px</Label>
                              <Slider
                                value={[config.shopItemNameSize]}
                                onValueChange={(value) => updateConfig('shopItemNameSize', value[0])}
                                min={10}
                                max={28}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ท็อปปิ้ง/เพิ่มเติม: {config.shopAddonSize}px</Label>
                              <Slider
                                value={[config.shopAddonSize]}
                                onValueChange={(value) => updateConfig('shopAddonSize', value[0])}
                                min={8}
                                max={24}
                                step={1}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Spacing */}
                        <div className="space-y-2">
                          <Label>ระยะห่างระหว่างรายการ: {config.shopItemSpacing}px</Label>
                          <Slider
                            value={[config.shopItemSpacing]}
                            onValueChange={(value) => updateConfig('shopItemSpacing', value[0])}
                            min={0}
                            max={30}
                            step={1}
                          />
                        </div>

                        {/* Border Settings */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">เส้นขอบ</Label>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="shop-show-border">แสดงเส้นขอบ</Label>
                            <Switch
                              id="shop-show-border"
                              checked={config.shopShowBorder}
                              onCheckedChange={(checked) => updateConfig('shopShowBorder', checked)}
                            />
                          </div>
                          {config.shopShowBorder && (
                            <div className="space-y-2">
                              <Label className="text-sm">ความหนาเส้นขอบ: {config.shopBorderThickness}px</Label>
                              <Slider
                                value={[config.shopBorderThickness]}
                                onValueChange={(value) => updateConfig('shopBorderThickness', value[0])}
                                min={1}
                                max={5}
                                step={1}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
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
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>ตัวอย่างสติ๊กเกอร์</DialogTitle>
                  <DialogDescription>
                    แก้ไขขนาดและรูปแบบตามต้องการ
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">ตัวอย่าง</TabsTrigger>
                    <TabsTrigger value="settings">การตั้งค่าละเอียด</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="space-y-4">
                    <ReceiptTemplatePreview 
                      type="sticker" 
                      fontSize={config.stickerFontSize}
                      paperWidth={config.stickerPaperWidth}
                      orientation={config.stickerOrientation}
                      paddingTop={config.stickerPaddingTop}
                      paddingBottom={config.stickerPaddingBottom}
                      paddingLeft={config.stickerPaddingLeft}
                      paddingRight={config.stickerPaddingRight}
                      itemSpacing={config.stickerItemSpacing}
                      headerSize={config.stickerHeaderSize}
                      itemNameSize={config.stickerItemNameSize}
                      addonSize={config.stickerAddonSize}
                      showBorder={config.stickerShowBorder}
                      borderThickness={config.stickerBorderThickness}
                      height={config.stickerHeight}
                    />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-6">
                        {/* Orientation */}
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">การวางแนว</Label>
                          <RadioGroup
                            value={config.stickerOrientation}
                            onValueChange={(value) => updateConfig('stickerOrientation', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="portrait" id="sticker-portrait" />
                              <Label htmlFor="sticker-portrait">แนวตั้ง (Portrait)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="landscape" id="sticker-landscape" />
                              <Label htmlFor="sticker-landscape">แนวนอน (Landscape)</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Size Settings */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">ขนาด</Label>
                          <div className="space-y-2">
                            <Label>ความกว้าง: {config.stickerPaperWidth}mm</Label>
                            <Slider
                              value={[config.stickerPaperWidth]}
                              onValueChange={(value) => updateConfig('stickerPaperWidth', value[0])}
                              min={40}
                              max={100}
                              step={1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>ความสูง: {config.stickerHeight}mm</Label>
                            <Slider
                              value={[config.stickerHeight]}
                              onValueChange={(value) => updateConfig('stickerHeight', value[0])}
                              min={40}
                              max={150}
                              step={1}
                            />
                          </div>
                        </div>

                        {/* Padding Section */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">ระยะขอบ (Padding)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">บน: {config.stickerPaddingTop}px</Label>
                              <Slider
                                value={[config.stickerPaddingTop]}
                                onValueChange={(value) => updateConfig('stickerPaddingTop', value[0])}
                                min={0}
                                max={20}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ล่าง: {config.stickerPaddingBottom}px</Label>
                              <Slider
                                value={[config.stickerPaddingBottom]}
                                onValueChange={(value) => updateConfig('stickerPaddingBottom', value[0])}
                                min={0}
                                max={20}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ซ้าย: {config.stickerPaddingLeft}px</Label>
                              <Slider
                                value={[config.stickerPaddingLeft]}
                                onValueChange={(value) => updateConfig('stickerPaddingLeft', value[0])}
                                min={0}
                                max={20}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ขวา: {config.stickerPaddingRight}px</Label>
                              <Slider
                                value={[config.stickerPaddingRight]}
                                onValueChange={(value) => updateConfig('stickerPaddingRight', value[0])}
                                min={0}
                                max={20}
                                step={1}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Font Sizes Section */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">ขนาดตัวอักษร</Label>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-sm">หัวเรื่อง (เลขออเดอร์): {config.stickerHeaderSize}px</Label>
                              <Slider
                                value={[config.stickerHeaderSize]}
                                onValueChange={(value) => updateConfig('stickerHeaderSize', value[0])}
                                min={10}
                                max={24}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ชื่อเมนู: {config.stickerItemNameSize}px</Label>
                              <Slider
                                value={[config.stickerItemNameSize]}
                                onValueChange={(value) => updateConfig('stickerItemNameSize', value[0])}
                                min={8}
                                max={20}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ท็อปปิ้ง/เพิ่มเติม: {config.stickerAddonSize}px</Label>
                              <Slider
                                value={[config.stickerAddonSize]}
                                onValueChange={(value) => updateConfig('stickerAddonSize', value[0])}
                                min={6}
                                max={16}
                                step={1}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Spacing */}
                        <div className="space-y-2">
                          <Label>ระยะห่างระหว่างรายการ: {config.stickerItemSpacing}px</Label>
                          <Slider
                            value={[config.stickerItemSpacing]}
                            onValueChange={(value) => updateConfig('stickerItemSpacing', value[0])}
                            min={0}
                            max={20}
                            step={1}
                          />
                        </div>

                        {/* Border Settings */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">เส้นขอบ</Label>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="sticker-show-border">แสดงเส้นขอบ</Label>
                            <Switch
                              id="sticker-show-border"
                              checked={config.stickerShowBorder}
                              onCheckedChange={(checked) => updateConfig('stickerShowBorder', checked)}
                            />
                          </div>
                          {config.stickerShowBorder && (
                            <div className="space-y-2">
                              <Label className="text-sm">ความหนาเส้นขอบ: {config.stickerBorderThickness}px</Label>
                              <Slider
                                value={[config.stickerBorderThickness]}
                                onValueChange={(value) => updateConfig('stickerBorderThickness', value[0])}
                                min={1}
                                max={5}
                                step={1}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
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
