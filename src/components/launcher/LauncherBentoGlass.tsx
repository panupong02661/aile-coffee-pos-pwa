import { Link } from 'react-router-dom';
import { launcherItemsFlat } from '@/data/launcherMenu';

export default function LauncherBentoGlass() {
  return (
    <div className="relative rounded-3xl overflow-hidden p-8"
      style={{ background: 'linear-gradient(135deg, #f5efe6 0%, #e8d5b7 40%, #c9a978 100%)' }}>
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0%, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0%, transparent 40%)' }} />
      <div className="relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {launcherItemsFlat.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.path}
              className="group rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 p-4 hover:bg-white/60 hover:scale-[1.02] transition-all shadow-sm">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.tint} flex items-center justify-center mb-3 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-stone-800">{item.label}</div>
              <div className="text-[11px] text-stone-600 mt-0.5">แตะเพื่อเปิด</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
