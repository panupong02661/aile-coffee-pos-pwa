
import { CartItem } from '@/types';
import { Promotion } from '@/hooks/usePromotions';

export const calculatePromotionDiscount = (
  cartItem: CartItem,
  promotions: Promotion[]
): { discount: number; discountType: 'percent' | 'amount'; promotionName?: string } => {
  let bestDiscount = 0;
  let bestDiscountType: 'percent' | 'amount' = 'amount';
  let bestPromotionName = '';

  for (const promotion of promotions) {
    let applicable = false;

    // ตรวจสอบว่าโปรโมชั่นใช้ได้กับเมนูนี้หรือไม่
    if (promotion.apply_to === 'all') {
      applicable = true;
    } else if (promotion.apply_to === 'menu_item' && promotion.menu_item_ids.includes(cartItem.menu_item.id)) {
      applicable = true;
    } else if (promotion.apply_to === 'category' && cartItem.menu_item.category_id && promotion.category_ids.includes(cartItem.menu_item.category_id)) {
      applicable = true;
    }

    if (applicable) {
      const basePrice = cartItem.menu_item.price + cartItem.selected_addons.reduce((sum, addon) => sum + addon.price, 0);
      let discountAmount = 0;

      if (promotion.discount_type === 'percent') {
        discountAmount = (basePrice * promotion.discount_value) / 100;
      } else {
        discountAmount = promotion.discount_value;
      }

      // เลือกโปรโมชั่นที่คุ้มที่สุด
      if (discountAmount > bestDiscount) {
        bestDiscount = discountAmount;
        bestDiscountType = promotion.discount_type;
        bestPromotionName = promotion.name;
      }
    }
  }

  return {
    discount: bestDiscount,
    discountType: bestDiscountType,
    promotionName: bestPromotionName
  };
};
