
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo, memo } from 'react';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';

const InventoryDashboard = () => {
  const { 
    ingredients, 
    menuItems, 
    stockMovements,
    getLowStockIngredients,
    calculateMenuItemCost,
    calculateMenuItemProfit,
    calculateMenuItemMargin,
    loading 
  } = useSupabaseData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const lowStockItems = useMemo(() => getLowStockIngredients(), [getLowStockIngredients]);
  
  const totalStockValue = useMemo(() => 
    ingredients.reduce((total, ingredient) => 
      total + (ingredient.quantity * ingredient.cost_per_unit), 0
    ), [ingredients]
  );

  // Get best sellers with profit info
  const bestSellers = useMemo(() => menuItems.slice(0, 5).map(item => ({
    ...item,
    cost: calculateMenuItemCost(item.id),
    profit: calculateMenuItemProfit(item.id),
    margin: calculateMenuItemMargin(item.id)
  })), [menuItems, calculateMenuItemCost, calculateMenuItemProfit, calculateMenuItemMargin]);

  // Calculate today's cost and profit from menu items
  const financials = useMemo(() => {
    const totalMenuCost = bestSellers.reduce((sum, item) => sum + item.cost, 0);
    const totalMenuProfit = bestSellers.reduce((sum, item) => sum + item.profit, 0);
    const todayCost = totalMenuCost > 0 ? totalMenuCost : totalStockValue * 0.3;
    const todayProfit = totalMenuProfit > 0 ? totalMenuProfit : totalStockValue * 0.7;
    const profitMargin = ((todayProfit / (todayCost + todayProfit)) * 100).toFixed(1);
    return { todayCost, todayProfit, profitMargin };
  }, [bestSellers, totalStockValue]);

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
            <div className="text-2xl font-bold">฿{totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {ingredients.length} รายการวัตถุดิบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ต้นทุนวันนี้</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{financials.todayCost.toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-green-600">฿{financials.todayProfit.toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-green-600">{financials.profitMargin}%</div>
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
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">ไม่มีวัตถุดิบที่สต็อกต่ำ</p>
              ) : (
                lowStockItems.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium text-orange-800">{ingredient.name}</p>
                      <p className="text-sm text-orange-600">
                        เหลือ {ingredient.quantity} {ingredient.unit} (ขั้นต่ำ {ingredient.minimum_stock} {ingredient.unit})
                      </p>
                    </div>
                    <Badge variant="destructive">
                      ขาด {ingredient.minimum_stock - ingredient.quantity} {ingredient.unit}
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
              {bestSellers.map((item) => (
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
            {stockMovements.slice(0, 10).map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{movement.ingredients?.name || 'ไม่ระบุ'}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm')}
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

export default memo(InventoryDashboard);
