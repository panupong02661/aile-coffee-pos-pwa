import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const maxSales = Math.max(...dailySales.map(d => d.sales), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">ปฏิทินยอดขาย</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              วันนี้
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[160px] text-center">
              {monthNames[currentMonth]} {currentYear + 543}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm py-2 text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
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
                      aspect-square rounded-lg border transition-all hover:scale-105 hover:shadow-md
                      ${isToday(day) ? 'ring-2 ring-primary ring-offset-2' : ''}
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
                        className={`text-sm font-medium ${
                          hasSales ? 'text-primary-foreground' : 'text-muted-foreground'
                        } ${isToday(day) ? 'font-bold' : ''}`}
                      >
                        {day}
                      </span>
                      {hasSales && (
                        <div className="text-center mt-0.5">
                          <div className="text-[10px] font-bold text-primary-foreground leading-tight">
                            ฿{salesData.sales >= 1000
                              ? `${(salesData.sales / 1000).toFixed(1)}k`
                              : salesData.sales.toFixed(0)}
                          </div>
                          <div className="text-[9px] text-primary-foreground/80">
                            {salesData.orders} ออเดอร์
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/30 border"></div>
                <span className="text-xs text-muted-foreground">ไม่มียอดขาย</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: 'hsl(var(--primary) / 30%)' }}
                ></div>
                <span className="text-xs text-muted-foreground">ยอดขายต่ำ</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: 'hsl(var(--primary) / 100%)' }}
                ></div>
                <span className="text-xs text-muted-foreground">ยอดขายสูง</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
