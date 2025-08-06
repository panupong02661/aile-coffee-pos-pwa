import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  CreditCard, 
  Bell, 
  Gift, 
  Wallet, 
  History, 
  Settings,
  Star,
  Crown,
  Diamond,
  TrendingUp,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Shell from '@/components/Shell';
import VirtualLoyaltyCard from '@/components/virtual-loyalty/VirtualLoyaltyCard';

const VirtualLoyaltySystem = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const { toast } = useToast();

  // Mock data
  const mockMembers = [
    {
      id: 'M001',
      name: 'สมชาย ใจดี',
      phone: '081-234-5678',
      tier: 'gold' as const,
      points: 2500,
      totalSpent: 8500,
      joinDate: '2024-01-15'
    },
    {
      id: 'M002',
      name: 'สมหญิง จริงใจ',
      phone: '089-987-6543',
      tier: 'silver' as const,
      points: 800,
      totalSpent: 1200,
      joinDate: '2024-05-20'
    },
    {
      id: 'M003',
      name: 'ธนาคาร มั่นคง',
      phone: '085-111-2222',
      tier: 'platinum' as const,
      points: 12000,
      totalSpent: 25000,
      joinDate: '2023-11-01'
    }
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredMembers = searchTerm
    ? mockMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : mockMembers;

  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
  };

  const handleUpdateMember = (memberId: string, updatedData: any) => {
    // In a real application, you would update the member data in a database
    // Here, we'll just update the mock data
    // setMembers(prevMembers =>
    //   prevMembers.map(member =>
    //     member.id === memberId ? { ...member, ...updatedData } : member
    //   )
    // );

    toast({
      title: 'แก้ไขข้อมูลสมาชิก',
      description: `ข้อมูลสมาชิก ${updatedData.name} ถูกแก้ไขเรียบร้อยแล้ว`,
    });
  };

  return (
    <Shell 
      title="ระบบบัตรสมาชิกดิจิทัล" 
      subtitle="จัดการบัตรสมาชิกแบบดิจิทัลและระบบสะสมแต้ม"
      activeTab="other"
    >
      <Tabs defaultValue="members" className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            สมาชิก
          </TabsTrigger>
          <TabsTrigger value="tiers">
            <TrendingUp className="h-4 w-4 mr-2" />
            ระดับสมาชิก
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            ตั้งค่า
          </TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>รายชื่อสมาชิก</CardTitle>
              <CardDescription>ค้นหาและจัดการข้อมูลสมาชิก</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="ค้นหาจากชื่อ, เบอร์โทร, หรือ ID"
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    เพิ่มสมาชิกใหม่
                  </Button>
                </div>
              </div>

              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>เบอร์โทร</TableHead>
                    <TableHead>ระดับสมาชิก</TableHead>
                    <TableHead>แต้มสะสม</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.id}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.tier === 'gold'
                              ? 'default'
                              : member.tier === 'silver'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {member.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.points}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectMember(member)}
                        >
                          ดูข้อมูล
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>ระดับสมาชิก</CardTitle>
              <CardDescription>จัดการระดับสมาชิกและสิทธิประโยชน์</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-gray-500" />
                      Silver
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5">
                      <li>ส่วนลด 5%</li>
                      <li>แต้มพิเศษ 2x</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-100">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                      Gold
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5">
                      <li>ส่วนลด 10%</li>
                      <li>แต้มพิเศษ 3x</li>
                      <li>ของแถมพิเศษ</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Diamond className="h-5 w-5 mr-2 text-purple-500" />
                      Platinum
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5">
                      <li>ส่วนลด 15%</li>
                      <li>แต้มพิเศษ 5x</li>
                      <li>ของแถมพิเศษ</li>
                      <li>เครื่องดื่มฟรี</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าระบบ</CardTitle>
              <CardDescription>ปรับแต่งการทำงานของระบบสมาชิก</CardDescription>
            </CardHeader>
            <CardContent>
              <p>กำลังอยู่ในระหว่างการพัฒนา...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedMember && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>ข้อมูลสมาชิก</CardTitle>
            <CardDescription>รายละเอียดและประวัติของสมาชิก</CardDescription>
          </CardHeader>
          <CardContent>
            <VirtualLoyaltyCard memberData={selectedMember} />
          </CardContent>
        </Card>
      )}
    </Shell>
  );
};

export default VirtualLoyaltySystem;
