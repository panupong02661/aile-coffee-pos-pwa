
import { Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import DisplaySettingsModal from './DisplaySettingsModal';
import CategoryFilter from './CategoryFilter';
import { Category } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onSettingsClick?: () => void;
  onMemberClick?: () => void;
  onToggleSidebar?: () => void;
  categories?: Category[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  gridColumns?: number;
  setGridColumns?: (columns: number) => void;
  itemSize?: 'small' | 'medium' | 'large';
  setItemSize?: (size: 'small' | 'medium' | 'large') => void;
  page?: 'dashboard' | 'pos' | 'qr-promptpay' | 'other';
}

const Header = ({ 
  onSettingsClick, 
  onMemberClick, 
  onToggleSidebar,
  categories = [],
  selectedCategory = '',
  onCategorySelect = () => {},
  gridColumns = 4,
  setGridColumns = () => {},
  itemSize = 'medium',
  setItemSize = () => {},
  page = 'other'
}: HeaderProps) => {
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <div className={`bg-coffee-600 text-white rounded-lg shadow-lg ${
        isMobile ? 'p-2' : 'p-3'
      } mb-4`}>
        {/* Mobile Layout - 2 rows */}
        {isMobile ? (
          <>
            {/* First row - Menu button and action buttons */}
            <div className="flex justify-between items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="text-white hover:bg-coffee-500 p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {page === 'pos' && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onMemberClick}
                    className="bg-coffee-500 hover:bg-coffee-400 text-white border-coffee-400"
                  >
                    <User className="w-4 h-4 mr-1" />
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
              )}
            </div>
            
            {/* Second row - Category filter */}
            {page === 'pos' && (
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={onCategorySelect}
                variant="header"
              />
            )}
          </>
        ) : (
          /* Desktop/Tablet Layout - 1 row */
          <div className="flex justify-between items-center">
            {/* Left side - Menu button and category filter */}
            <div className="flex items-center space-x-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="text-white hover:bg-coffee-500 p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {page === 'pos' && (
                <div className="flex-1">
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={onCategorySelect}
                    variant="header"
                  />
                </div>
              )}
            </div>
            
            {/* Right side - Action buttons */}
            {page === 'pos' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onMemberClick}
                  className="bg-coffee-500 hover:bg-coffee-400 text-white border-coffee-400"
                >
                  <User className="w-4 h-4 mr-1" />
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
            )}
          </div>
        )}
      </div>

      {page === 'pos' && (
        <DisplaySettingsModal
          isOpen={isDisplaySettingsOpen}
          onClose={() => setIsDisplaySettingsOpen(false)}
          gridColumns={gridColumns}
          setGridColumns={setGridColumns}
          itemSize={itemSize}
          setItemSize={setItemSize}
        />
      )}
    </>
  );
};

export default Header;
