import { Link } from 'react-router-dom';
import { launcherGroups } from '@/data/launcherMenu';

export default function LauncherIOSFolder() {
  return (
    <div className="rounded-3xl p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {launcherGroups.map((group) => {
          const GIcon = group.icon;
          return (
            <div key={group.id} className="rounded-3xl bg-white/10 backdrop-blur-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3 text-white">
                <GIcon className="w-4 h-4 opacity-80" />
                <span className="text-xs font-semibold opacity-90">{group.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.items.slice(0, 4).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.id} to={item.path}
                      className={`aspect-square rounded-2xl bg-gradient-to-br ${item.tint} flex flex-col items-center justify-center p-1 hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                      <span className="text-[9px] text-white font-medium mt-1 line-clamp-1 px-1 text-center">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              {group.items.length > 4 && (
                <div className="text-[10px] text-white/60 mt-2 text-center">+{group.items.length - 4} เพิ่มเติม</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
