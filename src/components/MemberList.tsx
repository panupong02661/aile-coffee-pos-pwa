
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Award } from 'lucide-react';
import MemberEditForm from '@/components/MemberEditForm';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
  join_date: string;
}

const MemberList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลสมาชิกได้', variant: 'destructive' });
      return;
    }
    
    // Cast the data to the correct types
    const typedMembers = (data || []).map(member => ({
      ...member,
      tier: member.tier as 'silver' | 'gold' | 'platinum'
    }));
    
    setMembers(typedMembers);
    setFilteredMembers(typedMembers);
    setLoading(false);
  };

  const filterMembers = () => {
    let filtered = members;
    
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (tierFilter !== 'all') {
      filtered = filtered.filter(member => member.tier === tierFilter);
    }
    
    setFilteredMembers(filtered);
  };

  const deleteMember = async (id: string) => {
    if (!confirm('คุณต้องการลบสมาชิกนี้หรือไม่?')) return;
    
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบสมาชิกได้', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'สำเร็จ', description: 'ลบสมาชิกเรียบร้อยแล้ว' });
    fetchMembers();
  };

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

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, tierFilter, members]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">กำลังโหลดข้อมูลสมาชิก...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          รายชื่อสมาชิก
        </CardTitle>
        <CardDescription>จัดการข้อมูลสมาชิกทั้งหมด</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, หรืออีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="เลือกระดับสมาชิก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกระดับ</SelectItem>
              <SelectItem value="silver">เงิน</SelectItem>
              <SelectItem value="gold">ทอง</SelectItem>
              <SelectItem value="platinum">แพลตินัม</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>ระดับ</TableHead>
                <TableHead>แต้ม</TableHead>
                <TableHead>ยอดซื้อรวม</TableHead>
                <TableHead>วันที่เข้าร่วม</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.email || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getTierBadgeColor(member.tier)}>
                      {getTierName(member.tier)}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.points.toLocaleString()}</TableCell>
                  <TableCell>฿{member.total_spent.toLocaleString()}</TableCell>
                  <TableCell>{new Date(member.join_date).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>แก้ไขข้อมูลสมาชิก</DialogTitle>
                          </DialogHeader>
                          {editingMember && (
                            <MemberEditForm
                              member={editingMember}
                              onSuccess={() => {
                                fetchMembers();
                                setEditingMember(null);
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบข้อมูลสมาชิก
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberList;
