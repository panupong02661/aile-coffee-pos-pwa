
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Volume2, Users, Clock } from 'lucide-react';

interface QueueTicket {
  id: string;
  queue_number: number;
  customer_name: string | null;
  status: string;
  called_at: string | null;
  created_at: string;
}

const QueueDisplay = () => {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [currentCalled, setCurrentCalled] = useState<QueueTicket | null>(null);
  const [flash, setFlash] = useState(false);

  const fetchTickets = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('queue_tickets')
      .select('*')
      .gte('created_at', today.toISOString())
      .in('status', ['waiting', 'called', 'seated'])
      .order('queue_number', { ascending: true });
    
    const all = data || [];
    setTickets(all);
    
    const called = all.filter(t => t.status === 'called').sort((a, b) => 
      new Date(b.called_at || 0).getTime() - new Date(a.called_at || 0).getTime()
    );
    if (called.length > 0 && called[0].id !== currentCalled?.id) {
      setCurrentCalled(called[0]);
      setFlash(true);
      try { new Audio('/sounds/default-notification.mp3').play(); } catch {}
      setTimeout(() => setFlash(false), 3000);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    const channel = supabase.channel('queue-display')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tickets' }, () => fetchTickets())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentCalled]);

  const waiting = tickets.filter(t => t.status === 'waiting');
  const called = tickets.filter(t => t.status === 'called');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 md:p-8">
      {/* Current Called */}
      <div className={`text-center mb-8 transition-all duration-500 ${flash ? 'scale-110' : 'scale-100'}`}>
        <p className="text-lg text-blue-300 mb-2 flex items-center justify-center gap-2">
          <Volume2 className={`w-5 h-5 ${flash ? 'animate-bounce' : ''}`} /> คิวที่เรียก
        </p>
        {currentCalled ? (
          <>
            <div className={`text-[120px] md:text-[180px] font-black leading-none tracking-tight ${flash ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
              {currentCalled.queue_number}
            </div>
            {currentCalled.customer_name && (
              <p className="text-2xl text-blue-200 mt-2">{currentCalled.customer_name}</p>
            )}
          </>
        ) : (
          <div className="text-6xl text-slate-500 mt-4">—</div>
        )}
      </div>

      {/* Called Queue List */}
      {called.length > 1 && (
        <div className="mb-6">
          <h3 className="text-sm text-blue-400 mb-2">เรียกแล้ว รอรับบริการ</h3>
          <div className="flex flex-wrap gap-3">
            {called.slice(1).map(t => (
              <div key={t.id} className="bg-blue-800/50 rounded-xl px-6 py-3 text-center border border-blue-600">
                <div className="text-3xl font-bold">{t.queue_number}</div>
                {t.customer_name && <div className="text-xs text-blue-300">{t.customer_name}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waiting Queue */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm text-yellow-400">รอคิว ({waiting.length} คิว)</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {waiting.map(t => (
            <div key={t.id} className="bg-slate-800/60 rounded-lg px-4 py-2 text-center border border-slate-700">
              <div className="text-xl font-bold text-slate-300">{t.queue_number}</div>
              {t.customer_name && <div className="text-[10px] text-slate-500">{t.customer_name}</div>}
            </div>
          ))}
          {waiting.length === 0 && <p className="text-slate-600 text-sm">ไม่มีคิวรอ</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur p-3 flex justify-between text-xs text-slate-500">
        <span>ระบบคิว Aile Coffee POS</span>
        <span>{new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  );
};

export default QueueDisplay;
