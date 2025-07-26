
import React from 'react';
import OnlineShopSection from './OnlineShopSection';

interface ShopSectionProps {
  currentUser: any;
}

const ShopSection: React.FC<ShopSectionProps> = ({ currentUser }) => {
  return <OnlineShopSection currentUser={currentUser} />;
};

export default ShopSection;
