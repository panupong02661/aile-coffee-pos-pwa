import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatTone = 'primary' | 'success' | 'warning' | 'info';

const toneMap: Record<StatTone, { icon: string; value: string; glow: string }> = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    value: 'text-foreground',
    glow: 'from-primary/15',
  },
  success: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
    glow: 'from-emerald-500/15',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
    glow: 'from-amber-500/15',
  },
  info: {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    value: 'text-sky-600 dark:text-sky-400',
    glow: 'from-sky-500/15',
  },
};

interface StatCardProps {
  label: string;
  value: string;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  trend?: number;
  className?: string;
}

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
  trend,
  className,
}: StatCardProps) {
  const t = toneMap[tone];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br to-transparent',
          t.glow
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-2xl font-bold leading-tight tabular-nums', t.value)}>{value}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {hint}
            {typeof trend === 'number' && trend !== 0 && (
              <span
                className={cn(
                  'font-medium',
                  trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                )}
              >
                {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', t.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
