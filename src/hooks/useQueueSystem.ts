
import { supabase } from '@/integrations/supabase/client';

/**
 * Create a queue ticket linked to an order and return the queue number
 */
export const createQueueFromOrder = async (
  orderId: string,
  shopId: string | null,
  customerName?: string | null,
  customerPhone?: string | null
): Promise<number | null> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get next queue number
    const { data: existing } = await supabase
      .from('queue_tickets')
      .select('queue_number')
      .gte('created_at', today.toISOString())
      .neq('status', 'cancelled')
      .order('queue_number', { ascending: false })
      .limit(1);

    const nextNum = (existing && existing.length > 0) ? existing[0].queue_number + 1 : 1;

    const { error } = await supabase.from('queue_tickets').insert({
      queue_number: nextNum,
      order_id: orderId,
      shop_id: shopId,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      party_size: 1,
      status: 'waiting',
    });

    if (error) {
      console.error('Failed to create queue ticket:', error);
      return null;
    }

    return nextNum;
  } catch (err) {
    console.error('Queue creation error:', err);
    return null;
  }
};

/**
 * Call a queue ticket by order_id (used when kitchen completes an order)
 */
export const callQueueByOrderId = async (orderId: string): Promise<number | null> => {
  try {
    const { data: ticket } = await supabase
      .from('queue_tickets')
      .select('id, queue_number, status')
      .eq('order_id', orderId)
      .in('status', ['waiting'])
      .single();

    if (!ticket) return null;

    await supabase.from('queue_tickets').update({
      status: 'called',
      called_at: new Date().toISOString(),
    }).eq('id', ticket.id);

    return ticket.queue_number;
  } catch {
    return null;
  }
};
