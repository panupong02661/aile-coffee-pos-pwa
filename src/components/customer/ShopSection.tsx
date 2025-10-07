
import React from 'react';
import OnlineShopSection from './OnlineShopSection';

interface ShopSectionProps {
  currentUser?: any;
  setCurrentUser?: (user: any) => void;
}

const ShopSection = ({ currentUser, setCurrentUser }: ShopSectionProps) => {
  return <OnlineShopSection currentUser={currentUser} setCurrentUser={setCurrentUser} />;
};

export default ShopSection;
