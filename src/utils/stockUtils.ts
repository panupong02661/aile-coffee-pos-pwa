
import { supabase } from '@/integrations/supabase/client';

interface MenuIngredient {
  ingredient_id: string;
  quantity_needed: number;
}

export const reduceStockForOrder = async (orderItems: any[]) => {
  try {
    console.log('[StockUtils] Starting stock reduction for order items:', orderItems);
    
    if (!orderItems || orderItems.length === 0) {
      console.log('[StockUtils] No order items provided');
      return { success: false, error: 'No order items provided' };
    }

    // Get all menu ingredients for the ordered items
    const menuItemIds = orderItems.map(item => item.menu_item_id);
    console.log('[StockUtils] Looking for ingredients for menu items:', menuItemIds);
    
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
      return { success: false, error: `Failed to fetch ingredients: ${ingredientsError.message}` };
    }

    if (!menuIngredients || menuIngredients.length === 0) {
      console.log('[StockUtils] No ingredients found for menu items - this might be normal if items have no recipes');
      return { success: true, message: 'No ingredients to reduce' };
    }

    console.log('[StockUtils] Found ingredients:', menuIngredients);

    // Calculate total ingredient usage
    const ingredientUsage = new Map<string, number>();

    orderItems.forEach(orderItem => {
      const itemIngredients = menuIngredients.filter(
        ing => ing.menu_item_id === orderItem.menu_item_id
      );

      console.log(`[StockUtils] Ingredients for ${orderItem.menu_item_name}:`, itemIngredients);

      itemIngredients.forEach(ingredient => {
        const totalUsage = ingredient.quantity_needed * orderItem.quantity;
        const currentUsage = ingredientUsage.get(ingredient.ingredient_id) || 0;
        ingredientUsage.set(ingredient.ingredient_id, currentUsage + totalUsage);
        console.log(`[StockUtils] ${ingredient.ingredient_id}: ${ingredient.quantity_needed} × ${orderItem.quantity} = ${totalUsage}`);
      });
    });

    console.log('[StockUtils] Total ingredient usage:', Object.fromEntries(ingredientUsage));

    if (ingredientUsage.size === 0) {
      console.log('[StockUtils] No ingredient usage calculated');
      return { success: true, message: 'No ingredients to reduce' };
    }

    // Update ingredient quantities with better error handling
    const updateResults = [];
    for (const [ingredientId, usageAmount] of ingredientUsage) {
      try {
        // Get current ingredient quantity
        const { data: ingredient, error: getError } = await supabase
          .from('ingredients')
          .select('quantity, name, id')
          .eq('id', ingredientId)
          .single();

        if (getError) {
          console.error(`[StockUtils] Error getting ingredient ${ingredientId}:`, getError);
          updateResults.push({ ingredientId, success: false, error: getError.message });
          continue;
        }

        if (!ingredient) {
          console.error(`[StockUtils] Ingredient ${ingredientId} not found`);
          updateResults.push({ ingredientId, success: false, error: 'Ingredient not found' });
          continue;
        }

        const oldQuantity = ingredient.quantity;
        const newQuantity = Math.max(0, oldQuantity - usageAmount);
        
        console.log(`[StockUtils] Updating ${ingredient.name} (${ingredient.id}): ${oldQuantity} - ${usageAmount} = ${newQuantity}`);

        // Update ingredient quantity
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({ quantity: newQuantity })
          .eq('id', ingredientId);

        if (updateError) {
          console.error(`[StockUtils] Error updating ingredient ${ingredientId}:`, updateError);
          updateResults.push({ ingredientId, success: false, error: updateError.message });
          continue;
        }

        console.log(`[StockUtils] Successfully updated ${ingredient.name}: ${oldQuantity} → ${newQuantity}`);

        // Log stock movement
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            ingredient_id: ingredientId,
            movement_type: 'usage',
            quantity_change: -usageAmount,
            notes: `การใช้วัตถุดิบจากการสั่งซื้อ - ${ingredient.name}`,
            created_by: 'system'
          });

        if (movementError) {
          console.error(`[StockUtils] Error logging stock movement for ${ingredientId}:`, movementError);
          // Don't fail the whole operation for logging errors
        }

        updateResults.push({ 
          ingredientId, 
          ingredientName: ingredient.name,
          success: true, 
          oldQuantity, 
          newQuantity, 
          usageAmount 
        });

      } catch (error) {
        console.error(`[StockUtils] Unexpected error processing ingredient ${ingredientId}:`, error);
        updateResults.push({ ingredientId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    const successCount = updateResults.filter(r => r.success).length;
    const failCount = updateResults.filter(r => !r.success).length;

    console.log(`[StockUtils] Stock reduction completed: ${successCount} success, ${failCount} failed`);
    console.log('[StockUtils] Update results:', updateResults);

    return { 
      success: failCount === 0, 
      successCount, 
      failCount, 
      results: updateResults,
      message: `Updated ${successCount} ingredients${failCount > 0 ? `, ${failCount} failed` : ''}`
    };

  } catch (error) {
    console.error('[StockUtils] Unexpected error in stock reduction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error in stock reduction' 
    };
  }
};

// ฟังก์ชันใหม่สำหรับการยกเลิกออเดอร์และคืนสต็อก
export const cancelOrderAndRestoreStock = async (orderId: string, reason: string, restoreStock: boolean = true) => {
  try {
    console.log('[StockUtils] Starting order cancellation process for order:', orderId);

    // ดึงข้อมูลออเดอร์
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[StockUtils] Error fetching order:', orderError);
      return { success: false, error: 'Order not found' };
    }

    // ดึงรายการสินค้าในออเดอร์
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('[StockUtils] Error fetching order items:', itemsError);
      return { success: false, error: 'Failed to fetch order items' };
    }

    // บันทึกข้อมูลการยกเลิก
    const { error: cancelError } = await supabase
      .from('cancelled_orders')
      .insert({
        original_order_id: orderId,
        original_order_number: order.order_number,
        cancelled_by: 'system',
        reason,
        original_total_amount: order.total_amount,
        original_items_count: order.items_count,
        original_payment_method: order.payment_method,
        original_member_id: order.member_id,
        stock_restored: restoreStock
      });

    if (cancelError) {
      console.error('[StockUtils] Error recording cancellation:', cancelError);
      return { success: false, error: 'Failed to record cancellation' };
    }

    // คืนสต็อกถ้าต้องการ
    let stockResult = null;
    if (restoreStock) {
      const { data: result, error: stockError } = await supabase
        .rpc('restore_stock_for_cancelled_order', {
          order_id_param: orderId
        });

      if (stockError) {
        console.error('[StockUtils] Error restoring stock:', stockError);
        stockResult = { success: false, error: stockError.message };
      } else {
        stockResult = result;
        console.log('[StockUtils] Stock restoration result:', result);
      }
    }

    // ลบออเดอร์และรายการ
    const { error: deleteItemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (deleteItemsError) {
      console.error('[StockUtils] Error deleting order items:', deleteItemsError);
    }

    const { error: deleteOrderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (deleteOrderError) {
      console.error('[StockUtils] Error deleting order:', deleteOrderError);
      return { success: false, error: 'Failed to delete order' };
    }

    console.log('[StockUtils] Order cancellation completed successfully');

    return {
      success: true,
      message: `Order ${order.order_number} cancelled successfully`,
      stockResult,
      orderNumber: order.order_number
    };

  } catch (error) {
    console.error('[StockUtils] Unexpected error in order cancellation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in order cancellation'
    };
  }
};
