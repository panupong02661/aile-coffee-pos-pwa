import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

export const SalesCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    fetchMonthlySales();
  }, [currentYear, currentMonth]);

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

  const maxSales = Math.max(...dailySales.map(d => d.sales), 1);

  return (
    <Card className="max-w-2xl">
      <CardHeader className="pb-1 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs">ปฏิทินยอดขาย</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToToday} className="h-5 text-[9px] px-1.5">
              วันนี้
            </Button>
            <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[70px] h-5 text-[9px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-[9px]">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[60px] h-5 text-[9px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-[9px]">
                    {year + 543}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 px-3">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-[8px] py-0.5 text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const salesData = getSalesForDay(day);
                const hasSales = salesData && salesData.sales > 0;
                const intensity = hasSales ? (salesData.sales / maxSales) * 100 : 0;
                
                return (
                  <div
                    key={day}
                    className={`
                      h-12 w-full rounded border transition-all hover:scale-105 hover:shadow-sm
                      ${isToday(day) ? 'ring-1 ring-primary' : ''}
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
                    <div className="h-full flex flex-col items-center justify-center p-0.5">
                      <span
                        className={`text-[10px] font-medium ${
                          hasSales ? 'text-primary-foreground' : 'text-muted-foreground'
                        } ${isToday(day) ? 'font-bold' : ''}`}
                      >
                        {day}
                      </span>
                      {hasSales && (
                        <div className="text-center">
                          <div className="text-xs font-bold text-primary-foreground leading-tight">
                            ฿{salesData.sales >= 1000
                              ? `${(salesData.sales / 1000).toFixed(1)}k`
                              : salesData.sales.toFixed(0)}
                          </div>
                          <div className="text-[9px] text-primary-foreground/90 font-medium leading-tight">
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
            <div className="flex items-center justify-center gap-1.5 pt-1 mt-1 border-t">
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded bg-muted/30 border"></div>
                <span className="text-[8px] text-muted-foreground">ไม่มียอดขาย</span>
              </div>
              <div className="flex items-center gap-0.5">
                <div
                  className="w-2 h-2 rounded border"
                  style={{ backgroundColor: 'hsl(var(--primary) / 30%)' }}
                ></div>
                <span className="text-[8px] text-muted-foreground">ยอดขายต่ำ</span>
              </div>
              <div className="flex items-center gap-0.5">
                <div
                  className="w-2 h-2 rounded border"
                  style={{ backgroundColor: 'hsl(var(--primary) / 100%)' }}
                ></div>
                <span className="text-[8px] text-muted-foreground">ยอดขายสูง</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
