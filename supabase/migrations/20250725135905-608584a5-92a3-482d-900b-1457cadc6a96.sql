-- Enable realtime for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Create function to call edge function for order notifications
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  order_data jsonb;
BEGIN
  -- Only process online orders
  IF NEW.order_source = 'online' THEN
    -- Prepare order data for notification
    order_data := jsonb_build_object(
      'id', NEW.id,
      'order_number', NEW.order_number,
      'total_amount', NEW.total_amount,
      'items_count', NEW.items_count,
      'member_id', NEW.member_id,
      'payment_method', NEW.payment_method,
      'order_source', NEW.order_source,
      'status', NEW.status,
      'created_at', NEW.created_at
    );
    
    -- Log the trigger execution
    RAISE LOG 'notify_new_order trigger fired for order %', NEW.order_number;
    
    -- Call the edge function asynchronously
    PERFORM net.http_post(
      url := 'https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/send-order-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnpieGZsd3Zrc29ocm14YnN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcwNTc1OSwiZXhwIjoyMDY1MjgxNzU5fQ.MUMubJh8atwpCHKi_Mc7UGk4wGBDNnDGx9t2pNQWxSE'
      ),
      body := order_data
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically notify on new online orders
DROP TRIGGER IF EXISTS trigger_notify_new_order ON public.orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();

-- Add orders table to realtime publication for web notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;