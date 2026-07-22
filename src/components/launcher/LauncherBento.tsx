import { Link } from 'react-router-dom';
import { launcherItemsFlat } from '@/data/launcherMenu';

export default function LauncherBento() {
  const pos = launcherItemsFlat.find(i => i.id === 'pos')!;
  const dashboard = launcherItemsFlat.find(i => i.id === 'dashboard')!;
  const reports = launcherItemsFlat.find(i => i.id === 'reports')!;
  const menu = launcherItemsFlat.find(i => i.id === 'menu')!;
  const rest = launcherItemsFlat.filter(i => !['pos', 'dashboard', 'reports', 'menu'].includes(i.id));

  const Tile = ({ item, className = '', showStat }: any) => {
    const Icon = item.icon;
    return (
      <Link to={item.path}
        className={`group relative rounded-3xl bg-card border border-border p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden ${className}`}>
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${item.tint} opacity-20 group-hover:opacity-40 transition-opacity`} />
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.tint} flex items-center justify-center mb-3 shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-base font-semibold text-foreground">{item.label}</div>
        {showStat && <div className="mt-2 text-3xl font-bold text-foreground">฿12,450</div>}
        {showStat && <div className="text-xs text-muted-foreground">ยอดวันนี้</div>}
      </Link>
    );
  };

  return (
    <div className="rounded-3xl p-6 bg-muted/30">
      <div className="grid grid-cols-4 auto-rows-[110px] gap-3">
        <Tile item={pos} className="col-span-2 row-span-2" showStat />
        <Tile item={dashboard} className="col-span-2" />
        <Tile item={reports} className="col-span-1" />
        <Tile item={menu} className="col-span-1" />
        {rest.slice(0, 12).map((item) => (
          <Tile key={item.id} item={item} className="col-span-1" />
        ))}
      </div>
    </div>
  );
}
