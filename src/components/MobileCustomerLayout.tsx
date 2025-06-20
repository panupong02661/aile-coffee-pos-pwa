
import { ReactNode } from 'react';

interface MobileCustomerLayoutProps {
  children: ReactNode;
}

const MobileCustomerLayout = ({ children }: MobileCustomerLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default MobileCustomerLayout;
