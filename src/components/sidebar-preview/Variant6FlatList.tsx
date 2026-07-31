import { Link } from 'react-router-dom';
import { previewMenuGroups } from './menuData';

/** Variant 6 — Minimal dense flat list */
export default function Variant6FlatList() {
  return (
    <div className="w-60 h-full bg-card border-r border-border overflow-y-auto">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold tracking-tight text-foreground">Aile Coffee POS</p>
      </div>
      <div className="py-1">
        {previewMenuGroups.map((g) => (
          <div key={g.id}>
            <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
              {g.label}
            </p>
            {g.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group flex items-center gap-2.5 pl-4 pr-3 py-[7px] text-[13px] text-foreground/80 hover:text-foreground hover:bg-accent/60 border-l-2 border-transparent hover:border-primary transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
