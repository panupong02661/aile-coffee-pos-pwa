import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Loader2, Search, FileSpreadsheet } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface OrderItem {
  id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_discount: number;
  item_discount_type: string;
  selected_addons: any[];
}

interface DetailedOrder {
  id: string;
  order_number: string;
  created_at: string;
  payment_method: string;
  status: string | null;
  total_amount: number;
  bill_discount: number | null;
  bill_discount_type: string | null;
  member_id: string | null;
  member_name: string | null;
  member_phone: string | null;
  order_items: OrderItem[];
}

const DetailedOrderReport = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [quickSelect, setQuickSelect] = useState<string>('today');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const handleQuickSelect = (value: string) => {
    setQuickSelect(value);
    const today = new Date();
    
    switch (value) {
      case 'today':
        setDateRange({ from: startOfDay(today), to: endOfDay(today) });
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({ from: startOfDay(yesterday), to: endOfDay(yesterday) });
        break;
      case 'last7days':
        setDateRange({ from: startOfDay(subDays(today, 6)), to: endOfDay(today) });
        break;
      case 'last30days':
        setDateRange({ from: startOfDay(subDays(today, 29)), to: endOfDay(today) });
        break;
      case 'thisMonth':
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      default:
        break;
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          payment_method,
          status,
          total_amount,
          bill_discount,
          bill_discount_type,
          member_id
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch order items for each order
      const orderIds = ordersData.map(o => o.id);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Fetch member info
      const memberIds = ordersData.filter(o => o.member_id).map(o => o.member_id) as string[];
      let membersData: any[] = [];
      if (memberIds.length > 0) {
        const { data } = await supabase
          .from('members')
          .select('id, name, phone')
          .in('id', memberIds);
        membersData = data || [];
      }

      // Combine data
      const detailedOrders: DetailedOrder[] = ordersData.map(order => {
        const member = membersData.find(m => m.id === order.member_id);
        const items = itemsData?.filter(i => i.order_id === order.id) || [];
        
        return {
          id: order.id,
          order_number: order.order_number,
          created_at: order.created_at,
          payment_method: order.payment_method,
          status: order.status,
          total_amount: Number(order.total_amount),
          bill_discount: order.bill_discount,
          bill_discount_type: order.bill_discount_type,
          member_id: order.member_id,
          member_name: member?.name || null,
          member_phone: member?.phone || null,
          order_items: items.map(item => ({
            id: item.id,
            menu_item_name: item.menu_item_name,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total_price: Number(item.total_price),
            item_discount: Number(item.item_discount || 0),
            item_discount_type: item.item_discount_type || 'amount',
            selected_addons: Array.isArray(item.selected_addons) ? item.selected_addons : [],
          })),
        };
      });

      setOrders(detailedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลรายงานได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const toggleOrderExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      cash: 'เงินสด',
      card: 'บัตรเครดิต',
      promptpay: 'พร้อมเพย์',
      transfer: 'โอนเงิน',
      credit: 'เครดิต',
    };
    return methods[method] || method;
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      completed: { label: 'สำเร็จ', variant: 'default' },
      pending: { label: 'รอดำเนินการ', variant: 'secondary' },
      cancelled: { label: 'ยกเลิก', variant: 'destructive' },
    };
    const config = statusConfig[status || ''] || { label: status || '-', variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatAddons = (addons: any[]) => {
    if (!addons || addons.length === 0) return '-';
    return addons.map(addon => `${addon.name || addon.addon_name} (+${addon.price || addon.addon_price}฿)`).join(', ');
  };

  const exportToExcel = () => {
    try {
      const exportData: any[] = [];

      orders.forEach(order => {
        order.order_items.forEach((item, index) => {
          exportData.push({
            'เลขออเดอร์': order.order_number,
            'วันที่สั่ง': format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: th }),
            'วิธีการชำระเงิน': getPaymentMethodText(order.payment_method),
            'สถานะ': order.status === 'completed' ? 'สำเร็จ' : order.status === 'pending' ? 'รอดำเนินการ' : order.status === 'cancelled' ? 'ยกเลิก' : order.status,
            'ลำดับสินค้า': index + 1,
            'ชื่อสินค้า': item.menu_item_name,
            'จำนวน': item.quantity,
            'ราคาต่อหน่วย': item.unit_price,
            'ส่วนลดสินค้า': item.item_discount,
            'ประเภทส่วนลดสินค้า': item.item_discount_type === 'percentage' ? '%' : 'บาท',
            'Add-on': formatAddons(item.selected_addons),
            'ราคารวม': item.total_price,
            'ชื่อลูกค้า': order.member_name || '-',
            'เบอร์โทรลูกค้า': order.member_phone || '-',
            'ส่วนลดบิล': order.bill_discount || 0,
            'ประเภทส่วนลดบิล': order.bill_discount_type === 'percentage' ? '%' : 'บาท',
            'ยอดรวมออเดอร์': order.total_amount,
          });
        });

        if (order.order_items.length === 0) {
          exportData.push({
            'เลขออเดอร์': order.order_number,
            'วันที่สั่ง': format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: th }),
            'วิธีการชำระเงิน': getPaymentMethodText(order.payment_method),
            'สถานะ': order.status === 'completed' ? 'สำเร็จ' : order.status === 'pending' ? 'รอดำเนินการ' : order.status === 'cancelled' ? 'ยกเลิก' : order.status,
            'ลำดับสินค้า': '-',
            'ชื่อสินค้า': '-',
            'จำนวน': '-',
            'ราคาต่อหน่วย': '-',
            'ส่วนลดสินค้า': '-',
            'ประเภทส่วนลดสินค้า': '-',
            'Add-on': '-',
            'ราคารวม': '-',
            'ชื่อลูกค้า': order.member_name || '-',
            'เบอร์โทรลูกค้า': order.member_phone || '-',
            'ส่วนลดบิล': order.bill_discount || 0,
            'ประเภทส่วนลดบิล': order.bill_discount_type === 'percentage' ? '%' : 'บาท',
            'ยอดรวมออเดอร์': order.total_amount,
          });
        }
      });

      if (exportData.length === 0) {
        toast({
          title: 'ไม่มีข้อมูล',
          description: 'ไม่พบข้อมูลที่จะส่งออก',
          variant: 'destructive',
        });
        return;
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'รายงานละเอียด');

      const maxWidth = 30;
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String(row[key] || '').length))),
      }));
      ws['!cols'] = colWidths;

      const filename = `รายงานละเอียด_${format(dateRange.from, 'dd-MM-yyyy')}_ถึง_${format(dateRange.to, 'dd-MM-yyyy')}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast({
        title: 'ส่งออกสำเร็จ',
        description: `ดาวน์โหลดไฟล์ ${filename} เรียบร้อยแล้ว`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งออกรายงานได้',
        variant: 'destructive',
      });
    }
  };

  const summary = {
    totalOrders: orders.length,
    totalAmount: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
    totalDiscount: orders.reduce((sum, o) => sum + Number(o.bill_discount || 0), 0),
    totalItems: orders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.quantity, 0), 0),
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            เลือกช่วงเวลา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">เลือกด่วน</label>
              <Select value={quickSelect} onValueChange={handleQuickSelect}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">วันนี้</SelectItem>
                  <SelectItem value="yesterday">เมื่อวาน</SelectItem>
                  <SelectItem value="last7days">7 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="last30days">30 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="thisMonth">เดือนนี้</SelectItem>
                  <SelectItem value="lastMonth">เดือนที่แล้ว</SelectItem>
                  <SelectItem value="custom">กำหนดเอง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">วันที่เริ่มต้น</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, 'dd MMM yyyy', { locale: th })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange(prev => ({ ...prev, from: startOfDay(date) }));
                        setQuickSelect('custom');
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">วันที่สิ้นสุด</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.to, 'dd MMM yyyy', { locale: th })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => {
                      if (date) {
                        setDateRange(prev => ({ ...prev, to: endOfDay(date) }));
                        setQuickSelect('custom');
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={fetchOrders} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              ค้นหา
            </Button>

            <Button onClick={exportToExcel} variant="default" className="bg-green-600 hover:bg-green-700">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              ดาวน์โหลด Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{summary.totalOrders}</div>
            <p className="text-sm text-muted-foreground">จำนวนออเดอร์</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">฿{summary.totalAmount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">ยอดขายรวม</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">฿{summary.totalDiscount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">ส่วนลดรวม</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{summary.totalItems}</div>
            <p className="text-sm text-muted-foreground">จำนวนสินค้า</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการออเดอร์ ({orders.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบข้อมูลออเดอร์ในช่วงเวลาที่เลือก
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">เลขออเดอร์</TableHead>
                    <TableHead className="w-[150px]">วันที่สั่ง</TableHead>
                    <TableHead>วิธีชำระเงิน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead className="text-right">ส่วนลด</TableHead>
                    <TableHead className="text-right">ยอดรวม</TableHead>
                    <TableHead className="w-[100px]">รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <>
                      <TableRow 
                        key={order.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{format(new Date(order.created_at), 'dd/MM/yy HH:mm', { locale: th })}</TableCell>
                        <TableCell>{getPaymentMethodText(order.payment_method)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.member_name ? (
                            <div>
                              <div className="font-medium">{order.member_name}</div>
                              <div className="text-xs text-muted-foreground">{order.member_phone}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-orange-600">
                          {order.bill_discount ? `฿${Number(order.bill_discount).toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold">฿{Number(order.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            {expandedOrders.has(order.id) ? 'ซ่อน' : 'ดู'} ({order.order_items.length})
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {expandedOrders.has(order.id) && (
                        <TableRow key={`${order.id}-items`}>
                          <TableCell colSpan={8} className="bg-muted/30 p-0">
                            <div className="p-4">
                              <h4 className="font-semibold mb-2">รายการสินค้า</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>ชื่อสินค้า</TableHead>
                                    <TableHead>Add-on</TableHead>
                                    <TableHead className="text-center">จำนวน</TableHead>
                                    <TableHead className="text-right">ราคา/หน่วย</TableHead>
                                    <TableHead className="text-right">ส่วนลด</TableHead>
                                    <TableHead className="text-right">ราคารวม</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.order_items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">{item.menu_item_name}</TableCell>
                                      <TableCell className="text-sm">{formatAddons(item.selected_addons)}</TableCell>
                                      <TableCell className="text-center">{item.quantity}</TableCell>
                                      <TableCell className="text-right">฿{item.unit_price.toLocaleString()}</TableCell>
                                      <TableCell className="text-right text-orange-600">
                                        {item.item_discount > 0 
                                          ? `${item.item_discount}${item.item_discount_type === 'percentage' ? '%' : '฿'}` 
                                          : '-'}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">฿{item.total_price.toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedOrderReport;
