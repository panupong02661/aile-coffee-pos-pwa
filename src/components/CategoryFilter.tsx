
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
  
  return (
    <div className={`${headerStyle ? '' : 'mb-6'} ${isMobile && headerStyle ? 'w-full' : ''}`}>
      <div className={`flex gap-2 ${
        isMobile && headerStyle 
          ? 'overflow-x-auto scrollbar-hide pb-2' 
          : 'flex-wrap'
      }`}>
        {categories.filter(cat => cat.is_active).map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => onCategorySelect(category.id)}
            size={headerStyle ? "sm" : "default"}
            className={`${
              selectedCategory === category.id
                ? headerStyle 
                  ? 'bg-coffee-500 hover:bg-coffee-400 text-white border-coffee-400'
                  : 'bg-coffee-600 hover:bg-coffee-700 text-white'
                : headerStyle
                  ? 'border-coffee-300 text-white hover:bg-coffee-500 bg-coffee-600/20'
                  : 'border-coffee-300 text-coffee-700 hover:bg-coffee-50'
            } transition-all duration-200 ${
              isMobile && headerStyle ? 'flex-shrink-0 whitespace-nowrap' : ''
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
