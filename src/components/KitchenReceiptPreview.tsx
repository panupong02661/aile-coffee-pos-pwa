import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/types';

interface KitchenReceiptPreviewProps {
  cartItems: CartItem[];
  orderType: 'dine_in' | 'takeaway' | 'delivery';
}

const orderTypeLabels: Record<string, string> = {
  dine_in: 'ทานที่ร้าน',
  takeaway: 'นำกลับบ้าน',
  delivery: 'จัดส่ง',
};

const KitchenReceiptPreview = ({ cartItems, orderType }: KitchenReceiptPreviewProps) => {
  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear() + 543} ${now.toLocaleTimeString('th-TH')}`;

  return (
    <Card className="bg-white shadow-sm border">
      <CardContent className="p-4 space-y-3">
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">ใบสั่งครัว</h3>
          <p className="text-xs text-muted-foreground">{dateStr}</p>
        </div>

        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
            {orderTypeLabels[orderType] || orderType}
          </span>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-foreground">รายการสินค้า</h4>
          {cartItems.map((item, index) => (
            <div key={index} className="border-b border-dashed border-border pb-2 last:border-0">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-foreground">
                  {item.menu_item.name}
                </span>
                <span className="font-bold text-sm text-foreground ml-2 flex-shrink-0">
                  x{item.quantity}
                </span>
              </div>
              {item.selected_addons && item.selected_addons.length > 0 && (
                <div className="ml-3 mt-0.5">
                  {item.selected_addons.map((addon, addonIdx) => (
                    <p key={addonIdx} className="text-xs text-muted-foreground">
                      + {addon.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />
        <p className="text-center text-xs text-muted-foreground">
          รวม {cartItems.reduce((sum, item) => sum + item.quantity, 0)} รายการ
        </p>
      </CardContent>
    </Card>
  );
};

export default KitchenReceiptPreview;
