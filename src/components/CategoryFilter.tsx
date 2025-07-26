
import { Button } from '@/components/ui/button';
import { Category } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  console.log('🏷️ CategoryFilter rendering:', {
    categoriesCount: categories?.length || 0,
    selectedCategory,
    variant,
    isMobile
  });
  
  if (!categories || categories.length === 0) {
    console.log('⚠️ No categories to display');
    return (
      <div className={`${headerStyle ? '' : 'mb-6'}`}>
        <div className="text-muted-foreground text-sm">ไม่พบหมวดหมู่</div>
      </div>
    );
  }
  
  return (
    <div className={`${headerStyle ? '' : 'mb-6'}`}>
      <div className="flex gap-2 flex-wrap">
        {categories.filter(cat => cat.is_active).map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => onCategorySelect(category.id)}
            size={headerStyle ? "sm" : "default"}
            className={`${
              selectedCategory === category.id
                ? headerStyle 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : headerStyle
                  ? 'border-border text-foreground hover:bg-accent bg-background/20'
                  : 'border-border text-foreground hover:bg-accent'
            } transition-all duration-200 ${
              isMobile && headerStyle ? 'text-sm px-3 py-1.5' : ''
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
