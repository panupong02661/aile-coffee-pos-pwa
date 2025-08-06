

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalNotificationProvider from '@/components/providers/GlobalNotificationProvider';
import { AuthProvider } from '@/hooks/useAuth';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import MenuManagement from './pages/MenuManagement';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import MemberManagement from './pages/MemberManagement';
import Promotions from './pages/Promotions';
import ShopSettings from './pages/ShopSettings';
import PrinterSettings from './pages/PrinterSettings';
import NotFound from './pages/NotFound';
import OnlineSystem from './pages/OnlineSystem';
import CustomerSystem from './pages/CustomerSystem';
import MemberRegistration from './pages/MemberRegistration';
import CustomerMobileApp from './pages/CustomerMobileApp';
import TechnologySystem from './pages/TechnologySystem';
import StaffManagement from './pages/StaffManagement';
import SecuritySystem from './pages/SecuritySystem';
import CustomerAppManagement from './pages/CustomerAppManagement';
import OnlineOrderManagement from './pages/OnlineOrderManagement';
import DeliveryIntegration from './pages/DeliveryIntegration';
import FinancialSystem from './pages/FinancialSystem';
import MobileSettings from './pages/MobileSettings';
import NotificationPage from './pages/NotificationPage';
import QRCodePromptPayPage from './pages/QRCodePromptPayPage';
import SecurityRecommendationsPage from './pages/SecurityRecommendationsPage';
import AdvancedReports from './pages/AdvancedReports';
import ComingSoon from './pages/ComingSoon';
import AIAnalyticsDashboard from './pages/AIAnalyticsDashboard';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import RealtimeBIDashboard from './pages/RealtimeBIDashboard';
import CustomerSegmentation from './pages/CustomerSegmentation';
import ProfitabilityAnalysis from './pages/ProfitabilityAnalysis';
import IntelligentInventory from './pages/IntelligentInventory';
import SmartMenuRecommendations from './pages/SmartMenuRecommendations';
import AutomatedMarketing from './pages/AutomatedMarketing';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalNotificationProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/members" element={<MemberManagement />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/settings" element={<ShopSettings />} />
              <Route path="/printer" element={<PrinterSettings />} />
              <Route path="/online-system" element={<OnlineSystem />} />
              <Route path="/customer-system" element={<CustomerSystem />} />
              <Route path="/member-registration" element={<MemberRegistration />} />
              <Route path="/customer-app" element={<CustomerMobileApp />} />
              <Route path="/technology" element={<TechnologySystem />} />
              <Route path="/staff" element={<StaffManagement />} />
              <Route path="/security" element={<SecuritySystem />} />
              <Route path="/customer-app-management" element={<CustomerAppManagement />} />
              <Route path="/online-orders" element={<OnlineOrderManagement />} />
              <Route path="/delivery" element={<DeliveryIntegration />} />
              <Route path="/financial" element={<FinancialSystem />} />
              <Route path="/mobile-settings" element={<MobileSettings />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/qr-promptpay" element={<QRCodePromptPayPage />} />
              <Route path="/security-recommendations" element={<SecurityRecommendationsPage />} />
              <Route path="/advanced-reports" element={<AdvancedReports />} />
              <Route path="/ai-analytics" element={<AIAnalyticsDashboard />} />
              <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
              <Route path="/realtime-bi" element={<RealtimeBIDashboard />} />
              <Route path="/customer-segmentation" element={<CustomerSegmentation />} />
              <Route path="/profitability-analysis" element={<ProfitabilityAnalysis />} />
              <Route path="/intelligent-inventory" element={<IntelligentInventory />} />
              <Route path="/smart-menu" element={<SmartMenuRecommendations />} />
              <Route path="/automated-marketing" element={<AutomatedMarketing />} />
              
              {/* Routing สำหรับหน้าที่ยังไม่ได้สร้าง */}
              <Route path="/dynamic-pricing" element={<ComingSoon />} />
              <Route path="/voice-assistant" element={<ComingSoon />} />
              <Route path="/chatbot-support" element={<ComingSoon />} />
              <Route path="/ar-menu" element={<ComingSoon />} />
              <Route path="/facial-recognition" element={<ComingSoon />} />
              <Route path="/iot-integration" element={<ComingSoon />} />
              <Route path="/blockchain-loyalty" element={<ComingSoon />} />
              <Route path="/virtual-reality" element={<ComingSoon />} />
              <Route path="/quantum-computing" element={<ComingSoon />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GlobalNotificationProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

