
import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { ChefHat, Clock, CheckCircle2, Package, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface OrderItemWithIngredients {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  selected_addons: any;
  ingredients: {
    ingredient_name: string;
    quantity_needed: number;
    unit: string;
    total_needed: number;
  }[];
}

interface KitchenOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  order_type: string | null;
  customer_notes: string | null;
  items: OrderItemWithIngredients[];
}

type TabType = 'pending' | 'completed';

const KitchenDisplay = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const skipRefetchRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (skipRefetchRef.current) {
      return;
    }
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, order_type, customer_notes')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: true })
        .limit(50);

      if (ordersError) throw ordersError;
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, menu_item_id, menu_item_name, quantity, selected_addons')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      const menuItemIds = [...new Set((itemsData || []).map(i => i.menu_item_id).filter(Boolean))];
      let ingredientsMap: Record<string, { ingredient_name: string; quantity_needed: number; unit: string }[]> = {};

      if (menuItemIds.length > 0) {
        const { data: menuIngData, error: menuIngError } = await supabase
          .from('menu_ingredients')
          .select(`
            menu_item_id,
            quantity_needed,
            ingredient_id,
            ingredients (
              name,
              unit
            )
          `)
          .in('menu_item_id', menuItemIds);

        if (!menuIngError && menuIngData) {
          for (const mi of menuIngData) {
            const menuId = mi.menu_item_id;
            if (!menuId) continue;
            if (!ingredientsMap[menuId]) ingredientsMap[menuId] = [];
            const ing = mi.ingredients as any;
            if (ing) {
              ingredientsMap[menuId].push({
                ingredient_name: ing.name,
                quantity_needed: mi.quantity_needed,
                unit: ing.unit,
              });
            }
          }
        }
      }

      const kitchenOrders: KitchenOrder[] = ordersData.map(order => {
        const orderItems = (itemsData || []).filter(i => i.order_id === order.id);
        const items: OrderItemWithIngredients[] = orderItems.map(item => {
          const menuIngredients = item.menu_item_id ? (ingredientsMap[item.menu_item_id] || []) : [];
          return {
            id: item.id,
            menu_item_id: item.menu_item_id,
            menu_item_name: item.menu_item_name,
            quantity: item.quantity,
            selected_addons: item.selected_addons,
            ingredients: menuIngredients.map(ing => ({
              ...ing,
              total_needed: ing.quantity_needed * item.quantity,
            })),
          };
        });

        return {
          id: order.id,
          order_number: order.order_number,
          created_at: order.created_at,
          status: order.status || 'pending',
          order_type: order.order_type,
          customer_notes: order.customer_notes,
          items,
        };
      });

      setOrders(kitchenOrders);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    const interval = setInterval(fetchOrders, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchOrders]);

  const markCompleted = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newStatus = order.status === 'kitchen_completed' ? 'pending' : 'kitchen_completed';

    skipRefetchRef.current = true;

    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );

    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select('id, status')
      .maybeSingle();

    setTimeout(() => {
      skipRefetchRef.current = false;
    }, 2000);

    if (error || !data) {
      console.error('KDS update failed:', error, 'data:', data);
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: order.status } : o)
      );
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: `ไม่สามารถอัปเดตสถานะได้: ${error?.message || 'ไม่มีข้อมูลส่งกลับ'}`,
        variant: 'destructive',
      });
      return;
    }

    console.log('KDS update success:', data);
    toast({
      title: 'อัปเดตสถานะ',
      description: newStatus === 'kitchen_completed' ? 'ออเดอร์เสร็จแล้ว' : 'เปลี่ยนกลับเป็นรอทำ',
    });
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อกี้';
    if (mins < 60) return `${mins} นาที`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} ชม. ${mins % 60} นาที`;
  };

  const parseAddons = (addons: any): string[] => {
    if (!addons) return [];
    try {
      const parsed = typeof addons === 'string' ? JSON.parse(addons) : addons;
      if (Array.isArray(parsed)) {
        return parsed.map((a: any) => a.name || a.addon_name || '').filter(Boolean);
      }
    } catch {
      // ignore
    }
    return [];
  };

  // Sort pending by created_at ascending (oldest first = queue order)
  const pendingOrders = orders
    .filter(o => o.status !== 'kitchen_completed')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const doneOrders = orders
    .filter(o => o.status === 'kitchen_completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const displayOrders = activeTab === 'pending' ? pendingOrders : doneOrders;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <ChefHat className="w-6 h-6 text-orange-400" />
          <h1 className="text-xl font-bold">จอแสดงผลในครัว (KDS)</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 border-b border-gray-700 px-4 flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-orange-400 text-orange-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          ออเดอร์รอทำ
          <Badge className="bg-orange-600 text-white text-xs ml-1 px-2 py-0.5 rounded-full">
            {pendingOrders.length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-green-400 text-green-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          เสร็จแล้ว
          <Badge className="bg-green-600 text-white text-xs ml-1 px-2 py-0.5 rounded-full">
            {doneOrders.length}
          </Badge>
        </button>
      </div>

      {/* Orders Grid */}
      <div className="p-4">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ChefHat className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">
              {activeTab === 'pending' ? 'ไม่มีออเดอร์รอทำ' : 'ยังไม่มีออเดอร์ที่เสร็จ'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayOrders.map((order, index) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                queueNumber={activeTab === 'pending' ? index + 1 : undefined}
                isCompleted={activeTab === 'completed'}
                onToggle={() => markCompleted(order.id)}
                getTimeSince={getTimeSince}
                parseAddons={parseAddons}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface KitchenOrderCardProps {
  order: KitchenOrder;
  queueNumber?: number;
  isCompleted: boolean;
  onToggle: () => void;
  getTimeSince: (dateStr: string) => string;
  parseAddons: (addons: any) => string[];
}

const KitchenOrderCard = ({ order, queueNumber, isCompleted, onToggle, getTimeSince, parseAddons }: KitchenOrderCardProps) => {
  const timeSince = getTimeSince(order.created_at);
  const isUrgent = !isCompleted && (Date.now() - new Date(order.created_at).getTime()) > 10 * 60 * 1000;

  return (
    <Card className={`overflow-hidden border-2 transition-all ${
      isCompleted
        ? 'bg-gray-800/50 border-green-700/50 opacity-70'
        : isUrgent
          ? 'bg-gray-800 border-red-500 animate-pulse'
          : 'bg-gray-800 border-gray-600'
    }`}>
      {/* Order Header - visually separated */}
      <div className={`px-4 py-3 border-b-2 ${
        isCompleted
          ? 'bg-green-900/40 border-green-700/60'
          : isUrgent
            ? 'bg-red-900/40 border-red-600/60'
            : 'bg-gray-900 border-orange-500/60'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {queueNumber && (
              <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {queueNumber}
              </span>
            )}
            <span className="font-bold text-orange-400 text-sm">
              #{order.order_number}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {order.order_type && (
              <Badge variant="secondary" className="text-[10px] bg-gray-700 text-gray-300">
                {order.order_type}
              </Badge>
            )}
            <Badge className={`text-[10px] ${
              isUrgent ? 'bg-red-600' : isCompleted ? 'bg-green-600' : 'bg-orange-600'
            }`}>
              <Clock className="w-3 h-3 mr-1" />
              {timeSince}
            </Badge>
          </div>
        </div>
      </div>

      {/* Order Content */}
      <CardContent className="px-4 py-3">
        {/* Customer Notes */}
        {order.customer_notes && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded px-2 py-1 mb-2">
            <p className="text-yellow-300 text-xs">📝 {order.customer_notes}</p>
          </div>
        )}

        {/* Order Items */}
        <ScrollArea className={order.items.length > 3 ? 'h-64' : ''}>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="border-b border-gray-700/50 pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">
                    {item.menu_item_name}
                  </span>
                  <Badge variant="outline" className="text-orange-300 border-orange-500 font-bold">
                    x{item.quantity}
                  </Badge>
                </div>

                {parseAddons(item.selected_addons).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseAddons(item.selected_addons).map((addon, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] bg-gray-700 text-blue-300">
                        + {addon}
                      </Badge>
                    ))}
                  </div>
                )}

                {item.ingredients.length > 0 && (
                  <div className="mt-1.5 bg-gray-900/50 rounded p-2">
                    <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      วัตถุดิบที่ใช้:
                    </p>
                    <div className="space-y-0.5">
                      {item.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">{ing.ingredient_name}</span>
                          <span className="text-orange-300 font-medium">
                            {ing.total_needed} {ing.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Action Button */}
        <Button
          onClick={onToggle}
          className={`w-full mt-3 text-sm font-semibold ${
            isCompleted
              ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
              : 'bg-green-600 hover:bg-green-500 text-white'
          }`}
          size="sm"
        >
          {isCompleted ? (
            <>ย้ายกลับรอทำ</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-1" /> เสร็จสิ้น</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KitchenDisplay;
