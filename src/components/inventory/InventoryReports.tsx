
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

const InventoryReports = () => {
  const { 
    ingredients,
    menuItems,
    stockMovements,
    calculateMenuItemCost,
    calculateMenuItemProfit,
    calculateMenuItemMargin,
    loading 
  } = useSupabaseData();

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
  }

  // Financial Summary Calculations
  const totalStockValue = ingredients.reduce((total, ingredient) => 
    total + (ingredient.quantity * ingredient.cost_per_unit), 0
  );

  const menuItemsWithCosts = menuItems.map(item => ({
    ...item,
    cost: calculateMenuItemCost(item.id),
    profit: calculateMenuItemProfit(item.id),
    margin: calculateMenuItemMargin(item.id)
  }));

  const totalMenuCosts = menuItemsWithCosts.reduce((total, item) => total + item.cost, 0);
  const totalMenuProfits = menuItemsWithCosts.reduce((total, item) => total + item.profit, 0);
  const averageMargin = menuItemsWithCosts.length > 0 
    ? menuItemsWithCosts.reduce((total, item) => total + item.margin, 0) / menuItemsWithCosts.length 
    : 0;

  // Stock by Category
  const stockByCategory = ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = {
        name: ingredient.category,
        items: 0,
        value: 0,
        quantity: 0
      };
    }
    acc[ingredient.category].items += 1;
    acc[ingredient.category].value += ingredient.quantity * ingredient.cost_per_unit;
    acc[ingredient.category].quantity += ingredient.quantity;
    return acc;
  }, {} as Record<string, any>);

  const categoryLabels: Record<string, string> = {
    coffee: 'กาแฟ',
    dairy: 'นม & ของแทน',
    sweetener: 'สารให้ความหวาน',
    syrup: 'ไซรัป',
    bakery: 'เบเกอรี่',
    packaging: 'บรรจุภัณฑ์',
    other: 'อื่นๆ'
  };

  // Stock Movement Analysis
  const movementsByType = stockMovements.reduce((acc, movement) => {
    if (!acc[movement.movement_type]) {
      acc[movement.movement_type] = {
        count: 0,
        totalQuantity: 0,
        totalValue: 0
      };
    }
    acc[movement.movement_type].count += 1;
    acc[movement.movement_type].totalQuantity += Math.abs(movement.quantity_change);
    acc[movement.movement_type].totalValue += Math.abs(movement.quantity_change * (movement.cost_per_unit || 0));
    return acc;
  }, {} as Record<string, any>);

  const movementTypeLabels: Record<string, string> = {
    purchase: 'ซื้อเข้า',
    adjustment: 'ปรับยอด',
    usage: 'ใช้งาน',
    waste: 'สูญเสีย/เสียหาย'
  };

  // Best and Worst Performing Items
  const sortedByMargin = [...menuItemsWithCosts].sort((a, b) => b.margin - a.margin);
  const bestPerformers = sortedByMargin.slice(0, 5);
  const worstPerformers = sortedByMargin.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">
            <FileText className="h-4 w-4 mr-2" />
            สรุปการเงิน
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            ประสิทธิภาพสินค้า
          </TabsTrigger>
          <TabsTrigger value="stock-value">
            <Package className="h-4 w-4 mr-2" />
            มูลค่าสต็อก
          </TabsTrigger>
          <TabsTrigger value="movements">
            <BarChart3 className="h-4 w-4 mr-2" />
            การเคลื่อนไหวสต็อก
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">มูลค่าสต็อกทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{totalStockValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {ingredients.length} รายการวัตถุดิบ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ต้นทุนเมนูรวม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">฿{totalMenuCosts.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {menuItems.length} รายการเมนู
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">กำไรคาดการณ์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">฿{totalMenuProfits.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  จากการขาย 1 รอบ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin เฉลี่ย</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{averageMargin.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  อัตรากำไรเฉลี่ย
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>สรุปต้นทุนและกำไรแต่ละเมนู</CardTitle>
              <CardDescription>รายละเอียดการคำนวณต้นทุนและกำไรของแต่ละเมนู</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuItemsWithCosts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.categories?.name || 'ไม่ระบุหมวดหมู่'}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">ราคาขาย</p>
                        <p className="font-medium">฿{item.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ต้นทุน</p>
                        <p className="font-medium">฿{item.cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">กำไร</p>
                        <p className={`font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ฿{item.profit.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Margin</p>
                        <p className={`font-medium ${item.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">เมนูที่ทำกำไรดีที่สุด</CardTitle>
                <CardDescription>5 เมนูที่มี Profit Margin สูงสุด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bestPerformers.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ราคา ฿{item.price} | ต้นทุน ฿{item.cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">฿{item.profit.toFixed(2)}</p>
                        <p className="text-sm text-green-600">{item.margin.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">เมนูที่ต้องปรับปรุง</CardTitle>
                <CardDescription>5 เมนูที่มี Profit Margin ต่ำสุด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {worstPerformers.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ราคา ฿{item.price} | ต้นทุน ฿{item.cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ฿{item.profit.toFixed(2)}
                        </p>
                        <p className={`text-sm ${item.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock-value" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>มูลค่าสต็อกแยกตามหมวดหมู่</CardTitle>
              <CardDescription>การกระจายมูลค่าสต็อกในแต่ละหมวดหมู่</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(stockByCategory).map((category: any) => (
                  <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{categoryLabels[category.name] || category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.items} รายการ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">฿{category.value.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {((category.value / totalStockValue) * 100).toFixed(1)}% ของทั้งหมด
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>สรุปการเคลื่อนไหวสต็อกตามประเภท</CardTitle>
              <CardDescription>สถิติการเคลื่อนไหวสต็อกในช่วงที่ผ่านมา</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(movementsByType).map(([type, data]: [string, any]) => (
                  <Card key={type}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {movementTypeLabels[type] || type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-lg font-bold">{data.count} ครั้ง</div>
                        <div className="text-sm text-muted-foreground">
                          ปริมาณรวม: {data.totalQuantity.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          มูลค่า: ฿{data.totalValue.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ประวัติการเคลื่อนไหวสต็อกล่าสุด</CardTitle>
              <CardDescription>รายการเคลื่อนไหวสต็อก 20 รายการล่าสุด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockMovements.slice(0, 20).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{movement.ingredients?.name || 'ไม่ระบุ'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm')} • {movement.created_by}
                      </p>
                      {movement.notes && (
                        <p className="text-xs text-muted-foreground">{movement.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        movement.movement_type === 'purchase' ? 'default' :
                        movement.movement_type === 'usage' ? 'secondary' :
                        movement.movement_type === 'waste' ? 'destructive' : 'outline'
                      }>
                        {movementTypeLabels[movement.movement_type] || movement.movement_type}
                      </Badge>
                      <p className="text-sm mt-1">
                        {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change} {movement.ingredients?.unit}
                      </p>
                      {movement.cost_per_unit && (
                        <p className="text-xs text-muted-foreground">
                          ฿{(Math.abs(movement.quantity_change) * movement.cost_per_unit).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryReports;
