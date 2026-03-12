import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Calendar as CalendarIcon } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import { useCurrentShop } from '@/hooks/useCurrentShop';

interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

interface DayOrder {
  id: string;
  order_number: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  member_id?: string;
  member_name?: string;
}

interface SalesCalendarProps {
  initialMonthOffset?: number;
}

export const SalesCalendar = ({ initialMonthOffset = 0 }: SalesCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + initialMonthOffset);
    return date;
  });
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayOrders, setDayOrders] = useState<DayOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const { shopId, loading: shopLoading } = useCurrentShop();

  useEffect(() => {
    if (shopLoading || !shopId) {
      setDailySales([]);
      setLoading(false);
      return;
    }

    fetchMonthlySales();
  }, [currentYear, currentMonth, shopId, shopLoading]);

  const fetchMonthlySales = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .neq('status', 'cancelled');

      if (error) throw error;

      // Group by date
      const salesByDate: { [key: string]: { sales: number; orders: number } } = {};
      
      orders?.forEach((order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!salesByDate[date]) {
          salesByDate[date] = { sales: 0, orders: 0 };
        }
        salesByDate[date].sales += Number(order.total_amount);
        salesByDate[date].orders += 1;
      });

      const salesData: DailySales[] = Object.entries(salesByDate).map(([date, data]) => ({
        date,
        sales: data.sales,
        orders: data.orders,
      }));

      setDailySales(salesData);
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = useMemo(() => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  const getSalesForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dailySales.find(d => d.date === dateStr);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleMonthChange = (month: string) => {
    setCurrentDate(new Date(currentYear, parseInt(month), 1));
  };

  const handleYearChange = (year: string) => {
    setCurrentDate(new Date(parseInt(year), currentMonth, 1));
  };

  // Generate year options (current year ± 5 years)
  const currentYearActual = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYearActual - 5 + i);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const handleDayClick = async (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const salesData = getSalesForDay(day);
    
    if (!salesData || salesData.sales === 0) return;
    
    setSelectedDate(dateStr);
    setLoadingOrders(true);
    
    try {
      const startOfDay = new Date(currentYear, currentMonth, day, 0, 0, 0);
      const endOfDay = new Date(currentYear, currentMonth, day, 23, 59, 59);

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          payment_method,
          created_at,
          member_id,
          members (name)
        `)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithMember = (orders || []).map(order => ({
        ...order,
        member_name: (order as any).members?.name
      }));

      setDayOrders(ordersWithMember);
    } catch (error) {
      console.error('Error fetching day orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const closeDayOrdersModal = () => {
    setSelectedDate(null);
    setDayOrders([]);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'card': return 'บัตรเครดิต';
      case 'mobile_banking': return 'โมบายแบงก์กิ้ง';
      case 'points': return 'แต้ม';
      default: return method;
    }
  };

  const getPaymentBadgeColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'mobile_banking': return 'bg-purple-100 text-purple-800';
      case 'points': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const maxSales = Math.max(...dailySales.map(d => d.sales), 1);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ปฏิทินยอดขาย</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="h-7 text-xs px-3">
              วันนี้
            </Button>
            <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[100px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-xs">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[85px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-xs">
                    {year + 543}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-xs py-1 text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-16 w-full" />;
                }

                const salesData = getSalesForDay(day);
                const hasSales = salesData && salesData.sales > 0;
                const intensity = hasSales ? (salesData.sales / maxSales) * 100 : 0;
                
                return (
                  <div
                    key={day}
                    onClick={() => hasSales && handleDayClick(day)}
                    className={`
                      h-16 w-full rounded border transition-all hover:scale-105 hover:shadow-sm
                      ${isToday(day) ? 'ring-2 ring-primary' : ''}
                      ${hasSales ? 'cursor-pointer' : 'bg-muted/30'}
                    `}
                    style={{
                      backgroundColor: hasSales
                        ? `hsl(var(--primary) / ${Math.max(intensity, 20)}%)`
                        : undefined,
                    }}
                    title={
                      hasSales
                        ? `ยอดขาย: ฿${salesData.sales.toLocaleString()}\nจำนวน: ${salesData.orders} ออเดอร์`
                        : 'ไม่มียอดขาย'
                    }
                  >
                    <div className="h-full flex flex-col items-center justify-center p-1">
                      <span
                        className={`text-xs font-medium ${
                          hasSales ? 'text-primary-foreground' : 'text-muted-foreground'
                        } ${isToday(day) ? 'font-bold' : ''}`}
                      >
                        {day}
                      </span>
                      {hasSales && (
                        <div className="text-center mt-0.5">
                          <div className="text-sm font-bold text-primary-foreground leading-tight">
                            ฿{salesData.sales >= 1000
                              ? `${(salesData.sales / 1000).toFixed(1)}k`
                              : salesData.sales.toFixed(0)}
                          </div>
                          <div className="text-xs text-primary-foreground/90 font-medium leading-tight">
                            {salesData.orders}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-2 mt-2 border-t">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-muted/30 border"></div>
                <span className="text-xs text-muted-foreground">ไม่มียอดขาย</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: 'hsl(var(--primary) / 30%)' }}
                ></div>
                <span className="text-xs text-muted-foreground">ยอดขายต่ำ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: 'hsl(var(--primary) / 100%)' }}
                ></div>
                <span className="text-xs text-muted-foreground">ยอดขายสูง</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Day Orders Modal */}
      <Dialog open={selectedDate !== null} onOpenChange={closeDayOrdersModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              รายการบิลวันที่ {selectedDate && new Date(selectedDate).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>

          {loadingOrders ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {dayOrders.length > 0 ? (
                <>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">จำนวนบิล:</span>
                        <span className="ml-2 font-semibold">{dayOrders.length} บิล</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ยอดรวม:</span>
                        <span className="ml-2 font-semibold">
                          ฿{dayOrders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ค่าเฉลี่ย:</span>
                        <span className="ml-2 font-semibold">
                          ฿{(dayOrders.reduce((sum, order) => sum + order.total_amount, 0) / dayOrders.length).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {dayOrders.map((order) => (
                    <Card
                      key={order.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Receipt className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <div className="font-semibold">{order.order_number}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleTimeString('th-TH', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {order.member_name && (
                                  <span className="ml-2">• {order.member_name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              ฿{order.total_amount.toLocaleString()}
                            </div>
                            <Badge className={getPaymentBadgeColor(order.payment_method)}>
                              {getPaymentMethodText(order.payment_method)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  ไม่พบรายการบิล
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
      />
    </Card>
  );
};
