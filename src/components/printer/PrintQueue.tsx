import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Trash2, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { buildScopedStorageKey } from '@/utils/storageScope';

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
  const { user } = useAuth();
  const { shopId } = useCurrentShop();

  const queueKey = useMemo(
    () => buildScopedStorageKey('printQueue', { userId: user?.id, shopId }),
    [user?.id, shopId]
  );

  const syncQueue = () => {
    try {
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      setPrintJobs(Array.isArray(queue) ? queue : []);
    } catch {
      setPrintJobs([]);
    }
  };

  useEffect(() => {
    syncQueue();
    const onQueueUpdated = () => syncQueue();
    window.addEventListener('print-queue-updated', onQueueUpdated);
    window.addEventListener('storage', onQueueUpdated);
    return () => {
      window.removeEventListener('print-queue-updated', onQueueUpdated);
      window.removeEventListener('storage', onQueueUpdated);
    };
  }, [queueKey]);

  const persistQueue = (jobs: PrintJob[]) => {
    setPrintJobs(jobs);
    localStorage.setItem(queueKey, JSON.stringify(jobs));
    window.dispatchEvent(new Event('print-queue-updated'));
  };

  const getStatusBadge = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />รอ</Badge>;
      case 'printing':
        return <Badge variant="secondary" className="flex items-center gap-1"><Printer className="h-3 w-3" />กำลังพิมพ์</Badge>;
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />เสร็จสิ้น</Badge>;
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
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = printJobs.map(job =>
        job.id === jobId ? { ...job, status: 'pending' as const } : job
      );
      persistQueue(updated);
      toast({ title: 'ส่งงานพิมพ์ใหม่', description: 'ได้ส่งงานพิมพ์เข้าคิวใหม่แล้ว' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      persistQueue(printJobs.filter(job => job.id !== jobId));
      toast({ title: 'ลบงานพิมพ์', description: 'ได้ลบงานพิมพ์ออกจากคิวแล้ว' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCompleted = () => {
    persistQueue(printJobs.filter(job => job.status !== 'completed'));
    toast({ title: 'ล้างคิว', description: 'ได้ลบงานพิมพ์ที่เสร็จสิ้นแล้วออกจากคิว' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>คิวการพิมพ์</CardTitle>
              <CardDescription>จัดการงานพิมพ์ที่อยู่ในคิวเฉพาะสาขาปัจจุบัน</CardDescription>
            </div>
            <Button variant="outline" onClick={handleClearCompleted} disabled={!printJobs.some(job => job.status === 'completed')}>
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
                  <TableCell className="text-sm text-muted-foreground">{new Date(job.created_at).toLocaleString('th-TH')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {job.status === 'failed' && (
                        <Button size="sm" variant="outline" onClick={() => handleRetryJob(job.id)} disabled={loading}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDeleteJob(job.id)} disabled={loading || job.status === 'printing'}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {printJobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">ยังไม่มีงานพิมพ์สำหรับผู้ใช้/สาขานี้</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintQueue;
