
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentShop } from '@/hooks/useCurrentShop';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { currentShop } = useCurrentShop();

  if (!user) return null;

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive';
      case 'manager': return 'bg-primary/10 text-primary';
      case 'staff': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'แอดมิน';
      case 'manager': return 'ผู้จัดการ';
      case 'staff': return 'พนักงาน';
      default: return 'ผู้ใช้';
    }
  };

  return (
    <div className="px-3 py-2.5 border-b border-border/50">
      <div className="flex items-center gap-2.5">
        <Avatar className="w-8 h-8 ring-2 ring-primary/20">
          <AvatarImage src={user.avatar_url} alt={user.full_name || user.username} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            <User className="w-3.5 h-3.5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground truncate leading-tight">
              {user.full_name || user.username}
            </p>
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${getRoleStyle(user.role)}`}>
              {getRoleName(user.role)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
            @{user.username}
          </p>
          {currentShop && (
            <p className="text-[10px] text-primary/70 truncate leading-tight mt-0.5 flex items-center gap-0.5">
              <Store className="w-2.5 h-2.5" />
              {currentShop.branch_name || currentShop.shop_name}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
