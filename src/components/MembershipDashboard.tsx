
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Award, Star } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const MembershipDashboard = () => {
  const { members, loading } = useSupabaseData();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        </CardContent>
      </Card>
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
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <p className="text-gray-500 text-sm">ยังไม่มีสมาชิก</p>
      ) : (
        members.map((member, index) => (
          <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-coffee-600 text-white font-bold text-sm">
              {index + 1}
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{member.name}</p>
              <p className="text-xs text-gray-500">{member.phone}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{member.points.toLocaleString()}</p>
              <p className="text-xs text-gray-500">แต้ม</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกเงิน</CardTitle>
            <Badge className={getTierBadgeColor('silver')}>เงิน</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{silverMembers.length}</div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกทอง</CardTitle>
            <Badge className={getTierBadgeColor('gold')}>ทอง</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goldMembers.length}</div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกแพลตินัม</CardTitle>
            <Badge className={getTierBadgeColor('platinum')}>แพลตินัม</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platinumMembers.length}</div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>
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
              <div className="text-3xl font-bold text-coffee-600">{totalPoints.toLocaleString()}</div>
              <p className="text-sm text-gray-500">แต้มทั้งหมด</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {silverMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">แต้มสมาชิกเงิน</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {goldMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">แต้มสมาชิกทอง</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {platinumMembers.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">แต้มสมาชิกแพลตินัม</p>
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
