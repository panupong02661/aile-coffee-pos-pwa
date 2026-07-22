import { Link } from 'react-router-dom';
import { launcherGroups } from '@/data/launcherMenu';

export default function LauncherMinimal() {
  return (
    <div className="rounded-3xl p-10 bg-[#faf7f2] border border-stone-200">
      <div className="space-y-10">
        {launcherGroups.map((group, gi) => (
          <div key={group.id}>
            <div className="flex items-baseline gap-4 mb-5 pb-2 border-b border-stone-300">
              <span className="text-xs font-mono text-stone-500">{String(gi + 1).padStart(2, '0')}</span>
              <h3 className="text-lg font-serif text-stone-800 tracking-wide">{group.label}</h3>
              <span className="flex-1 border-b border-dotted border-stone-300 translate-y-[-4px]" />
              <span className="text-xs text-stone-400">{group.items.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-6">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.id} to={item.path}
                    className="group flex items-center gap-3 py-1 hover:text-stone-900 text-stone-600 transition-colors">
                    <Icon className="w-4 h-4 opacity-60 group-hover:opacity-100" strokeWidth={1.5} />
                    <span className="text-sm">{item.label}</span>
                    <span className="ml-auto text-xs opacity-0 group-hover:opacity-60 transition-opacity">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
