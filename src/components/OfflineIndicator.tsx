import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CloudOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflinePOS } from '@/hooks/useOfflinePOS';

interface OfflineIndicatorProps {
  onSync?: () => void;
  compact?: boolean;
}

export const OfflineIndicator = ({ onSync, compact = false }: OfflineIndicatorProps) => {
  const { 
    isOnline, 
    isSyncing, 
    pendingOrdersCount, 
    lastSyncTime,
    syncMenuData,
    syncPendingOrders 
  } = useOfflinePOS();

  const handleSync = async () => {
    if (isSyncing) return;
    
    await syncMenuData();
    await syncPendingOrders();
    onSync?.();
  };

  const formatLastSync = (time: string | null) => {
    if (!time) return 'ยังไม่เคยซิงค์';
    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ชั่วโมงที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  // Compact mode for header
  if (compact) {
    if (isOnline && pendingOrdersCount === 0) return null;
    
    return (
      <div className="flex items-center gap-2">
        {!isOnline && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
            <WifiOff className="w-3 h-3" />
            <span>ออฟไลน์</span>
          </div>
        )}
        {pendingOrdersCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">
            <Upload className="w-3 h-3" />
            <span>{pendingOrdersCount} รอซิงค์</span>
          </div>
        )}
        {isOnline && pendingOrdersCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  // Full mode - banner style
  if (isOnline && pendingOrdersCount === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
      <div className={`px-4 py-2 flex items-center justify-between ${
        isOnline ? 'bg-amber-50 border-b border-amber-200' : 'bg-orange-50 border-b border-orange-200'
      }`}>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-orange-600" />
          )}
          
          <div className="text-sm">
            {!isOnline ? (
              <span className="text-orange-700 font-medium">
                ออฟไลน์ - ระบบทำงานแบบออฟไลน์
              </span>
            ) : pendingOrdersCount > 0 ? (
              <span className="text-amber-700">
                มี {pendingOrdersCount} ออเดอร์รอซิงค์
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSyncTime && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              ซิงค์ล่าสุด: {formatLastSync(lastSyncTime)}
            </span>
          )}
          
          {isOnline && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูล'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
