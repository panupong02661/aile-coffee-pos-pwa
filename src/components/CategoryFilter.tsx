
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

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
  
  return (
    <div className={`flex flex-wrap gap-2 ${headerStyle ? '' : 'mb-6'}`}>
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
          } transition-all duration-200`}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
