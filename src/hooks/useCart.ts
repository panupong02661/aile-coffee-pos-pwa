
import { useState, useEffect, useCallback } from 'react';
import { CartItem, MenuItem, Addon } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [billDiscountType, setBillDiscountType] = useState<'percent' | 'amount'>('amount');
  const [showPayment, setShowPayment] = useState(false);

  // Sync cart to CustomerDisplay via Supabase
  const syncCartToDisplay = useCallback(async (paymentVisible: boolean = false) => {
    const currentSubtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const currentBillDiscountAmount = billDiscountType === 'percent'
      ? Math.min(currentSubtotal * billDiscount / 100, currentSubtotal)
      : Math.min(billDiscount, currentSubtotal);
    const currentTotal = Math.max(0, currentSubtotal - currentBillDiscountAmount);
    
    const displayData = {
      cartItems: cartItems.map(item => ({
        id: item.id,
        name: item.menu_item.name,
        price: item.menu_item.price,
        quantity: item.quantity,
        addons: Array.isArray(item.selected_addons) ? item.selected_addons.map(addon => ({
          name: addon.name,
          price: addon.price
        })) : [],
        discount: item.item_discount,
        discountType: item.item_discount_type,
        totalPrice: item.total_price
      })),
      totalAmount: currentTotal,
      subtotal: currentSubtotal,
      billDiscount,
      billDiscountType,
      showPayment: paymentVisible,
      timestamp: Date.now()
    };
    
    try {
      const { error } = await supabase
        .from('cart_display_sync' as any)
        .upsert({
          id: 'current-cart',
          cart_data: displayData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) {
        console.error('🛒 Cart sync error:', error);
      } else {
        console.log('🛒 Cart synced to display:', displayData.cartItems.length, 'items');
      }
    } catch (err) {
      console.error('🛒 Cart sync failed:', err);
    }
  }, [cartItems, billDiscount, billDiscountType]);

  // Auto-sync whenever cart changes
  useEffect(() => {
    syncCartToDisplay(showPayment);
  }, [cartItems, billDiscount, billDiscountType, showPayment, syncCartToDisplay]);

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
          (Array.isArray(item.selected_addons) ? item.selected_addons.reduce((sum, addon) => sum + addon.price, 0) : 0);
        
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

  const updateDiscount = (itemId: string, discount: number, discountType: 'percent' | 'amount') => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const basePrice = item.menu_item.price + 
          (Array.isArray(item.selected_addons) ? item.selected_addons.reduce((sum, addon) => sum + addon.price, 0) : 0);
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

  // Function to set payment visibility for CustomerDisplay
  const setPaymentVisible = (visible: boolean) => {
    setShowPayment(visible);
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
    restoreCart,
    setPaymentVisible,
    syncCartToDisplay
  };
};
