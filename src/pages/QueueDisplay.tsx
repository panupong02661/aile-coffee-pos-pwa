
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Volume2, Clock, Utensils, Coffee } from 'lucide-react';

interface QueueTicket {
  id: string;
  queue_number: number;
  customer_name: string | null;
  status: string;
  called_at: string | null;
  created_at: string;
}

const speakQueue = (queueNumber: number) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`คิวที่ ${queueNumber} ค่ะ`);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
};

const QueueDisplay = () => {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [currentCalled, setCurrentCalled] = useState<QueueTicket | null>(null);
  const [flash, setFlash] = useState(false);
  const [time, setTime] = useState(new Date());
  const lastCalledIdRef = useRef<string | null>(null);

  const fetchTickets = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('queue_tickets')
      .select('*')
      .gte('created_at', today.toISOString())
      .in('status', ['waiting', 'called', 'seated'])
      .order('queue_number', { ascending: true });
    
    const all = (data || []) as QueueTicket[];
    setTickets(all);
    
    const called = all.filter(t => t.status === 'called').sort((a, b) => 
      new Date(b.called_at || 0).getTime() - new Date(a.called_at || 0).getTime()
    );
    if (called.length > 0 && called[0].id !== lastCalledIdRef.current) {
      lastCalledIdRef.current = called[0].id;
      setCurrentCalled(called[0]);
      setFlash(true);
      try { new Audio('/sounds/default-notification.mp3').play(); } catch {}
      setTimeout(() => speakQueue(called[0].queue_number), 500);
      setTimeout(() => setFlash(false), 4000);
    } else if (called.length > 0) {
      setCurrentCalled(called[0]);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    const channel = supabase.channel('queue-display-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tickets' }, () => fetchTickets())
      .subscribe();
    const interval = setInterval(fetchTickets, 10000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [fetchTickets]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const waiting = tickets.filter(t => t.status === 'waiting');
  const called = tickets.filter(t => t.status === 'called');

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">ระบบเรียกคิว</h1>
              <p className="text-xs text-blue-300/60">Queue Display System</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono tracking-widest text-blue-200">
              {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-blue-400/60">
              {time.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Main Called Number */}
        <div className={`text-center mb-8 transition-all duration-700 ${flash ? 'scale-105' : 'scale-100'}`}>
          <div className="inline-block relative">
            {/* Glow effect */}
            {flash && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20 rounded-3xl blur-2xl animate-pulse" />
            )}
            <div className={`relative bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border ${flash ? 'border-yellow-400/50' : 'border-blue-500/20'} px-12 py-8 md:px-20 md:py-10 transition-all duration-500`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Volume2 className={`w-5 h-5 ${flash ? 'text-yellow-400 animate-bounce' : 'text-blue-400'}`} />
                <span className={`text-sm font-medium tracking-wider uppercase ${flash ? 'text-yellow-400' : 'text-blue-400'}`}>
                  คิวที่เรียก
                </span>
              </div>
              {currentCalled ? (
                <>
                  <div className={`text-[100px] md:text-[160px] font-black leading-none tracking-tight transition-colors duration-500 ${flash ? 'text-yellow-400' : 'text-white'}`} style={{ textShadow: flash ? '0 0 60px rgba(250,204,21,0.4)' : '0 0 40px rgba(59,130,246,0.2)' }}>
                    {String(currentCalled.queue_number).padStart(3, '0')}
                  </div>
                  {currentCalled.customer_name && (
                    <p className={`text-xl mt-2 font-medium ${flash ? 'text-yellow-200' : 'text-blue-200/80'}`}>
                      {currentCalled.customer_name}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-7xl text-slate-600 font-light">---</div>
              )}
            </div>
          </div>
        </div>

        {/* Called + Waiting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Called Queue */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                เรียกแล้ว รอรับบริการ ({called.length})
              </h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {called.map(t => (
                <div key={t.id} className="bg-gradient-to-b from-blue-600/30 to-blue-700/20 backdrop-blur rounded-xl p-3 text-center border border-blue-500/30 hover:border-blue-400/50 transition-all">
                  <div className="text-2xl md:text-3xl font-bold text-white">{String(t.queue_number).padStart(3, '0')}</div>
                  {t.customer_name && <div className="text-[10px] text-blue-300/70 mt-1 truncate">{t.customer_name}</div>}
                </div>
              ))}
              {called.length === 0 && (
                <div className="col-span-full text-center py-6 text-slate-600 text-sm">ยังไม่มีคิวที่เรียก</div>
              )}
            </div>
          </div>

          {/* Waiting Queue */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">
                รอคิว ({waiting.length} คิว)
              </h3>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {waiting.map(t => (
                <div key={t.id} className="bg-slate-800/50 backdrop-blur rounded-lg p-2 text-center border border-slate-700/50">
                  <div className="text-lg font-bold text-slate-300">{String(t.queue_number).padStart(3, '0')}</div>
                  {t.customer_name && <div className="text-[9px] text-slate-500 truncate">{t.customer_name}</div>}
                </div>
              ))}
              {waiting.length === 0 && (
                <div className="col-span-full text-center py-6 text-slate-600 text-sm">ไม่มีคิวรอ</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0f1a] to-transparent pt-8 pb-3 px-4">
        <div className="flex justify-between items-center text-xs text-slate-600 max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3 h-3" />
            <span>POS — Queue System</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>เชื่อมต่อ Realtime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;
