
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import NotificationSettings from '@/components/NotificationSettings';

const NotificationSettingsPage = () => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isMainSidebarOpen} 
        onClose={() => setIsMainSidebarOpen(false)} 
      />
      
      <div className="flex-1">
        <div className="p-4">
          <Header 
            onToggleMainSidebar={() => setIsMainSidebarOpen(true)}
            showMainSidebarToggle={true}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="max-w-6xl mx-auto">
            <NotificationSettings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
