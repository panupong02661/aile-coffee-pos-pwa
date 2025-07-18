
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import OrderFilters from '@/components/orders/OrderFilters';
import OrdersList from '@/components/orders/OrdersList';
import OrderDetailModal from '@/components/orders/OrderDetailModal';
import SoundSettingsModal from '@/components/orders/SoundSettingsModal';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export interface OnlineOrder {
  id: string;
  order_number: string;
  member_id: string;
  total_amount: number;
  items_count: number;
  payment_method: string;
  created_at: string;
  customer_notes?: string;
  order_items?: Array<{
    menu_item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    order_addons?: Array<{
      addon_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  }>;
  members?: {
    name: string;
    phone: string;
  };
}

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_year' | 'all' | 'custom';

const OnlineOrderManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return {
          start: today.toISOString(),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday.toISOString(),
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start: weekStart.toISOString(),
          end: now.toISOString()
        };
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          start: monthStart.toISOString(),
          end: now.toISOString()
        };
      case 'this_year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return {
          start: yearStart.toISOString(),
          end: now.toISOString()
        };
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate).toISOString(),
            end: new Date(customEndDate + 'T23:59:59').toISOString()
          };
        }
        return null;
      default:
        return null;
    }
  };

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['online-orders', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          members (
            name,
            phone
          ),
          order_items (
            menu_item_name,
            quantity,
            unit_price,
            total_price,
            order_addons (
              addon_name,
              quantity,
              unit_price,
              total_price
            )
          )
        `)
        .eq('order_source', 'online')
        .order('created_at', { ascending: false });

      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OnlineOrder[];
    },
    refetchInterval: 2000,
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleViewOrderDetail = (order: OnlineOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const ordersCount = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="h-screen bg-cream-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="p-4">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">จัดการออเดอร์ออนไลน์</h1>
            <Button
              onClick={() => setIsSoundSettingsOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              ตั้งค่าเสียงแจ้งเตือน
            </Button>
          </div>

          <OrderFilters
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
            ordersCount={ordersCount}
            totalAmount={totalAmount}
          />

          <OrdersList
            orders={orders}
            ordersLoading={ordersLoading}
            onViewOrderDetail={handleViewOrderDetail}
            dateFilter={dateFilter}
          />
        </div>
      </div>

      <OrderDetailModal
        selectedOrder={selectedOrder}
        isOpen={isOrderDetailOpen}
        onClose={() => setIsOrderDetailOpen(false)}
      />

      <SoundSettingsModal
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
      />
    </div>
  );
};

export default OnlineOrderManagement;
