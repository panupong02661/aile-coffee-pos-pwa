
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menu, Search, Settings, User } from 'lucide-react';
import DisplaySettingsModal from './DisplaySettingsModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onToggleMainSidebar?: () => void;
  onMemberClick?: () => void;
  categories?: { id: string; name: string }[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  gridColumns?: number;
  setGridColumns?: (columns: number) => void;
  itemSize?: 'small' | 'medium' | 'large';
  setItemSize?: (size: 'small' | 'medium' | 'large') => void;
  page?: 'pos' | 'online' | 'dashboard' | 'qr-promptpay' | 'menu' | 'customer-app' | 'other';
  showMainSidebarToggle?: boolean;
}

const Header = ({ 
  onToggleSidebar, 
  onToggleMainSidebar,
  onMemberClick, 
  categories = [], 
  selectedCategory = '', 
  onCategorySelect = () => {},
  gridColumns = 4,
  setGridColumns = () => {},
  itemSize = 'medium',
  setItemSize = () => {},
  page = 'other',
  showMainSidebarToggle = false
}: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showMainSidebarToggle && onToggleMainSidebar && (
            <Button variant="ghost" size="icon" onClick={onToggleMainSidebar} className="mr-2">
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          {onToggleSidebar && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {onMemberClick && (
            <Button variant="outline" size="sm" className="ml-2" onClick={onMemberClick}>
              <User className="w-4 h-4 mr-2" />
              ลูกค้า
            </Button>
          )}
          
          <div className="hidden md:flex items-center ml-6">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="mr-2"
                onClick={() => onCategorySelect(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
            <Search className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search Modal */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="bg-cream-100">
          <SheetHeader>
            <SheetTitle>ค้นหาสินค้า</SheetTitle>
            <SheetDescription>
              ป้อนชื่อสินค้าที่คุณต้องการค้นหา
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search" className="text-right">
                คำค้นหา
              </Label>
              <Input id="search" className="col-span-3" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Settings Modal */}
      <DisplaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        itemSize={itemSize}
        setItemSize={setItemSize}
        page={page}
      />
    </>
  );
};

export default Header;
