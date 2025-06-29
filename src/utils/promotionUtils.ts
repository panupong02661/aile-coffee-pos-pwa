
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
    let isEligible = false;

    // ตรวจสอบว่าเมนูนี้มีสิทธิ์ได้รับโปรโมชั่นหรือไม่
    const hasSpecificMenuItems = promotion.menu_item_ids && promotion.menu_item_ids.length > 0;
    const hasSpecificCategories = promotion.category_ids && promotion.category_ids.length > 0;

    if (hasSpecificMenuItems || hasSpecificCategories) {
      // มีการระบุเมนูหรือหมวดหมู่เฉพาะ
      if (hasSpecificMenuItems && promotion.menu_item_ids!.includes(cartItem.menu_item.id)) {
        isEligible = true;
      } else if (hasSpecificCategories && cartItem.menu_item.category_id && promotion.category_ids!.includes(cartItem.menu_item.category_id)) {
        isEligible = true;
      }
    } else {
      // ไม่มีการระบุเฉพาะ ใช้ได้กับทุกเมนู
      isEligible = true;
    }

    if (isEligible) {
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
  }

  return {
    discount: bestDiscount,
    discountType: bestDiscountType,
    promotionName: bestPromotionName
  };
};
