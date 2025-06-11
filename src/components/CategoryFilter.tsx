
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.filter(cat => cat.is_active).map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategorySelect(category.id)}
          className={`${
            selectedCategory === category.id
              ? 'bg-coffee-600 hover:bg-coffee-700 text-white'
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
