import { Percent, Clock, QrCode, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { PosV2Item } from './PosV2MenuCard';

export interface PosV2CartLine {
  item: PosV2Item;
  qty: number;
}

interface Props {
  lines: PosV2CartLine[];
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onClear: () => void;
}

export default function PosV2Cart({ lines, onInc, onDec, onClear }: Props) {
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const discount = 0;
  const total = subtotal - discount;
  const count = lines.reduce((s, l) => s + l.qty, 0);

  const shortcuts = [
    { icon: Percent, label: 'ส่วนลด' },
    { icon: Clock, label: 'พักบิล' },
    { icon: QrCode, label: 'คิวอาร์' },
    { icon: Trash2, label: 'เคลียร์', danger: true, onClick: onClear },
  ];

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-[hsl(var(--posv2-card))] shadow-[var(--posv2-shadow-lift)]">
      {/* Head */}
      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <div>
          <h2 className="text-xl font-extrabold text-[hsl(var(--posv2-ink))]">ตะกร้าสินค้า</h2>
          <p className="mt-0.5 text-xs text-[hsl(var(--posv2-ink-soft))]">โต๊ะ 08 · ทานที่ร้าน</p>
        </div>
        <span className="flex h-9 items-center gap-1.5 rounded-full bg-[hsl(var(--posv2-surface))] px-3 text-sm font-bold text-[hsl(var(--posv2-ink))]">
          <ShoppingBag className="h-4 w-4" />
          {count}
        </span>
      </div>

      {/* Scroll body */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4">
        {lines.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--posv2-surface))]">
              <ShoppingBag className="h-6 w-6 text-[hsl(var(--posv2-ink-soft))]" />
            </div>
            <p className="text-sm text-[hsl(var(--posv2-ink-soft))]">ยังไม่มีสินค้าในตะกร้า</p>
          </div>
        )}

        {lines.map(({ item, qty }) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--posv2-surface))] p-2.5"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--posv2-card))]">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-black text-[hsl(var(--posv2-ink))] opacity-20">
                  {item.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[hsl(var(--posv2-ink))]">{item.name}</p>
              <p className="text-xs font-semibold text-[hsl(var(--posv2-accent))]">
                ฿{(item.price * qty).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-[hsl(var(--posv2-card))] p-1 shadow-[var(--posv2-shadow-soft)]">
              <button
                onClick={() => onDec(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--posv2-ink-soft))] transition-colors hover:text-[hsl(var(--posv2-ink))] active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
              <span className="w-5 text-center text-sm font-bold text-[hsl(var(--posv2-ink))]">{qty}</span>
              <button
                onClick={() => onInc(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--posv2-ink))] text-[hsl(var(--posv2-card))] transition-transform active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed footer */}
      <div className="shrink-0 rounded-t-3xl bg-[hsl(var(--posv2-surface))] px-5 pb-5 pt-4">
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between text-sm text-[hsl(var(--posv2-ink-soft))]">
            <span>ยอดรวมย่อย</span>
            <span>฿{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-[hsl(var(--posv2-ink-soft))]">
            <span>ส่วนลด</span>
            <span>-฿{discount.toLocaleString()}</span>
          </div>
          <div className="flex items-end justify-between border-t border-dashed border-[hsl(var(--posv2-line))] pt-2.5">
            <span className="text-base font-bold text-[hsl(var(--posv2-ink))]">ยอดสุทธิ</span>
            <span className="text-3xl font-black tracking-tight text-[hsl(var(--posv2-accent))]">
              ฿{total.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-4 gap-2">
          {shortcuts.map(({ icon: Icon, label, danger, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-[10px] font-bold transition-all active:scale-95 ${
                danger
                  ? 'bg-[hsl(var(--posv2-danger)/0.12)] text-[hsl(var(--posv2-danger))]'
                  : 'bg-[hsl(var(--posv2-card))] text-[hsl(var(--posv2-ink-soft))] shadow-[var(--posv2-shadow-soft)] hover:text-[hsl(var(--posv2-ink))]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <button
          disabled={lines.length === 0}
          className="w-full rounded-2xl bg-[hsl(var(--posv2-ink))] py-4 text-lg font-extrabold text-[hsl(var(--posv2-card))] shadow-[var(--posv2-shadow-lift)] transition-all active:scale-[0.98] disabled:opacity-40"
        >
          ชำระเงิน
        </button>
      </div>
    </aside>
  );
}
