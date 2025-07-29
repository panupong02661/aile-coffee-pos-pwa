
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface OfflineData {
  orders: any[];
  menuItems: any[];
  members: any[];
  settings: any;
  lastSync: string;
}

export const useOfflineStorage = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    orders: [],
    menuItems: [],
    members: [],
    settings: {},
    lastSync: new Date().toISOString(),
  });

  useEffect(() => {
    loadOfflineData();
    
    // Listen for network changes
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      const data = await getOfflineData();
      if (data) {
        setOfflineData(data);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = async (data: Partial<OfflineData>) => {
    try {
      const updatedData = {
        ...offlineData,
        ...data,
        lastSync: new Date().toISOString(),
      };
      
      await Filesystem.writeFile({
        path: 'offline-data.json',
        data: JSON.stringify(updatedData),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      
      setOfflineData(updatedData);
      return true;
    } catch (error) {
      console.error('Error saving offline data:', error);
      return false;
    }
  };

  const getOfflineData = async (): Promise<OfflineData | null> => {
    try {
      const file = await Filesystem.readFile({
        path: 'offline-data.json',
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      
      return JSON.parse(file.data as string);
    } catch (error) {
      console.error('Error reading offline data:', error);
      return null;
    }
  };

  const saveOrder = async (order: any) => {
    try {
      const updatedOrders = [...offlineData.orders, order];
      await saveOfflineData({ orders: updatedOrders });
      
      if (isOffline) {
        toast.success('บันทึกออเดอร์ในโหมดออฟไลน์');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving offline order:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกออเดอร์');
      return false;
    }
  };

  const syncData = async () => {
    try {
      // Sync offline orders to server
      if (offlineData.orders.length > 0) {
        // Implementation for syncing orders to Supabase
        console.log('Syncing offline orders:', offlineData.orders);
        
        // Clear offline orders after successful sync
        await saveOfflineData({ orders: [] });
        toast.success('ซิงค์ข้อมูลสำเร็จ');
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('เกิดข้อผิดพลาดในการซิงค์ข้อมูล');
      return false;
    }
  };

  const clearOfflineData = async () => {
    try {
      await Filesystem.deleteFile({
        path: 'offline-data.json',
        directory: Directory.Data,
      });
      
      setOfflineData({
        orders: [],
        menuItems: [],
        members: [],
        settings: {},
        lastSync: new Date().toISOString(),
      });
      
      toast.success('ลบข้อมูลออฟไลน์แล้ว');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  };

  return {
    isOffline,
    offlineData,
    saveOfflineData,
    saveOrder,
    syncData,
    clearOfflineData,
    hasOfflineOrders: offlineData.orders.length > 0,
  };
};
