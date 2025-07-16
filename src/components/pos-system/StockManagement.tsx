import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Package, Plus, Edit } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  costPerUnit: number;
  supplier?: string;
}

export const StockManagement: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Coffee Beans (Arabica)', category: 'Coffee', quantity: 25, unit: 'kg', minimumStock: 10, costPerUnit: 450, supplier: 'Local Farm Co.' },
    { id: '2', name: 'Milk', category: 'Dairy', quantity: 8, unit: 'L', minimumStock: 15, costPerUnit: 35, supplier: 'Dairy Fresh Ltd.' },
    { id: '3', name: 'Sugar', category: 'Sweetener', quantity: 50, unit: 'kg', minimumStock: 20, costPerUnit: 25 },
    { id: '4', name: 'Vanilla Syrup', category: 'Syrup', quantity: 5, unit: 'bottles', minimumStock: 10, costPerUnit: 120 },
    { id: '5', name: 'Disposable Cups', category: 'Supplies', quantity: 200, unit: 'pcs', minimumStock: 500, costPerUnit: 2 },
  ]);

  const lowStockItems = ingredients.filter(item => item.quantity <= item.minimumStock);
  
  const getStockStatus = (item: Ingredient) => {
    if (item.quantity <= item.minimumStock * 0.5) return 'critical';
    if (item.quantity <= item.minimumStock) return 'low';
    return 'normal';
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Stock</Badge>;
      default:
        return <Badge variant="default">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Stock Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มวัตถุดิบใหม่
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">คลังสินค้า</TabsTrigger>
          <TabsTrigger value="low-stock">สินค้าใกล้หมด</TabsTrigger>
          <TabsTrigger value="recipes">สูตรอาหาร</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.map(item => {
              const status = getStockStatus(item);
              return (
                <Card key={item.id} className={status === 'critical' ? 'border-destructive' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {getStockBadge(status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">ปริมาณ:</span>
                        <p className="font-medium">{item.quantity} {item.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ขั้นต่ำ:</span>
                        <p className="font-medium">{item.minimumStock} {item.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ราคา/หน่วย:</span>
                        <p className="font-medium">฿{item.costPerUnit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">มูลค่ารวม:</span>
                        <p className="font-medium">฿{(item.quantity * item.costPerUnit).toLocaleString()}</p>
                      </div>
                    </div>
                    {item.supplier && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">ผู้จัดจำหน่าย:</span>
                        <p className="font-medium">{item.supplier}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        แก้ไข
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Package className="h-3 w-3 mr-1" />
                        เติมสต็อก
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {lowStockItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">ไม่มีสินค้าใกล้หมดในขณะนี้</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-semibold text-destructive">
                  สินค้าใกล้หมด ({lowStockItems.length} รายการ)
                </h3>
              </div>
              <div className="grid gap-4">
                {lowStockItems.map(item => (
                  <Card key={item.id} className="border-destructive">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            คงเหลือ: {item.quantity} {item.unit} (ขั้นต่ำ: {item.minimumStock} {item.unit})
                          </p>
                        </div>
                        <Button size="sm">สั่งซื้อทันที</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>สูตรอาหาร/เครื่องดื่ม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Americano</h4>
                    <div className="text-sm space-y-1">
                      <p>• Coffee Beans: 18g</p>
                      <p>• Hot Water: 150ml</p>
                      <p className="text-muted-foreground">ต้นทุน: ฿12.50</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Latte</h4>
                    <div className="text-sm space-y-1">
                      <p>• Coffee Beans: 18g</p>
                      <p>• Milk: 150ml</p>
                      <p className="text-muted-foreground">ต้นทุน: ฿17.75</p>
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