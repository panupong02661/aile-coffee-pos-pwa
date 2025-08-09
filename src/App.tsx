
import React from 'react';
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
import Orders from './pages/Orders';
import Tables from './pages/Tables';
import SalesReports from './pages/SalesReports';
import ProductReports from './pages/ProductReports';
import CustomerAnalytics from './pages/CustomerAnalytics';

// Create QueryClient instance outside component to avoid recreating
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <GlobalNotificationProvider>
              <div className="min-h-screen bg-background">
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
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/tables" element={<Tables />} />
                  <Route path="/sales-reports" element={<SalesReports />} />
                  <Route path="/product-reports" element={<ProductReports />} />
                  <Route path="/customer-analytics" element={<CustomerAnalytics />} />
                  
                  {/* Coming Soon routes */}
                  <Route path="/time-attendance" element={<ComingSoon />} />
                  <Route path="/permissions" element={<ComingSoon />} />
                  <Route path="/branch-management" element={<ComingSoon />} />
                  <Route path="/accounting" element={<ComingSoon />} />
                  <Route path="/income-expense" element={<ComingSoon />} />
                  <Route path="/profit-loss" element={<ComingSoon />} />
                  <Route path="/tax-system" element={<ComingSoon />} />
                  <Route path="/vat-calculation" element={<ComingSoon />} />
                  <Route path="/tax-invoice" element={<ComingSoon />} />
                  <Route path="/credit-system" element={<ComingSoon />} />
                  <Route path="/crm" element={<ComingSoon />} />
                  <Route path="/customer-data" element={<ComingSoon />} />
                  <Route path="/purchase-history" element={<ComingSoon />} />
                  <Route path="/marketing" element={<ComingSoon />} />
                  <Route path="/sms-marketing" element={<ComingSoon />} />
                  <Route path="/email-marketing" element={<ComingSoon />} />
                  <Route path="/table-reservation" element={<ComingSoon />} />
                  <Route path="/digital-payment" element={<ComingSoon />} />
                  <Route path="/credit-card" element={<ComingSoon />} />
                  <Route path="/api-system" element={<ComingSoon />} />
                  <Route path="/external-integration" element={<ComingSoon />} />
                  <Route path="/staff-mobile-app" element={<ComingSoon />} />
                  <Route path="/customer-mobile-app" element={<ComingSoon />} />
                  <Route path="/data-backup" element={<ComingSoon />} />
                  <Route path="/auto-backup" element={<ComingSoon />} />
                  <Route path="/system-logs" element={<ComingSoon />} />
                  <Route path="/usage-logs" element={<ComingSoon />} />
                  <Route path="/role-access" element={<ComingSoon />} />
                  <Route path="/access-control" element={<ComingSoon />} />
                  <Route path="/ai-analytics-dashboard" element={<ComingSoon />} />
                  <Route path="/smart-recommendation" element={<ComingSoon />} />
                  <Route path="/smart-inventory-ai" element={<ComingSoon />} />
                  <Route path="/pwa-app" element={<ComingSoon />} />
                  <Route path="/gamification" element={<ComingSoon />} />
                  <Route path="/virtual-loyalty" element={<ComingSoon />} />
                  <Route path="/push-notifications" element={<ComingSoon />} />
                  <Route path="/dark-mode" element={<ComingSoon />} />
                  <Route path="/responsive-design" element={<ComingSoon />} />
                  <Route path="/drag-drop" element={<ComingSoon />} />
                  <Route path="/advanced-filtering" element={<ComingSoon />} />
                  <Route path="/keyboard-shortcuts" element={<ComingSoon />} />
                  <Route path="/offline-first" element={<ComingSoon />} />
                  <Route path="/smart-caching" element={<ComingSoon />} />
                  <Route path="/image-optimization" element={<ComingSoon />} />
                  <Route path="/lazy-loading" element={<ComingSoon />} />
                  <Route path="/cdn-integration" element={<ComingSoon />} />
                  <Route path="/rbac-advanced" element={<ComingSoon />} />
                  <Route path="/fraud-detection" element={<ComingSoon />} />
                  <Route path="/advanced-reporting-new" element={<ComingSoon />} />
                  <Route path="/custom-dashboards" element={<ComingSoon />} />
                  <Route path="/data-export" element={<ComingSoon />} />
                  <Route path="/automated-reports" element={<ComingSoon />} />
                  <Route path="/kpi-monitoring" element={<ComingSoon />} />
                  <Route path="/third-party-pos" element={<ComingSoon />} />
                  <Route path="/accounting-integration" element={<ComingSoon />} />
                  <Route path="/social-media-integration" element={<ComingSoon />} />
                  <Route path="/email-marketing-tools" element={<ComingSoon />} />
                  <Route path="/webhook-support" element={<ComingSoon />} />
                  <Route path="/ab-testing" element={<ComingSoon />} />
                  <Route path="/customer-journey" element={<ComingSoon />} />
                  <Route path="/retention-analytics" element={<ComingSoon />} />
                  <Route path="/kitchen-display" element={<ComingSoon />} />
                  <Route path="/queue-management" element={<ComingSoon />} />
                  <Route path="/recipe-management" element={<ComingSoon />} />
                  <Route path="/allergen-tracking" element={<ComingSoon />} />
                  <Route path="/barcode-scanner" element={<ComingSoon />} />
                  <Route path="/camera-integration" element={<ComingSoon />} />
                  <Route path="/gps-integration" element={<ComingSoon />} />
                  <Route path="/advanced" element={<ComingSoon />} />
                  <Route path="/advanced-payment" element={<ComingSoon />} />
                  <Route path="/kitchen" element={<ComingSoon />} />
                  <Route path="/business-settings" element={<ComingSoon />} />
                  <Route path="/shop-settings" element={<ShopSettings />} />
                  <Route path="/printer-settings" element={<PrinterSettings />} />
                  <Route path="/delivery-integration" element={<DeliveryIntegration />} />
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
              </div>
              <Toaster />
              <Sonner />
            </GlobalNotificationProvider>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
