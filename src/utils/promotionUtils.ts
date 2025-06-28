
import { CartItem } from '@/types';
import { Promotion } from '@/hooks/usePromotions';

export const calculatePromotionDiscount = (
  cartItem: CartItem,
  promotions: Promotion[]
): { discount: number; discountType: 'percent' | 'amount'; promotionName?: string } => {
  let bestDiscount = 0;
  let bestDiscountType: 'percent' | 'amount' = 'amount';
  let bestPromotionName = '';

  // For now, apply promotions to all items since we don't have specific menu/category targeting
  // This is a basic implementation that applies all active promotions
  for (const promotion of promotions) {
    const basePrice = cartItem.menu_item.price + cartItem.selected_addons.reduce((sum, addon) => sum + addon.price, 0);
    let discountAmount = 0;

    if (promotion.type === 'percentage') {
      discountAmount = (basePrice * promotion.discount_value) / 100;
    } else {
      discountAmount = promotion.discount_value;
    }

    // เลือกโปรโมชั่นที่คุ้มที่สุด
    if (discountAmount > bestDiscount) {
      bestDiscount = discountAmount;
      bestDiscountType = promotion.type === 'percentage' ? 'percent' : 'amount';
      bestPromotionName = promotion.name;
    }
  }

  return {
    discount: bestDiscount,
    discountType: bestDiscountType,
    promotionName: bestPromotionName
  };
};
