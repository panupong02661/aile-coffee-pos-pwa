
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Package, TrendingDown, TrendingUp, Download } from 'lucide-react';

const ProductReports = () => {
  const productData = [
    { 
      id: 1, 
      name: 'กาแฟเอสเปรสโซ', 
      category: 'เครื่องดื่มร้อน',
      stock: 150, 
      sold: 85, 
      revenue: 12750,
      trend: 'up',
      trendValue: 15
    },
    { 
      id: 2, 
      name: 'กาแฟคาปูชิโน่', 
      category: 'เครื่องดื่มร้อน',
      stock: 120, 
      sold: 72, 
      revenue: 10800,
      trend: 'up',
      trendValue: 8
    },
    { 
      id: 3, 
      name: 'เค้กช็อกโกแลต', 
      category: 'ขนม',
      stock: 25, 
      sold: 18, 
      revenue: 8640,
      trend: 'down',
      trendValue: 5
    },
    { 
      id: 4, 
      name: 'ชาเขียวเย็น', 
      category: 'เครื่องดื่มเย็น',
      stock: 80, 
      sold: 42, 
      revenue: 4620,
      trend: 'up',
      trendValue: 12
    }
  ];

  const lowStockItems = productData.filter(item => item.stock < 30);
  const totalRevenue = productData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSold = productData.reduce((sum, item) => sum + item.sold, 0);

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานสินค้า</h1>
            <p className="text-gray-600">วิเคราะห์ประสิทธิภาพและคงคลังของสินค้า</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                รายได้รวมจากสินค้า
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600">สัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="w-4 h-4 mr-2" />
                สินค้าขายไปแล้ว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSold}</div>
              <p className="text-xs text-blue-600">ชิ้น</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                สินค้าใกล้หมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
              <p className="text-xs text-red-600">รายการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Performance Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ประสิทธิภาพสินค้า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productData.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <Badge variant="outline" className="mt-1">{product.category}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">฿{product.revenue.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        {product.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${product.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {product.trendValue}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">ขายแล้ว</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={(product.sold / (product.sold + product.stock)) * 100} className="flex-1" />
                        <span className="text-sm font-medium">{product.sold} ชิ้น</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">คงเหลือ</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-semibold ${product.stock < 30 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock} ชิ้น
                        </span>
                        {product.stock < 30 && (
                          <Badge variant="destructive" className="text-xs">ใกล้หมด</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                แจ้งเตือนสินค้าใกล้หมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="destructive">{item.stock} ชิ้น</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
};

export default ProductReports;
