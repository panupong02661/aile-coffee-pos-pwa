import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import MenuManagement from '@/pages/MenuManagement';
import MemberManagement from '@/pages/MemberManagement';
import Reports from '@/pages/Reports';
import ShopSettings from '@/pages/ShopSettings';
import Promotions from '@/pages/Promotions';
import OnlineSystem from '@/pages/OnlineSystem';
import CustomerMobileApp from '@/pages/CustomerMobileApp';
import CustomerAppManagement from '@/pages/CustomerAppManagement';
import QRCodePromptPayPage from '@/pages/QRCodePromptPayPage';
import Inventory from '@/pages/Inventory';
import PrinterSettings from '@/pages/PrinterSettings';
import OnlineOrderManagement from '@/pages/OnlineOrderManagement';
import SecurityRecommendationsPage from '@/pages/SecurityRecommendationsPage';
import AdvancedReports from '@/pages/AdvancedReports';
import StaffManagement from '@/pages/StaffManagement';
import FinancialSystem from '@/pages/FinancialSystem';
import TechnologySystem from '@/pages/TechnologySystem';
import SecuritySystem from '@/pages/SecuritySystem';
import CustomerSystem from '@/pages/CustomerSystem';
import MemberRegistration from '@/pages/MemberRegistration';
import POS from '@/pages/POS';
import DeliveryIntegration from '@/pages/DeliveryIntegration';
import LineNotifySettings from '@/pages/LineNotifySettings';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/members" element={<MemberManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/shop-settings" element={<ShopSettings />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/online-system" element={<OnlineSystem />} />
          <Route path="/customer-mobile-app" element={<CustomerMobileApp />} />
          <Route path="/customer-app-management" element={<CustomerAppManagement />} />
          <Route path="/qr-promptpay" element={<QRCodePromptPayPage />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/printer-settings" element={<PrinterSettings />} />
          <Route path="/online-orders" element={<OnlineOrderManagement />} />
          <Route path="/security-recommendations" element={<SecurityRecommendationsPage />} />
          <Route path="/advanced-reports" element={<AdvancedReports />} />
          <Route path="/sales-reports" element={<AdvancedReports />} />
          <Route path="/product-reports" element={<AdvancedReports />} />
          <Route path="/customer-analytics" element={<AdvancedReports />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/time-attendance" element={<StaffManagement />} />
          <Route path="/permissions" element={<StaffManagement />} />
          <Route path="/branch-management" element={<StaffManagement />} />
          <Route path="/accounting" element={<FinancialSystem />} />
          <Route path="/income-expense" element={<FinancialSystem />} />
          <Route path="/profit-loss" element={<FinancialSystem />} />
          <Route path="/tax-system" element={<FinancialSystem />} />
          <Route path="/vat-calculation" element={<FinancialSystem />} />
          <Route path="/tax-invoice" element={<FinancialSystem />} />
          <Route path="/credit-system" element={<FinancialSystem />} />
          <Route path="/digital-payment" element={<TechnologySystem />} />
          <Route path="/credit-card" element={<TechnologySystem />} />
          <Route path="/api-system" element={<TechnologySystem />} />
          <Route path="/external-integration" element={<TechnologySystem />} />
          <Route path="/staff-mobile-app" element={<TechnologySystem />} />
          <Route path="/data-backup" element={<SecuritySystem />} />
          <Route path="/auto-backup" element={<SecuritySystem />} />
          <Route path="/system-logs" element={<SecuritySystem />} />
          <Route path="/usage-logs" element={<SecuritySystem />} />
          <Route path="/role-access" element={<SecuritySystem />} />
          <Route path="/access-control" element={<SecuritySystem />} />
          <Route path="/crm" element={<CustomerSystem />} />
          <Route path="/customer-data" element={<CustomerSystem />} />
          <Route path="/purchase-history" element={<CustomerSystem />} />
          <Route path="/marketing" element={<CustomerSystem />} />
          <Route path="/sms-marketing" element={<CustomerSystem />} />
          <Route path="/email-marketing" element={<CustomerSystem />} />
          <Route path="/table-reservation" element={<CustomerSystem />} />
          <Route path="/member-registration" element={<MemberRegistration />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/delivery-integration" element={<DeliveryIntegration />} />
          <Route path="/line-notify" element={<LineNotifySettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
