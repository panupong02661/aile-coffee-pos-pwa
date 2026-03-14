import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Props {
  dashboardStats: any;
  monthlyData: any[];
  menuItems: any[];
  calculateMenuItemCost: (id: string) => number;
}

const ProfitLossReport = ({ dashboardStats, monthlyData, menuItems, calculateMenuItemCost }: Props) => {
  const { toast } = useToast();

  // Calculate estimated profit from top products
  const totalRevenue = dashboardStats.monthSales || 0;
  const totalDiscount = dashboardStats.monthDiscount || 0;
  const netSales = totalRevenue - totalDiscount;

  // Estimate cost from top products (60% average if no recipe data)
  const estimatedCostRatio = menuItems.length > 0
    ? menuItems.reduce((sum, item) => {
        const cost = calculateMenuItemCost(item.id);
        return sum + (cost > 0 ? cost / item.price : 0.4);
      }, 0) / menuItems.length
    : 0.4;

  const estimatedCost = Math.round(netSales * estimatedCostRatio);
  const grossProfit = netSales - estimatedCost;
  const grossMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

  // Monthly profit data for chart
  const profitData = monthlyData.map(m => ({
    ...m,
    estimated_cost: Math.round(m.net_sales * estimatedCostRatio),
    profit: Math.round(m.net_sales * (1 - estimatedCostRatio)),
  }));

  const downloadProfitReport = () => {
    if (profitData.length === 0) {
      toast({ title: 'ไม่มีข้อมูล', variant: 'destructive' });
      return;
    }
    try {
      const ws = XLSX.utils.json_to_sheet(
        profitData.map(item => ({
          'เดือน': item.month,
          'ยอดขายรวม': item.sales,
          'ส่วนลด': item.discount,
          'ยอดขายสุทธิ': item.net_sales,
          'ต้นทุนโดยประมาณ': item.estimated_cost,
          'กำไรโดยประมาณ': item.profit,
          'จำนวนบิล': item.orders,
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'กำไร-ขาดทุน');
      XLSX.writeFile(wb, `รายงานกำไรขาดทุน_${new Date().toLocaleDateString('th-TH')}.xlsx`);
      toast({ title: 'ดาวน์โหลดสำเร็จ' });
    } catch (error: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">ยอดขายสุทธิ (เดือนนี้)</span>
            </div>
            <p className="text-2xl font-bold">฿{netSales.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">ต้นทุนโดยประมาณ</span>
            </div>
            <p className="text-2xl font-bold text-destructive">฿{estimatedCost.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              {grossProfit >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
              <span className="text-sm text-muted-foreground">กำไรขั้นต้น</span>
            </div>
            <p className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              ฿{grossProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">อัตรากำไร</span>
            </div>
            <p className={`text-2xl font-bold ${grossMargin >= 50 ? 'text-green-600' : grossMargin >= 30 ? 'text-yellow-600' : 'text-destructive'}`}>
              {grossMargin.toFixed(1)}%
            </p>
            <Badge variant={grossMargin >= 50 ? 'default' : grossMargin >= 30 ? 'secondary' : 'destructive'} className="mt-1">
              {grossMargin >= 50 ? 'ดีมาก' : grossMargin >= 30 ? 'ปกติ' : 'ต่ำ'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Monthly P&L table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>รายงานกำไร-ขาดทุนรายเดือน</CardTitle>
            <CardDescription>ต้นทุนประมาณจากสูตรอาหาร (Recipe) ที่ตั้งไว้</CardDescription>
          </div>
          <Button onClick={downloadProfitReport} variant="outline" size="sm" disabled={profitData.length === 0}>
            <Download className="w-4 h-4 mr-1" /> ส่งออก Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">เดือน</th>
                  <th className="text-right py-2 px-3">ยอดขายรวม</th>
                  <th className="text-right py-2 px-3">ส่วนลด</th>
                  <th className="text-right py-2 px-3">ยอดสุทธิ</th>
                  <th className="text-right py-2 px-3">ต้นทุน</th>
                  <th className="text-right py-2 px-3">กำไร</th>
                  <th className="text-right py-2 px-3">บิล</th>
                </tr>
              </thead>
              <tbody>
                {profitData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล</td></tr>
                ) : (
                  profitData.map(row => (
                    <tr key={row.month} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-medium">{row.month}</td>
                      <td className="text-right py-2 px-3">฿{row.sales.toLocaleString()}</td>
                      <td className="text-right py-2 px-3 text-destructive">฿{row.discount.toLocaleString()}</td>
                      <td className="text-right py-2 px-3">฿{row.net_sales.toLocaleString()}</td>
                      <td className="text-right py-2 px-3 text-destructive">฿{row.estimated_cost.toLocaleString()}</td>
                      <td className={`text-right py-2 px-3 font-medium ${row.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        ฿{row.profit.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-3">{row.orders}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {profitData.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="py-2 px-3">รวม</td>
                    <td className="text-right py-2 px-3">฿{profitData.reduce((s, r) => s + r.sales, 0).toLocaleString()}</td>
                    <td className="text-right py-2 px-3 text-destructive">฿{profitData.reduce((s, r) => s + r.discount, 0).toLocaleString()}</td>
                    <td className="text-right py-2 px-3">฿{profitData.reduce((s, r) => s + r.net_sales, 0).toLocaleString()}</td>
                    <td className="text-right py-2 px-3 text-destructive">฿{profitData.reduce((s, r) => s + r.estimated_cost, 0).toLocaleString()}</td>
                    <td className="text-right py-2 px-3 text-green-600">฿{profitData.reduce((s, r) => s + r.profit, 0).toLocaleString()}</td>
                    <td className="text-right py-2 px-3">{profitData.reduce((s, r) => s + r.orders, 0)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLossReport;
