import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types';

interface TableInfo {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
}

interface TableOrder {
  id: string;
  table_id: string;
  table_number: string;
  cart_items: CartItem[];
  bill_discount: number;
  bill_discount_type: 'percent' | 'amount';
  status: string;
  created_at: string;
}

export const useTableOrders = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [activeTableOrders, setActiveTableOrders] = useState<TableOrder[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch available tables
  const fetchTables = useCallback(async () => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('id, table_number, capacity, status')
      .eq('is_active', true)
      .order('table_number');

    if (!error && data) {
      setTables(data as TableInfo[]);
    }
  }, []);

  // Fetch active table orders
  const fetchActiveOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('table_orders' as any)
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActiveTableOrders((data as any[]).map(d => ({
        ...d,
        cart_items: Array.isArray(d.cart_items) ? d.cart_items : [],
        bill_discount_type: d.bill_discount_type as 'percent' | 'amount',
      })));
    }
  }, []);

  useEffect(() => {
    fetchTables();
    fetchActiveOrders();

    const channel = supabase
      .channel('table-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_orders' }, () => {
        fetchActiveOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, () => {
        fetchTables();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchTables, fetchActiveOrders]);

  // Save current cart to a table
  const saveCartToTable = useCallback(async (
    tableId: string,
    tableNumber: string,
    cartItems: CartItem[],
    billDiscount: number,
    billDiscountType: 'percent' | 'amount'
  ) => {
    if (cartItems.length === 0) return false;

    // Check if there's already an active order for this table
    const existing = activeTableOrders.find(o => o.table_id === tableId && o.status === 'active');

    if (existing) {
      // Overwrite items (not merge) to prevent duplication
      const mergedItems = cartItems;
      const { error } = await supabase
        .from('table_orders' as any)
        .update({
          cart_items: mergedItems as any,
          bill_discount: billDiscount || existing.bill_discount,
          bill_discount_type: billDiscountType || existing.bill_discount_type,
        })
        .eq('id', existing.id);

      if (error) { console.error('Update table order error:', error); return false; }
    } else {
      const { error } = await supabase
        .from('table_orders' as any)
        .insert({
          table_id: tableId,
          table_number: tableNumber,
          cart_items: cartItems as any,
          bill_discount: billDiscount,
          bill_discount_type: billDiscountType,
        });

      if (error) { console.error('Insert table order error:', error); return false; }

      // Update table status to occupied
      await supabase
        .from('restaurant_tables')
        .update({ status: 'occupied' })
        .eq('id', tableId);
    }

    await fetchActiveOrders();
    return true;
  }, [activeTableOrders, fetchActiveOrders]);

  // Load table order into cart (returns the items)
  const loadTableOrder = useCallback((tableId: string): TableOrder | null => {
    return activeTableOrders.find(o => o.table_id === tableId && o.status === 'active') || null;
  }, [activeTableOrders]);

  // Complete a table order (after payment)
  const completeTableOrder = useCallback(async (tableId: string) => {
    const { error } = await supabase
      .from('table_orders' as any)
      .update({ status: 'completed' })
      .eq('table_id', tableId)
      .eq('status', 'active');

    if (!error) {
      // Set table back to available
      await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', tableId);

      setSelectedTableId(null);
      await fetchActiveOrders();
    }
  }, [fetchActiveOrders]);

  // Update table order items (e.g. after editing cart)
  const updateTableOrderItems = useCallback(async (
    tableId: string,
    cartItems: CartItem[],
    billDiscount: number,
    billDiscountType: 'percent' | 'amount'
  ) => {
    const existing = activeTableOrders.find(o => o.table_id === tableId && o.status === 'active');
    if (!existing) return;

    await supabase
      .from('table_orders' as any)
      .update({
        cart_items: cartItems as any,
        bill_discount: billDiscount,
        bill_discount_type: billDiscountType,
      })
      .eq('id', existing.id);
  }, [activeTableOrders]);

  // Get tables with active orders
  const tablesWithOrders = activeTableOrders.map(o => o.table_id);

  return {
    tables,
    activeTableOrders,
    selectedTableId,
    setSelectedTableId,
    saveCartToTable,
    loadTableOrder,
    completeTableOrder,
    updateTableOrderItems,
    tablesWithOrders,
    loading,
    fetchActiveOrders,
  };
};
