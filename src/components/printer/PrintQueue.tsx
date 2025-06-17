
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Trash2, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrintJob {
  id: string;
  type: string;
  document: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  created_at: string;
  copies: number;
}

const PrintQueue = () => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching print jobs
    const mockJobs: PrintJob[] = [
      {
        id: '1',
        type: 'ใบเสร็จ',
        document: 'ใบเสร็จ #001234',
        status: 'printing',
        priority: 'high',
        created_at: '2025-01-17 21:00:00',
        copies: 1
      },
      {
        id: '2',
        type: 'รายงานยอดขาย',
        document: 'รายงานยอดขายรายวัน',
        status: 'pending',
        priority: 'normal',
        created_at: '2025-01-17 20:58:00',
        copies: 2
      },
      {
        id: '3',
        type: 'ใบเสร็จ',
        document: 'ใบเสร็จ #001233',
        status: 'completed',
        priority: 'normal',
        created_at: '2025-01-17 20:55:00',
        copies: 1
      },
      {
        id: '4',
        type: 'รายงานสินค้าคงคลัง',
        document: 'รายงานสต็อกสินค้า',
        status: 'failed',
        priority: 'low',
        created_at: '2025-01-17 20:50:00',
        copies: 1
      }
    ];
    setPrintJobs(mockJobs);
  }, []);

  const getStatusBadge = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />รอ</Badge>;
      case 'printing':
        return <Badge className="bg-blue-500 flex items-center gap-1"><Printer className="h-3 w-3" />กำลังพิมพ์</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" />เสร็จสิ้น</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />ล้มเหลว</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: PrintJob['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">สูง</Badge>;
      case 'normal':
        return <Badge variant="outline">ปกติ</Badge>;
      case 'low':
        return <Badge variant="secondary">ต่ำ</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleRetryJob = async (jobId: string) => {
    setLoading(true);
    try {
      // Simulate retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPrintJobs(jobs => jobs.map(job => 
        job.id === jobId ? { ...job, status: 'pending' as const } : job
      ));
      
      toast({
        title: 'ส่งงานพิมพ์ใหม่',
        description: 'ได้ส่งงานพิมพ์เข้าคิวใหม่แล้ว'
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถส่งงานพิมพ์ใหม่ได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setLoading(true);
    try {
      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPrintJobs(jobs => jobs.filter(job => job.id !== jobId));
      
      toast({
        title: 'ลบงานพิมพ์',
        description: 'ได้ลบงานพิมพ์ออกจากคิวแล้ว'
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถลบงานพิมพ์ได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCompleted = () => {
    setPrintJobs(jobs => jobs.filter(job => job.status !== 'completed'));
    toast({
      title: 'ล้างคิว',
      description: 'ได้ลบงานพิมพ์ที่เสร็จสิ้นแล้วออกจากคิว'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>คิวการพิมพ์</CardTitle>
              <CardDescription>จัดการงานพิมพ์ที่อยู่ในคิว</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleClearCompleted}
              disabled={!printJobs.some(job => job.status === 'completed')}
            >
              ล้างงานที่เสร็จสิ้น
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ประเภท</TableHead>
                <TableHead>เอกสาร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ความสำคัญ</TableHead>
                <TableHead>จำนวนสำเนา</TableHead>
                <TableHead>เวลา</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.type}</TableCell>
                  <TableCell>{job.document}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{getPriorityBadge(job.priority)}</TableCell>
                  <TableCell>{job.copies}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(job.created_at).toLocaleString('th-TH')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {job.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryJob(job.id)}
                          disabled={loading}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={loading || job.status === 'printing'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {printJobs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่มีงานพิมพ์ในคิว
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintQueue;
