
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface ProductSalesData {
  menu_item_name: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}

const ProductReportTable = () => {
  const [productData, setProductData] = useState<ProductSalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            menu_item_name,
            quantity,
            total_price,
            order_id
          `);

        if (error) throw error;

        // Group and aggregate data by menu item
        const groupedData = data?.reduce((acc: { [key: string]: ProductSalesData }, item) => {
          const name = item.menu_item_name;
          if (!acc[name]) {
            acc[name] = {
              menu_item_name: name,
              total_quantity: 0,
              total_revenue: 0,
              order_count: 0
            };
          }
          acc[name].total_quantity += item.quantity;
          acc[name].total_revenue += Number(item.total_price);
          acc[name].order_count += 1;
          return acc;
        }, {});

        const sortedData = Object.values(groupedData || {})
          .sort((a, b) => b.total_revenue - a.total_revenue);

        setProductData(sortedData);
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายงานสินค้าขายดี</CardTitle>
        <CardDescription>แสดงสินค้าที่ขายดีที่สุดเรียงตามยอดขาย</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>อันดับ</TableHead>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>จำนวนที่ขาย</TableHead>
              <TableHead>ยอดขายรวม</TableHead>
              <TableHead>จำนวนออเดอร์</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productData.map((item, index) => (
              <TableRow key={item.menu_item_name}>
                <TableCell className="font-medium">#{index + 1}</TableCell>
                <TableCell>{item.menu_item_name}</TableCell>
                <TableCell>{item.total_quantity}</TableCell>
                <TableCell>฿{item.total_revenue.toLocaleString()}</TableCell>
                <TableCell>{item.order_count}</TableCell>
                <TableCell>
                  <Badge variant={index < 5 ? "default" : "secondary"}>
                    {index < 5 ? "ขายดี" : "ขายปกติ"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductReportTable;
