import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Award, Star, FileSpreadsheet, FileText } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { exportToExcel, exportToPDF, formatDashboardDataForExport } from '@/utils/exportUtils';
import { toast } from 'sonner';
import StatCard from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/skeleton';

const MembershipDashboard = () => {
  const { members, loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const silverMembers = members.filter(m => m.tier === 'silver');
  const goldMembers = members.filter(m => m.tier === 'gold');
  const platinumMembers = members.filter(m => m.tier === 'platinum');

  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);

  // Get top 5 members for each tier by points
  const getTopMembers = (tierMembers: typeof members) => {
    return tierMembers
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  };

  const topSilver = getTopMembers(silverMembers);
  const topGold = getTopMembers(goldMembers);
  const topPlatinum = getTopMembers(platinumMembers);

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'แพลตินัม';
      case 'gold': return 'ทอง';
      case 'silver': return 'เงิน';
      default: return tier;
    }
  };

  const renderTopMembers = (members: typeof topSilver, tier: string) => (
    <div className="space-y-3">
      {members.length === 0 ? (
        <p className="text-muted-foreground text-sm">ยังไม่มีสมาชิก</p>
      ) : (
        members.map((member, index) => (
          <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {index + 1}
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.phone}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{member.points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">แต้ม</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const handleExportExcel = () => {
    const data = formatDashboardDataForExport(members);
    exportToExcel(data, `รายงานแดชบอร์ดสมาชิก_${new Date().toLocaleDateString('th-TH')}`, 'แดชบอร์ด');
    toast.success('ส่งออกไฟล์ Excel สำเร็จ');
  };

  const handleExportPDF = () => {
    const headers = ['ลำดับ', 'ชื่อ', 'เบอร์โทร', 'ระดับ', 'แต้มสะสม', 'ยอดซื้อรวม'];
    const rows = members.map((m, i) => [
      String(i + 1),
      m.name,
      m.phone,
      getTierName(m.tier),
      m.points.toLocaleString(),
      `฿${m.total_spent.toLocaleString()}`
    ]);

    const summary = [
      { label: 'สมาชิกทั้งหมด', value: `${members.length} คน` },
      { label: 'สมาชิกเงิน', value: `${silverMembers.length} คน` },
      { label: 'สมาชิกทอง', value: `${goldMembers.length} คน` },
      { label: 'สมาชิกแพลตินัม', value: `${platinumMembers.length} คน` },
      { label: 'แต้มทั้งหมด', value: totalPoints.toLocaleString() },
    ];

    exportToPDF('รายงานแดชบอร์ดสมาชิก', headers, rows, 'dashboard', summary);
    toast.success('กำลังเปิดหน้าพิมพ์ PDF');
  };

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleExportExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          PDF
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="สมาชิกทั้งหมด"
          value={members.length.toLocaleString()}
          hint="คน"
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="สมาชิกเงิน"
          value={silverMembers.length.toLocaleString()}
          hint="คน"
          icon={Star}
          tone="info"
        />
        <StatCard
          label="สมาชิกทอง"
          value={goldMembers.length.toLocaleString()}
          hint="คน"
          icon={Award}
          tone="warning"
        />
        <StatCard
          label="สมาชิกแพลตินัม"
          value={platinumMembers.length.toLocaleString()}
          hint="คน"
          icon={Award}
          tone="success"
        />
      </div>


      {/* Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            สรุปแต้มสะสม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">{totalPoints.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">แต้มทั้งหมด</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {silverMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">แต้มสมาชิกเงิน</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {goldMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">แต้มสมาชิกทอง</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {platinumMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">แต้มสมาชิกแพลตินัม</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Members */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5" />
              TOP 5 สมาชิกเงิน
            </CardTitle>
            <CardDescription>สมาชิกที่มีแต้มสูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            {renderTopMembers(topSilver, 'silver')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5" />
              TOP 5 สมาชิกทอง
            </CardTitle>
            <CardDescription>สมาชิกที่มีแต้มสูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            {renderTopMembers(topGold, 'gold')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5" />
              TOP 5 สมาชิกแพลตินัม
            </CardTitle>
            <CardDescription>สมาชิกที่มีแต้มสูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            {renderTopMembers(topPlatinum, 'platinum')}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MembershipDashboard;
