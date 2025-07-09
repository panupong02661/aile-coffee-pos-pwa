import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Menu, 
  User, 
  Search, 
  Settings,
  Grid3X3,
  LayoutGrid
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  onMemberClick?: () => void;
  categories?: Category[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  gridColumns?: number;
  setGridColumns?: (columns: number) => void;
  itemSize?: string;
  setItemSize?: (size: string) => void;
  page?: 'pos' | 'menu' | 'other';
  onDisplaySettingsClick?: () => void;
}

const Header = ({ 
  onToggleSidebar, 
  onMemberClick, 
  categories = [], 
  selectedCategory = '1', 
  onCategorySelect,
  gridColumns = 4,
  setGridColumns,
  itemSize = 'medium',
  setItemSize,
  page = 'other',
  onDisplaySettingsClick
}: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border-b border-coffee-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
            className="border-coffee-300 text-coffee-700 hover:bg-coffee-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-xl font-bold text-coffee-800">
            {page === 'pos' ? 'ระบบขายหน้าร้าน (POS)' : 
             page === 'menu' ? 'จัดการเมนู' : 'ระบบจัดการ'}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Display Settings Button for POS page */}
          {page === 'pos' && onDisplaySettingsClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDisplaySettingsClick}
              className="border-coffee-300 text-coffee-700 hover:bg-coffee-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              ตั้งค่าการแสดงผล
            </Button>
          )}

          {onMemberClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMemberClick}
              className="border-coffee-300 text-coffee-700 hover:bg-coffee-50"
            >
              <User className="h-4 w-4 mr-2" />
              เลือกสมาชิก
            </Button>
          )}
        </div>
      </div>

      {/* Categories Section for POS */}
      {page === 'pos' && categories.length > 0 && (
        <div className="border-t border-coffee-100 px-4 py-3">
          {!isMobile && (
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400 h-4 w-4" />
                <Input
                  placeholder="ค้นหาหมวดหมู่..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-coffee-200 focus:border-coffee-400"
                />
              </div>
            </div>
          )}
          
          <ScrollArea className="w-full">
            <div className="flex space-x-2 pb-2">
              {filteredCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-coffee-600 text-white hover:bg-coffee-700' 
                      : 'border-coffee-300 text-coffee-700 hover:bg-coffee-50'
                  }`}
                  onClick={() => onCategorySelect?.(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Header;
