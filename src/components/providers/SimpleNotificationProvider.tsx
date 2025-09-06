import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const SimpleNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    console.log('🔔 SimpleNotificationProvider - Starting setup');
    
    // Skip customer mobile app
    if (location.pathname === '/customer-mobile-app') {
      console.log('🚫 Skipping setup on customer mobile app');
      return;
    }

    // Prevent multiple setups
    if (isSetup) {
      console.log('🚫 Already setup, skipping');
      return;
    }

    setIsSetup(true);
    console.log('🎯 Setting up real-time order listener...');

    // Listen for new orders
    const channel = supabase
      .channel('orders-simple')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('🔔 NEW ORDER DETECTED:', payload);
          const order = payload.new as any;
          
          // Skip test orders
          if (order.order_number && order.order_number.includes('-TRIGGER')) {
            console.log(`🚫 Skipping test order: ${order.order_number}`);
            return;
          }
          
          console.log(`🎯 Processing order: ${order.order_number} (source: ${order.order_source || 'pos'})`);
          
          // Show simple toast
          toast.success(`🔔 ออเดอร์ใหม่! #${order.order_number}`, {
            description: `ยอดรวม: ฿${order.total_amount}`,
            duration: 5000,
          });
        }
      )
      .subscribe((status) => {
        console.log('🔔 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Simple notification listener is ACTIVE');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Simple subscription failed');
        }
      });

    return () => {
      console.log('🧹 Cleaning up SimpleNotificationProvider');
      setIsSetup(false);
      supabase.removeChannel(channel);
    };
  }, [location.pathname, isSetup]);

  return <>{children}</>;
};

export default SimpleNotificationProvider;