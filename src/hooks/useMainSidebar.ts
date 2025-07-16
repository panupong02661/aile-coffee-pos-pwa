
import { useState } from 'react';

export const useMainSidebar = () => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);

  const toggleMainSidebar = () => {
    setIsMainSidebarOpen(prev => !prev);
  };

  const closeMainSidebar = () => {
    setIsMainSidebarOpen(false);
  };

  const openMainSidebar = () => {
    setIsMainSidebarOpen(true);
  };

  return {
    isMainSidebarOpen,
    toggleMainSidebar,
    closeMainSidebar,
    openMainSidebar
  };
};
