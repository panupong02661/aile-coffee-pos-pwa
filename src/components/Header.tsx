
import { Clock, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import DisplaySettingsModal from './DisplaySettingsModal';
import CategoryFilter from './CategoryFilter';
import { Category } from '@/types';

interface HeaderProps {
  onSettingsClick?: () => void;
  onMemberClick?: () => void;
  onToggleSidebar?: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  gridColumns: number;
  setGridColumns: (columns: number) => void;
  itemSize: 'small' | 'medium' | 'large';
  setItemSize: (size: 'small' | 'medium' | 'large') => void;
}

const Header = ({ 
  onSettingsClick, 
  onMemberClick, 
  onToggleSidebar,
  categories,
  selectedCategory,
  onCategorySelect,
  gridColumns,
  setGridColumns,
  itemSize,
  setItemSize
}: HeaderProps) => {
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);
  
  const currentTime = new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <div className="bg-coffee-600 text-white p-3 rounded-lg mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="text-white hover:bg-coffee-500 p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={onCategorySelect}
                variant="header"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-coffee-100">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{currentTime}</span>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onMemberClick}
              className="bg-coffee-500 hover:bg-coffee-400 text-white border-coffee-400"
            >
              <User className="w-4 h-4 mr-2" />
              สมาชิก
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDisplaySettingsOpen(true)}
              className="bg-coffee-500 hover:bg-coffee-400 text-white border-coffee-400"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <DisplaySettingsModal
        isOpen={isDisplaySettingsOpen}
        onClose={() => setIsDisplaySettingsOpen(false)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        itemSize={itemSize}
        setItemSize={setItemSize}
      />
    </>
  );
};

export default Header;
