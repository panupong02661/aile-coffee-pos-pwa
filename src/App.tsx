import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { usePrefetch } from './hooks/usePrefetch';
import GlobalNotificationProvider from './components/providers/GlobalNotificationProvider';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PageLoadingSkeleton } from '@/components/ui/page-loading-skeleton';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load components
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const MemberManagement = lazy(() => import('./pages/MemberManagement'));
const MemberRegistration = lazy(() => import('./pages/MemberRegistration'));
const POS = lazy(() => import('./pages/POS'));
const Reports = lazy(() => import('./pages/Reports'));
const ShopSettings = lazy(() => import('./pages/ShopSettings'));
const BusinessSettings = lazy(() => import('./pages/BusinessSettings'));
const Promotions = lazy(() => import('./pages/Promotions'));

const CustomerMobileApp = lazy(() => import('./pages/CustomerMobileApp'));
const CustomerAppManagement = lazy(() => import('./pages/CustomerAppManagement'));
const QRCodePromptPayPage = lazy(() => import('./pages/QRCodePromptPayPage'));
import Inventory from './pages/Inventory';
const PrinterSettings = lazy(() => import('./pages/PrinterSettings'));
const OnlineOrderManagement = lazy(() => import('./pages/OnlineOrderManagement'));
const SecurityRecommendationsPage = lazy(() => import('./pages/SecurityRecommendationsPage'));
const DeliveryIntegration = lazy(() => import('./pages/DeliveryIntegration'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const MobileSettings = lazy(() => import('./pages/MobileSettings'));
const LineMessaging = lazy(() => import('./pages/LineMessaging'));
const CostAnalysis = lazy(() => import('./pages/CostAnalysis'));
const CouponManagement = lazy(() => import('./pages/CouponManagement'));
const ReviewManagement = lazy(() => import('./pages/ReviewManagement'));
const DeliveryManagement = lazy(() => import('./pages/DeliveryManagement'));
const PWAInstallGuide = lazy(() => import('./pages/PWAInstallGuide'));
const AppBuildGuide = lazy(() => import('./pages/AppBuildGuide'));
const WiFiVouchers = lazy(() => import('./pages/WiFiVouchers'));
const CustomerDisplay = lazy(() => import('./pages/CustomerDisplay'));
const KitchenDisplay = lazy(() => import('./pages/KitchenDisplay'));

// Additional Dashboard pages
const SecurityDashboard = lazy(() => import('./pages/SecurityDashboard'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const FinancialDashboard = lazy(() => import('./pages/FinancialDashboard'));

// New 5 main system pages
const AdvancedReports = lazy(() => import('./pages/AdvancedReports'));
const StaffManagement = lazy(() => import('./pages/StaffManagement'));
const FinancialSystem = lazy(() => import('./pages/FinancialSystem'));
const CustomerSystem = lazy(() => import('./pages/CustomerSystem'));
const TechnologySystem = lazy(() => import('./pages/TechnologySystem'));
const SecuritySystem = lazy(() => import('./pages/SecuritySystem'));
const MenuPromotions = lazy(() => import('./pages/MenuPromotions'));

function AppContent() {
  usePrefetch();
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <AuthProvider>
          <Router>
            <GlobalNotificationProvider>
              <div className="min-h-screen bg-background">
                <ProtectedRoute>
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <Routes>
                  <Route path="/" element={<POS />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/menu" element={<MenuManagement />} />
                  <Route path="/members" element={<MemberManagement />} />
                  <Route path="/member-registration" element={<MemberRegistration />} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/shop-settings" element={<ShopSettings />} />
                  <Route path="/business-settings" element={<BusinessSettings />} />
                  <Route path="/promotions" element={<Promotions />} />
                  <Route path="/menu-promotions" element={<MenuPromotions />} />
                  
                  <Route path="/customer-mobile-app" element={<CustomerMobileApp />} />
                  <Route path="/customer-app-management" element={<CustomerAppManagement />} />
                  <Route path="/qr-promptpay" element={<QRCodePromptPayPage />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/printer-settings" element={<PrinterSettings />} />
                  <Route path="/online-orders" element={<OnlineOrderManagement />} />
                  <Route path="/security-recommendations" element={<SecurityRecommendationsPage />} />
                  <Route path="/delivery-integration" element={<DeliveryIntegration />} />
                  <Route path="/notifications" element={<NotificationPage />} />
                  <Route path="/line-messaging" element={<LineMessaging />} />
                  <Route path="/cost-analysis" element={<CostAnalysis />} />
                  <Route path="/coupon-management" element={<CouponManagement />} />
                  <Route path="/review-management" element={<ReviewManagement />} />
                  <Route path="/delivery-management" element={<DeliveryManagement />} />
                  <Route path="/install" element={<PWAInstallGuide />} />
                  <Route path="/app-build-guide" element={<AppBuildGuide />} />
                  <Route path="/wifi-vouchers" element={<WiFiVouchers />} />
                  <Route path="/customer-display" element={<CustomerDisplay />} />
                  <Route path="/kitchen-display" element={<KitchenDisplay />} />
                  
                  <Route path="/mobile-settings" element={<MobileSettings />} />
                  
                  <Route path="/security-dashboard" element={<SecurityDashboard />} />
                  <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
                  <Route path="/financial-dashboard" element={<FinancialDashboard />} />
                  <Route path="/error-tracking" element={<SecurityDashboard />} />
                  <Route path="/session-management" element={<SecurityDashboard />} />
                  <Route path="/data-backup-monitor" element={<SecurityDashboard />} />
                  <Route path="/predictive-analytics" element={<AnalyticsDashboard />} />
                  <Route path="/customer-behavior-analysis" element={<AnalyticsDashboard />} />
                  <Route path="/inventory-forecasting" element={<AnalyticsDashboard />} />
                  
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
                  <Route path="/data-backup" element={<SecuritySystem />} />
                  <Route path="/auto-backup" element={<SecuritySystem />} />
                  <Route path="/system-logs" element={<SecuritySystem />} />
                  <Route path="/usage-logs" element={<SecuritySystem />} />
                  <Route path="/role-access" element={<SecuritySystem />} />
                  <Route path="/access-control" element={<SecuritySystem />} />
                  </Routes>
                </Suspense>
                </ProtectedRoute>
                <PWAInstallPrompt />
                <OfflineIndicator />
                <Toaster />
                <SonnerToaster />
              </div>
            </GlobalNotificationProvider>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
