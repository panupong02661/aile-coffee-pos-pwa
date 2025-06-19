
import { supabase } from '@/integrations/supabase/client';

interface MenuIngredient {
  ingredient_id: string;
  quantity_needed: number;
}

export const reduceStockForOrder = async (orderItems: any[]) => {
  try {
    console.log('[StockUtils] Starting stock reduction for order items:', orderItems);
    
    // Get all menu ingredients for the ordered items
    const menuItemIds = orderItems.map(item => item.menu_item_id);
    
    const { data: menuIngredients, error: ingredientsError } = await supabase
      .from('menu_ingredients')
      .select(`
        ingredient_id,
        quantity_needed,
        menu_item_id
      `)
      .in('menu_item_id', menuItemIds);

    if (ingredientsError) {
      console.error('[StockUtils] Error fetching menu ingredients:', ingredientsError);
      return;
    }

    if (!menuIngredients || menuIngredients.length === 0) {
      console.log('[StockUtils] No ingredients found for menu items');
      return;
    }

    // Calculate total ingredient usage
    const ingredientUsage = new Map<string, number>();

    orderItems.forEach(orderItem => {
      const itemIngredients = menuIngredients.filter(
        ing => ing.menu_item_id === orderItem.menu_item_id
      );

      itemIngredients.forEach(ingredient => {
        const totalUsage = ingredient.quantity_needed * orderItem.quantity;
        const currentUsage = ingredientUsage.get(ingredient.ingredient_id) || 0;
        ingredientUsage.set(ingredient.ingredient_id, currentUsage + totalUsage);
      });
    });

    console.log('[StockUtils] Calculated ingredient usage:', Object.fromEntries(ingredientUsage));

    // Update ingredient quantities
    for (const [ingredientId, usageAmount] of ingredientUsage) {
      // Get current ingredient quantity
      const { data: ingredient, error: getError } = await supabase
        .from('ingredients')
        .select('quantity, name')
        .eq('id', ingredientId)
        .single();

      if (getError || !ingredient) {
        console.error('[StockUtils] Error getting ingredient:', getError);
        continue;
      }

      const newQuantity = Math.max(0, ingredient.quantity - usageAmount);
      
      console.log(`[StockUtils] Updating ${ingredient.name}: ${ingredient.quantity} - ${usageAmount} = ${newQuantity}`);

      // Update ingredient quantity
      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ quantity: newQuantity })
        .eq('id', ingredientId);

      if (updateError) {
        console.error('[StockUtils] Error updating ingredient quantity:', updateError);
        continue;
      }

      // Log stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          ingredient_id: ingredientId,
          movement_type: 'usage',
          quantity_change: -usageAmount,
          notes: `การใช้วัตถุดิบจากการสั่งซื้อ`,
          created_by: 'system'
        });

      if (movementError) {
        console.error('[StockUtils] Error logging stock movement:', movementError);
      }
    }

    console.log('[StockUtils] Stock reduction completed successfully');
  } catch (error) {
    console.error('[StockUtils] Unexpected error in stock reduction:', error);
  }
};
