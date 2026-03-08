
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle2, Bell, Coffee, Utensils } from 'lucide-react';

interface QueueTicket {
  id: string;
  queue_number: number;
  customer_name: string | null;
  status: string;
  called_at: string | null;
  created_at: string;
}

const QueueTracker = () => {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('id');
  const queueNum = searchParams.get('q');
  
  const [myTicket, setMyTicket] = useState<QueueTicket | null>(null);
  const [aheadCount, setAheadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch my ticket
    let myData: QueueTicket | null = null;
    if (ticketId) {
      const { data } = await supabase.from('queue_tickets').select('*').eq('id', ticketId).single();
      myData = data as QueueTicket | null;
    } else if (queueNum) {
      const { data } = await supabase.from('queue_tickets').select('*')
        .eq('queue_number', parseInt(queueNum))
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      myData = data as QueueTicket | null;
    }

    setMyTicket(myData);

    if (myData && myData.status === 'waiting') {
      // Count how many waiting tickets are ahead
      const { count } = await supabase.from('queue_tickets')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .eq('status', 'waiting')
        .lt('queue_number', myData.queue_number);
      setAheadCount(count || 0);
    } else {
      setAheadCount(0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [ticketId, queueNum]);

  useEffect(() => {
    const channel = supabase.channel('queue-tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tickets' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ticketId, queueNum]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
      </div>
    );
  }

  if (!myTicket) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-white p-4">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">ไม่พบข้อมูลคิว</h2>
          <p className="text-slate-400 text-sm">กรุณาตรวจสอบ QR Code อีกครั้ง</p>
        </div>
      </div>
    );
  }

  const isCalled = myTicket.status === 'called';
  const isCompleted = myTicket.status === 'completed' || myTicket.status === 'seated';
  const isWaiting = myTicket.status === 'waiting';

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Utensils className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-lg font-bold text-blue-200">ติดตามคิวของคุณ</h1>
        </div>

        {/* Queue Number */}
        <div className={`rounded-3xl p-8 text-center mb-6 border-2 transition-all ${
          isCalled 
            ? 'bg-gradient-to-b from-yellow-500/20 to-amber-600/10 border-yellow-400/50 animate-pulse' 
            : isCompleted 
              ? 'bg-gradient-to-b from-green-500/20 to-emerald-600/10 border-green-400/50'
              : 'bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-blue-500/20'
        }`}>
          <div className="text-sm font-medium tracking-wider uppercase mb-2" style={{ color: isCalled ? '#fbbf24' : isCompleted ? '#34d399' : '#60a5fa' }}>
            คิวของคุณ
          </div>
          <div className={`text-8xl font-black leading-none ${
            isCalled ? 'text-yellow-400' : isCompleted ? 'text-green-400' : 'text-white'
          }`}>
            {String(myTicket.queue_number).padStart(3, '0')}
          </div>
          {myTicket.customer_name && (
            <p className="text-blue-200/70 mt-2">{myTicket.customer_name}</p>
          )}
        </div>

        {/* Status */}
        <div className={`rounded-2xl p-5 text-center mb-4 ${
          isCalled 
            ? 'bg-yellow-500/20 border border-yellow-400/40'
            : isCompleted 
              ? 'bg-green-500/20 border border-green-400/40'
              : 'bg-blue-500/10 border border-blue-400/20'
        }`}>
          {isCalled && (
            <>
              <Bell className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-bounce" />
              <h2 className="text-xl font-bold text-yellow-400">ถึงคิวของคุณแล้ว!</h2>
              <p className="text-yellow-200/70 text-sm mt-1">กรุณามารับบริการ</p>
            </>
          )}
          {isCompleted && (
            <>
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-green-400">รับบริการแล้ว</h2>
              <p className="text-green-200/70 text-sm mt-1">ขอบคุณที่ใช้บริการ</p>
            </>
          )}
          {isWaiting && (
            <>
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-blue-300">กำลังรอคิว</h2>
              <div className="mt-3 bg-slate-800/60 rounded-xl p-4">
                <div className="text-3xl font-black text-white">{aheadCount}</div>
                <p className="text-blue-300/60 text-sm mt-1">คิวก่อนหน้าคุณ</p>
              </div>
              <p className="text-slate-500 text-xs mt-3">อัปเดตอัตโนมัติแบบเรียลไทม์</p>
            </>
          )}
        </div>

        {/* Realtime indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          เชื่อมต่อเรียลไทม์
        </div>
      </div>
    </div>
  );
};

export default QueueTracker;
