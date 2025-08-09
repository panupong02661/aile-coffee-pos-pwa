
import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Search, Filter, Download, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const StockMovementHistory = () => {
  const { stockMovements, loading } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getMovementTypeLabel = (type: string) => {
    const types = {
      purchase: 'ซื้อเข้า',
      adjustment: 'ปรับปรุง',
      usage: 'ใช้งาน', 
      waste: 'ของเสีย'
    };
    return types[type as keyof typeof types] || type;
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'usage':
      case 'waste':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-blue-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const variants = {
      purchase: 'default',
      adjustment: 'secondary',
      usage: 'destructive',
      waste: 'outline'
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  const filteredMovements = stockMovements.filter(movement => {
    const matchesSearch = movement.ingredients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || movement.movement_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalInbound = stockMovements
    .filter(m => ['purchase', 'adjustment'].includes(m.movement_type) && m.quantity_change > 0)
    .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

  const totalOutbound = stockMovements
    .filter(m => ['usage', 'waste'].includes(m.movement_type) || m.quantity_change < 0)
    .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ประวัติการเคลื่อนไหวสต็อก</h1>
            <p className="text-gray-600">ติดตามการเคลื่อนไหวของวัตถุดิบและสินค้าคงคลัง</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                รับเข้าทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalInbound.toLocaleString()}</div>
              <p className="text-xs text-gray-600">หน่วย</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                จ่ายออกทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalOutbound.toLocaleString()}</div>
              <p className="text-xs text-gray-600">หน่วย</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="w-4 h-4 mr-2" />
                รายการเคลื่อนไหว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockMovements.length}</div>
              <p className="text-xs text-gray-600">รายการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาวัตถุดิบ หรือ หมายเหตุ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="ประเภทการเคลื่อนไหว" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="purchase">ซื้อเข้า</SelectItem>
                  <SelectItem value="adjustment">ปรับปรุง</SelectItem>
                  <SelectItem value="usage">ใช้งาน</SelectItem>
                  <SelectItem value="waste">ของเสีย</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Movement History Table */}
        <Card>
          <CardHeader>
            <CardTitle>ประวัติการเคลื่อนไหว</CardTitle>
            <CardDescription>รายละเอียดการเคลื่อนไหวของสต็อกทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>วัตถุดิบ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead>หน่วย</TableHead>
                  <TableHead>ราคาต่อหน่วย</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                  <TableHead>ผู้บันทึก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">
                      {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{movement.ingredients?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.movement_type)}
                        <Badge variant={getMovementBadge(movement.movement_type) as any}>
                          {getMovementTypeLabel(movement.movement_type)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className={`font-medium ${
                      movement.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                    </TableCell>
                    <TableCell>{movement.ingredients?.unit}</TableCell>
                    <TableCell>
                      {movement.cost_per_unit ? `฿${movement.cost_per_unit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>{movement.notes || '-'}</TableCell>
                    <TableCell>{movement.created_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredMovements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                ไม่พบข้อมูลการเคลื่อนไหวสต็อก
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

export default StockMovementHistory;
