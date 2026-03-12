

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { Coins, History } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  phone: string;
  points: number;
}

interface PointTransaction {
  id: string;
  member_id: string;
  points_change: number;
  transaction_type: string;
  description: string;
  created_at: string;
  members: {
    name: string;
    phone: string;
  };
}

const PointsManagement = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [pointsChange, setPointsChange] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<string>('adjust');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { shopId, loading: shopLoading } = useCurrentShop();

  const fetchMembers = async () => {
    if (!shopId) {
      setMembers([]);
      return;
    }

    const { data, error } = await supabase
      .from('members')
      .select('id, name, phone, points')
      .eq('shop_id', shopId)
      .order('name');

    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลสมาชิกได้', variant: 'destructive' });
      return;
    }

    setMembers(data || []);
  };

  const fetchTransactions = async () => {
    if (!shopId) {
      setTransactions([]);
      return;
    }

    const { data, error } = await supabase
      .from('point_transactions')
      .select(`
        *,
        members (name, phone)
      `)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดประวัติการใช้แต้มได้', variant: 'destructive' });
      return;
    }

    setTransactions((data as PointTransaction[]) || []);
  };

  const handlePointsAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่พบข้อมูลสาขา', variant: 'destructive' });
      return;
    }
    if (!selectedMember || pointsChange === 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกสมาชิกและกรอกจำนวนแต้ม', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const member = members.find(m => m.id === selectedMember);
      if (!member) return;

      const newPoints = Math.max(0, member.points + pointsChange);

      const { error: updateError } = await supabase
        .from('members')
        .update({ points: newPoints })
        .eq('id', selectedMember)
        .eq('shop_id', shopId);

      if (updateError) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถอัพเดทแต้มได้', variant: 'destructive' });
        return;
      }

      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert([{
          member_id: selectedMember,
          points_change: pointsChange,
          transaction_type: transactionType,
          description: description || `${pointsChange > 0 ? 'เพิ่ม' : 'หัก'}แต้มโดยผู้ดูแลระบบ`,
          shop_id: shopId,
        }]);

      if (transactionError) {
        toast({ title: 'คำเตือน', description: 'อัพเดทแต้มสำเร็จ แต่ไม่สามารถบันทึกประวัติได้', variant: 'destructive' });
      }

      toast({ title: 'สำเร็จ', description: 'อัพเดทแต้มเรียบร้อยแล้ว' });
      setSelectedMember('');
      setPointsChange(0);
      setDescription('');
      fetchMembers();
      fetchTransactions();
    } catch {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดที่ไม่คาดคิด', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case 'earn': return 'bg-green-100 text-green-800';
      case 'redeem': return 'bg-red-100 text-red-800';
      case 'adjust': return 'bg-blue-100 text-blue-800';
      case 'expire': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case 'earn': return 'ได้รับ';
      case 'redeem': return 'แลก';
      case 'adjust': return 'ปรับแต้ม';
      case 'expire': return 'หมดอายุ';
      default: return type;
    }
  };

  useEffect(() => {
    if (shopLoading) return;
    if (!shopId) {
      setMembers([]);
      setTransactions([]);
      return;
    }
    fetchMembers();
    fetchTransactions();
  }, [shopId, shopLoading]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Coins className="w-5 h-5" />จัดการแต้มสมาชิก</CardTitle>
          <CardDescription>เพิ่ม ลด หรือปรับแต้มของสมาชิก</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePointsAdjustment} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="member-select">เลือกสมาชิก</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger><SelectValue placeholder="เลือกสมาชิก" /></SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.phone}) - แต้มปัจจุบัน: {member.points.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points-change">จำนวนแต้ม (+ เพิ่ม, - ลด)</Label>
              <Input id="points-change" type="number" value={pointsChange} onChange={(e) => setPointsChange(parseInt(e.target.value) || 0)} placeholder="กรอกจำนวนแต้ม" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-type">ประเภทการทำรายการ</Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjust">ปรับแต้ม</SelectItem>
                  <SelectItem value="earn">ให้แต้มพิเศษ</SelectItem>
                  <SelectItem value="redeem">หักแต้ม</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">หมายเหตุ</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="เหตุผลในการปรับแต้ม (ไม่บังคับ)" rows={3} />
            </div>

            <Button type="submit" disabled={loading || shopLoading} className="w-full">{loading ? 'กำลังอัพเดท...' : 'อัพเดทแต้ม'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="w-5 h-5" />ประวัติการใช้แต้ม</CardTitle>
          <CardDescription>ประวัติการทำรายการแต้มล่าสุด 50 รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สมาชิก</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>แต้มที่เปลี่ยนแปลง</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                  <TableHead>วันที่</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.members?.name || '-'}</div>
                        <div className="text-sm text-gray-500">{transaction.members?.phone || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell><Badge className={getTransactionBadgeColor(transaction.transaction_type)}>{getTransactionTypeName(transaction.transaction_type)}</Badge></TableCell>
                    <TableCell className={transaction.points_change > 0 ? 'text-green-600' : 'text-red-600'}>{transaction.points_change > 0 ? '+' : ''}{transaction.points_change}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleString('th-TH')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsManagement;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Coins, History } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  phone: string;
  points: number;
}

interface PointTransaction {
  id: string;
  member_id: string;
  points_change: number;
  transaction_type: string;
  description: string;
  created_at: string;
  members: {
    name: string;
    phone: string;
  };
}

const PointsManagement = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [pointsChange, setPointsChange] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<string>('adjust');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('id, name, phone, points')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลสมาชิกได้', variant: 'destructive' });
      return;
    }
    
    setMembers(data || []);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('point_transactions')
      .select(`
        *,
        members (name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดประวัติการใช้แต้มได้', variant: 'destructive' });
      return;
    }
    
    setTransactions(data || []);
  };

  const handlePointsAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || pointsChange === 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกสมาชิกและกรอกจำนวนแต้ม', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      // Update member points
      const member = members.find(m => m.id === selectedMember);
      if (!member) return;

      const newPoints = Math.max(0, member.points + pointsChange);
      
      const { error: updateError } = await supabase
        .from('members')
        .update({ points: newPoints })
        .eq('id', selectedMember);

      if (updateError) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถอัพเดทแต้มได้', variant: 'destructive' });
        return;
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert([{
          member_id: selectedMember,
          points_change: pointsChange,
          transaction_type: transactionType,
          description: description || `${pointsChange > 0 ? 'เพิ่ม' : 'หัก'}แต้มโดยผู้ดูแลระบบ`
        }]);

      if (transactionError) {
        toast({ title: 'คำเตือน', description: 'อัพเดทแต้มสำเร็จ แต่ไม่สามารถบันทึกประวัติได้', variant: 'destructive' });
      }

      toast({ title: 'สำเร็จ', description: 'อัพเดทแต้มเรียบร้อยแล้ว' });
      
      // Reset form
      setSelectedMember('');
      setPointsChange(0);
      setDescription('');
      
      // Refresh data
      fetchMembers();
      fetchTransactions();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดที่ไม่คาดคิด', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case 'earn': return 'bg-green-100 text-green-800';
      case 'redeem': return 'bg-red-100 text-red-800';
      case 'adjust': return 'bg-blue-100 text-blue-800';
      case 'expire': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case 'earn': return 'ได้รับ';
      case 'redeem': return 'แลก';
      case 'adjust': return 'ปรับแต้ม';
      case 'expire': return 'หมดอายุ';
      default: return type;
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            จัดการแต้มสมาชิก
          </CardTitle>
          <CardDescription>เพิ่ม ลด หรือปรับแต้มของสมาชิก</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePointsAdjustment} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="member-select">เลือกสมาชิก</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสมาชิก" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.phone}) - แต้มปัจจุบัน: {member.points.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points-change">จำนวนแต้ม (+ เพิ่ม, - ลด)</Label>
              <Input
                id="points-change"
                type="number"
                value={pointsChange}
                onChange={(e) => setPointsChange(parseInt(e.target.value) || 0)}
                placeholder="กรอกจำนวนแต้ม"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-type">ประเภทการทำรายการ</Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjust">ปรับแต้ม</SelectItem>
                  <SelectItem value="earn">ให้แต้มพิเศษ</SelectItem>
                  <SelectItem value="redeem">หักแต้ม</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">หมายเหตุ</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เหตุผลในการปรับแต้ม (ไม่บังคับ)"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'กำลังอัพเดท...' : 'อัพเดทแต้ม'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            ประวัติการใช้แต้ม
          </CardTitle>
          <CardDescription>ประวัติการทำรายการแต้มล่าสุด 50 รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สมาชิก</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>แต้มที่เปลี่ยนแปลง</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                  <TableHead>วันที่</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.members.name}</div>
                        <div className="text-sm text-gray-500">{transaction.members.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTransactionBadgeColor(transaction.transaction_type)}>
                        {getTransactionTypeName(transaction.transaction_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={transaction.points_change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.points_change > 0 ? '+' : ''}{transaction.points_change.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleString('th-TH')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีประวัติการทำรายการ
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsManagement;
