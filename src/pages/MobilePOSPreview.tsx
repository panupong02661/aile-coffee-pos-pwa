import { useMemo, useState } from 'react';
import {
  BadgePercent,
  BarChart3,
  Bug,
  ChevronLeft,
  Coffee,
  Grid2X2,
  History,
  Home,
  Menu,
  MoreHorizontal,
  Package,
  QrCode,
  ReceiptText,
  Search,
  Settings,
  ShoppingCart,
  Store,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const variants = [
  { id: 1, name: 'Bottom Five', desc: 'แถบล่าง 5 จุดหมายหลัก' },
  { id: 2, name: 'Full Drawer', desc: 'ปุ่มลอยเปิดเมนูเต็มความสูง' },
  { id: 3, name: 'Top Rail', desc: 'แถบบนคู่กับเมนูเลื่อนเข้า' },
  { id: 4, name: 'Command Grid', desc: 'แผงคำสั่งแบบตารางไอคอน' },
  { id: 5, name: 'Compact Dock', desc: 'แถบล่างย่อและหน้ารวมเมนู' },
];

const categories = ['ทั้งหมด', 'กาแฟ', 'ชา', 'นม', 'โซดา', 'ขนม'];
const products = [
  { name: 'อเมริกาโน่', price: 65, icon: Coffee },
  { name: 'ลาเต้', price: 75, icon: Coffee },
  { name: 'ชาไทย', price: 60, icon: Store },
  { name: 'มัทฉะลาเต้', price: 85, icon: Coffee },
  { name: 'โกโก้', price: 70, icon: Store },
  { name: 'ครัวซองต์', price: 75, icon: Package },
];

type NavItem = { label: string; icon: LucideIcon };
const navItems: NavItem[] = [
  { label: 'ขายสินค้า', icon: Store },
  { label: 'ออเดอร์', icon: ReceiptText },
  { label: 'สมาชิก', icon: Users },
  { label: 'รายงาน', icon: BarChart3 },
  { label: 'ตั้งค่า', icon: Settings },
];

const toolItems: NavItem[] = [
  { label: 'สมาชิก', icon: User },
  { label: 'ดีบัก', icon: Bug },
  { label: 'โค้ด', icon: QrCode },
  { label: 'ค้นหา', icon: Search },
];

function ToolPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="absolute inset-x-3 top-14 z-30 rounded-md border border-border bg-popover p-2 shadow-lg">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-popover-foreground">เครื่องมือ</span>
        <Button variant="ghost" size="icon" className="size-8" onClick={onClose} aria-label="ปิดเครื่องมือ">
          <X className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {toolItems.map(({ label, icon: Icon }) => (
          <Button key={label} variant="ghost" className="h-16 flex-col gap-1 px-1 text-[10px]">
            <Icon className="size-5" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function NavigationPanel({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: number }) {
  if (!open) return null;
  const full = mode === 2;
  return (
    <div className="absolute inset-0 z-40 flex bg-foreground/35" onClick={onClose}>
      <aside
        className={cn(
          'h-full border-r border-border bg-background p-3 shadow-lg',
          full ? 'w-full' : mode === 4 ? 'm-3 h-auto w-[calc(100%-1.5rem)] self-center rounded-md border' : 'w-[82%]'
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><Coffee className="size-5" /></span>
            <div><p className="text-sm font-bold">Aile Coffee</p><p className="text-[10px] text-muted-foreground">POS Mobile</p></div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="ปิดเมนู"><X className="size-5" /></Button>
        </div>
        <div className={cn(mode === 4 ? 'grid grid-cols-2 gap-2' : 'space-y-1')}>
          {navItems.map(({ label, icon: Icon }, index) => (
            <Button key={label} variant={index === 0 ? 'secondary' : 'ghost'} className={cn('w-full justify-start gap-3', mode === 4 && 'h-20 flex-col justify-center gap-1')} onClick={onClose}>
              <Icon className="size-5" />{label}
            </Button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function POSMockup({ variant }: { variant: number }) {
  const [category, setCategory] = useState('ทั้งหมด');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [cartCount, setCartCount] = useState(2);
  const selectedVariant = variants.find((item) => item.id === variant);
  const dockItems = variant === 5 ? navItems.slice(0, 3) : navItems.slice(0, 4);

  return (
    <div className="relative mx-auto flex h-[640px] w-full max-w-[414px] flex-col overflow-hidden border border-border bg-background shadow-md">
      <div className="flex h-12 flex-none items-center justify-between border-b border-border bg-card px-2">
        <div className="flex items-center gap-1.5">
          {variant === 3 ? (
            <Button variant="ghost" size="icon" className="size-9" onClick={() => setNavOpen(true)} aria-label="ย้อนกลับและเปิดเมนู"><ChevronLeft className="size-5" /></Button>
          ) : (
            <Button variant={variant === 2 ? 'default' : 'ghost'} size="icon" className="size-9" onClick={() => setNavOpen(true)} aria-label="เปิดเมนู"><Menu className="size-5" /></Button>
          )}
          <div className="min-w-0"><p className="truncate text-sm font-bold">Aile Coffee</p><p className="text-[9px] text-muted-foreground">{selectedVariant?.name}</p></div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-9" onClick={() => setToolsOpen((value) => !value)} aria-label="เปิดเครื่องมือ"><Grid2X2 className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="relative size-9" onClick={() => setCartCount((count) => count + 1)} aria-label="เปิดตะกร้า">
            <ShoppingCart className="size-5" /><span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-destructive text-[9px] text-destructive-foreground">{cartCount}</span>
          </Button>
        </div>
      </div>
      <ToolPanel open={toolsOpen} onClose={() => setToolsOpen(false)} />

      {variant === 3 && (
        <div className="flex flex-none items-center gap-1 border-b border-border bg-muted/50 px-2 py-1.5">
          {navItems.slice(0, 4).map(({ label, icon: Icon }, index) => (
            <Button key={label} variant={index === 0 ? 'secondary' : 'ghost'} size="sm" className="min-w-0 flex-1 gap-1 px-1 text-[9px]" onClick={() => setNavOpen(true)}><Icon className="size-3.5" /><span className="truncate">{label}</span></Button>
          ))}
        </div>
      )}

      <div className="flex flex-none gap-1.5 overflow-x-auto border-b border-border bg-card px-2 py-2 [scrollbar-width:none]">
        {categories.map((item) => (
          <Button key={item} variant={category === item ? 'default' : 'outline'} size="sm" className="h-8 shrink-0 px-3 text-xs" onClick={() => setCategory(item)}>{item}</Button>
        ))}
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto p-2 pb-20">
        <div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold">{category}</p><span className="text-[10px] text-muted-foreground">6 เมนู</span></div>
        <div className="grid grid-cols-2 gap-2">
          {products.map(({ name, price, icon: Icon }, index) => (
            <Button key={name} variant="outline" className="h-32 flex-col items-stretch justify-between overflow-hidden p-0 text-left" onClick={() => setCartCount((count) => count + 1)}>
              <span className={cn('grid h-20 place-items-center bg-muted', index % 3 === 1 && 'bg-accent', index % 3 === 2 && 'bg-secondary')}><Icon className="size-8 text-primary" /></span>
              <span className="flex w-full items-center justify-between px-2 pb-2"><span className="truncate text-xs font-semibold">{name}</span><span className="text-xs font-bold text-primary">฿{price}</span></span>
            </Button>
          ))}
        </div>
      </main>

      {variant === 2 && <Button size="icon" className="absolute bottom-20 left-3 z-20 size-12 rounded-full shadow-lg" onClick={() => setNavOpen(true)} aria-label="เปิดเมนูหลัก"><Menu className="size-5" /></Button>}
      {variant === 4 && <Button className="absolute bottom-20 left-1/2 z-20 h-11 -translate-x-1/2 gap-2 rounded-full px-5 shadow-lg" onClick={() => setNavOpen(true)}><Grid2X2 className="size-4" />เมนูทั้งหมด</Button>}

      {(variant === 1 || variant === 5) && (
        <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-border bg-card px-1 pb-1 pt-1">
          <div className="flex items-center justify-around">
            {dockItems.map(({ label, icon: Icon }, index) => (
              <Button key={label} variant="ghost" className={cn('h-14 min-w-0 flex-1 flex-col gap-0.5 px-1 text-[9px]', index === 0 && 'text-primary')} onClick={() => index === dockItems.length - 1 && setNavOpen(true)}><Icon className="size-5" /><span className="truncate">{label}</span></Button>
            ))}
            <Button variant="ghost" className="h-14 min-w-0 flex-1 flex-col gap-0.5 px-1 text-[9px]" onClick={() => setNavOpen(true)}><MoreHorizontal className="size-5" />ทั้งหมด</Button>
          </div>
        </nav>
      )}

      <Button size="icon" className={cn('absolute bottom-4 right-4 z-30 size-14 rounded-full shadow-lg', (variant === 1 || variant === 5) && 'bottom-[4.5rem]')} onClick={() => setCartCount((count) => count + 1)} aria-label="ตะกร้าสินค้า">
        <ShoppingCart className="size-6" /><span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[10px] text-destructive-foreground">{cartCount}</span>
      </Button>
      <NavigationPanel open={navOpen} onClose={() => setNavOpen(false)} mode={variant} />
    </div>
  );
}

export default function MobilePOSPreview() {
  const [active, setActive] = useState(1);
  const current = useMemo(() => variants.find((item) => item.id === active) ?? variants[0], [active]);
  if (!current) return null;

  return (
    <div className="min-h-screen bg-muted/40 px-2 py-3 font-sans">
      <header className="mx-auto mb-3 max-w-[414px]">
        <p className="text-[10px] font-semibold uppercase text-primary">Mobile POS Preview</p>
        <div className="flex items-end justify-between gap-2"><div><h1 className="text-xl font-bold text-foreground">ตัวอย่าง POS มือถือ 5 แบบ</h1><p className="text-xs text-muted-foreground">หน้าทดลองเท่านั้น — POS จริงยังไม่เปลี่ยน</p></div><BadgePercent className="size-6 text-primary" /></div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {variants.map((item) => <Button key={item.id} variant={active === item.id ? 'default' : 'outline'} size="sm" className="h-8 shrink-0 px-2 text-[10px]" onClick={() => setActive(item.id)}>{item.id}. {item.name}</Button>)}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Home className="size-3" /><span>{current.desc}</span><History className="ml-auto size-3" /></div>
      </header>
      <POSMockup variant={active} />
    </div>
  );
}