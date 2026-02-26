
import { useRef, useEffect } from 'react';
import { Category } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  variant?: 'default' | 'header';
}

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  variant = 'default'
}: CategoryFilterProps) => {
  const headerStyle = variant === 'header';
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active pill
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedCategory]);
  
  if (!categories || categories.length === 0) {
    return (
      <div className={cn(!headerStyle && 'mb-6')}>
        <div className="text-muted-foreground text-sm">ไม่พบหมวดหมู่</div>
      </div>
    );
  }
  
  return (
    <div className={cn(!headerStyle && 'mb-6')}>
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.filter(cat => cat.is_active).map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              ref={isActive ? activeRef : null}
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 select-none shrink-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                  : 'bg-muted/80 text-foreground/80 border border-border/50 hover:bg-accent hover:text-accent-foreground',
                isMobile && headerStyle && 'text-xs px-3 py-1.5'
              )}
            >
              {category.id === '1' && (
                <LayoutGrid className={cn('shrink-0', isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
              )}
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
