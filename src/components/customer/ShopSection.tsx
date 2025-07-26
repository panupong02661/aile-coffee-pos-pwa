
import React from 'react';
import OnlineShopSection from './OnlineShopSection';

interface ShopSectionProps {
  currentUser?: any;
}

const ShopSection = ({ currentUser }: ShopSectionProps) => {
  return <OnlineShopSection currentUser={currentUser} />;
};

export default ShopSection;
