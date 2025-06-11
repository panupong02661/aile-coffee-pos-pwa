
import { useState, useCallback } from 'react';
import { CartItem, MenuItem, Addon } from '@/types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((menuItem: MenuItem, selectedAddons: Addon[] = []) => {
    const newCartItem: CartItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menu_item: menuItem,
      quantity: 1,
      selected_addons: selectedAddons,
      item_discount: 0,
      item_discount_type: 'amount',
      total_price: menuItem.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    };
    
    setCartItems(prev => [...prev, newCartItem]);
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity, total_price: (item.menu_item.price + item.selected_addons.reduce((sum, addon) => sum + addon.price, 0)) * quantity }
        : item
    ));
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateDiscount = useCallback((itemId: string, discount: number, discountType: 'percent' | 'amount') => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const basePrice = (item.menu_item.price + item.selected_addons.reduce((sum, addon) => sum + addon.price, 0)) * item.quantity;
        const discountAmount = discountType === 'percent' ? (basePrice * discount / 100) : discount;
        return {
          ...item,
          item_discount: discount,
          item_discount_type: discountType,
          total_price: Math.max(0, basePrice - discountAmount)
        };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateDiscount,
    clearCart,
    subtotal,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  };
};
