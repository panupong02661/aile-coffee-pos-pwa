
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Table {
  id: string;
  table_number: string;
  capacity: number;
  position_x: number;
  position_y: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  area_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableReservation {
  id: string;
  table_id: string;
  customer_name: string;
  customer_phone?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TableArea {
  id: string;
  name: string;
  color: string;
  description?: string;
  is_active: boolean;
}

export const useTableManagement = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [areas, setAreas] = useState<TableArea[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลโต๊ะได้',
        variant: 'destructive'
      });
    }
  };

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .select('*')
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลการจองได้',
        variant: 'destructive'
      });
    }
  };

  const createTable = async (tableData: Omit<Table, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .insert(tableData)
        .select()
        .single();

      if (error) throw error;

      setTables(prev => [...prev, data]);
      toast({
        title: 'สำเร็จ',
        description: 'เพิ่มโต๊ะใหม่แล้ว'
      });

      return data;
    } catch (error) {
      console.error('Error creating table:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถเพิ่มโต๊ะได้',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateTable = async (tableId: string, updates: Partial<Table>) => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .update(updates)
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;

      setTables(prev => prev.map(table => 
        table.id === tableId ? data : table
      ));

      toast({
        title: 'สำเร็จ',
        description: 'อัปเดตข้อมูลโต๊ะแล้ว'
      });

      return data;
    } catch (error) {
      console.error('Error updating table:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตโต๊ะได้',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteTable = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;

      setTables(prev => prev.filter(table => table.id !== tableId));
      toast({
        title: 'สำเร็จ',
        description: 'ลบโต๊ะแล้ว'
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถลบโต๊ะได้',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const createReservation = async (reservationData: Omit<TableReservation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .insert(reservationData)
        .select()
        .single();

      if (error) throw error;

      setReservations(prev => [...prev, data]);
      toast({
        title: 'สำเร็จ',
        description: 'จองโต๊ะแล้ว'
      });

      return data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถจองโต๊ะได้',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateReservation = async (reservationId: string, updates: Partial<TableReservation>) => {
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .update(updates)
        .eq('id', reservationId)
        .select()
        .single();

      if (error) throw error;

      setReservations(prev => prev.map(reservation => 
        reservation.id === reservationId ? data : reservation
      ));

      toast({
        title: 'สำเร็จ',
        description: 'อัปเดตการจองแล้ว'
      });

      return data;
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตการจองได้',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateTableStatus = async (tableId: string, status: Table['status']) => {
    return updateTable(tableId, { status });
  };

  const getTodayReservations = () => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(reservation => reservation.reservation_date === today);
  };

  const getTableReservations = (tableId: string) => {
    return reservations.filter(reservation => reservation.table_id === tableId);
  };

  const getAvailableTables = () => {
    return tables.filter(table => table.status === 'available' && table.is_active);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTables(),
        fetchReservations()
      ]);
      setLoading(false);
    };

    loadData();

    // Subscribe to real-time changes
    const tablesSubscription = supabase
      .channel('tables_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        fetchTables();
      })
      .subscribe();

    const reservationsSubscription = supabase
      .channel('reservations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_reservations' }, () => {
        fetchReservations();
      })
      .subscribe();

    return () => {
      tablesSubscription.unsubscribe();
      reservationsSubscription.unsubscribe();
    };
  }, []);

  return {
    tables,
    reservations,
    areas,
    loading,
    createTable,
    updateTable,
    deleteTable,
    createReservation,
    updateReservation,
    updateTableStatus,
    getTodayReservations,
    getTableReservations,
    getAvailableTables,
    refetch: {
      tables: fetchTables,
      reservations: fetchReservations
    }
  };
};
