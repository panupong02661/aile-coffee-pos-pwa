
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/components/LoginPage';
import GlobalNotificationProvider from '@/components/providers/GlobalNotificationProvider';

// Import all pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import MenuManagement from '@/pages/MenuManagement';
import Inventory from '@/pages/Inventory';
import Reports from '@/pages/Reports';
import MemberManagement from '@/pages/MemberManagement';
import Promotions from '@/pages/Promotions';
import ShopSettings from '@/pages/ShopSettings';
import PrinterSettings from '@/pages/PrinterSettings';
import MobileSettings from '@/pages/MobileSettings';
import OnlineSystem from '@/pages/OnlineSystem';
import CustomerSystem from '@/pages/CustomerSystem';
import TechnologySystem from '@/pages/TechnologySystem';
import SecuritySystem from '@/pages/SecuritySystem';
import FinancialSystem from '@/pages/FinancialSystem';
import StaffManagement from '@/pages/StaffManagement';
import OnlineOrderManagement from '@/pages/OnlineOrderManagement';
import MemberRegistration from '@/pages/MemberRegistration';
import QRCodePromptPayPage from '@/pages/QRCodePromptPayPage';
import CustomerMobileApp from '@/pages/CustomerMobileApp';
import CustomerAppManagement from '@/pages/CustomerAppManagement';
import DeliveryIntegration from '@/pages/DeliveryIntegration';
import AutomatedMarketing from '@/pages/AutomatedMarketing';
import AIAnalyticsDashboard from '@/pages/AIAnalyticsDashboard';
import PredictiveAnalytics from '@/pages/PredictiveAnalytics';
import RealtimeBIDashboard from '@/pages/RealtimeBIDashboard';
import CustomerSegmentation from '@/pages/CustomerSegmentation';
import ProfitabilityAnalysis from '@/pages/ProfitabilityAnalysis';
import SmartMenuRecommendations from '@/pages/SmartMenuRecommendations';
import IntelligentInventory from '@/pages/IntelligentInventory';
import AdvancedReports from '@/pages/AdvancedReports';
import NotificationPage from '@/pages/NotificationPage';
import SecurityRecommendationsPage from '@/pages/SecurityRecommendationsPage';
import PWAApplication from '@/pages/PWAApplication';
import GamificationSystem from '@/pages/GamificationSystem';
import VirtualLoyaltyCard from '@/pages/VirtualLoyaltyCard';
import PushNotifications from '@/pages/PushNotifications';
import NotFound from '@/pages/NotFound';
import ComingSoon from '@/pages/ComingSoon';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <GlobalNotificationProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                <Route path="/menu-management" element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/member-management" element={<ProtectedRoute><MemberManagement /></ProtectedRoute>} />
                <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
                <Route path="/shop-settings" element={<ProtectedRoute><ShopSettings /></ProtectedRoute>} />
                <Route path="/printer-settings" element={<ProtectedRoute><PrinterSettings /></ProtectedRoute>} />
                <Route path="/mobile-settings" element={<ProtectedRoute><MobileSettings /></ProtectedRoute>} />
                
                {/* System Routes */}
                <Route path="/online-system" element={<ProtectedRoute><OnlineSystem /></ProtectedRoute>} />
                <Route path="/customer-system" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                <Route path="/technology-system" element={<ProtectedRoute><TechnologySystem /></ProtectedRoute>} />
                <Route path="/security-system" element={<ProtectedRoute><SecuritySystem /></ProtectedRoute>} />
                <Route path="/financial-system" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                <Route path="/staff-management" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
                
                {/* Online Features */}
                <Route path="/online-orders" element={<ProtectedRoute><OnlineOrderManagement /></ProtectedRoute>} />
                <Route path="/member-registration" element={<ProtectedRoute><MemberRegistration /></ProtectedRoute>} />
                <Route path="/qr-promptpay" element={<ProtectedRoute><QRCodePromptPayPage /></ProtectedRoute>} />
                <Route path="/customer-app" element={<ProtectedRoute><CustomerMobileApp /></ProtectedRoute>} />
                <Route path="/customer-app-management" element={<ProtectedRoute><CustomerAppManagement /></ProtectedRoute>} />
                <Route path="/delivery-integration" element={<ProtectedRoute><DeliveryIntegration /></ProtectedRoute>} />
                <Route path="/automated-marketing" element={<ProtectedRoute><AutomatedMarketing /></ProtectedRoute>} />
                
                {/* Analytics & AI */}
                <Route path="/ai-analytics" element={<ProtectedRoute><AIAnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/predictive-analytics" element={<ProtectedRoute><PredictiveAnalytics /></ProtectedRoute>} />
                <Route path="/realtime-bi" element={<ProtectedRoute><RealtimeBIDashboard /></ProtectedRoute>} />
                <Route path="/customer-segmentation" element={<ProtectedRoute><CustomerSegmentation /></ProtectedRoute>} />
                <Route path="/profitability-analysis" element={<ProtectedRoute><ProfitabilityAnalysis /></ProtectedRoute>} />
                <Route path="/smart-recommendations" element={<ProtectedRoute><SmartMenuRecommendations /></ProtectedRoute>} />
                <Route path="/intelligent-inventory" element={<ProtectedRoute><IntelligentInventory /></ProtectedRoute>} />
                <Route path="/advanced-reports" element={<ProtectedRoute><AdvancedReports /></ProtectedRoute>} />
                
                {/* Notifications & Security */}
                <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
                <Route path="/security-recommendations" element={<ProtectedRoute><SecurityRecommendationsPage /></ProtectedRoute>} />
                
                {/* Modern Features */}
                <Route path="/pwa-application" element={<ProtectedRoute><PWAApplication /></ProtectedRoute>} />
                <Route path="/gamification-system" element={<ProtectedRoute><GamificationSystem /></ProtectedRoute>} />
                <Route path="/virtual-loyalty-card" element={<ProtectedRoute><VirtualLoyaltyCard /></ProtectedRoute>} />
                <Route path="/push-notifications" element={<ProtectedRoute><PushNotifications /></ProtectedRoute>} />
                
                {/* Utility Routes */}
                <Route path="/coming-soon" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </GlobalNotificationProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
