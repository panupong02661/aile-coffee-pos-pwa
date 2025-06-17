
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';

const InventoryReports = () => {
  const { ingredients, stockMovements, loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  // Calculate total stock value
  const totalStockValue = ingredients.reduce((total, ingredient) => {
    return total + (ingredient.quantity * ingredient.cost_per_unit);
  }, 0);

  // Calculate stock value by category
  const stockByCategory = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.category;
    if (!acc[category]) {
      acc[category] = { value: 0, count: 0 };
    }
    acc[category].value += ingredient.quantity * ingredient.cost_per_unit;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { value: number; count: number }>);

  // Low stock items
  const lowStockItems = ingredients.filter(
    ingredient => ingredient.quantity <= ingredient.minimum_stock && ingredient.is_active
  );

  // Recent movements (last 10)
  const recentMovements = stockMovements.slice(0, 10);

  const categoryLabels: Record<string, string> = {
    coffee: 'กาแฟ',
    dairy: 'นม/ของเหลว',
    syrup: 'ไซรัป',
    sweetener: 'สารให้ความหวาน',
    bakery: 'อบเบเกอรี่',
    packaging: 'บรรจุภัณฑ์',
    other: 'อื่นๆ'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าสต็อกรวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              จาก {ingredients.length} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">วัตถุดิบทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ingredients.length}</div>
            <p className="text-xs text-muted-foreground">
              รายการที่ใช้งาน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สต็อกต่ำ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              รายการที่ต้องเติม
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การเคลื่อนไหว</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockMovements.length}</div>
            <p className="text-xs text-muted-foreground">
              รายการทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>มูลค่าสต็อกแยกตามหมวดหมู่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stockByCategory).map(([category, data]) => (
                <div key={category} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{categoryLabels[category] || category}</span>
                    <span className="text-sm text-gray-500 ml-2">({data.count} รายการ)</span>
                  </div>
                  <span className="font-bold">฿{data.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การเคลื่อนไหวล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีการเคลื่อนไหว</p>
              ) : (
                recentMovements.map((movement) => {
                  const ingredient = ingredients.find(i => i.id === movement.ingredient_id);
                  return (
                    <div key={movement.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{ingredient?.name || 'N/A'}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          movement.movement_type === 'purchase' ? 'bg-green-100 text-green-700' :
                          movement.movement_type === 'usage' ? 'bg-blue-100 text-blue-700' :
                          movement.movement_type === 'waste' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {movement.movement_type === 'purchase' ? 'ซื้อเข้า' :
                           movement.movement_type === 'usage' ? 'ใช้งาน' :
                           movement.movement_type === 'waste' ? 'สูญเสีย' : 'ปรับยอด'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={movement.quantity_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {movement.quantity_change >= 0 ? '+' : ''}{movement.quantity_change}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(movement.created_at).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryReports;
