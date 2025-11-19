
import React from 'react';
import OnlineShopSection from './OnlineShopSection';

interface ShopSectionProps {
  currentUser?: any;
  setCurrentUser?: (user: any) => void;
  selectedMenuItemId?: string | null;
  onItemAdded?: () => void;
}

const ShopSection = ({ currentUser, setCurrentUser, selectedMenuItemId, onItemAdded }: ShopSectionProps) => {
  return <OnlineShopSection currentUser={currentUser} setCurrentUser={setCurrentUser} selectedMenuItemId={selectedMenuItemId} onItemAdded={onItemAdded} />;
};

export default ShopSection;
