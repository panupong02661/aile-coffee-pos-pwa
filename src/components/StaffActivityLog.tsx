import { useActivityLogs } from '@/hooks/useSecurityLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, User, Clock } from 'lucide-react';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  menu_created: { label: 'สร้างเมนู', color: 'bg-green-100 text-green-800' },
  menu_updated: { label: 'แก้ไขเมนู', color: 'bg-blue-100 text-blue-800' },
  menu_deleted: { label: 'ลบเมนู', color: 'bg-red-100 text-red-800' },
  order_cancelled: { label: 'ยกเลิกออเดอร์', color: 'bg-red-100 text-red-800' },
  order_created: { label: 'สร้างออเดอร์', color: 'bg-green-100 text-green-800' },
  discount_applied: { label: 'ให้ส่วนลด', color: 'bg-orange-100 text-orange-800' },
  discount_exceeded: { label: 'ส่วนลดเกินสิทธิ์', color: 'bg-red-100 text-red-800' },
  member_created: { label: 'เพิ่มสมาชิก', color: 'bg-green-100 text-green-800' },
  member_deleted: { label: 'ลบสมาชิก', color: 'bg-red-100 text-red-800' },
  settings_changed: { label: 'เปลี่ยนการตั้งค่า', color: 'bg-purple-100 text-purple-800' },
  stock_adjusted: { label: 'ปรับสต็อก', color: 'bg-yellow-100 text-yellow-800' },
  login: { label: 'เข้าสู่ระบบ', color: 'bg-blue-100 text-blue-800' },
  logout: { label: 'ออกจากระบบ', color: 'bg-gray-100 text-gray-800' },
  backup_created: { label: 'สำรองข้อมูล', color: 'bg-blue-100 text-blue-800' },
  backup_restored: { label: 'กู้คืนข้อมูล', color: 'bg-orange-100 text-orange-800' },
};

const StaffActivityLog = () => {
  const { data: logs = [], isLoading } = useActivityLogs();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          กำลังโหลด...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          ประวัติการใช้งานพนักงาน
        </CardTitle>
        <CardDescription>บันทึกกิจกรรมล่าสุด 100 รายการ</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">ยังไม่มีบันทึกกิจกรรม</p>
            ) : (
              logs.map((log: any) => {
                const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-800' };
                const details = log.details as Record<string, any> || {};
                
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{details.username || 'ไม่ทราบ'}</span>
                        <Badge className={`text-xs ${actionInfo.color}`} variant="secondary">
                          {actionInfo.label}
                        </Badge>
                        {log.resource_type && (
                          <span className="text-xs text-muted-foreground">
                            {log.resource_type}
                          </span>
                        )}
                      </div>
                      {details.item_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          รายการ: {details.item_name}
                        </p>
                      )}
                      {details.reason && (
                        <p className="text-sm text-muted-foreground mt-1">
                          เหตุผล: {details.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StaffActivityLog;
