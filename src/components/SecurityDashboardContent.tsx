import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  UserCheck, 
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useSecurityLogs, useActivityLogs } from '@/hooks/useSecurityLogs';
import { format } from 'date-fns';

const SecurityDashboardContent = () => {
  const { data: securityLogs = [], isLoading: securityLoading } = useSecurityLogs();
  const { data: activityLogs = [], isLoading: activityLoading } = useActivityLogs();

  // Mock security data - replace with real data from your hooks
  const securityStats = {
    threatLevel: 'low',
    failedLogins: 3,
    suspiciousActivities: 1,
    blockedIPs: 5,
    activeUsers: 15,
    lastBackup: '2024-01-20 09:00:00'
  };

  const recentThreats = [
    { id: 1, type: 'Failed Login', severity: 'medium', ip: '192.168.1.100', time: '10:30', description: 'Multiple failed login attempts' },
    { id: 2, type: 'Suspicious Activity', severity: 'high', ip: '203.154.1.50', time: '09:15', description: 'Unusual data access pattern' },
    { id: 3, type: 'Rate Limiting', severity: 'low', ip: '192.168.1.200', time: '08:45', description: 'API rate limit exceeded' }
  ];

  const systemHealth = {
    database: 98,
    api: 99,
    storage: 95,
    network: 97
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (securityLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-coffee-800">Security Dashboard</h1>
        <p className="text-coffee-600 mt-2">ตรวจสอบความปลอดภัยและการเข้าถึงผิดปกติ</p>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              <span className={getThreatLevelColor(securityStats.threatLevel)}>
                {securityStats.threatLevel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Overall system security status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">ในช่วง 24 ชั่วโมงที่ผ่านมา</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">ผู้ใช้ที่เข้าสู่ระบบอยู่</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.blockedIPs}</div>
            <p className="text-xs text-muted-foreground">IP addresses ที่ถูกบล็อก</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threats">Recent Threats</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Security Threats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentThreats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={getSeverityColor(threat.severity) as any}>
                        {threat.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{threat.type}</p>
                        <p className="text-sm text-muted-foreground">{threat.description}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>IP: {threat.ip}</p>
                      <p>{threat.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(systemHealth).map(([system, health]) => (
                  <div key={system} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="capitalize">{system}</span>
                      <span>{health}%</span>
                    </div>
                    <Progress value={health} className="w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Last Backup Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Successful</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Last backup: {securityStats.lastBackup}
                </p>
                <p className="text-sm">
                  ข้อมูลถูกสำรองครั้งล่าสุดเมื่อ 2 ชั่วโมงที่ผ่านมา
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Security Event Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {securityLogs.length > 0 ? (
                  securityLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded text-sm">
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{log.event_type}</p>
                          <p className="text-muted-foreground">{log.details?.message || 'Security event logged'}</p>
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">ไม่มี Security Logs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded text-sm">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-muted-foreground">
                            {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">ไม่มี Activity Logs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboardContent;