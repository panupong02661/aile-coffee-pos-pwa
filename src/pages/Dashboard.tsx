import { useState } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="max-w-7xl mx-auto">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="dashboard"
          />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-coffee-800">แดชบอร์ด</h1>
            <p className="text-coffee-600 mt-2">ภาพรวมการดำเนินงาน</p>
          </div>

          {/* Add your dashboard content here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold text-coffee-700 mb-2">ยอดขายวันนี้</h2>
              <p className="text-2xl text-coffee-900">฿12,500</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold text-coffee-700 mb-2">จำนวนลูกค้า</h2>
              <p className="text-2xl text-coffee-900">150</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold text-coffee-700 mb-2">สินค้าขายดี</h2>
              <p className="text-lg text-coffee-900">กาแฟเอสเปรสโซ่</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
