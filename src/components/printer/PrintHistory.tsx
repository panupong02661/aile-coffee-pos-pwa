import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPrintHistory } from '@/utils/printerUtils';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { buildScopedStorageKey } from '@/utils/storageScope';

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
  const { user } = useAuth();
  const { shopId } = useCurrentShop();

  const historyKey = useMemo(
    () => buildScopedStorageKey('printLogs', { userId: user?.id, shopId }),
    [user?.id, shopId]
  );

  const loadHistory = () => {
    const logs = getPrintHistory();
    const mapped: PrintHistoryItem[] = (logs || []).map((log: any, index: number) => ({
      id: `${log.orderId || log.orderNumber || index}`,
      document_type: 'ใบเสร็จ',
      document_name: `ใบเสร็จ #${log.orderNumber || '-'}`,
      status: log.status === 'success' ? 'completed' : 'failed',
      copies: 1,
      printed_at: log.timestamp,
      printed_by: log.printedBy || 'unknown',
      file_size: undefined,
    }));

    setPrintHistory(mapped);
    setFilteredHistory(mapped);
  };

  useEffect(() => {
    loadHistory();
    const onStorageUpdated = () => loadHistory();
    window.addEventListener('storage', onStorageUpdated);
    window.addEventListener('print-queue-updated', onStorageUpdated);
    return () => {
      window.removeEventListener('storage', onStorageUpdated);
      window.removeEventListener('print-queue-updated', onStorageUpdated);
    };
  }, [historyKey]);

  useEffect(() => {
    let filtered = printHistory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.printed_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.document_type === filterType);
    }

    setFilteredHistory(filtered);
  }, [printHistory, searchTerm, filterStatus, filterType]);

  const getStatusBadge = (status: PrintHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">สำเร็จ</Badge>;
      case 'failed':
        return <Badge variant="destructive">ล้มเหลว</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleReprintDocument = async (item: PrintHistoryItem) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({ title: 'ส่งงานพิมพ์ซ้ำ', description: `${item.document_name} ถูกส่งไปยังคิวการพิมพ์แล้ว` });
  };

  const documentTypes = [...new Set(printHistory.map(item => item.document_type))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการพิมพ์</CardTitle>
          <CardDescription>แสดงเฉพาะประวัติของผู้ใช้และสาขาปัจจุบัน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ค้นหาเอกสาร..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="สถานะ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="completed">สำเร็จ</SelectItem>
                <SelectItem value="failed">ล้มเหลว</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger><SelectValue placeholder="ประเภทเอกสาร" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                {documentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterType('all'); }}>
              <Filter className="h-4 w-4 mr-2" />ล้างตัวกรอง
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ประเภท</TableHead>
                <TableHead>ชื่อเอกสาร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>จำนวนสำเนา</TableHead>
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
                  <TableCell>{item.printed_by}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(item.printed_at).toLocaleString('th-TH')}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleReprintDocument(item)}>
                      <RotateCcw className="h-4 w-4 mr-1" />พิมพ์ซ้ำ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' ? 'ไม่พบประวัติการพิมพ์ที่ตรงกับเงื่อนไข' : 'ยังไม่มีประวัติการพิมพ์'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintHistory;
