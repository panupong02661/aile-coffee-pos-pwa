import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import UserProfile from './UserProfile';
import POSGeneralSettings from './POSGeneralSettings';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { usePOSSettings, SIDEBAR_WIDTHS } from '@/hooks/usePOSSettings';
import { menuGroups, SidebarSkinProps } from './sidebar/menuConfig';
import SkinRailFlyout from './sidebar/skins/SkinRailFlyout';
import SkinTwoPane from './sidebar/skins/SkinTwoPane';
import SkinSearchFirst from './sidebar/skins/SkinSearchFirst';
import SkinCardGroups from './sidebar/skins/SkinCardGroups';
import SkinIconTabs from './sidebar/skins/SkinIconTabs';
import SkinFlatList from './sidebar/skins/SkinFlatList';
import { ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';

interface MainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKINS: Record<string, (p: SidebarSkinProps) => JSX.Element | null> = {
  rail: SkinRailFlyout,
  'two-pane': SkinTwoPane,
  search: SkinSearchFirst,
  cards: SkinCardGroups,
  'icon-tabs': SkinIconTabs,
  flat: SkinFlatList,
};

const MainSidebar = ({ isOpen, onClose }: MainSidebarProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const { hasPermission } = useUserPermissions();
  const { currentShop } = useCurrentShop();
  const { sidebarStyle } = usePOSSettings();

  // Filter menu groups based on user permissions
  const filteredMenuGroups = useMemo(() => {
    return menuGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => hasPermission(item.id)),
      }))
      .filter(group => group.items.length > 0);
  }, [hasPermission]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const activeGroup = filteredMenuGroups.find((g) =>
      g.items.some((item) => item.path === location.pathname)
    );
    return new Set(activeGroup ? [activeGroup.id] : ['main']);
  });

  const shopName = currentShop?.shop_name || 'POS System';
  const branchName = currentShop?.branch_name || '';
  const shopDisplayName = branchName ? `${shopName} · ${branchName}` : shopName;
  const width = SIDEBAR_WIDTHS[sidebarStyle] ?? 56;

  // Expose the current sidebar width so page layouts can offset content
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-w',
      `${sidebarStyle === 'classic' ? (collapsed ? 56 : 56) : width}px`
    );
  }, [sidebarStyle, width, collapsed]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 768) setCollapsed(false);
  }, [isOpen]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 768) onClose();
  };

  // ---------- Alternative skins ----------
  if (sidebarStyle !== 'classic' && SKINS[sidebarStyle]) {
    const Skin = SKINS[sidebarStyle];
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
        )}
        <div
          className={cn(
            'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{ width }}
        >
          <Skin
            groups={filteredMenuGroups}
            pathname={location.pathname}
            shopName={shopDisplayName}
            onNavigate={handleMenuClick}
          />
        </div>
      </>
    );
  }

  // ---------- Classic skin (default) ----------
  const sidebarWidth = collapsed ? 'w-[56px]' : 'w-64';

  return (
    <TooltipProvider delayDuration={200}>
      {/* Overlay - shown when expanded */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 hidden md:block"
          onClick={() => setCollapsed(true)}
        />
      )}
      {!collapsed && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
           onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full z-50 transform transition-all duration-300 ease-in-out',
          sidebarWidth,
          // On desktop: always visible
          'md:translate-x-0',
          // On mobile: show/hide via translate
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full bg-card border-r border-border rounded-none flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground truncate">{shopName}</h2>
                {branchName && (
                  <p className="text-[11px] text-muted-foreground truncate -mt-0.5">{branchName}</p>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* User Profile (hide in collapsed) */}
          {!collapsed && (
            <div className="flex-shrink-0">
              <UserProfile />
            </div>
          )}

          {/* Menu */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className={cn('pb-6', collapsed ? 'p-1' : 'p-2')}>
                <nav className="space-y-0.5">
                  {filteredMenuGroups.map((group) => {
                    const isGroupOpen = openGroups.has(group.id);
                    const GroupIcon = group.icon;
                    const hasActiveItem = group.items.some(
                      (item) => item.path === location.pathname
                    );

                    return (
                      <div key={group.id}>
                        {/* Group header */}
                        {collapsed ? (
                          /* In collapsed mode: clicking icon expands the sidebar */
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setCollapsed(false)}
                                className={cn(
                                  'flex items-center justify-center w-full rounded-lg transition-colors text-sm p-2 my-0.5',
                                  hasActiveItem
                                    ? 'bg-primary text-primary-foreground font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                )}
                              >
                                <GroupIcon className="w-4 h-4 flex-shrink-0" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              <p>{group.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className={cn(
                              'flex items-center w-full rounded-lg transition-colors text-sm justify-between px-3 py-2',
                              hasActiveItem
                                ? 'text-primary font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GroupIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{group.label}</span>
                            </div>
                            <ChevronDown
                              className={cn(
                                'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200',
                                isGroupOpen && 'rotate-180'
                              )}
                            />
                          </button>
                        )}

                        {/* Group items - only in expanded mode */}
                        {!collapsed && isGroupOpen && (
                          <div className="ml-3 border-l border-border/50 pl-2 mt-0.5 mb-1">
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              const isActive = location.pathname === item.path;

                              return (
                                <Link
                                  key={item.id}
                                  to={item.path}
                                  onClick={handleMenuClick}
                                  title={item.label}
                                  className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-xs',
                                    isActive
                                      ? 'bg-primary text-primary-foreground font-medium'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                  )}
                                >
                                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* POS General Settings */}
                {!collapsed && (
                  <>
                    <Separator className="my-3" />
                    <POSGeneralSettings />
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MainSidebar;
