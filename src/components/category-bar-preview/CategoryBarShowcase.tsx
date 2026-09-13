import {
  ChevronRight,
  Coffee,
  Grid3X3,
  Sparkles,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PreviewCategory {
  id: string;
  name: string;
}

interface Props {
  categories: PreviewCategory[];
  selected: string;
  onSelect: (id: string) => void;
  variant: number;
}

const baseButton = 'category-preview-body shrink-0 transition-all focus-visible:ring-2 focus-visible:ring-ring';

export default function CategoryBarShowcase({ categories, selected, onSelect, variant }: Props) {
  const item = (cat: PreviewCategory, className: string, children?: React.ReactNode) => (
    <Button
      key={cat.id}
      type="button"
      variant="ghost"
      onClick={() => onSelect(cat.id)}
      className={cn(baseButton, className, selected === cat.id && 'bg-muted')}
      aria-pressed={selected === cat.id}
    >
      {children ?? cat.name}
    </Button>
  );

  if (variant === 1) {
    return (
      <div className="flex items-end gap-0.5 overflow-x-auto border-b-2 border-foreground posv2-noscroll">
        {categories.map((cat, index) => item(cat,
          'h-9 rounded-none border-x border-t border-transparent px-3 text-xs text-muted-foreground hover:bg-muted aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background',
          <><span className="text-[10px] opacity-60">{String(index + 1).padStart(2, '0')}</span><span>{cat.name}</span></>
        ))}
      </div>
    );
  }

  if (variant === 2) {
    return (
      <div className="flex gap-1.5 overflow-x-auto py-1 posv2-noscroll">
        {categories.map((cat, index) => item(cat,
          'h-10 rounded-sm border border-border bg-card px-3 text-xs text-foreground shadow-sm hover:border-foreground aria-pressed:-translate-y-0.5 aria-pressed:border-foreground aria-pressed:shadow-md',
          <><span className="grid size-5 place-items-center rounded-full border border-current text-[10px]">{index + 1}</span><span>{cat.name}</span></>
        ))}
      </div>
    );
  }

  if (variant === 3) {
    const featured = categories[0];
    return (
      <div className="flex min-w-max items-stretch gap-1 overflow-x-auto posv2-noscroll">
        {featured && item(featured,
          'h-11 rounded-sm border-2 border-foreground bg-foreground px-4 text-background aria-pressed:bg-foreground',
          <><Sparkles className="size-3.5" /><span className="category-preview-serif text-sm">{featured.name}</span></>
        )}
        <div className="flex items-center gap-0.5 border-y border-border px-1">
          {categories.slice(1).map((cat) => item(cat,
            'h-9 rounded-none px-3 text-xs text-muted-foreground hover:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground aria-pressed:underline aria-pressed:underline-offset-4'
          ))}
        </div>
      </div>
    );
  }

  if (variant === 4) {
    const top = categories.slice(0, 4);
    const bottom = categories.slice(4);
    return (
      <div className="grid gap-0.5 border-l-4 border-foreground bg-muted p-1">
        <div className="flex gap-0.5 overflow-x-auto posv2-noscroll">
          <span className="category-preview-serif flex w-16 shrink-0 items-center px-2 text-[10px] font-bold">เครื่องดื่ม</span>
          {top.map((cat) => item(cat, 'h-7 rounded-sm px-2.5 text-[11px] aria-pressed:bg-foreground aria-pressed:text-background'))}
        </div>
        <div className="flex gap-0.5 overflow-x-auto posv2-noscroll">
          <span className="category-preview-serif flex w-16 shrink-0 items-center px-2 text-[10px] font-bold">อื่น ๆ</span>
          {bottom.map((cat) => item(cat, 'h-7 rounded-sm px-2.5 text-[11px] aria-pressed:bg-foreground aria-pressed:text-background'))}
        </div>
      </div>
    );
  }

  if (variant === 5) {
    return (
      <div className="grid grid-cols-4 border-l border-t border-border sm:grid-cols-8">
        {categories.map((cat, index) => item(cat,
          'h-11 rounded-none border-b border-r border-border bg-card px-1.5 text-[11px] hover:bg-muted aria-pressed:bg-foreground aria-pressed:text-background',
          <span className="flex flex-col items-center gap-0.5"><span className="category-preview-serif text-sm">{String(index + 1).padStart(2, '0')}</span>{cat.name}</span>
        ))}
      </div>
    );
  }

  if (variant === 6) {
    return (
      <div className="relative flex gap-1.5 overflow-x-auto border-y border-dashed border-foreground py-1.5 posv2-noscroll">
        {categories.map((cat) => item(cat,
          'h-9 rounded-none border border-foreground bg-card px-3 text-xs shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none aria-pressed:bg-foreground aria-pressed:text-background'
        ))}
      </div>
    );
  }

  if (variant === 7) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto bg-foreground px-3 py-2.5 text-background posv2-noscroll">
        <Coffee className="size-4 shrink-0" />
        {categories.map((cat) => item(cat,
          'category-preview-serif h-auto rounded-none px-0 py-0.5 text-xs text-background/60 hover:text-background aria-pressed:text-background aria-pressed:decoration-2 aria-pressed:underline aria-pressed:underline-offset-4'
        ))}
      </div>
    );
  }

  if (variant === 8) {
    return (
      <div className="flex gap-1 overflow-x-auto border-y border-border bg-card py-1 posv2-noscroll">
        {categories.map((cat) => item(cat, 'h-8 rounded-full border border-transparent px-3 text-xs aria-pressed:border-foreground aria-pressed:bg-muted'))}
      </div>
    );
  }

  if (variant === 9) {
    return (
      <div className="flex gap-0.5 overflow-x-auto rounded-sm bg-muted p-1 posv2-noscroll">
        {categories.map((cat, index) => item(cat,
          'h-9 rounded-sm px-3 text-xs text-muted-foreground hover:bg-card aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm',
          <><span className="size-2 rounded-full border border-current bg-current opacity-40" /><span>{cat.name}</span>{index === 0 && <Star className="size-3" />}</>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-stretch overflow-x-auto border-y-2 border-foreground bg-card posv2-noscroll">
      <div className="category-preview-serif flex shrink-0 items-center border-r-2 border-foreground px-3 text-xs font-bold">
        <Grid3X3 className="mr-1.5 size-3.5" />สารบัญเมนู
      </div>
      {categories.map((cat, index) => item(cat,
        'h-10 rounded-none border-r border-border px-3 text-xs aria-pressed:bg-muted aria-pressed:font-bold',
        <><span className="text-[10px] text-muted-foreground">{String.fromCharCode(65 + index)}</span><span>{cat.name}</span>{selected === cat.id && <ChevronRight className="size-3" />}</>
      ))}
    </div>
  );
}