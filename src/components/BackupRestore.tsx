import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, Upload, Database, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const BACKUP_TABLES = [
  'categories', 'menu_items', 'addons', 'addon_groups',
  'members', 'membership_settings', 'promotions',
  'ingredients', 'menu_ingredients',
  'coupons', 'rewards',
] as const;

interface BackupData {
  version: string;
  created_at: string;
  shop_id: string | null;
  tables: Record<string, unknown[]>;
}

const BackupRestore = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('last_backup_date')
  );

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const shopId = localStorage.getItem('active_shop_id');
      const backup: BackupData = {
        version: '1.0',
        created_at: new Date().toISOString(),
        shop_id: shopId,
        tables: {},
      };

      for (const table of BACKUP_TABLES) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.warn(`Skipping ${table}:`, error.message);
          continue;
        }
        backup.tables[table] = data || [];
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      localStorage.setItem('last_backup_date', now);
      setLastBackup(now);
      toast.success('สำรองข้อมูลสำเร็จ');
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการสำรองข้อมูล');
      console.error(err);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const confirmed = window.confirm(
        '⚠️ การกู้คืนข้อมูลจะเขียนทับข้อมูลปัจจุบัน คุณแน่ใจหรือไม่?'
      );
      if (!confirmed) return;

      setIsRestoring(true);
      try {
        const text = await file.text();
        const backup: BackupData = JSON.parse(text);

        if (!backup.version || !backup.tables) {
          toast.error('ไฟล์ backup ไม่ถูกต้อง');
          return;
        }

        let restored = 0;
        let skipped = 0;

        for (const table of BACKUP_TABLES) {
          const rows = backup.tables[table];
          if (!rows || rows.length === 0) {
            skipped++;
            continue;
          }

          // Use upsert to avoid duplicates
          const { error } = await supabase.from(table).upsert(rows as any[], {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

          if (error) {
            console.warn(`Failed to restore ${table}:`, error.message);
            skipped++;
          } else {
            restored++;
          }
        }

        toast.success(`กู้คืนข้อมูลสำเร็จ: ${restored} ตาราง (ข้าม ${skipped})`);
      } catch (err) {
        toast.error('เกิดข้อผิดพลาดในการกู้คืนข้อมูล');
        console.error(err);
      } finally {
        setIsRestoring(false);
      }
    };
    input.click();
  };

  const totalTables = BACKUP_TABLES.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="w-5 h-5 text-blue-600" />
              สำรองข้อมูล (Backup)
            </CardTitle>
            <CardDescription>
              ส่งออกข้อมูลร้านเป็นไฟล์ JSON เพื่อเก็บไว้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="w-4 h-4" />
              <span>จะสำรอง {totalTables} ตาราง</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {BACKUP_TABLES.map(t => (
                <Badge key={t} variant="outline" className="mr-1 mb-1">{t}</Badge>
              ))}
            </div>
            {lastBackup && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>สำรองล่าสุด: {new Date(lastBackup).toLocaleString('th-TH')}</span>
              </div>
            )}
            <Button onClick={handleBackup} disabled={isBackingUp} className="w-full">
              {isBackingUp ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสำรอง...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  สำรองข้อมูลตอนนี้
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Restore */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="w-5 h-5 text-orange-600" />
              กู้คืนข้อมูล (Restore)
            </CardTitle>
            <CardDescription>
              นำเข้าข้อมูลจากไฟล์ backup ที่สำรองไว้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span>การกู้คืนจะเขียนทับข้อมูลปัจจุบัน</span>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                ⚠️ แนะนำให้สำรองข้อมูลปัจจุบันก่อนทำการกู้คืน
              </p>
            </div>
            <Button onClick={handleRestore} disabled={isRestoring} variant="outline" className="w-full">
              {isRestoring ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  กำลังกู้คืน...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  เลือกไฟล์และกู้คืน
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupRestore;
