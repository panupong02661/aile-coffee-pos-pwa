import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Minus, Plus, FileText, ListOrdered } from 'lucide-react';
import { CartItem } from '@/types';

interface RoundOrder {
  id: string;
  table_id: string;
  table_number: string;
  cart_items: CartItem[];
  bill_discount: number;
  bill_discount_type: 'percent' | 'amount';
  round_number: number;
  created_at: string;
  status: string;
}

interface TableBillPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  rounds: RoundOrder[];
  onLoadRound: (roundNumber: number) => void;
  onDeleteRound: (roundOrderId: string, tableId: string) => void;
  onUpdateRoundItem: (roundOrderId: string, items: CartItem[], discount: number, discountType: 'percent' | 'amount') => void;
}

const TableBillPreview = ({
  isOpen,
  onClose,
  tableNumber,
  rounds,
  onLoadRound,
  onDeleteRound,
  onUpdateRoundItem,
}: TableBillPreviewProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const allItems = useMemo(() => {
    return rounds.flatMap(r => r.cart_items.map(item => ({ ...item, _round: r.round_number })));
  }, [rounds]);

  const totalAllRounds = useMemo(() => {
    return rounds.reduce((sum, r) => {
      const roundTotal = r.cart_items.reduce((s, item) => s + item.total_price, 0);
      return sum + roundTotal;
    }, 0);
  }, [rounds]);

  const handleRemoveItemFromRound = (round: RoundOrder, itemId: string) => {
    const newItems = round.cart_items.filter(i => i.id !== itemId);
    onUpdateRoundItem(round.id, newItems, round.bill_discount, round.bill_discount_type);
  };

  const handleUpdateQtyInRound = (round: RoundOrder, itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItemFromRound(round, itemId);
      return;
    }
    const newItems = round.cart_items.map(i => {
      if (i.id !== itemId) return i;
      const basePrice = i.menu_item.price + (Array.isArray(i.selected_addons) ? i.selected_addons.reduce((s, a) => s + a.price, 0) : 0);
      let discountedPrice = basePrice;
      if (i.item_discount > 0) {
        discountedPrice = i.item_discount_type === 'percent'
          ? basePrice * (1 - i.item_discount / 100)
          : basePrice - i.item_discount;
      }
      return { ...i, quantity: newQty, total_price: Math.round(discountedPrice * newQty) };
    });
    onUpdateRoundItem(round.id, newItems, round.bill_discount, round.bill_discount_type);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            บิลโต๊ะ {tableNumber}
          </DialogTitle>
        </DialogHeader>

        {rounds.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">ยังไม่มีรายการสั่ง</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full flex-shrink-0 overflow-x-auto">
              <TabsTrigger value="all" className="flex-shrink-0">
                ทั้งหมด ({allItems.length})
              </TabsTrigger>
              {rounds.map(r => (
                <TabsTrigger key={r.round_number} value={`round-${r.round_number}`} className="flex-shrink-0">
                  รอบ {r.round_number} ({r.cart_items.length})
                </TabsTrigger>
              ))}
            </TabsList>

            {/* All items tab */}
            <TabsContent value="all" className="flex-1 overflow-y-auto mt-2">
              <div className="space-y-2">
                {rounds.map(round => (
                  <div key={round.round_number}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="secondary" className="text-xs">
                        <ListOrdered className="w-3 h-3 mr-1" />
                        รอบ {round.round_number}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatTime(round.created_at)}</span>
                    </div>
                    {round.cart_items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/30 mb-1">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate block">{item.menu_item.name}</span>
                          {Array.isArray(item.selected_addons) && item.selected_addons.length > 0 && (
                            <span className="text-xs text-muted-foreground">{item.selected_addons.map(a => a.name).join(', ')}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                          <span className="text-sm font-semibold text-primary">฿{item.total_price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center font-bold text-lg px-2">
                <span className="text-foreground">ยอดรวมทั้งหมด</span>
                <span className="text-primary">฿{totalAllRounds.toLocaleString()}</span>
              </div>
            </TabsContent>

            {/* Individual round tabs */}
            {rounds.map(round => {
              const roundTotal = round.cart_items.reduce((s, i) => s + i.total_price, 0);
              return (
                <TabsContent key={round.round_number} value={`round-${round.round_number}`} className="flex-1 overflow-y-auto mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatTime(round.created_at)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{round.cart_items.length} รายการ</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          onLoadRound(round.round_number);
                          onClose();
                        }}
                      >
                        โหลดเข้าตะกร้า
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onDeleteRound(round.id, round.table_id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {round.cart_items.map(item => (
                      <div key={item.id} className="border border-border rounded-lg p-2.5 bg-card">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-foreground block truncate">{item.menu_item.name}</span>
                            {Array.isArray(item.selected_addons) && item.selected_addons.length > 0 && (
                              <span className="text-xs text-muted-foreground">{item.selected_addons.map(a => a.name).join(', ')}</span>
                            )}
                            {item.item_discount > 0 && (
                              <span className="text-xs text-destructive block">
                                ส่วนลด: {item.item_discount_type === 'percent' ? `${item.item_discount}%` : `฿${item.item_discount}`}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive h-6 w-6 p-0"
                            onClick={() => handleRemoveItemFromRound(round, item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="w-6 h-6 p-0" onClick={() => handleUpdateQtyInRound(round, item.id, item.quantity - 1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="outline" size="sm" className="w-6 h-6 p-0" onClick={() => handleUpdateQtyInRound(round, item.id, item.quantity + 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold text-primary">฿{item.total_price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />
                  <div className="flex justify-between items-center font-bold px-2">
                    <span className="text-foreground">ยอดรวมรอบ {round.round_number}</span>
                    <span className="text-primary">฿{roundTotal.toLocaleString()}</span>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TableBillPreview;
