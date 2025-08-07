
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  page?: string;
  categories?: any[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
  gridColumns?: number;
  setGridColumns?: (columns: number) => void;
  itemSize?: string;
  setItemSize?: (size: string) => void;
  onMemberClick?: () => void;
  selectedMember?: any;
  onRemoveMember?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  title = "Coffee POS",
  page,
  categories,
  selectedCategory,
  onCategorySelect,
  gridColumns,
  setGridColumns,
  itemSize,
  setItemSize,
  onMemberClick,
  selectedMember,
  onRemoveMember,
  ...otherProps
}) => {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
          >
            3
          </Badge>
        </Button>
        
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
