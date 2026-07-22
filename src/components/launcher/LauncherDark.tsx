import { useState } from 'react';
import { Link } from 'react-router-dom';
import { launcherGroups } from '@/data/launcherMenu';

export default function LauncherDark() {
  const [activeGroup, setActiveGroup] = useState(launcherGroups[0].id);
  const current = launcherGroups.find(g => g.id === activeGroup)!;

  return (
    <div className="rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 grid grid-cols-[220px_1fr] min-h-[500px]">
      {/* Sidebar */}
      <div className="bg-zinc-900/60 border-r border-zinc-800 p-4">
        <div className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-3 font-bold">Command Center</div>
        <div className="space-y-1">
          {launcherGroups.map((g) => {
            const GIcon = g.icon;
            const active = g.id === activeGroup;
            return (
              <button key={g.id} onClick={() => setActiveGroup(g.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  active ? 'bg-amber-400/10 text-amber-300 border-l-2 border-amber-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}>
                <GIcon className="w-4 h-4" />
                <span className="truncate">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-2xl font-bold text-white">{current.label}</h3>
          <span className="text-xs text-zinc-500">{current.items.length} เมนู</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {current.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={item.path}
                className="group relative rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-amber-400/60 hover:bg-zinc-800/60 transition-all">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.tint} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono">{item.path}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
