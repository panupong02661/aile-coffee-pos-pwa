
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuCostReport {
  id: string;
  name: string;
  category_name: string;
  price: number;
  cost_price: number;
  total_cost: number;
  profit: number;
  profit_margin: number;
}

const InventoryReports = () => {
  const [menuCostReports, setMenuCostReports] = useState<MenuCostReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuCostReports();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuCostReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          price,
          cost_price,
          categories (
            name
          )
        `);

      if (error) throw error;

      const reports: MenuCostReport[] = [];
      
      for (const item of data || []) {
        // Calculate total cost using the menu ingredients
        const { data: costData } = await supabase
          .rpc('calculate_menu_cost', { menu_id: item.id });
        
        const totalCost = costData || item.cost_price || 0;
        const profit = item.price - totalCost;
        const profitMargin = item.price > 0 ? (profit / item.price) * 100 : 0;

        reports.push({
          id: item.id,
          name: item.name,
          category_name: item.categories?.name || 'ไม่มีหมวดหมู่',
          price: item.price,
          cost_price: item.cost_price,
          total_cost: totalCost,
          profit: profit,
          profit_margin: profitMargin
        });
      }

      setMenuCostReports(reports);
    } catch (error) {
      console.error('Error fetching menu cost reports:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: 'ไม่สามารถโหลดรายงานต้นทุนได้', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = menuCostReports.filter(report => {
    if (selectedCategory === 'all') return true;
    return report.category_name === selectedCategory;
  });

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 50) return 'bg-green-100 text-green-800';
    if (margin >= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const totalRevenue = filteredReports.reduce((sum, report) => sum + report.price, 0);
  const totalCost = filteredReports.reduce((sum, report) => sum + report.total_cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">มูลค่าสินค้าทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">฿{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{filteredReports.length} รายการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ต้นทุนรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">฿{totalCost.toLocaleString()}</div>
            <p className="text-xs text-gray-500">จากการคำนวณ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">กำไรคาดการณ์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">฿{totalProfit.toLocaleString()}</div>
            <p className="text-xs text-gray-500">จากการขาย 1 รอบ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profit Margin เฉลี่ย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgProfitMargin.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">อัตรากำไรเฉลี่ย</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>สรุปต้นทุนและกำไรแต่ละเมนู</CardTitle>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อเมนู</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">ราคาขาย</TableHead>
                <TableHead className="text-right">ต้นทุน</TableHead>
                <TableHead className="text-right">กำไร</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.category_name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">฿{report.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">฿{report.total_cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={report.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ฿{report.profit.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={getProfitMarginColor(report.profit_margin)}>
                      {report.profit_margin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;
