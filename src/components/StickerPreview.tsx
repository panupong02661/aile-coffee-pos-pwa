import { Card, CardContent } from '@/components/ui/card';
import { CartItem } from '@/types';

interface StickerPreviewProps {
  cartItems: CartItem[];
}

const StickerPreview = ({ cartItems }: StickerPreviewProps) => {
  return (
    <div className="space-y-2">
      {cartItems.map((item, index) => (
        <Card key={index} className="bg-white shadow-sm border">
          <CardContent className="p-3">
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-foreground">{item.menu_item.name}</p>
              {item.selected_addons && item.selected_addons.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {item.selected_addons.map((addon) => addon.name).join(', ')}
                </div>
              )}
              <p className="text-xs text-muted-foreground">x{item.quantity}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {cartItems.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">ไม่มีรายการ</p>
      )}
    </div>
  );
};

export default StickerPreview;
