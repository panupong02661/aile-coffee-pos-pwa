
import { useEffect, useState, useCallback, useRef } from 'react';
import { callQueueByOrderId } from '@/hooks/useQueueSystem';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { ChefHat, Clock, CheckCircle2, Package, ArrowLeft, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface OrderItemWithIngredients {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  selected_addons: any;
  category_id: string | null;
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

interface KDSSettings {
  hiddenCategories: string[];
  hiddenMenuItems: string[];
  showQueueNumber: boolean;
  queueNumberSize: number; // px size
}

type TabType = 'pending' | 'completed';

const DEFAULT_KDS_SETTINGS: KDSSettings = {
  hiddenCategories: [],
  hiddenMenuItems: [],
  showQueueNumber: true,
  queueNumberSize: 40,
};

const loadKDSSettings = (): KDSSettings => {
  try {
    const saved = localStorage.getItem('kds-settings');
    if (saved) return { ...DEFAULT_KDS_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_KDS_SETTINGS;
};

const saveKDSSettings = (settings: KDSSettings) => {
  localStorage.setItem('kds-settings', JSON.stringify(settings));
};

const KitchenDisplay = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [kdsSettings, setKdsSettings] = useState<KDSSettings>(loadKDSSettings);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [menuItems, setMenuItems] = useState<{ id: string; name: string; category_id: string | null }[]>([]);
  const skipRefetchRef = useRef(false);

  // Fetch categories and menu items for settings
  useEffect(() => {
    const fetchMeta = async () => {
      const [catRes, menuRes] = await Promise.all([
        supabase.from('categories').select('id, name').eq('is_active', true).order('sort_order'),
        supabase.from('menu_items').select('id, name, category_id').eq('is_available', true).order('name'),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (menuRes.data) setMenuItems(menuRes.data);
    };
    fetchMeta();
  }, []);

  const fetchOrders = useCallback(async () => {
    if (skipRefetchRef.current) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch ALL orders for today (not just pending)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, order_type, customer_notes')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: true });

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

      // Get category_id for each menu item
      const menuItemIds = [...new Set((itemsData || []).map(i => i.menu_item_id).filter(Boolean))];
      let menuCategoryMap: Record<string, string | null> = {};
      let ingredientsMap: Record<string, { ingredient_name: string; quantity_needed: number; unit: string }[]> = {};

      if (menuItemIds.length > 0) {
        const [menuCatRes, menuIngRes] = await Promise.all([
          supabase.from('menu_items').select('id, category_id').in('id', menuItemIds),
          supabase.from('menu_ingredients').select(`
            menu_item_id,
            quantity_needed,
            ingredient_id,
            ingredients (name, unit)
          `).in('menu_item_id', menuItemIds),
        ]);

        if (menuCatRes.data) {
          for (const m of menuCatRes.data) {
            menuCategoryMap[m.id] = m.category_id;
          }
        }

        if (!menuIngRes.error && menuIngRes.data) {
          for (const mi of menuIngRes.data) {
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
            category_id: item.menu_item_id ? (menuCategoryMap[item.menu_item_id] || null) : null,
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
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select('id, status')
      .maybeSingle();

    setTimeout(() => { skipRefetchRef.current = false; }, 2000);

    if (error || !data) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: order.status } : o));
      toast({ title: 'เกิดข้อผิดพลาด', description: `ไม่สามารถอัปเดตสถานะได้: ${error?.message || 'ไม่มีข้อมูลส่งกลับ'}`, variant: 'destructive' });
      return;
    }

    // Auto-call queue when kitchen marks order as completed
    if (newStatus === 'kitchen_completed') {
      const queueNum = await callQueueByOrderId(orderId);
      if (queueNum) {
        toast({ title: `📢 เรียกคิว #${queueNum}`, description: 'ออเดอร์เสร็จแล้ว - เรียกลูกค้าอัตโนมัติ' });
      } else {
        toast({ title: 'อัปเดตสถานะ', description: 'ออเดอร์เสร็จแล้ว' });
      }
    } else {
      toast({ title: 'อัปเดตสถานะ', description: 'เปลี่ยนกลับเป็นรอทำ' });
    }
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
    } catch {}
    return [];
  };

  // Apply category/menu filters to order items
  const filterOrderItems = (items: OrderItemWithIngredients[]): OrderItemWithIngredients[] => {
    return items.filter(item => {
      if (item.category_id && kdsSettings.hiddenCategories.includes(item.category_id)) return false;
      if (item.menu_item_id && kdsSettings.hiddenMenuItems.includes(item.menu_item_id)) return false;
      return true;
    });
  };

  // Filter and prepare orders - show ALL statuses in pending except kitchen_completed
  const pendingOrders = orders
    .filter(o => o.status !== 'kitchen_completed')
    .map(o => ({ ...o, items: filterOrderItems(o.items) }))
    .filter(o => o.items.length > 0) // hide orders with 0 visible items
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const doneOrders = orders
    .filter(o => o.status === 'kitchen_completed')
    .map(o => ({ ...o, items: filterOrderItems(o.items) }))
    .filter(o => o.items.length > 0)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const displayOrders = activeTab === 'pending' ? pendingOrders : doneOrders;

  const updateSettings = (partial: Partial<KDSSettings>) => {
    setKdsSettings(prev => {
      const next = { ...prev, ...partial };
      saveKDSSettings(next);
      return next;
    });
  };

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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="text-gray-300 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-1" />
            ตั้งค่า
          </Button>
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
                showQueueNumber={kdsSettings.showQueueNumber}
                queueNumberSize={kdsSettings.queueNumberSize}
              />
            ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <KDSSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={kdsSettings}
        onUpdate={updateSettings}
        categories={categories}
        menuItems={menuItems}
      />
    </div>
  );
};

// ===================== Settings Modal =====================

interface KDSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: KDSSettings;
  onUpdate: (partial: Partial<KDSSettings>) => void;
  categories: { id: string; name: string }[];
  menuItems: { id: string; name: string; category_id: string | null }[];
}

const KDSSettingsModal = ({ isOpen, onClose, settings, onUpdate, categories, menuItems }: KDSSettingsModalProps) => {
  const [settingsTab, setSettingsTab] = useState<'display' | 'categories' | 'menus'>('display');

  const toggleCategory = (catId: string) => {
    const hidden = settings.hiddenCategories.includes(catId)
      ? settings.hiddenCategories.filter(c => c !== catId)
      : [...settings.hiddenCategories, catId];
    onUpdate({ hiddenCategories: hidden });
  };

  const toggleMenuItem = (itemId: string) => {
    const hidden = settings.hiddenMenuItems.includes(itemId)
      ? settings.hiddenMenuItems.filter(m => m !== itemId)
      : [...settings.hiddenMenuItems, itemId];
    onUpdate({ hiddenMenuItems: hidden });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gray-800 text-white border-gray-700 max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5 text-orange-400" />
            ตั้งค่า KDS
          </DialogTitle>
        </DialogHeader>

        {/* Settings Tabs */}
        <div className="flex gap-1 border-b border-gray-700 pb-2">
          {[
            { key: 'display' as const, label: 'การแสดงผล' },
            { key: 'categories' as const, label: 'หมวดหมู่' },
            { key: 'menus' as const, label: 'เมนู' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSettingsTab(tab.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                settingsTab === tab.key
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 pr-2 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)', WebkitOverflowScrolling: 'touch', overflowY: 'auto', touchAction: 'pan-y' }}>
          {settingsTab === 'display' && (
            <div className="space-y-6 py-2">
              {/* Queue Number Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-200">แสดงลำดับคิว</Label>
                <Switch
                  checked={settings.showQueueNumber}
                  onCheckedChange={(v) => onUpdate({ showQueueNumber: v })}
                />
              </div>

              {/* Queue Number Size */}
              {settings.showQueueNumber && (
                <div className="space-y-3">
                  <Label className="text-sm text-gray-200">
                    ขนาดตัวเลขลำดับ: {settings.queueNumberSize}px
                  </Label>
                  <Slider
                    value={[settings.queueNumberSize]}
                    onValueChange={([v]) => onUpdate({ queueNumberSize: v })}
                    min={24}
                    max={80}
                    step={4}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>เล็ก (24)</span>
                    <span>ใหญ่ (80)</span>
                  </div>
                  {/* Preview */}
                  <div className="flex items-center justify-center bg-gray-900 rounded-lg py-4">
                    <span
                      className="bg-orange-500 text-white font-bold rounded-full flex items-center justify-center"
                      style={{
                        width: settings.queueNumberSize,
                        height: settings.queueNumberSize,
                        fontSize: settings.queueNumberSize * 0.5,
                      }}
                    >
                      1
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {settingsTab === 'categories' && (
            <div className="space-y-2 py-2">
              <p className="text-xs text-gray-400 mb-3">เลือกหมวดหมู่ที่ต้องการแสดงใน KDS (ปิดเพื่อซ่อน)</p>
              {categories.map(cat => {
                const isVisible = !settings.hiddenCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3 py-2 bg-gray-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {isVisible ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={`text-sm ${isVisible ? 'text-white' : 'text-gray-500 line-through'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <Switch
                      checked={isVisible}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {settingsTab === 'menus' && (
            <div className="space-y-2 py-2">
              <p className="text-xs text-gray-400 mb-3">เลือกเมนูที่ต้องการแสดงใน KDS (ปิดเพื่อซ่อน)</p>
              {categories.map(cat => {
                const catMenus = menuItems.filter(m => m.category_id === cat.id);
                if (catMenus.length === 0) return null;
                return (
                  <div key={cat.id} className="mb-3">
                    <p className="text-xs font-semibold text-orange-400 mb-1 px-1">{cat.name}</p>
                    {catMenus.map(item => {
                      const isVisible = !settings.hiddenMenuItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-3 py-1.5 bg-gray-900/50 rounded-lg mb-1"
                        >
                          <span className={`text-sm ${isVisible ? 'text-white' : 'text-gray-500 line-through'}`}>
                            {item.name}
                          </span>
                          <Checkbox
                            checked={isVisible}
                            onCheckedChange={() => toggleMenuItem(item.id)}
                            className="border-gray-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ===================== Order Card =====================

interface KitchenOrderCardProps {
  order: KitchenOrder;
  queueNumber?: number;
  isCompleted: boolean;
  onToggle: () => void;
  getTimeSince: (dateStr: string) => string;
  parseAddons: (addons: any) => string[];
  showQueueNumber: boolean;
  queueNumberSize: number;
}

const KitchenOrderCard = ({
  order, queueNumber, isCompleted, onToggle, getTimeSince, parseAddons,
  showQueueNumber, queueNumberSize
}: KitchenOrderCardProps) => {
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
      {/* Order Header */}
      <div className={`px-4 py-3 border-b-2 ${
        isCompleted
          ? 'bg-green-900/40 border-green-700/60'
          : isUrgent
            ? 'bg-red-900/40 border-red-600/60'
            : 'bg-gray-900 border-orange-500/60'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showQueueNumber && queueNumber && (
              <span
                className="bg-orange-500 text-white font-bold rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  width: queueNumberSize,
                  height: queueNumberSize,
                  fontSize: queueNumberSize * 0.5,
                }}
              >
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
        {order.customer_notes && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded px-2 py-1 mb-2">
            <p className="text-yellow-300 text-xs">📝 {order.customer_notes}</p>
          </div>
        )}

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
