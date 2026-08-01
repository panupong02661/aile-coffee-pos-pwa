import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import POSGeneralSettings from '@/components/POSGeneralSettings';
import UserProfile from '@/components/UserProfile';

interface Props {
  shopName: string;
  compact?: boolean;
  showProfile?: boolean;
  className?: string;
}

/** Shared footer/header bar used by every sidebar skin so the settings panel
 *  (including the skin picker) is always reachable. */
const SidebarUtilityBar = ({ shopName, compact = false, showProfile = true, className }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('border-t border-border bg-card/80 flex-shrink-0', className)}>
      {showProfile && !compact && <UserProfile />}
      <div className={cn('flex items-center gap-2 p-2', compact && 'justify-center')}>
        {!compact && (
          <span className="text-[11px] text-muted-foreground truncate flex-1">{shopName}</span>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" title="ตั้งค่าทั่วไป">
              <Settings2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle>ตั้งค่าทั่วไป</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] px-3 pb-4">
              <POSGeneralSettings />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SidebarUtilityBar;
