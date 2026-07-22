import { Link } from 'react-router-dom';
import { launcherItemsFlat } from '@/data/launcherMenu';

export default function LauncherIOS() {
  return (
    <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500">
      <div className="absolute inset-0 backdrop-blur-3xl bg-white/5" />
      <div className="relative grid grid-cols-4 md:grid-cols-6 gap-6">
        {launcherItemsFlat.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.path} className="flex flex-col items-center gap-2 group">
              <div className={`w-16 h-16 rounded-[22px] bg-gradient-to-br ${item.tint} shadow-lg flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95`}>
                <Icon className="w-8 h-8 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-xs text-white font-medium text-center line-clamp-2 drop-shadow">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
