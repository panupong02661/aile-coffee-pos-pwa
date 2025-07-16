import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Percent, Tag, Clock, Gift } from 'lucide-react';

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export const DiscountManager: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([
    {
      id: '1',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minPurchase: 100,
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      usageLimit: 100,
      usedCount: 25,
      isActive: true
    },
    {
      id: '2',
      code: 'SAVE50',
      type: 'fixed',
      value: 50,
      minPurchase: 200,
      validFrom: '2024-07-01',
      validTo: '2024-07-31',
      usageLimit: 50,
      usedCount: 12,
      isActive: true
    },
    {
      id: '3',
      code: 'EXPIRED20',
      type: 'percentage',
      value: 20,
      validFrom: '2024-01-01',
      validTo: '2024-06-30',
      usedCount: 45,
      isActive: false
    }
  ]);

  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    validFrom: '',
    validTo: '',
    usageLimit: 0
  });

  const createDiscountCode = () => {
    const discount: DiscountCode = {
      id: Date.now().toString(),
      ...newDiscount,
      usedCount: 0,
      isActive: true
    };
    setDiscountCodes(prev => [...prev, discount]);
    setNewDiscount({
      code: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      validFrom: '',
      validTo: '',
      usageLimit: 0
    });
  };

  const toggleDiscountStatus = (id: string) => {
    setDiscountCodes(prev => prev.map(discount =>
      discount.id === id ? { ...discount, isActive: !discount.isActive } : discount
    ));
  };

  const getDiscountDisplay = (discount: DiscountCode) => {
    return discount.type === 'percentage' 
      ? `${discount.value}%` 
      : `฿${discount.value}`;
  };

  const isExpired = (discount: DiscountCode) => {
    return new Date(discount.validTo) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discount Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            ตั้งเวลาอัตโนมัติ
          </Button>
          <Button>
            <Tag className="h-4 w-4 mr-2" />
            สร้างโค้ดใหม่
          </Button>
        </div>
      </div>

      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="codes">รหัสส่วนลด</TabsTrigger>
          <TabsTrigger value="create">สร้างรหัสใหม่</TabsTrigger>
          <TabsTrigger value="time-based">ส่วนลดตามเวลา</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4">
          <div className="grid gap-4">
            {discountCodes.map(discount => (
              <Card key={discount.id} className={isExpired(discount) ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {discount.type === 'percentage' ? 
                          <Percent className="h-5 w-5 text-primary" /> : 
                          <Tag className="h-5 w-5 text-primary" />
                        }
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{discount.code}</h3>
                        <p className="text-muted-foreground">
                          ส่วนลด {getDiscountDisplay(discount)}
                          {discount.minPurchase && ` (ขั้นต่ำ ฿${discount.minPurchase})`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={discount.isActive && !isExpired(discount) ? 'default' : 'secondary'}>
                        {isExpired(discount) ? 'หมดอายุ' : discount.isActive ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleDiscountStatus(discount.id)}
                        disabled={isExpired(discount)}
                      >
                        {discount.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ใช้ได้ตั้งแต่:</span>
                      <p className="font-medium">{new Date(discount.validFrom).toLocaleDateString('th-TH')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ใช้ได้ถึง:</span>
                      <p className="font-medium">{new Date(discount.validTo).toLocaleDateString('th-TH')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">จำนวนการใช้:</span>
                      <p className="font-medium">
                        {discount.usedCount}
                        {discount.usageLimit && ` / ${discount.usageLimit}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">สถานะ:</span>
                      <p className="font-medium">
                        {discount.usageLimit && discount.usedCount >= discount.usageLimit 
                          ? 'ใช้หมดแล้ว' 
                          : 'ใช้งานได้'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>สร้างรหัสส่วนลดใหม่</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">รหัสส่วนลด</label>
                  <Input
                    placeholder="เช่น SAVE20"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ประเภทส่วนลด</label>
                  <Select value={newDiscount.type} onValueChange={(value: 'percentage' | 'fixed') => 
                    setNewDiscount(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">เปอร์เซ็นต์ (%)</SelectItem>
                      <SelectItem value="fixed">จำนวนเงิน (บาท)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    มูลค่าส่วนลด {newDiscount.type === 'percentage' ? '(%)' : '(บาท)'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, value: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ยอดซื้อขั้นต่ำ (บาท)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newDiscount.minPurchase}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, minPurchase: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">วันที่เริ่มใช้</label>
                  <Input
                    type="date"
                    value={newDiscount.validFrom}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, validFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">วันที่หมดอายุ</label>
                  <Input
                    type="date"
                    value={newDiscount.validTo}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, validTo: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">จำนวนครั้งที่ใช้ได้</label>
                  <Input
                    type="number"
                    placeholder="ไม่จำกัด"
                    value={newDiscount.usageLimit || ''}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, usageLimit: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <Button onClick={createDiscountCode} className="w-full">
                <Gift className="h-4 w-4 mr-2" />
                สร้างรหัสส่วนลด
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-based" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ส่วนลดตามช่วงเวลา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Happy Hour</h4>
                        <p className="text-sm text-muted-foreground">
                          14:00-16:00 น. ทุกวัน - ส่วนลด 20%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">ใช้งานอยู่</Badge>
                        <Button size="sm" variant="outline">แก้ไข</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Weekend Special</h4>
                        <p className="text-sm text-muted-foreground">
                          เสาร์-อาทิตย์ ทั้งวัน - ส่วนลด 15%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">ปิดใช้งาน</Badge>
                        <Button size="sm" variant="outline">แก้ไข</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Button className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                เพิ่มส่วนลดตามเวลาใหม่
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};