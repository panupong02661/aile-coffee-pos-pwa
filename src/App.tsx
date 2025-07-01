
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';

const queryClient = new QueryClient();

// Lazy load components
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
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
