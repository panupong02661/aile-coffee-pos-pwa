import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import GlobalNotificationProvider from './components/providers/GlobalNotificationProvider';

const queryClient = new QueryClient();

// Existing pages
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const MemberManagement = lazy(() => import('./pages/MemberManagement'));
const MemberRegistration = lazy(() => import('./pages/MemberRegistration'));
const POS = lazy(() => import('./pages/POS'));
const Reports = lazy(() => import('./pages/Reports'));
const ShopSettings = lazy(() => import('./pages/ShopSettings'));
const Promotions = lazy(() => import('./pages/Promotions'));
const OnlineSystem = lazy(() => import('./pages/OnlineSystem'));
const CustomerMobileApp = lazy(() => import('./pages/CustomerMobileApp'));
const CustomerAppManagement = lazy(() => import('./pages/CustomerAppManagement'));
const QRCodePromptPayPage = lazy(() => import('./pages/QRCodePromptPayPage'));
const Inventory = lazy(() => import('./pages/Inventory'));
const PrinterSettings = lazy(() => import('./pages/PrinterSettings'));
const OnlineOrderManagement = lazy(() => import('./pages/OnlineOrderManagement'));
const SecurityRecommendationsPage = lazy(() => import('./pages/SecurityRecommendationsPage'));
const DeliveryIntegration = lazy(() => import('./pages/DeliveryIntegration'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const MobileSettings = lazy(() => import('./pages/MobileSettings'));

// Existing 5 main system pages
const AdvancedReports = lazy(() => import('./pages/AdvancedReports'));
const StaffManagement = lazy(() => import('./pages/StaffManagement'));
const FinancialSystem = lazy(() => import('./pages/FinancialSystem'));
const CustomerSystem = lazy(() => import('./pages/CustomerSystem'));
const TechnologySystem = lazy(() => import('./pages/TechnologySystem'));
const SecuritySystem = lazy(() => import('./pages/SecuritySystem'));

// New placeholder page for all new features
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <GlobalNotificationProvider>
            <div className="min-h-screen bg-background">
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                <Routes>
                  {/* Existing routes */}
                  <Route path="/" element={<POS />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/menu" element={<MenuManagement />} />
                  <Route path="/members" element={<MemberManagement />} />
                  <Route path="/member-registration" element={<MemberRegistration />} />
                  <Route path="/pos" element={<POS />} />
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
                  <Route path="/delivery-integration" element={<DeliveryIntegration />} />
                  <Route path="/notifications" element={<NotificationPage />} />
                  
                  {/* Mobile Settings Route */}
                  <Route path="/mobile-settings" element={<MobileSettings />} />
                  
                  {/* Existing 5 main system routes */}
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
                  <Route path="/crm" element={<CustomerSystem />} />
                  <Route path="/customer-data" element={<CustomerSystem />} />
                  <Route path="/purchase-history" element={<CustomerSystem />} />
                  <Route path="/marketing" element={<CustomerSystem />} />
                  <Route path="/sms-marketing" element={<CustomerSystem />} />
                  <Route path="/email-marketing" element={<CustomerSystem />} />
                  <Route path="/table-reservation" element={<CustomerSystem />} />
                  <Route path="/digital-payment" element={<TechnologySystem />} />
                  <Route path="/credit-card" element={<TechnologySystem />} />
                  <Route path="/api-system" element={<TechnologySystem />} />
                  <Route path="/external-integration" element={<TechnologySystem />} />
                  <Route path="/staff-mobile-app" element={<TechnologySystem />} />
                  <Route path="/customer-mobile-app" element={<TechnologySystem />} />
                  <Route path="/data-backup" element={<SecuritySystem />} />
                  <Route path="/auto-backup" element={<SecuritySystem />} />
                  <Route path="/system-logs" element={<SecuritySystem />} />
                  <Route path="/usage-logs" element={<SecuritySystem />} />
                  <Route path="/role-access" element={<SecuritySystem />} />
                  <Route path="/access-control" element={<SecuritySystem />} />
                  
                  {/* New routes - 📊 ระบบวิเคราะห์และรายงานขั้นสูง */}
                  <Route path="/ai-analytics-dashboard" element={<ComingSoon />} />
                  <Route path="/predictive-analytics" element={<ComingSoon />} />
                  <Route path="/realtime-bi" element={<ComingSoon />} />
                  <Route path="/customer-segmentation" element={<ComingSoon />} />
                  <Route path="/profitability-analysis" element={<ComingSoon />} />
                  
                  {/* New routes - 🤖 ระบบ AI และ Automation */}
                  <Route path="/smart-recommendation" element={<ComingSoon />} />
                  <Route path="/smart-inventory-ai" element={<ComingSoon />} />
                  
                  {/* New routes - 📱 ระบบลูกค้าขั้นสูง */}
                  <Route path="/pwa-app" element={<ComingSoon />} />
                  <Route path="/gamification" element={<ComingSoon />} />
                  <Route path="/virtual-loyalty" element={<ComingSoon />} />
                  <Route path="/push-notifications" element={<ComingSoon />} />
                  
                  {/* New routes - 🎨 UI/UX Enhancement */}
                  <Route path="/dark-mode" element={<ComingSoon />} />
                  <Route path="/responsive-design" element={<ComingSoon />} />
                  <Route path="/drag-drop" element={<ComingSoon />} />
                  <Route path="/advanced-filtering" element={<ComingSoon />} />
                  <Route path="/keyboard-shortcuts" element={<ComingSoon />} />
                  
                  {/* New routes - ⚡ Performance Optimization */}
                  <Route path="/offline-first" element={<ComingSoon />} />
                  <Route path="/smart-caching" element={<ComingSoon />} />
                  <Route path="/image-optimization" element={<ComingSoon />} />
                  <Route path="/lazy-loading" element={<ComingSoon />} />
                  <Route path="/cdn-integration" element={<ComingSoon />} />
                  
                  {/* New routes - 🔒 Security Enhancement */}
                  <Route path="/rbac-advanced" element={<ComingSoon />} />
                  <Route path="/fraud-detection" element={<ComingSoon />} />
                  
                  {/* New routes - 📈 Business Intelligence */}
                  <Route path="/advanced-reporting-new" element={<ComingSoon />} />
                  <Route path="/custom-dashboards" element={<ComingSoon />} />
                  <Route path="/data-export" element={<ComingSoon />} />
                  <Route path="/automated-reports" element={<ComingSoon />} />
                  <Route path="/kpi-monitoring" element={<ComingSoon />} />
                  
                  {/* New routes - 🌐 Integration & API */}
                  <Route path="/third-party-pos" element={<ComingSoon />} />
                  <Route path="/accounting-integration" element={<ComingSoon />} />
                  <Route path="/social-media-integration" element={<ComingSoon />} />
                  <Route path="/email-marketing-tools" element={<ComingSoon />} />
                  <Route path="/webhook-support" element={<ComingSoon />} />
                  
                  {/* New routes - 🎯 Marketing Automation */}
                  <Route path="/ab-testing" element={<ComingSoon />} />
                  <Route path="/customer-journey" element={<ComingSoon />} />
                  <Route path="/retention-analytics" element={<ComingSoon />} />
                  
                  {/* New routes - 🍽️ Restaurant-Specific Features */}
                  <Route path="/kitchen-display" element={<ComingSoon />} />
                  <Route path="/queue-management" element={<ComingSoon />} />
                  <Route path="/recipe-management" element={<ComingSoon />} />
                  <Route path="/allergen-tracking" element={<ComingSoon />} />
                  
                  {/* New routes - 📱 Mobile Enhancements */}
                  <Route path="/barcode-scanner" element={<ComingSoon />} />
                  <Route path="/camera-integration" element={<ComingSoon />} />
                  <Route path="/gps-integration" element={<ComingSoon />} />
                </Routes>
              </Suspense>
              <Toaster />
              <SonnerToaster />
            </div>
          </GlobalNotificationProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
