import {
  ChevronRight,
  Coffee,
  Grid3X3,
  Search,
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
      className={cn(baseButton, className, selected === cat.id && 'is-active')}
      aria-pressed={selected === cat.id}
    >
      {children ?? cat.name}
    </Button>
  );

  if (variant === 1) {
    return (
      <div className="flex items-end gap-1 overflow-x-auto border-b-2 border-foreground px-2 posv2-noscroll">
        {categories.map((cat, index) => item(cat,
          'h-12 rounded-none border-x border-t border-transparent px-5 text-sm text-muted-foreground hover:bg-muted is-[.is-active]:border-foreground is-[.is-active]:bg-foreground is-[.is-active]:text-background',
          <><span className="text-[10px] opacity-60">{String(index + 1).padStart(2, '0')}</span><span>{cat.name}</span></>
        ))}
      </div>
    );
  }

  if (variant === 2) {
    return (
      <div className="flex gap-3 overflow-x-auto py-2 posv2-noscroll">
        {categories.map((cat, index) => item(cat,
          'h-14 min-w-28 rounded-sm border border-border bg-card px-4 text-foreground shadow-sm hover:border-foreground is-[.is-active]:-translate-y-1 is-[.is-active]:border-foreground is-[.is-active]:shadow-md',
          <><span className="grid size-7 place-items-center rounded-full border border-current text-xs">{index + 1}</span><span>{cat.name}</span></>
        ))}
      </div>
    );
  }

  if (variant === 3) {
    const featured = categories[0];
    return (
      <div className="flex min-w-max items-stretch gap-2 overflow-x-auto posv2-noscroll">
        {featured && item(featured,
          'h-16 rounded-sm border-2 border-foreground bg-foreground px-6 text-background is-[.is-active]:bg-foreground',
          <><Sparkles className="size-4" /><span className="category-preview-serif text-base">{featured.name}</span></>
        )}
        <div className="flex items-center gap-1 border-y border-border px-2">
          {categories.slice(1).map((cat) => item(cat,
            'h-10 rounded-none px-4 text-sm text-muted-foreground hover:text-foreground is-[.is-active]:bg-muted is-[.is-active]:text-foreground is-[.is-active]:underline is-[.is-active]:underline-offset-8'
          ))}
        </div>
      </div>
    );
  }

  if (variant === 4) {
    const top = categories.slice(0, 4);
    const bottom = categories.slice(4);
    return (
      <div className="grid gap-1 border-l-4 border-foreground bg-muted p-2">
        <div className="flex gap-1 overflow-x-auto posv2-noscroll">
          <span className="category-preview-serif flex w-20 shrink-0 items-center px-3 text-xs font-bold">เครื่องดื่ม</span>
          {top.map((cat) => item(cat, 'h-8 rounded-sm px-3 text-xs is-[.is-active]:bg-foreground is-[.is-active]:text-background'))}
        </div>
        <div className="flex gap-1 overflow-x-auto posv2-noscroll">
          <span className="category-preview-serif flex w-20 shrink-0 items-center px-3 text-xs font-bold">อื่น ๆ</span>
          {bottom.map((cat) => item(cat, 'h-8 rounded-sm px-3 text-xs is-[.is-active]:bg-foreground is-[.is-active]:text-background'))}
        </div>
      </div>
    );
  }

  if (variant === 5) {
    return (
      <div className="grid grid-cols-4 border-l border-t border-border sm:grid-cols-8">
        {categories.map((cat, index) => item(cat,
          'h-16 rounded-none border-b border-r border-border bg-card px-2 text-xs hover:bg-muted is-[.is-active]:bg-foreground is-[.is-active]:text-background',
          <span className="flex flex-col items-center gap-1"><span className="category-preview-serif text-lg">{String(index + 1).padStart(2, '0')}</span>{cat.name}</span>
        ))}
      </div>
    );
  }

  if (variant === 6) {
    return (
      <div className="relative flex gap-2 overflow-x-auto border-y border-dashed border-foreground py-3 posv2-noscroll">
        {categories.map((cat) => item(cat,
          'h-11 rounded-none border border-foreground bg-card px-5 text-sm shadow-[3px_3px_0_hsl(var(--foreground))] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none is-[.is-active]:bg-foreground is-[.is-active]:text-background'
        ))}
      </div>
    );
  }

  if (variant === 7) {
    return (
      <div className="flex items-center gap-5 overflow-x-auto bg-foreground px-5 py-4 text-background posv2-noscroll">
        <Coffee className="size-6 shrink-0" />
        {categories.map((cat) => item(cat,
          'category-preview-serif h-auto rounded-none px-0 py-1 text-base text-background/60 hover:text-background is-[.is-active]:text-background is-[.is-active]:decoration-2 is-[.is-active]:underline is-[.is-active]:underline-offset-8'
        ))}
      </div>
    );
  }

  if (variant === 8) {
    return (
      <div className="flex items-center gap-2 border border-border bg-card p-2">
        <div className="hidden h-10 min-w-44 items-center gap-2 border-r border-border px-3 text-muted-foreground sm:flex">
          <Search className="size-4" /><span className="text-xs">ค้นหาเมนู...</span>
        </div>
        <div className="flex flex-1 gap-1 overflow-x-auto posv2-noscroll">
          {categories.map((cat) => item(cat, 'h-9 rounded-full border border-transparent px-4 text-xs is-[.is-active]:border-foreground is-[.is-active]:bg-muted'))}
        </div>
      </div>
    );
  }

  if (variant === 9) {
    return (
      <div className="flex gap-1 overflow-x-auto rounded-sm bg-muted p-1.5 posv2-noscroll">
        {categories.map((cat, index) => item(cat,
          'h-12 rounded-sm px-4 text-xs text-muted-foreground hover:bg-card is-[.is-active]:bg-card is-[.is-active]:text-foreground is-[.is-active]:shadow-sm',
          <><span className="size-2 rounded-full border border-current bg-current opacity-40" /><span>{cat.name}</span>{index === 0 && <Star className="size-3" />}</>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-stretch overflow-x-auto border-y-2 border-foreground bg-card posv2-noscroll">
      <div className="category-preview-serif flex shrink-0 items-center border-r-2 border-foreground px-5 text-sm font-bold">
        <Grid3X3 className="mr-2 size-4" />สารบัญเมนู
      </div>
      {categories.map((cat, index) => item(cat,
        'h-14 rounded-none border-r border-border px-5 text-sm is-[.is-active]:bg-muted is-[.is-active]:font-bold',
        <><span className="text-[10px] text-muted-foreground">{String.fromCharCode(65 + index)}</span><span>{cat.name}</span>{selected === cat.id && <ChevronRight className="size-3" />}</>
      ))}
    </div>
  );
}