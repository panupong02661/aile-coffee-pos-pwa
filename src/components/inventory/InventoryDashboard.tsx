
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, TrendingUp, DollarSign } from 'lucide-react';

const InventoryDashboard = () => {
  // Mock data for demonstration
  const mockStats = {
    totalStockValue: 125000,
    todayCost: 8500,
    todayProfit: 15200,
    profitMargin: 64.1
  };

  const mockLowStock = [
    { id: 1, name: 'กาแฟเมล็ด Arabica', quantity: 2, unit: 'กก.', minimum_stock: 5 },
    { id: 2, name: 'นมสด', quantity: 8, unit: 'ลิตร', minimum_stock: 20 },
    { id: 3, name: 'น้ำตาลทรายขาว', quantity: 1.5, unit: 'กก.', minimum_stock: 3 }
  ];

  const mockBestSellers = [
    { id: 1, name: 'กาแฟอเมริกาโน่', price: 65, cost: 18, profit: 47, margin: 72.3 },
    { id: 2, name: 'คาปูชิโน่', price: 75, cost: 22, profit: 53, margin: 70.7 },
    { id: 3, name: 'ลาเต้', price: 80, cost: 25, profit: 55, margin: 68.8 },
    { id: 4, name: 'มอคค่า', price: 85, cost: 28, profit: 57, margin: 67.1 },
    { id: 5, name: 'เอสเปรสโซ่', price: 50, cost: 15, profit: 35, margin: 70.0 }
  ];

  const mockRecentMovements = [
    { id: 1, ingredients: { name: 'กาแฟเมล็ด Arabica', unit: 'กก.' }, movement_type: 'purchase', quantity_change: 10, created_at: new Date().toISOString() },
    { id: 2, ingredients: { name: 'นมสด', unit: 'ลิตร' }, movement_type: 'usage', quantity_change: -5, created_at: new Date().toISOString() },
    { id: 3, ingredients: { name: 'น้ำตาลทรายขาว', unit: 'กก.' }, movement_type: 'purchase', quantity_change: 2, created_at: new Date().toISOString() }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าสต็อกทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{mockStats.totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ข้อมูลตัวอย่าง</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ต้นทุนวันนี้</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{mockStats.todayCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ต้นทุนการผลิต
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำไรวันนี้</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">฿{mockStats.todayProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              กำไรสุทธิ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.profitMargin}%</div>
            <p className="text-xs text-muted-foreground">
              อัตรากำไร
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              แจ้งเตือนสต็อกต่ำ
            </CardTitle>
            <CardDescription>
              วัตถุดิบที่ใกล้หมดและต้องเติมสต็อก
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">ไม่มีวัตถุดิบที่สต็อกต่ำ</p>
              ) : (
                mockLowStock.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium text-orange-800">{ingredient.name}</p>
                      <p className="text-sm text-orange-600">
                        เหลือ {ingredient.quantity} {ingredient.unit} (ขั้นต่ำ {ingredient.minimum_stock} {ingredient.unit})
                      </p>
                    </div>
                    <Badge variant="destructive">
                      ขาด {Number(ingredient.minimum_stock) - Number(ingredient.quantity)} {ingredient.unit}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Best Sellers with Profit */}
        <Card>
          <CardHeader>
            <CardTitle>เมนูขายดี & กำไร</CardTitle>
            <CardDescription>
              เมนูที่ขายดีพร้อมข้อมูลต้นทุนและกำไร
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockBestSellers.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-green-800">{item.name}</p>
                    <p className="text-sm text-green-600">
                      ราคา ฿{item.price} | ต้นทุน ฿{item.cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-700">฿{item.profit.toFixed(2)}</p>
                    <p className="text-sm text-green-600">{item.margin.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>การเคลื่อนไหวสต็อกล่าสุด</CardTitle>
          <CardDescription>
            ประวัติการเคลื่อนไหวสต็อก 10 รายการล่าสุด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentMovements.slice(0, 10).map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{movement.ingredients?.name || 'ไม่ระบุ'}</p>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const d = new Date(movement.created_at as any);
                      return isNaN(d.getTime()) ? '-' : d.toLocaleString('th-TH');
                    })()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={
                    movement.movement_type === 'purchase' ? 'default' :
                    movement.movement_type === 'usage' ? 'secondary' :
                    movement.movement_type === 'waste' ? 'destructive' : 'outline'
                  }>
                    {movement.movement_type === 'purchase' ? 'ซื้อเข้า' :
                     movement.movement_type === 'usage' ? 'ใช้งาน' :
                     movement.movement_type === 'waste' ? 'สูญเสีย' : 'ปรับยอด'}
                  </Badge>
                  <p className="text-sm mt-1">
                    {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change} {movement.ingredients?.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
