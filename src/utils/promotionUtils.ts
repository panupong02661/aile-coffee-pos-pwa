
import { CartItem } from '@/types';
import { Promotion } from '@/hooks/usePromotions';

export const calculatePromotionDiscount = (
  cartItem: CartItem,
  promotions: Promotion[],
  allCartItems?: CartItem[]
): { discount: number; discountType: 'percent' | 'amount'; promotionName?: string } => {
  console.log('=== Calculating promotion discount ===');
  console.log('Item:', cartItem.menu_item.name, 'ID:', cartItem.menu_item.id);
  console.log('Item category_id:', cartItem.menu_item.category_id);
  console.log('Available promotions:', promotions.length);

  let bestDiscount = 0;
  let bestDiscountType: 'percent' | 'amount' = 'amount';
  let bestPromotionName = '';

  for (const promotion of promotions) {
    console.log(`--- Checking promotion: ${promotion.name} ---`);
    console.log('Promotion type:', promotion.type);
    console.log('Promotion discount_value:', promotion.discount_value);
    console.log('Promotion menu_item_ids:', promotion.menu_item_ids);
    console.log('Promotion category_ids:', promotion.category_ids);
    console.log('Promotion min_purchase:', promotion.min_purchase);

    let isEligible = false;

    // ตรวจสอบว่ามีการระบุเมนูหรือหมวดหมู่เฉพาะหรือไม่
    const hasSpecificMenuItems = promotion.menu_item_ids && promotion.menu_item_ids.length > 0;
    const hasSpecificCategories = promotion.category_ids && promotion.category_ids.length > 0;

    console.log('Has specific menu items:', hasSpecificMenuItems);
    console.log('Has specific categories:', hasSpecificCategories);

    if (hasSpecificMenuItems || hasSpecificCategories) {
      // มีการระบุเฉพาะ - ต้องตรวจสอบว่าเมนูนี้อยู่ในรายการหรือไม่
      console.log('Promotion has specific targeting');
      
      // ตรวจสอบเมนูเฉพาะ
      if (hasSpecificMenuItems) {
        const isInMenuItems = promotion.menu_item_ids!.includes(cartItem.menu_item.id);
        console.log('Item ID in menu_item_ids:', isInMenuItems);
        if (isInMenuItems) {
          isEligible = true;
          console.log('✅ Item eligible via menu_item_ids');
        }
      }
      
      // ตรวจสอบหมวดหมู่เฉพาะ (ถ้ายังไม่ eligible)
      if (!isEligible && hasSpecificCategories && cartItem.menu_item.category_id) {
        const isInCategories = promotion.category_ids!.includes(cartItem.menu_item.category_id);
        console.log('Item category in category_ids:', isInCategories);
        if (isInCategories) {
          isEligible = true;
          console.log('✅ Item eligible via category_ids');
        }
      }
      
      if (!isEligible) {
        console.log('❌ Item not eligible for this promotion');
      }
    } else {
      // ไม่มีการระบุเฉพาะ - ใช้ได้กับทุกเมนู
      console.log('✅ Promotion applies to all items');
      isEligible = true;
    }

    // ตรวจสอบยอดซื้อขั้นต่ำ
    if (isEligible && promotion.min_purchase && promotion.min_purchase > 0 && allCartItems) {
      console.log('Checking min_purchase requirement:', promotion.min_purchase);
      
      // คำนวณยอดรวมของสินค้าที่อยู่ในเงื่อนไขโปรโมชั่น
      let eligibleTotal = 0;
      
      for (const item of allCartItems) {
        let itemIsEligible = false;
        
        if (hasSpecificMenuItems && promotion.menu_item_ids!.includes(item.menu_item.id)) {
          itemIsEligible = true;
        }
        
        if (!itemIsEligible && hasSpecificCategories && item.menu_item.category_id) {
          if (promotion.category_ids!.includes(item.menu_item.category_id)) {
            itemIsEligible = true;
          }
        }
        
        if (!hasSpecificMenuItems && !hasSpecificCategories) {
          itemIsEligible = true;
        }
        
        if (itemIsEligible) {
          const basePrice = item.menu_item.price + item.selected_addons.reduce((sum, addon) => sum + addon.price, 0);
          eligibleTotal += basePrice * item.quantity;
        }
      }
      
      console.log('Eligible total in cart:', eligibleTotal);
      
      if (eligibleTotal < promotion.min_purchase) {
        console.log('❌ Min purchase not met. Required:', promotion.min_purchase, 'Got:', eligibleTotal);
        isEligible = false;
      } else {
        console.log('✅ Min purchase requirement met');
      }
    }

    if (isEligible) {
      console.log('🎯 Item is eligible for promotion');
      const basePrice = cartItem.menu_item.price + cartItem.selected_addons.reduce((sum, addon) => sum + addon.price, 0);
      let discountAmount = 0;

      if (promotion.type === 'percentage') {
        discountAmount = (basePrice * promotion.discount_value) / 100;
        console.log(`Percentage discount: ${promotion.discount_value}% of ${basePrice} = ${discountAmount}`);
      } else {
        discountAmount = promotion.discount_value;
        console.log(`Fixed amount discount: ${discountAmount}`);
      }

      // เลือกโปรโมชั่นที่คุ้มที่สุด
      if (discountAmount > bestDiscount) {
        bestDiscount = discountAmount;
        bestDiscountType = promotion.type === 'percentage' ? 'percent' : 'amount';
        bestPromotionName = promotion.name;
        console.log(`🏆 New best promotion: ${bestPromotionName} with discount: ${bestDiscount}`);
      }
    }
  }

  const result = {
    discount: bestDiscount,
    discountType: bestDiscountType,
    promotionName: bestPromotionName
  };

  console.log('=== Final promotion result ===', result);
  return result;
};
