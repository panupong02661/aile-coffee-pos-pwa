import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { AddOnManager } from './AddOnManager';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

interface OrderItem extends MenuItem {
  quantity: number;
  addOns: Array<{ id: string; name: string; price: number }>;
}

interface POSInterfaceProps {
  onOrderComplete: (order: OrderItem[]) => void;
}

export const POSInterface: React.FC<POSInterfaceProps> = ({ onOrderComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showAddOns, setShowAddOns] = useState(false);

  const categories = ['coffee', 'food', 'dessert', 'beverage'];
  const menuItems: MenuItem[] = [
    { id: '1', name: 'Americano', price: 45, category: 'coffee' },
    { id: '2', name: 'Latte', price: 55, category: 'coffee' },
    { id: '3', name: 'Cappuccino', price: 50, category: 'coffee' },
    { id: '4', name: 'Sandwich', price: 85, category: 'food' },
    { id: '5', name: 'Croissant', price: 65, category: 'food' },
    { id: '6', name: 'Cheesecake', price: 75, category: 'dessert' },
  ];

  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  const addToOrder = (item: MenuItem, addOns: Array<{ id: string; name: string; price: number }> = []) => {
    const existingItem = currentOrder.find(orderItem => 
      orderItem.id === item.id && 
      JSON.stringify(orderItem.addOns) === JSON.stringify(addOns)
    );

    if (existingItem) {
      setCurrentOrder(prev => prev.map(orderItem =>
        orderItem === existingItem
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setCurrentOrder(prev => [...prev, { ...item, quantity: 1, addOns }]);
    }
    setShowAddOns(false);
    setSelectedItem(null);
  };

  const updateQuantity = (index: number, change: number) => {
    setCurrentOrder(prev => {
      const newOrder = [...prev];
      newOrder[index].quantity += change;
      if (newOrder[index].quantity <= 0) {
        newOrder.splice(index, 1);
      }
      return newOrder;
    });
  };

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => {
      const itemTotal = (item.price + item.addOns.reduce((sum, addon) => sum + addon.price, 0)) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setShowAddOns(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Menu Display */}
      <div className="lg:col-span-2 space-y-4">
        {/* Category Buttons */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                <p className="text-lg font-bold text-primary">฿{item.price}</p>
                <Button 
                  onClick={() => handleMenuItemClick(item)}
                  className="w-full mt-2" 
                  size="sm"
                >
                  เพิ่ม
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>สรุปรายการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentOrder.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">ยังไม่มีรายการสั่งซื้อ</p>
            ) : (
              <>
                {currentOrder.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.addOns.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {item.addOns.map(addon => (
                              <div key={addon.id}>+ {addon.name} (+฿{addon.price})</div>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          ฿{item.price + item.addOns.reduce((sum, addon) => sum + addon.price, 0)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(index, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(index, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
                
                <div className="pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>รวมทั้งหมด:</span>
                    <span>฿{calculateTotal()}</span>
                  </div>
                  <Button 
                    onClick={() => onOrderComplete(currentOrder)}
                    className="w-full mt-4"
                    disabled={currentOrder.length === 0}
                  >
                    ยืนยันรายการ
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add-ons Modal */}
      {showAddOns && selectedItem && (
        <AddOnManager
          item={selectedItem}
          onAdd={addToOrder}
          onClose={() => {
            setShowAddOns(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};