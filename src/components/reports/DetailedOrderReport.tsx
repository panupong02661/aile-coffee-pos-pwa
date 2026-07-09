import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Loader2, Search, FileSpreadsheet, ChevronDown, ChevronRight } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import * as XLSX from 'xlsx';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface OrderItem {
  id: string;
  menu_item_id: string | null;
  menu_item_name: string;
  category_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_discount: number;
  item_discount_type: string;
  selected_addons: any[];
  cost_price: number;
  ingredients: Ingredient[];
  item_profit: number;
  item_profit_margin: number;
}

interface PointTransaction {
  points_change: number;
  transaction_type: string;
  description: string;
}

interface PromotionClaim {
  promotion_title: string;
  promo_code: string | null;
  discount_type: string;
  discount_value: number;
}

interface MemberInfo {
  id: string;
  name: string;
  phone: string;
  tier: string;
  total_spent: number;
  birth_date: string | null;
  order_count: number;
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
  order_type: string;
  order_source: string | null;
  member_id: string | null;
  member_info: MemberInfo | null;
  order_items: OrderItem[];
  points_redeemed: number;
  points_earned: number;
  promotion_claims: PromotionClaim[];
  total_cost: number;
  profit: number;
  profit_margin: number;
  time_period: string;
  category_breakdown: { [key: string]: number };
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

  const getTimePeriod = (dateStr: string) => {
    const hour = new Date(dateStr).getHours();
    if (hour >= 6 && hour < 12) return 'เช้า (06:00-12:00)';
    if (hour >= 12 && hour < 17) return 'กลางวัน (12:00-17:00)';
    if (hour >= 17 && hour < 21) return 'เย็น (17:00-21:00)';
    return 'ดึก (21:00-06:00)';
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders with order_type and order_source
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
          order_type,
          order_source,
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

      const orderIds = ordersData.map(o => o.id);
      const orderNumbers = ordersData.map(o => o.order_number);
      
      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Get unique menu_item_ids for cost, category and ingredients
      const menuItemIds = [...new Set((itemsData || []).filter(i => i.menu_item_id).map(i => i.menu_item_id))] as string[];
      
      // Fetch menu items for cost_price and category
      let menuItemsData: any[] = [];
      if (menuItemIds.length > 0) {
        const { data } = await supabase
          .from('menu_items')
          .select(`
            id, 
            cost_price,
            category_id,
            categories (
              id,
              name
            )
          `)
          .in('id', menuItemIds);
        menuItemsData = data || [];
      }

      // Fetch menu ingredients
      let menuIngredientsData: any[] = [];
      if (menuItemIds.length > 0) {
        const { data } = await supabase
          .from('menu_ingredients')
          .select(`
            menu_item_id,
            quantity_needed,
            ingredients (
              id,
              name,
              unit,
              cost_per_unit
            )
          `)
          .in('menu_item_id', menuItemIds);
        menuIngredientsData = data || [];
      }

      // Fetch member info with tier, total_spent, birth_date
      const memberIds = ordersData.filter(o => o.member_id).map(o => o.member_id) as string[];
      let membersData: any[] = [];
      if (memberIds.length > 0) {
        const { data } = await supabase
          .from('members')
          .select('id, name, phone, tier, total_spent, birth_date')
          .in('id', memberIds);
        membersData = data || [];
      }

      // Count order frequency for each member
      let memberOrderCounts: { [key: string]: number } = {};
      if (memberIds.length > 0) {
        const { data: countData } = await supabase
          .from('orders')
          .select('member_id')
          .in('member_id', memberIds);
        
        (countData || []).forEach(o => {
          if (o.member_id) {
            memberOrderCounts[o.member_id] = (memberOrderCounts[o.member_id] || 0) + 1;
          }
        });
      }

      // Fetch point transactions for these orders
      let pointTransactionsData: any[] = [];
      if (orderNumbers.length > 0) {
        const { data } = await supabase
          .from('point_transactions')
          .select('*')
          .in('order_id', orderNumbers);
        pointTransactionsData = data || [];
      }

      // Fetch promotion claims for members who ordered
      let promotionClaimsData: any[] = [];
      if (memberIds.length > 0) {
        const { data } = await supabase
          .from('customer_promotion_claims')
          .select(`
            customer_id,
            order_id,
            limited_promotions (
              title,
              promo_code,
              discount_type,
              discount_value
            )
          `)
          .in('customer_id', memberIds)
          .eq('is_used', true);
        promotionClaimsData = data || [];
      }

      // Build detailed orders
      const detailedOrders: DetailedOrder[] = ordersData.map(order => {
        const member = membersData.find(m => m.id === order.member_id);
        const items = itemsData?.filter(i => i.order_id === order.id) || [];
        
        // Calculate points
        const orderPointTx = pointTransactionsData.filter(pt => pt.order_id === order.order_number);
        const pointsRedeemed = orderPointTx
          .filter(pt => pt.transaction_type === 'redeem' || pt.points_change < 0)
          .reduce((sum, pt) => sum + Math.abs(pt.points_change), 0);
        const pointsEarned = orderPointTx
          .filter(pt => pt.transaction_type === 'earn' && pt.points_change > 0)
          .reduce((sum, pt) => sum + pt.points_change, 0);

        // Get promotion claims for this order
        const orderPromotions = promotionClaimsData
          .filter(pc => pc.order_id === order.id && pc.limited_promotions)
          .map(pc => ({
            promotion_title: pc.limited_promotions.title,
            promo_code: pc.limited_promotions.promo_code,
            discount_type: pc.limited_promotions.discount_type,
            discount_value: pc.limited_promotions.discount_value,
          }));

        // Build category breakdown for the order
        const categoryBreakdown: { [key: string]: number } = {};

        // Build items with cost, category and ingredients
        const orderItems: OrderItem[] = items.map(item => {
          const menuItem = menuItemsData.find(m => m.id === item.menu_item_id);
          const categoryName = menuItem?.categories?.name || 'ไม่ระบุหมวดหมู่';
          const itemIngredients = menuIngredientsData
            .filter(mi => mi.menu_item_id === item.menu_item_id && mi.ingredients)
            .map(mi => ({
              name: mi.ingredients.name,
              quantity: mi.quantity_needed * item.quantity,
              unit: mi.ingredients.unit,
              cost: mi.quantity_needed * mi.ingredients.cost_per_unit * item.quantity,
            }));

          const costPrice = menuItem?.cost_price ? Number(menuItem.cost_price) * item.quantity : 0;
          const itemProfit = Number(item.total_price) - costPrice;
          const itemProfitMargin = Number(item.total_price) > 0 ? (itemProfit / Number(item.total_price)) * 100 : 0;

          // Add to category breakdown
          categoryBreakdown[categoryName] = (categoryBreakdown[categoryName] || 0) + Number(item.total_price);

          return {
            id: item.id,
            menu_item_id: item.menu_item_id,
            menu_item_name: item.menu_item_name,
            category_name: categoryName,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total_price: Number(item.total_price),
            item_discount: Number(item.item_discount || 0),
            item_discount_type: item.item_discount_type || 'amount',
            selected_addons: Array.isArray(item.selected_addons) ? item.selected_addons : [],
            cost_price: costPrice,
            ingredients: itemIngredients,
            item_profit: itemProfit,
            item_profit_margin: itemProfitMargin,
          };
        });

        const totalCost = orderItems.reduce((sum, item) => sum + item.cost_price, 0);
        const profit = Number(order.total_amount) - totalCost;
        const profitMargin = Number(order.total_amount) > 0 ? (profit / Number(order.total_amount)) * 100 : 0;

        // Build member info
        const memberInfo: MemberInfo | null = member ? {
          id: member.id,
          name: member.name,
          phone: member.phone,
          tier: member.tier || 'bronze',
          total_spent: Number(member.total_spent) || 0,
          birth_date: member.birth_date,
          order_count: memberOrderCounts[member.id] || 1,
        } : null;

        return {
          id: order.id,
          order_number: order.order_number,
          created_at: order.created_at,
          payment_method: order.payment_method,
          status: order.status,
          total_amount: Number(order.total_amount),
          bill_discount: order.bill_discount,
          bill_discount_type: order.bill_discount_type,
          order_type: order.order_type || 'dine-in',
          order_source: order.order_source,
          member_id: order.member_id,
          member_info: memberInfo,
          order_items: orderItems,
          points_redeemed: pointsRedeemed,
          points_earned: pointsEarned,
          promotion_claims: orderPromotions,
          total_cost: totalCost,
          profit: profit,
          profit_margin: profitMargin,
          time_period: getTimePeriod(order.created_at),
          category_breakdown: categoryBreakdown,
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
      points: 'แลกแต้ม',
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

  const formatIngredients = (ingredients: Ingredient[]) => {
    if (!ingredients || ingredients.length === 0) return '-';
    return ingredients.map(ing => `${ing.name} ${ing.quantity}${ing.unit}`).join(', ');
  };

  const getDiscountTypeLabel = (type: string | null) => {
    if (!type) return '-';
    return type === 'percentage' || type === 'percent' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน';
  };

  const getOrderTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      'dine-in': 'ทานที่ร้าน',
      'takeaway': 'สั่งกลับบ้าน',
      'delivery': 'เดลิเวอรี่',
      'online': 'ออนไลน์',
    };
    return types[type] || type;
  };

  const getTierBadgeColor = (tier: string) => {
    const colors: { [key: string]: string } = {
      bronze: 'bg-amber-700 text-white',
      silver: 'bg-gray-400 text-white',
      gold: 'bg-yellow-500 text-black',
      platinum: 'bg-gray-700 text-white',
    };
    return colors[tier?.toLowerCase()] || 'bg-gray-200';
  };

  const exportToExcel = () => {
    try {
      const exportData: any[] = [];

      orders.forEach(order => {
        order.order_items.forEach((item, index) => {
          exportData.push({
            'เลขออเดอร์': order.order_number,
            'วันที่สั่ง': format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: th }),
            'ช่วงเวลา': order.time_period,
            'ประเภทออเดอร์': getOrderTypeText(order.order_type),
            'แหล่งที่มา': order.order_source || 'POS',
            'วิธีการชำระเงิน': getPaymentMethodText(order.payment_method),
            'สถานะ': order.status === 'completed' ? 'สำเร็จ' : order.status === 'pending' ? 'รอดำเนินการ' : order.status === 'cancelled' ? 'ยกเลิก' : order.status,
            'ลำดับสินค้า': index + 1,
            'ชื่อสินค้า': item.menu_item_name,
            'หมวดหมู่': item.category_name || '-',
            'จำนวน': item.quantity,
            'ราคาต่อหน่วย': item.unit_price,
            'ต้นทุนสินค้า': item.cost_price,
            'กำไรสินค้า': item.item_profit,
            'กำไรขั้นต้น %': item.item_profit_margin.toFixed(1) + '%',
            'ส่วนผสม': formatIngredients(item.ingredients),
            'ส่วนลดสินค้า': item.item_discount,
            'ประเภทส่วนลดสินค้า': getDiscountTypeLabel(item.item_discount_type),
            'Add-on': formatAddons(item.selected_addons),
            'ราคารวม': item.total_price,
            'ชื่อลูกค้า': order.member_info?.name || '-',
            'เบอร์โทรลูกค้า': order.member_info?.phone || '-',
            'Tier สมาชิก': order.member_info?.tier || '-',
            'ยอดสะสม': order.member_info?.total_spent || '-',
            'ความถี่ซื้อ (ครั้ง)': order.member_info?.order_count || '-',
            'วันเกิด': order.member_info?.birth_date ? format(new Date(order.member_info.birth_date), 'dd/MM/yyyy') : '-',
            'ส่วนลดบิล': order.bill_discount || 0,
            'ประเภทส่วนลดบิล': getDiscountTypeLabel(order.bill_discount_type),
            'โปรโมชั่น/Code': order.promotion_claims.length > 0 
              ? order.promotion_claims.map(p => p.promo_code || p.promotion_title).join(', ') 
              : '-',
            'รายละเอียดโปรโมชั่น': order.promotion_claims.length > 0
              ? order.promotion_claims.map(p => `${p.promotion_title} (${p.discount_value}${p.discount_type === 'percentage' ? '%' : '฿'})`).join(', ')
              : '-',
            'แต้มที่ใช้แลก': order.points_redeemed || 0,
            'แต้มที่ได้รับ': order.points_earned || 0,
            'ต้นทุนรวม': order.total_cost,
            'กำไร': order.profit,
            'กำไรขั้นต้นบิล %': order.profit_margin.toFixed(1) + '%',
            'ยอดรวมออเดอร์': order.total_amount,
          });
        });

        if (order.order_items.length === 0) {
          exportData.push({
            'เลขออเดอร์': order.order_number,
            'วันที่สั่ง': format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: th }),
            'ช่วงเวลา': order.time_period,
            'ประเภทออเดอร์': getOrderTypeText(order.order_type),
            'แหล่งที่มา': order.order_source || 'POS',
            'วิธีการชำระเงิน': getPaymentMethodText(order.payment_method),
            'สถานะ': order.status === 'completed' ? 'สำเร็จ' : order.status === 'pending' ? 'รอดำเนินการ' : order.status === 'cancelled' ? 'ยกเลิก' : order.status,
            'ลำดับสินค้า': '-',
            'ชื่อสินค้า': '-',
            'หมวดหมู่': '-',
            'จำนวน': '-',
            'ราคาต่อหน่วย': '-',
            'ต้นทุนสินค้า': '-',
            'กำไรสินค้า': '-',
            'กำไรขั้นต้น %': '-',
            'ส่วนผสม': '-',
            'ส่วนลดสินค้า': '-',
            'ประเภทส่วนลดสินค้า': '-',
            'Add-on': '-',
            'ราคารวม': '-',
            'ชื่อลูกค้า': order.member_info?.name || '-',
            'เบอร์โทรลูกค้า': order.member_info?.phone || '-',
            'Tier สมาชิก': order.member_info?.tier || '-',
            'ยอดสะสม': order.member_info?.total_spent || '-',
            'ความถี่ซื้อ (ครั้ง)': order.member_info?.order_count || '-',
            'วันเกิด': order.member_info?.birth_date ? format(new Date(order.member_info.birth_date), 'dd/MM/yyyy') : '-',
            'ส่วนลดบิล': order.bill_discount || 0,
            'ประเภทส่วนลดบิล': getDiscountTypeLabel(order.bill_discount_type),
            'โปรโมชั่น/Code': order.promotion_claims.length > 0 
              ? order.promotion_claims.map(p => p.promo_code || p.promotion_title).join(', ') 
              : '-',
            'รายละเอียดโปรโมชั่น': '-',
            'แต้มที่ใช้แลก': order.points_redeemed || 0,
            'แต้มที่ได้รับ': order.points_earned || 0,
            'ต้นทุนรวม': order.total_cost,
            'กำไร': order.profit,
            'กำไรขั้นต้นบิล %': order.profit_margin.toFixed(1) + '%',
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

      const maxWidth = 35;
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

  // Calculate item sales ranking
  const itemSalesMap = new Map<string, { name: string; qty: number; revenue: number; profit: number }>();
  orders.forEach(order => {
    order.order_items.forEach(item => {
      const existing = itemSalesMap.get(item.menu_item_name) || { name: item.menu_item_name, qty: 0, revenue: 0, profit: 0 };
      existing.qty += item.quantity;
      existing.revenue += item.total_price;
      existing.profit += item.item_profit;
      itemSalesMap.set(item.menu_item_name, existing);
    });
  });
  const itemRanking = Array.from(itemSalesMap.values()).sort((a, b) => b.qty - a.qty);
  const topSelling = itemRanking.slice(0, 5);
  const lowSelling = itemRanking.slice(-5).reverse();

  // Time period breakdown
  const timePeriodMap = new Map<string, number>();
  orders.forEach(order => {
    const count = timePeriodMap.get(order.time_period) || 0;
    timePeriodMap.set(order.time_period, count + 1);
  });

  // Category breakdown
  const categoryMap = new Map<string, number>();
  orders.forEach(order => {
    Object.entries(order.category_breakdown).forEach(([cat, amount]) => {
      const existing = categoryMap.get(cat) || 0;
      categoryMap.set(cat, existing + amount);
    });
  });
  const categoryRanking = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);

  const summary = {
    totalOrders: orders.length,
    totalAmount: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
    totalDiscount: orders.reduce((sum, o) => sum + Number(o.bill_discount || 0), 0),
    totalItems: orders.reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.quantity, 0), 0),
    totalCost: orders.reduce((sum, o) => sum + o.total_cost, 0),
    totalProfit: orders.reduce((sum, o) => sum + o.profit, 0),
    totalPointsRedeemed: orders.reduce((sum, o) => sum + o.points_redeemed, 0),
    totalPointsEarned: orders.reduce((sum, o) => sum + o.points_earned, 0),
  };

  const avgProfitMargin = summary.totalAmount > 0 ? (summary.totalProfit / summary.totalAmount) * 100 : 0;

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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{summary.totalOrders}</div>
            <p className="text-xs text-muted-foreground">ออเดอร์</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">฿{summary.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ยอดขาย</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">฿{summary.totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ต้นทุน</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">฿{summary.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">กำไร</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">฿{summary.totalDiscount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ส่วนลด</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{summary.totalItems}</div>
            <p className="text-xs text-muted-foreground">สินค้า</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{summary.totalPointsRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">แต้มใช้แลก</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{summary.totalPointsEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">แต้มได้รับ</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Section */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profit Margin Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">กำไรขั้นต้น %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{avgProfitMargin.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                ต้นทุน: ฿{summary.totalCost.toLocaleString()} | กำไร: ฿{summary.totalProfit.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Time Period Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">ช่วงเวลาขาย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from(timePeriodMap.entries()).map(([period, count]) => (
                  <div key={period} className="flex justify-between items-center">
                    <span className="text-sm">{period}</span>
                    <Badge variant="secondary">{count} ออเดอร์</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">หมวดหมู่ยอดนิยม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryRanking.slice(0, 5).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-sm truncate max-w-[150px]">{cat}</span>
                    <span className="text-sm font-medium">฿{Number(amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top/Low Selling Products */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-600">🔥 สินค้าขายดี Top 5</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สินค้า</TableHead>
                    <TableHead className="text-right">จำนวน</TableHead>
                    <TableHead className="text-right">รายได้</TableHead>
                    <TableHead className="text-right">กำไร</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSelling.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">฿{item.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600">฿{item.profit.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-600">📉 สินค้าขายน้อย</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สินค้า</TableHead>
                    <TableHead className="text-right">จำนวน</TableHead>
                    <TableHead className="text-right">รายได้</TableHead>
                    <TableHead className="text-right">กำไร</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowSelling.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">฿{item.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-600">฿{item.profit.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}


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
            <div>
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[28px] px-1"></TableHead>
                    <TableHead className="w-[120px] px-1 text-xs">ออเดอร์</TableHead>
                    <TableHead className="w-[70px] px-1 text-xs">วันที่</TableHead>
                    <TableHead className="w-[55px] px-1 text-xs">ชำระเงิน</TableHead>
                    <TableHead className="w-[50px] px-1 text-xs">สถานะ</TableHead>
                    <TableHead className="w-[55px] px-1 text-xs">ลูกค้า</TableHead>
                    <TableHead className="w-[55px] px-1 text-xs text-right">ต้นทุน</TableHead>
                    <TableHead className="w-[50px] px-1 text-xs text-right">ส่วนลด</TableHead>
                    <TableHead className="w-[42px] px-1 text-xs text-center">แต้มใช้</TableHead>
                    <TableHead className="w-[55px] px-1 text-xs">โปรโมชั่น</TableHead>
                    <TableHead className="w-[58px] px-1 text-xs text-right">ยอดรวม</TableHead>
                    <TableHead className="w-[58px] px-1 text-xs text-right">กำไร</TableHead>
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
                        <TableCell className="px-1 py-2">
                          {expandedOrders.has(order.id) ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </TableCell>
                        <TableCell className="px-1 py-2 font-medium text-xs truncate">{order.order_number}</TableCell>
                        <TableCell className="px-1 py-2 text-xs">{format(new Date(order.created_at), 'dd/MM/yy HH:mm', { locale: th })}</TableCell>
                        <TableCell className="px-1 py-2">
                          <Badge variant="outline" className="text-[10px] px-1 py-0">{getPaymentMethodText(order.payment_method)}</Badge>
                        </TableCell>
                        <TableCell className="px-1 py-2">{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="px-1 py-2">
                          {order.member_info ? (
                            <div>
                              <div className="font-medium text-xs truncate">{order.member_info.name}</div>
                              <Badge className={cn("text-[10px] px-1 py-0 mt-0.5", getTierBadgeColor(order.member_info.tier))}>
                                {order.member_info.tier}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-1 py-2 text-right text-xs text-red-600">฿{order.total_cost.toLocaleString()}</TableCell>
                        <TableCell className="px-1 py-2 text-right text-xs text-orange-600">
                          {order.bill_discount ? (
                            <span>
                              {order.bill_discount}{order.bill_discount_type === 'percentage' ? '%' : '฿'}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="px-1 py-2 text-center text-xs text-purple-600">
                          {order.points_redeemed > 0 ? order.points_redeemed.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="px-1 py-2">
                          {order.promotion_claims.length > 0 ? (
                            <div className="space-y-0.5">
                              {order.promotion_claims.map((promo, idx) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] px-1 py-0 truncate max-w-full block">
                                  {promo.promo_code || promo.promotion_title}
                                </Badge>
                              ))}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="px-1 py-2 text-right text-xs font-bold">฿{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell className="px-1 py-2 text-right text-xs font-bold text-emerald-600">
                          ฿{order.profit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Items */}
                      {expandedOrders.has(order.id) && (
                        <TableRow key={`${order.id}-items`}>
                          <TableCell colSpan={12} className="bg-muted/30 p-0">
                            <div className="p-4">
                              <h4 className="font-semibold mb-3">รายการสินค้า</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>ชื่อสินค้า</TableHead>
                                    <TableHead>Add-on</TableHead>
                                    <TableHead>ส่วนผสม</TableHead>
                                    <TableHead className="text-center">จำนวน</TableHead>
                                    <TableHead className="text-right">ราคา</TableHead>
                                    <TableHead className="text-right">ต้นทุน</TableHead>
                                    <TableHead className="text-right">ส่วนลด</TableHead>
                                    <TableHead className="text-right">รวม</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.order_items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">{item.menu_item_name}</TableCell>
                                      <TableCell className="text-sm max-w-[150px] truncate" title={formatAddons(item.selected_addons)}>
                                        {formatAddons(item.selected_addons)}
                                      </TableCell>
                                      <TableCell className="text-sm max-w-[200px] truncate" title={formatIngredients(item.ingredients)}>
                                        {formatIngredients(item.ingredients)}
                                      </TableCell>
                                      <TableCell className="text-center">{item.quantity}</TableCell>
                                      <TableCell className="text-right">฿{item.unit_price.toLocaleString()}</TableCell>
                                      <TableCell className="text-right text-red-600">฿{item.cost_price.toLocaleString()}</TableCell>
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

                              {/* Additional Order Info */}
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-background p-3 rounded-lg">
                                  <span className="text-muted-foreground">ประเภทส่วนลดบิล:</span>
                                  <span className="ml-2 font-medium">{getDiscountTypeLabel(order.bill_discount_type)}</span>
                                </div>
                                <div className="bg-background p-3 rounded-lg">
                                  <span className="text-muted-foreground">แต้มที่ได้รับ:</span>
                                  <span className="ml-2 font-medium text-amber-600">+{order.points_earned}</span>
                                </div>
                                {order.promotion_claims.length > 0 && (
                                  <div className="bg-background p-3 rounded-lg col-span-2">
                                    <span className="text-muted-foreground">รายละเอียดโปรโมชั่น:</span>
                                    <div className="mt-1">
                                      {order.promotion_claims.map((promo, idx) => (
                                        <div key={idx} className="text-sm">
                                          {promo.promotion_title} - ลด {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '฿'}
                                          {promo.promo_code && <span className="text-muted-foreground"> (Code: {promo.promo_code})</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
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
