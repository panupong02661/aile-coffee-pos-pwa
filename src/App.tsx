
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalNotificationProvider from '@/components/providers/GlobalNotificationProvider';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import MemberManagement from "./pages/MemberManagement";
import Reports from "./pages/Reports";
import ShopSettings from "./pages/ShopSettings";
import StaffManagement from "./pages/StaffManagement";
import SystemSettings from "./pages/SystemSettings";
import Promotions from "./pages/Promotions";
import Inventory from "./pages/Inventory";
import PrinterSettings from "./pages/PrinterSettings";
import MobileSettings from "./pages/MobileSettings";
import NotificationPage from "./pages/NotificationPage";
import OnlineSystem from "./pages/OnlineSystem";
import CustomerSystem from "./pages/CustomerSystem";
import SecuritySystem from "./pages/SecuritySystem";
import SecurityRecommendationsPage from "./pages/SecurityRecommendationsPage";
import TechnologySystem from "./pages/TechnologySystem";
import OnlineOrderManagement from "./pages/OnlineOrderManagement";
import CustomerAppManagement from "./pages/CustomerAppManagement";
import CustomerSegmentation from "./pages/CustomerSegmentation";
import AutomatedMarketing from "./pages/AutomatedMarketing";
import DeliveryIntegration from "./pages/DeliveryIntegration";
import AIAnalyticsDashboard from "./pages/AIAnalyticsDashboard";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import IntelligentInventory from "./pages/IntelligentInventory";
import SmartMenuRecommendations from "./pages/SmartMenuRecommendations";
import RealtimeBIDashboard from "./pages/RealtimeBIDashboard";
import ProfitabilityAnalysis from "./pages/ProfitabilityAnalysis";
import AdvancedReports from "./pages/AdvancedReports";
import FinancialSystem from "./pages/FinancialSystem";
import MemberRegistration from "./pages/MemberRegistration";
import CustomerMobileApp from "./pages/CustomerMobileApp";
import QRCodePromptPayPage from "./pages/QRCodePromptPayPage";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";
import SalesReports from "./pages/SalesReports";
import ProductReports from "./pages/ProductReports";
import CustomerAnalytics from "./pages/CustomerAnalytics";
import StockMovementHistory from "./pages/StockMovementHistory";
import InventoryReportsPage from "./pages/InventoryReportsPage";
import FinancialReportsPage from "./pages/FinancialReportsPage";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/menu-management" element={<MenuManagement />} />
    <Route path="/member-management" element={<MemberManagement />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/shop-settings" element={<ShopSettings />} />
    <Route path="/staff-management" element={<StaffManagement />} />
    <Route path="/system-settings" element={<SystemSettings />} />
    <Route path="/promotions" element={<Promotions />} />
    <Route path="/inventory" element={<Inventory />} />
    <Route path="/printer-settings" element={<PrinterSettings />} />
    <Route path="/mobile-settings" element={<MobileSettings />} />
    <Route path="/notifications" element={<NotificationPage />} />
    <Route path="/online-system" element={<OnlineSystem />} />
    <Route path="/customer-system" element={<CustomerSystem />} />
    <Route path="/security-system" element={<SecuritySystem />} />
    <Route path="/security-recommendations" element={<SecurityRecommendationsPage />} />
    <Route path="/technology-system" element={<TechnologySystem />} />
    <Route path="/online-order-management" element={<OnlineOrderManagement />} />
    <Route path="/customer-app-management" element={<CustomerAppManagement />} />
    <Route path="/customer-segmentation" element={<CustomerSegmentation />} />
    <Route path="/automated-marketing" element={<AutomatedMarketing />} />
    <Route path="/delivery-integration" element={<DeliveryIntegration />} />
    <Route path="/ai-analytics" element={<AIAnalyticsDashboard />} />
    <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
    <Route path="/intelligent-inventory" element={<IntelligentInventory />} />
    <Route path="/smart-menu" element={<SmartMenuRecommendations />} />
    <Route path="/realtime-bi" element={<RealtimeBIDashboard />} />
    <Route path="/profitability" element={<ProfitabilityAnalysis />} />
    <Route path="/advanced-reports" element={<AdvancedReports />} />
    <Route path="/financial-system" element={<FinancialSystem />} />
    <Route path="/member-registration" element={<MemberRegistration />} />
    <Route path="/customer-mobile-app" element={<CustomerMobileApp />} />
    <Route path="/qr-promptpay" element={<QRCodePromptPayPage />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/tables" element={<Tables />} />
    <Route path="/sales-reports" element={<SalesReports />} />
    <Route path="/product-reports" element={<ProductReports />} />
    <Route path="/customer-analytics" element={<CustomerAnalytics />} />
    <Route path="/stock-movement" element={<StockMovementHistory />} />
    <Route path="/inventory-reports" element={<InventoryReportsPage />} />
    <Route path="/financial-reports" element={<FinancialReportsPage />} />
    <Route path="/coming-soon" element={<ComingSoon />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <GlobalNotificationProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </GlobalNotificationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
