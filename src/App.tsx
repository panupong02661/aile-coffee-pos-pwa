import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { ShopProvider } from './hooks/useCurrentShop';
import { usePrefetch } from './hooks/usePrefetch';
import GlobalNotificationProvider from './components/providers/GlobalNotificationProvider';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PageLoadingSkeleton } from '@/components/ui/page-loading-skeleton';
import ProtectedRoute from './components/ProtectedRoute';
import CommandPalette from '@/components/CommandPalette';


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
const SidebarPreview = lazy(() => import('./pages/SidebarPreview'));

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
const EngagementManagement = lazy(() => import('./pages/EngagementManagement'));
const ShopBenchmark = lazy(() => import('./pages/ShopBenchmark'));
const QueueManagement = lazy(() => import('./pages/QueueManagement'));
const QueueDisplay = lazy(() => import('./pages/QueueDisplay'));
const TableManagement = lazy(() => import('./pages/TableManagement'));
const DeliveryTracking = lazy(() => import('./pages/DeliveryTracking'));
const QueueTracker = lazy(() => import('./pages/QueueTracker'));
const LauncherPreview = lazy(() => import('./pages/LauncherPreview'));
const ShiftClose = lazy(() => import('./pages/ShiftClose'));
const CategoryBarPreview = lazy(() => import('./pages/CategoryBarPreview'));

const PreviewHome = lazy(() => import('./pages/preview/PreviewHome'));
const PreviewPOS = lazy(() => import('./pages/preview/PreviewPOS'));
const PosV2 = lazy(() => import('./pages/preview/PosV2'));

function AppContent() {
  usePrefetch();
  return null;
}

function App() {
  // Catch unhandled async errors to prevent blank screen
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ShopProvider>
            <AppContent />
          <Router>
            <GlobalNotificationProvider>
              <div className="min-h-screen bg-background">
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <Routes>
                    {/* Public routes - no auth required */}
                    <Route path="/customer-mobile-app" element={<CustomerMobileApp />} />
                    <Route path="/member-registration" element={<MemberRegistration />} />
                    <Route path="/customer-display" element={<CustomerDisplay />} />
                    <Route path="/queue-display" element={<QueueDisplay />} />
                    <Route path="/queue-tracker" element={<QueueTracker />} />
                    <Route path="/kitchen-display" element={<KitchenDisplay />} />
                    <Route path="/preview-home" element={<PreviewHome />} />
                    <Route path="/preview-pos" element={<PreviewPOS />} />
                    <Route path="/pos-v2" element={<PosV2 />} />
                    <Route path="/sidebar-preview" element={<SidebarPreview />} />


                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/menu" element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
                    <Route path="/members" element={<ProtectedRoute><MemberManagement /></ProtectedRoute>} />
                    <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                    <Route path="/pos-classic" element={<ProtectedRoute><POS classic /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/shop-settings" element={<ProtectedRoute><ShopSettings /></ProtectedRoute>} />
                    <Route path="/business-settings" element={<ProtectedRoute><BusinessSettings /></ProtectedRoute>} />
                    <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
                    <Route path="/menu-promotions" element={<ProtectedRoute><MenuPromotions /></ProtectedRoute>} />
                    <Route path="/customer-app-management" element={<ProtectedRoute><CustomerAppManagement /></ProtectedRoute>} />
                    <Route path="/qr-promptpay" element={<ProtectedRoute><QRCodePromptPayPage /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                    <Route path="/printer-settings" element={<ProtectedRoute><PrinterSettings /></ProtectedRoute>} />
                    <Route path="/online-orders" element={<ProtectedRoute><OnlineOrderManagement /></ProtectedRoute>} />
                    <Route path="/security-recommendations" element={<ProtectedRoute><SecurityRecommendationsPage /></ProtectedRoute>} />
                    <Route path="/delivery-integration" element={<ProtectedRoute><DeliveryIntegration /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
                    <Route path="/line-messaging" element={<ProtectedRoute><LineMessaging /></ProtectedRoute>} />
                    <Route path="/cost-analysis" element={<ProtectedRoute><CostAnalysis /></ProtectedRoute>} />
                    <Route path="/coupon-management" element={<ProtectedRoute><CouponManagement /></ProtectedRoute>} />
                    <Route path="/review-management" element={<ProtectedRoute><ReviewManagement /></ProtectedRoute>} />
                    <Route path="/delivery-management" element={<ProtectedRoute><DeliveryManagement /></ProtectedRoute>} />
                    <Route path="/install" element={<ProtectedRoute><PWAInstallGuide /></ProtectedRoute>} />
                    <Route path="/app-build-guide" element={<ProtectedRoute><AppBuildGuide /></ProtectedRoute>} />
                    <Route path="/wifi-vouchers" element={<ProtectedRoute><WiFiVouchers /></ProtectedRoute>} />
                    <Route path="/mobile-settings" element={<ProtectedRoute><MobileSettings /></ProtectedRoute>} />
                    <Route path="/security-dashboard" element={<ProtectedRoute><SecurityDashboard /></ProtectedRoute>} />
                    <Route path="/analytics-dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                    <Route path="/financial-dashboard" element={<ProtectedRoute><FinancialDashboard /></ProtectedRoute>} />
                    <Route path="/error-tracking" element={<ProtectedRoute><SecurityDashboard /></ProtectedRoute>} />
                    <Route path="/session-management" element={<ProtectedRoute><SecurityDashboard /></ProtectedRoute>} />
                    <Route path="/data-backup-monitor" element={<ProtectedRoute><SecurityDashboard /></ProtectedRoute>} />
                    <Route path="/predictive-analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                    <Route path="/customer-behavior-analysis" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                    <Route path="/inventory-forecasting" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                    <Route path="/advanced-reports" element={<ProtectedRoute><AdvancedReports /></ProtectedRoute>} />
                    <Route path="/sales-reports" element={<ProtectedRoute><AdvancedReports /></ProtectedRoute>} />
                    <Route path="/product-reports" element={<ProtectedRoute><AdvancedReports /></ProtectedRoute>} />
                    <Route path="/customer-analytics" element={<ProtectedRoute><AdvancedReports /></ProtectedRoute>} />
                    <Route path="/staff" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
                    <Route path="/time-attendance" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
                    <Route path="/permissions" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
                    <Route path="/branch-management" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
                    <Route path="/accounting" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                    <Route path="/income-expense" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                    <Route path="/profit-loss" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                    <Route path="/tax-system" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                    <Route path="/vat-calculation" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                    <Route path="/tax-invoice" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                    <Route path="/credit-system" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                    <Route path="/crm" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                    <Route path="/customer-data" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                    <Route path="/purchase-history" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                    <Route path="/marketing" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                    <Route path="/sms-marketing" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                    <Route path="/email-marketing" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                    <Route path="/table-reservation" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                    <Route path="/digital-payment" element={<ProtectedRoute><TechnologySystem /></ProtectedRoute>} />
                    <Route path="/credit-card" element={<ProtectedRoute><TechnologySystem /></ProtectedRoute>} />
                    <Route path="/api-system" element={<ProtectedRoute><TechnologySystem /></ProtectedRoute>} />
                    <Route path="/external-integration" element={<ProtectedRoute><TechnologySystem /></ProtectedRoute>} />
                    <Route path="/staff-mobile-app" element={<ProtectedRoute><TechnologySystem /></ProtectedRoute>} />
                    <Route path="/data-backup" element={<ProtectedRoute><SecuritySystem /></ProtectedRoute>} />
                    <Route path="/auto-backup" element={<ProtectedRoute><SecuritySystem /></ProtectedRoute>} />
                    <Route path="/system-logs" element={<ProtectedRoute><SecuritySystem /></ProtectedRoute>} />
                    <Route path="/usage-logs" element={<ProtectedRoute><SecuritySystem /></ProtectedRoute>} />
                    <Route path="/role-access" element={<ProtectedRoute><SecuritySystem /></ProtectedRoute>} />
                    <Route path="/access-control" element={<ProtectedRoute><SecuritySystem /></ProtectedRoute>} />
                    <Route path="/engagement" element={<ProtectedRoute><EngagementManagement /></ProtectedRoute>} />
                    <Route path="/shop-benchmark" element={<ProtectedRoute><ShopBenchmark /></ProtectedRoute>} />
                    <Route path="/queue-management" element={<ProtectedRoute><QueueManagement /></ProtectedRoute>} />
                    <Route path="/table-management" element={<ProtectedRoute><TableManagement /></ProtectedRoute>} />
                    <Route path="/delivery-tracking" element={<ProtectedRoute><DeliveryTracking /></ProtectedRoute>} />
                    <Route path="/launcher-preview" element={<ProtectedRoute><LauncherPreview /></ProtectedRoute>} />
                    <Route path="/shift-close" element={<ProtectedRoute><ShiftClose /></ProtectedRoute>} />
                  </Routes>

                </Suspense>
                <CommandPalette />
                <PWAInstallPrompt />

                <OfflineIndicator />
                <Toaster />
                <SonnerToaster />
              </div>
            </GlobalNotificationProvider>
          </Router>
          </ShopProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
