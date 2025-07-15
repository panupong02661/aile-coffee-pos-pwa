
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';

const queryClient = new QueryClient();

// Lazy load components with proper error boundaries
const Index = lazy(() => import('./pages/Index').catch(() => ({ default: () => <div>Error loading page</div> })));
const Dashboard = lazy(() => import('./pages/Dashboard').catch(() => ({ default: () => <div>Error loading Dashboard</div> })));
const MenuManagement = lazy(() => import('./pages/MenuManagement').catch(() => ({ default: () => <div>Error loading Menu Management</div> })));
const MemberManagement = lazy(() => import('./pages/MemberManagement').catch(() => ({ default: () => <div>Error loading Member Management</div> })));
const MemberRegistration = lazy(() => import('./pages/MemberRegistration').catch(() => ({ default: () => <div>Error loading Member Registration</div> })));
const POS = lazy(() => import('./pages/POS').catch(() => ({ default: () => <div>Error loading POS</div> })));
const Reports = lazy(() => import('./pages/Reports').catch(() => ({ default: () => <div>Error loading Reports</div> })));
const ShopSettings = lazy(() => import('./pages/ShopSettings').catch(() => ({ default: () => <div>Error loading Shop Settings</div> })));
const Promotions = lazy(() => import('./pages/Promotions').catch(() => ({ default: () => <div>Error loading Promotions</div> })));
const OnlineSystem = lazy(() => import('./pages/OnlineSystem').catch(() => ({ default: () => <div>Error loading Online System</div> })));
const CustomerMobileApp = lazy(() => import('./pages/CustomerMobileApp').catch(() => ({ default: () => <div>Error loading Customer Mobile App</div> })));
const CustomerAppManagement = lazy(() => import('./pages/CustomerAppManagement').catch(() => ({ default: () => <div>Error loading Customer App Management</div> })));
const QRCodePromptPayPage = lazy(() => import('./pages/QRCodePromptPayPage').catch(() => ({ default: () => <div>Error loading QR Code PromptPay</div> })));
const Inventory = lazy(() => import('./pages/Inventory').catch(() => ({ default: () => <div>Error loading Inventory</div> })));
const PrinterSettings = lazy(() => import('./pages/PrinterSettings').catch(() => ({ default: () => <div>Error loading Printer Settings</div> })));
const OnlineOrderManagement = lazy(() => import('./pages/OnlineOrderManagement').catch(() => ({ default: () => <div>Error loading Online Order Management</div> })));
const SecurityRecommendationsPage = lazy(() => import('./pages/SecurityRecommendationsPage').catch(() => ({ default: () => <div>Error loading Security Recommendations</div> })));

// New 5 main system pages
const AdvancedReports = lazy(() => import('./pages/AdvancedReports').catch(() => ({ default: () => <div>Error loading Advanced Reports</div> })));
const StaffManagement = lazy(() => import('./pages/StaffManagement').catch(() => ({ default: () => <div>Error loading Staff Management</div> })));
const FinancialSystem = lazy(() => import('./pages/FinancialSystem').catch(() => ({ default: () => <div>Error loading Financial System</div> })));
const CustomerSystem = lazy(() => import('./pages/CustomerSystem').catch(() => ({ default: () => <div>Error loading Customer System</div> })));
const TechnologySystem = lazy(() => import('./pages/TechnologySystem').catch(() => ({ default: () => <div>Error loading Technology System</div> })));
const SecuritySystem = lazy(() => import('./pages/SecuritySystem').catch(() => ({ default: () => <div>Error loading Security System</div> })));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
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
                
                {/* New 5 main system routes */}
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
            <Toaster />
            <SonnerToaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
