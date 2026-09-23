import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, MoreHorizontal, ReceiptText, Settings2, Store, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { menuGroups } from '@/components/sidebar/menuConfig';

interface MobilePOSBottomNavProps {
  onDisplaySettings: () => void;
}

const primaryItems = [
  { id: 'pos', label: 'POS', icon: Store, path: '/' },
  { id: 'online-orders', label: 'ออเดอร์', icon: ReceiptText, path: '/online-orders' },
  { id: 'members', label: 'สมาชิก', icon: Users, path: '/members' },
  { id: 'reports', label: 'รายงาน', icon: BarChart3, path: '/reports' },
];

const MobilePOSBottomNav = ({ onDisplaySettings }: MobilePOSBottomNavProps) => {
  const [allMenuOpen, setAllMenuOpen] = useState(false);
  const location = useLocation();
  const { hasPermission } = useUserPermissions();

  const allowedGroups = useMemo(() => menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(item.id)),
    }))
    .filter((group) => group.items.length > 0), [hasPermission]);

  const allowedPrimaryItems = primaryItems.filter((item) => hasPermission(item.id));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="เมนูหลัก POS มือถือ">
        <div className="mx-auto flex h-16 max-w-lg items-stretch px-1">
          {allowedPrimaryItems.map(({ id, label, icon: Icon, path }) => {
            const isActive = location.pathname === path || (id === 'pos' && location.pathname === '/pos');
            return (
              <Button
                key={id}
                asChild
                variant="ghost"
                className={cn('h-16 min-w-0 flex-1 flex-col gap-0.5 rounded-none px-1 text-[10px]', isActive && 'text-primary')}
              >
                <Link to={path} aria-current={isActive ? 'page' : undefined}>
                  <Icon className="size-5" />
                  <span className="w-full truncate">{label}</span>
                </Link>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            className="h-16 min-w-0 flex-1 flex-col gap-0.5 rounded-none px-1 text-[10px]"
            onClick={() => setAllMenuOpen(true)}
          >
            <MoreHorizontal className="size-5" />
            <span>ทั้งหมด</span>
          </Button>
        </div>
      </nav>

      <Sheet open={allMenuOpen} onOpenChange={setAllMenuOpen}>
        <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:hidden">
          <SheetHeader className="pr-9 text-left">
            <SheetTitle>เมนูทั้งหมด</SheetTitle>
            <SheetDescription>แสดงเฉพาะรายการที่บัญชีนี้มีสิทธิ์ใช้งาน</SheetDescription>
          </SheetHeader>

          <Button
            variant="outline"
            className="mt-4 h-11 w-full justify-start gap-3"
            onClick={() => {
              setAllMenuOpen(false);
              onDisplaySettings();
            }}
          >
            <Settings2 className="size-4" />
            ตั้งค่าการแสดงผล POS
          </Button>

          <div className="mt-4 space-y-4">
            {allowedGroups.map((group) => (
              <section key={group.id} aria-labelledby={`mobile-menu-${group.id}`}>
                <h3 id={`mobile-menu-${group.id}`} className="mb-1.5 px-1 text-xs font-semibold text-muted-foreground">
                  {group.label}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Button
                        key={item.id}
                        asChild
                        variant={isActive ? 'secondary' : 'outline'}
                        className="h-14 min-w-0 justify-start gap-2 px-3 text-xs"
                      >
                        <Link to={item.path} onClick={() => setAllMenuOpen(false)}>
                          <Icon className="size-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobilePOSBottomNav;