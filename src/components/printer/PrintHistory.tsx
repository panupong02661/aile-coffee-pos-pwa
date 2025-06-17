
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrintHistoryItem {
  id: string;
  document_type: string;
  document_name: string;
  status: 'completed' | 'failed';
  copies: number;
  printed_at: string;
  printed_by: string;
  file_size?: string;
}

const PrintHistory = () => {
  const [printHistory, setPrintHistory] = useState<PrintHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PrintHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching print history
    const mockHistory: PrintHistoryItem[] = [
      {
        id: '1',
        document_type: 'ใบเสร็จ',
        document_name: 'ใบเสร็จ #001234',
        status: 'completed',
        copies: 1,
        printed_at: '2025-01-17 21:05:00',
        printed_by: 'admin',
        file_size: '2.3 KB'
      },
      {
        id: '2',
        document_type: 'รายงานยอดขาย',
        document_name: 'รายงานยอดขายรายวัน',
        status: 'completed',
        copies: 2,
        printed_at: '2025-01-17 20:58:00',
        printed_by: 'manager',
        file_size: '15.7 KB'
      },
      {
        id: '3',
        document_type: 'ใบเสร็จ',
        document_name: 'ใบเสร็จ #001233',
        status: 'completed',
        copies: 1,
        printed_at: '2025-01-17 20:55:00',
        printed_by: 'cashier1',
        file_size: '2.1 KB'
      },
      {
        id: '4',
        document_type: 'รายงานสินค้าคงคลัง',
        document_name: 'รายงานสต็อกสินค้า',
        status: 'failed',
        copies: 1,
        printed_at: '2025-01-17 20:50:00',
        printed_by: 'admin',
        file_size: '45.2 KB'
      },
      {
        id: '5',
        document_type: 'ใบเสร็จ',
        document_name: 'ใบเสร็จ #001232',
        status: 'completed',
        copies: 1,
        printed_at: '2025-01-17 20:45:00',
        printed_by: 'cashier2',
        file_size: '2.4 KB'
      }
    ];
    setPrintHistory(mockHistory);
    setFilteredHistory(mockHistory);
  }, []);

  useEffect(() => {
    let filtered = printHistory;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.printed_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Filter by document type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.document_type === filterType);
    }

    setFilteredHistory(filtered);
  }, [printHistory, searchTerm, filterStatus, filterType]);

  const getStatusBadge = (status: PrintHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">สำเร็จ</Badge>;
      case 'failed':
        return <Badge variant="destructive">ล้มเหลว</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleReprintDocument = async (item: PrintHistoryItem) => {
    try {
      // Simulate reprint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'ส่งงานพิมพ์ซ้ำ',
        description: `${item.document_name} ถูกส่งไปยังคิวการพิมพ์แล้ว`
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถส่งงานพิมพ์ซ้ำได้',
        variant: 'destructive'
      });
    }
  };

  const documentTypes = [...new Set(printHistory.map(item => item.document_type))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการพิมพ์</CardTitle>
          <CardDescription>ดูประวัติการพิมพ์ทั้งหมดและพิมพ์ซ้ำได้</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาเอกสาร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="completed">สำเร็จ</SelectItem>
                <SelectItem value="failed">ล้มเหลว</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="ประเภทเอกสาร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                {documentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterType('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              ล้างตัวกรอง
            </Button>
          </div>

          {/* History Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ประเภท</TableHead>
                <TableHead>ชื่อเอกสาร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>จำนวนสำเนา</TableHead>
                <TableHead>ขนาดไฟล์</TableHead>
                <TableHead>พิมพ์โดย</TableHead>
                <TableHead>เวลาที่พิมพ์</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.document_type}</TableCell>
                  <TableCell>{item.document_name}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.copies}</TableCell>
                  <TableCell className="text-sm text-gray-500">{item.file_size}</TableCell>
                  <TableCell>{item.printed_by}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(item.printed_at).toLocaleString('th-TH')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReprintDocument(item)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      พิมพ์ซ้ำ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'ไม่พบประวัติการพิมพ์ที่ตรงกับเงื่อนไข'
                : 'ยังไม่มีประวัติการพิมพ์'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintHistory;
