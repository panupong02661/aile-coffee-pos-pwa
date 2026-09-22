import { supabase } from '@/integrations/supabase/client';

/**
 * ส่งแจ้งเตือนออเดอร์หน้าร้าน (POS) ไปยัง LINE / Discord ตามการตั้งค่า
 * - ทำงานเบื้องหลัง ไม่บล็อกการขาย
 * - กันส่งซ้ำด้วย Set ในหน่วยความจำ (ฝั่งเซิร์ฟเวอร์ยังมี outbox กันซ้ำอีกชั้น)
 */
const notifiedOrders = new Set<string>();

export interface PosNotifyItem {
  menu_item_id?: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_addons?: any;
  item_discount?: number;
  item_discount_type?: string;
}

export interface PosNotifyPayload {
  id: string;
  order_number: string;
  total_amount: number;
  items_count: number;
  payment_method: string;
  created_at?: string;
  shop_id?: string | null;
  member_id?: string | null;
  customer_name?: string;
  customer_phone?: string;
  customer_notes?: string;
  bill_discount?: number;
  bill_discount_type?: string;
  order_items: PosNotifyItem[];
}

const normalizeAddons = (addons: any) => {
  if (!addons) return [];
  if (Array.isArray(addons)) return addons;
  if (typeof addons === 'string') {
    try {
      const parsed = JSON.parse(addons);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const notifyPosOrder = (payload: PosNotifyPayload) => {
  if (!payload?.id || notifiedOrders.has(payload.id)) return;
  notifiedOrders.add(payload.id);

  const orderData = {
    id: payload.id,
    order_number: payload.order_number,
    total_amount: Number(payload.total_amount) || 0,
    items_count: Number(payload.items_count) || payload.order_items.length,
    member_id: payload.member_id || null,
    payment_method: payload.payment_method,
    order_source: 'pos',
    status: 'completed',
    created_at: payload.created_at || new Date().toISOString(),
    customer_notes: payload.customer_notes || '',
    customer_name: payload.customer_name || 'ลูกค้า',
    customer_phone: payload.customer_phone || '',
    bill_discount: payload.bill_discount || 0,
    bill_discount_type: payload.bill_discount_type || 'amount',
    shop_id: payload.shop_id || null,
    order_items: (payload.order_items || []).map((item) => ({
      menu_item_id: item.menu_item_id,
      menu_item_name: item.menu_item_name,
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
      total_price: Number(item.total_price) || 0,
      item_discount: item.item_discount || 0,
      item_discount_type: item.item_discount_type || 'amount',
      selected_addons: normalizeAddons(item.selected_addons),
    })),
  };

  supabase.functions
    .invoke('send-order-notification', { body: { orderData } })
    .then(({ error }) => {
      if (error) {
        console.warn('[orderNotify] POS notification failed:', error);
        notifiedOrders.delete(payload.id);
      } else {
        console.log('[orderNotify] ✅ POS notification sent:', payload.order_number);
      }
    })
    .catch((err) => {
      console.warn('[orderNotify] POS notification error:', err);
      notifiedOrders.delete(payload.id);
    });
};
