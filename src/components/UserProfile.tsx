
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const UserProfile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getLevelBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'manager': return 'ผู้จัดการ';
      case 'staff': return 'พนักงาน';
      default: return 'ผู้ใช้งาน';
    }
  };

  return (
    <div className="p-4 border-b border-coffee-200 bg-coffee-50">
      <div className="flex items-center space-x-3 mb-3">
        <Avatar className="w-12 h-12 border-2 border-coffee-300">
          <AvatarImage src={user.avatar_url} alt={user.full_name || user.username} />
          <AvatarFallback className="bg-coffee-600 text-white">
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-coffee-800 truncate">
            {user.full_name || user.username}
          </p>
          <p className="text-xs text-coffee-600">@{user.username}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span 
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLevelBadgeColor(user.role)}`}
        >
          {getLevelDisplayName(user.role)}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
