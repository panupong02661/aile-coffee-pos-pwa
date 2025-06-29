
import { CartItem } from '@/types';
import { Promotion } from '@/hooks/usePromotions';

export const calculatePromotionDiscount = (
  cartItem: CartItem,
  promotions: Promotion[]
): { discount: number; discountType: 'percent' | 'amount'; promotionName?: string } => {
  console.log('Calculating promotion discount for item:', cartItem.menu_item.name, cartItem.menu_item.id);
  console.log('Available promotions:', promotions);

  let bestDiscount = 0;
  let bestDiscountType: 'percent' | 'amount' = 'amount';
  let bestPromotionName = '';

  for (const promotion of promotions) {
    console.log(`Checking promotion: ${promotion.name}`);
    console.log(`Promotion menu_item_ids:`, promotion.menu_item_ids);
    console.log(`Promotion category_ids:`, promotion.category_ids);
    console.log(`Item menu_item_id:`, cartItem.menu_item.id);
    console.log(`Item category_id:`, cartItem.menu_item.category_id);

    let isEligible = false;

    // ตรวจสอบว่ามีการระบุเมนูหรือหมวดหมู่เฉพาะหรือไม่
    const hasSpecificMenuItems = promotion.menu_item_ids && promotion.menu_item_ids.length > 0;
    const hasSpecificCategories = promotion.category_ids && promotion.category_ids.length > 0;

    if (hasSpecificMenuItems || hasSpecificCategories) {
      // มีการระบุเฉพาะ - ต้องตรวจสอบว่าเมนูนี้อยู่ในรายการหรือไม่
      console.log('Promotion has specific items/categories');
      
      if (hasSpecificMenuItems && promotion.menu_item_ids!.includes(cartItem.menu_item.id)) {
        console.log('Item is in specific menu items list');
        isEligible = true;
      } else if (hasSpecificCategories && cartItem.menu_item.category_id && 
                 promotion.category_ids!.includes(cartItem.menu_item.category_id)) {
        console.log('Item category is in specific categories list');
        isEligible = true;
      } else {
        console.log('Item is not eligible for this promotion');
        isEligible = false;
      }
    } else {
      // ไม่มีการระบุเฉพาะ - ใช้ได้กับทุกเมนู
      console.log('Promotion applies to all items');
      isEligible = true;
    }

    console.log(`Is eligible: ${isEligible}`);

    if (isEligible) {
      const basePrice = cartItem.menu_item.price + cartItem.selected_addons.reduce((sum, addon) => sum + addon.price, 0);
      let discountAmount = 0;

      if (promotion.type === 'percentage') {
        discountAmount = (basePrice * promotion.discount_value) / 100;
      } else {
        discountAmount = promotion.discount_value;
      }

      console.log(`Calculated discount: ${discountAmount} (type: ${promotion.type})`);

      // เลือกโปรโมชั่นที่คุ้มที่สุด
      if (discountAmount > bestDiscount) {
        bestDiscount = discountAmount;
        bestDiscountType = promotion.type === 'percentage' ? 'percent' : 'amount';
        bestPromotionName = promotion.name;
        console.log(`New best promotion: ${bestPromotionName} with discount: ${bestDiscount}`);
      }
    }
  }

  const result = {
    discount: bestDiscount,
    discountType: bestDiscountType,
    promotionName: bestPromotionName
  };

  console.log('Final promotion result:', result);
  return result;
};
