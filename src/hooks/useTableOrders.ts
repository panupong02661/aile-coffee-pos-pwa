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
  round_number: number;
  created_at: string;
}

export const useTableOrders = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [activeTableOrders, setActiveTableOrders] = useState<TableOrder[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const fetchActiveOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('table_orders' as any)
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setActiveTableOrders((data as any[]).map(d => ({
        ...d,
        cart_items: Array.isArray(d.cart_items) ? d.cart_items : [],
        bill_discount_type: d.bill_discount_type as 'percent' | 'amount',
        round_number: d.round_number || 1,
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

  // Get all rounds for a specific table
  const getTableRounds = useCallback((tableId: string): TableOrder[] => {
    return activeTableOrders
      .filter(o => o.table_id === tableId && o.status === 'active')
      .sort((a, b) => a.round_number - b.round_number);
  }, [activeTableOrders]);

  // Get the next round number for a table
  const getNextRoundNumber = useCallback((tableId: string): number => {
    const rounds = getTableRounds(tableId);
    if (rounds.length === 0) return 1;
    return Math.max(...rounds.map(r => r.round_number)) + 1;
  }, [getTableRounds]);

  // Save current cart as a NEW round for a table
  const saveCartToTable = useCallback(async (
    tableId: string,
    tableNumber: string,
    cartItems: CartItem[],
    billDiscount: number,
    billDiscountType: 'percent' | 'amount'
  ) => {
    if (cartItems.length === 0) return false;

    const nextRound = getNextRoundNumber(tableId);

    const { error } = await supabase
      .from('table_orders' as any)
      .insert({
        table_id: tableId,
        table_number: tableNumber,
        cart_items: cartItems as any,
        bill_discount: billDiscount,
        bill_discount_type: billDiscountType,
        round_number: nextRound,
      });

    if (error) { console.error('Insert table order error:', error); return false; }

    // Update table status to occupied
    await supabase
      .from('restaurant_tables')
      .update({ status: 'occupied' })
      .eq('id', tableId);

    await fetchActiveOrders();
    return true;
  }, [getNextRoundNumber, fetchActiveOrders]);

  // Load a specific round's order into cart
  const loadTableOrder = useCallback((tableId: string, roundNumber?: number): TableOrder | null => {
    const rounds = getTableRounds(tableId);
    if (rounds.length === 0) return null;
    if (roundNumber !== undefined) {
      return rounds.find(r => r.round_number === roundNumber) || null;
    }
    // Return the latest round by default
    return rounds[rounds.length - 1];
  }, [getTableRounds]);

  // Get all items combined across all rounds for a table
  const getAllTableItems = useCallback((tableId: string): CartItem[] => {
    const rounds = getTableRounds(tableId);
    return rounds.flatMap(r => r.cart_items);
  }, [getTableRounds]);

  // Update items in a specific round
  const updateRoundItems = useCallback(async (
    roundOrderId: string,
    cartItems: CartItem[],
    billDiscount: number,
    billDiscountType: 'percent' | 'amount'
  ) => {
    const { error } = await supabase
      .from('table_orders' as any)
      .update({
        cart_items: cartItems as any,
        bill_discount: billDiscount,
        bill_discount_type: billDiscountType,
      })
      .eq('id', roundOrderId);

    if (error) console.error('Update round error:', error);
    await fetchActiveOrders();
  }, [fetchActiveOrders]);

  // Delete a specific round
  const deleteRound = useCallback(async (roundOrderId: string, tableId: string) => {
    const { error } = await supabase
      .from('table_orders' as any)
      .update({ status: 'cancelled' })
      .eq('id', roundOrderId);

    if (error) { console.error('Delete round error:', error); return; }

    // Check if table has any remaining active orders
    const remaining = activeTableOrders.filter(
      o => o.table_id === tableId && o.status === 'active' && o.id !== roundOrderId
    );
    if (remaining.length === 0) {
      await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', tableId);
    }

    await fetchActiveOrders();
  }, [activeTableOrders, fetchActiveOrders]);

  // Complete all table orders (after payment)
  const completeTableOrder = useCallback(async (tableId: string) => {
    const { error } = await supabase
      .from('table_orders' as any)
      .update({ status: 'completed' })
      .eq('table_id', tableId)
      .eq('status', 'active');

    if (!error) {
      await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', tableId);

      setSelectedTableId(null);
      await fetchActiveOrders();
    }
  }, [fetchActiveOrders]);

  // Update table order items (legacy compat)
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

  const tablesWithOrders = [...new Set(activeTableOrders.filter(o => o.status === 'active').map(o => o.table_id))];

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
    getTableRounds,
    getNextRoundNumber,
    getAllTableItems,
    updateRoundItems,
    deleteRound,
  };
};
