import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Phone, Star, Gift, TrendingUp } from 'lucide-react';

interface Customer {
  id: string;
  phone: string;
  name: string;
  points: number;
  tier: string;
  totalSpent: number;
  visits: number;
  joinDate: string;
}

interface Tier {
  name: string;
  minSpent: number;
  discount: number;
  pointsPerBaht: number;
  color: string;
}

export const LoyaltyProgram: React.FC = () => {
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const tiers: Tier[] = [
    { name: 'Bronze', minSpent: 0, discount: 0, pointsPerBaht: 1, color: 'bg-amber-600' },
    { name: 'Silver', minSpent: 1000, discount: 5, pointsPerBaht: 1.5, color: 'bg-gray-400' },
    { name: 'Gold', minSpent: 5000, discount: 10, pointsPerBaht: 2, color: 'bg-yellow-500' },
    { name: 'Platinum', minSpent: 15000, discount: 15, pointsPerBaht: 3, color: 'bg-purple-600' },
  ];

  const customers: Customer[] = [
    { id: '1', phone: '0812345678', name: 'สมชาย ใจดี', points: 150, tier: 'Silver', totalSpent: 2500, visits: 25, joinDate: '2024-01-15' },
    { id: '2', phone: '0887654321', name: 'สมหญิง รักกาแฟ', points: 320, tier: 'Gold', totalSpent: 8500, visits: 85, joinDate: '2023-11-20' },
    { id: '3', phone: '0856789012', name: 'วิชัย คาเฟ่', points: 480, tier: 'Platinum', totalSpent: 18500, visits: 125, joinDate: '2023-08-10' },
  ];

  const handlePhoneSearch = () => {
    const customer = customers.find(c => c.phone.includes(searchPhone));
    setSelectedCustomer(customer || null);
  };

  const getTierInfo = (tierName: string) => {
    return tiers.find(t => t.name === tierName) || tiers[0];
  };

  const createDiscount = (customerId: string, type: 'birthday' | 'promotion') => {
    // สร้างส่วนลดตามประเภท
    console.log(`Creating ${type} discount for customer ${customerId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Loyalty Program</h2>
        <Button>
          <Gift className="h-4 w-4 mr-2" />
          สร้างโปรโมชั่น
        </Button>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">ค้นหาลูกค้า</TabsTrigger>
          <TabsTrigger value="tiers">ระดับสมาชิก</TabsTrigger>
          <TabsTrigger value="promotions">โปรโมชั่น</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {/* Phone Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                ค้นหาลูกค้าด้วยเบอร์โทร
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="กรอกเบอร์โทรศัพท์"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handlePhoneSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  ค้นหา
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          {selectedCustomer && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedCustomer.name}</CardTitle>
                    <p className="text-muted-foreground">{selectedCustomer.phone}</p>
                  </div>
                  <Badge className={getTierInfo(selectedCustomer.tier).color}>
                    {selectedCustomer.tier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedCustomer.points}</div>
                    <div className="text-sm text-muted-foreground">แต้มสะสม</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">฿{selectedCustomer.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">ยอดซื้อรวม</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedCustomer.visits}</div>
                    <div className="text-sm text-muted-foreground">ครั้งที่มา</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{getTierInfo(selectedCustomer.tier).discount}%</div>
                    <div className="text-sm text-muted-foreground">ส่วนลด</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => createDiscount(selectedCustomer.id, 'birthday')}>
                    <Gift className="h-4 w-4 mr-2" />
                    ส่วนลดวันเกิด
                  </Button>
                  <Button variant="outline" onClick={() => createDiscount(selectedCustomer.id, 'promotion')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    โปรโมชั่นพิเศษ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Customer List */}
          <Card>
            <CardHeader>
              <CardTitle>ลูกค้าล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customers.map(customer => (
                  <div 
                    key={customer.id}
                    className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-muted"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.phone}</div>
                    </div>
                    <div className="text-right">
                      <Badge className={getTierInfo(customer.tier).color}>
                        {customer.tier}
                      </Badge>
                      <div className="text-sm text-muted-foreground">{customer.points} แต้ม</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4">
            {tiers.map(tier => (
              <Card key={tier.name}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${tier.color}`}></div>
                      <h3 className="text-lg font-semibold">{tier.name}</h3>
                    </div>
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ยอดซื้อขั้นต่ำ:</span>
                      <p className="font-medium">฿{tier.minSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ส่วนลด:</span>
                      <p className="font-medium">{tier.discount}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">แต้มต่อบาท:</span>
                      <p className="font-medium">{tier.pointsPerBaht} แต้ม</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>โปรโมชั่นตามเวลา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Happy Hour</h4>
                        <p className="text-sm text-muted-foreground">14:00-16:00 น. ส่วนลด 20% เครื่องดื่มทุกชนิด</p>
                      </div>
                      <Badge variant="default">กำลังใช้งาน</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Morning Special</h4>
                        <p className="text-sm text-muted-foreground">07:00-10:00 น. ซื้อ 2 แก้วราคาแก้วเดียว</p>
                      </div>
                      <Badge variant="secondary">ปิดใช้งาน</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};