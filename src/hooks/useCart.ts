
import { useState } from 'react';
import { CartItem, MenuItem, Addon } from '@/types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [billDiscountType, setBillDiscountType] = useState<'percent' | 'amount'>('amount');

  const addToCart = (menuItem: MenuItem, selectedAddons: Addon[]) => {
    const addonPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = menuItem.price + addonPrice;

    const newItem: CartItem = {
      id: `${menuItem.id}_${Date.now()}_${Math.random()}`,
      menu_item: menuItem,
      quantity: 1,
      selected_addons: selectedAddons,
      item_discount: 0,
      item_discount_type: 'amount',
      total_price: totalPrice
    };

    setCartItems(prev => [...prev, newItem]);
  };

  const addFreeItemToCart = (menuItem: MenuItem, giftName: string) => {
    const newItem: CartItem = {
      id: `${menuItem.id}_${Date.now()}_${Math.random()}_free`,
      menu_item: {
        ...menuItem,
        name: `${menuItem.name} (${giftName})`
      },
      quantity: 1,
      selected_addons: [],
      item_discount: menuItem.price,
      item_discount_type: 'amount',
      total_price: 0
    };

    setCartItems(prev => [...prev, newItem]);
  };

  const applyPromotionDiscount = (discountValue: number) => {
    setBillDiscount(discountValue);
    setBillDiscountType('amount');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const basePrice = item.menu_item.price + 
          item.selected_addons.reduce((sum, addon) => sum + addon.price, 0);
        
        let discountAmount = 0;
        if (item.item_discount_type === 'percent') {
          discountAmount = (basePrice * quantity) * (item.item_discount / 100);
        } else {
          discountAmount = item.item_discount;
        }

        return {
          ...item,
          quantity,
          total_price: Math.max(0, (basePrice * quantity) - discountAmount)
        };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateDiscount = (itemId: string, discount: number, discountType: 'percent' | 'amount' = 'amount') => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const basePrice = item.menu_item.price + 
          item.selected_addons.reduce((sum, addon) => sum + addon.price, 0);
        const totalBasePrice = basePrice * item.quantity;
        
        let discountAmount = 0;
        if (discountType === 'percent') {
          discountAmount = totalBasePrice * (discount / 100);
        } else {
          discountAmount = discount;
        }

        return {
          ...item,
          item_discount: discount,
          item_discount_type: discountType,
          total_price: Math.max(0, totalBasePrice - discountAmount)
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    setBillDiscount(0);
    setBillDiscountType('amount');
  };

  const restoreCart = (items: CartItem[], discount: number, discountType: 'percent' | 'amount') => {
    setCartItems(items);
    setBillDiscount(discount);
    setBillDiscountType(discountType);
  };

  return {
    cartItems,
    addToCart,
    addFreeItemToCart,
    applyPromotionDiscount,
    updateQuantity,
    removeFromCart,
    updateDiscount,
    clearCart,
    billDiscount,
    billDiscountType,
    setBillDiscount,
    setBillDiscountType,
    restoreCart
  };
};
