
import { useEffect } from 'react';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import CustomerOrderingInterface from '@/components/customer/CustomerOrderingInterface';
import { Toaster } from '@/components/ui/toaster';

const CustomerOrderApp = () => {
  const { initializeAudio } = useOrderNotifications();

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleUserInteraction = async () => {
      await initializeAudio();
    };

    // Add event listeners for first user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [initializeAudio]);

  return (
    <div>
      <CustomerOrderingInterface />
      <Toaster />
    </div>
  );
};

export default CustomerOrderApp;
