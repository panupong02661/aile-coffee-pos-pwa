
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_year' | 'all' | 'custom';

interface OrderFiltersProps {
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  ordersCount: number;
  totalAmount: number;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  ordersCount,
  totalAmount
}) => {
  const getDateFilterText = () => {
    switch (dateFilter) {
      case 'today': return 'วันนี้';
      case 'yesterday': return 'เมื่อวาน';
      case 'this_week': return 'สัปดาห์นี้';
      case 'this_month': return 'เดือนนี้';
      case 'this_year': return 'ปีนี้';
      case 'custom': return 'กำหนดเอง';
      default: return 'ทั้งหมด';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          ตัวกรองแสดงผล
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1">
            <Label htmlFor="date-filter">ช่วงเวลา</Label>
            <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="yesterday">เมื่อวาน</SelectItem>
                <SelectItem value="this_week">สัปดาห์นี้</SelectItem>
                <SelectItem value="this_month">เดือนนี้</SelectItem>
                <SelectItem value="this_year">ปีนี้</SelectItem>
                <SelectItem value="custom">กำหนดเอง</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilter === 'custom' && (
            <>
              <div>
                <Label htmlFor="start-date">วันที่เริ่มต้น</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">วันที่สิ้นสุด</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div className="font-medium mb-1">สรุป: {getDateFilterText()}</div>
            <div className="flex gap-4">
              <span>{ordersCount} ออเดอร์</span>
              <span>฿{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderFilters;
