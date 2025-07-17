
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalNotificationProvider from "@/components/providers/GlobalNotificationProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import MemberManagement from "./pages/MemberManagement";
import OnlineSystem from "./pages/OnlineSystem";
import CustomerSystem from "./pages/CustomerSystem";
import MemberRegistration from "./pages/MemberRegistration";
import Promotions from "./pages/Promotions";
import ShopSettings from "./pages/ShopSettings";
import CustomerMobileApp from "./pages/CustomerMobileApp";
import CustomerAppManagement from "./pages/CustomerAppManagement";
import QRCodePromptPayPage from "./pages/QRCodePromptPayPage";
import Reports from "./pages/Reports";
import Inventory from "./pages/Inventory";
import PrinterSettings from "./pages/PrinterSettings";
import OnlineOrderManagement from "./pages/OnlineOrderManagement";
import SecurityRecommendationsPage from "./pages/SecurityRecommendationsPage";
import AdvancedReports from "./pages/AdvancedReports";
import TechnologySystem from "./pages/TechnologySystem";
import FinancialSystem from "./pages/FinancialSystem";
import SecuritySystem from "./pages/SecuritySystem";
import StaffManagement from "./pages/StaffManagement";
import DeliveryIntegration from "./pages/DeliveryIntegration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalNotificationProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/members" element={<MemberManagement />} />
            <Route path="/online-system" element={<OnlineSystem />} />
            <Route path="/customer-system" element={<CustomerSystem />} />
            <Route path="/member-registration" element={<MemberRegistration />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/shop-settings" element={<ShopSettings />} />
            <Route path="/customer-mobile-app" element={<CustomerMobileApp />} />
            <Route path="/customer-app-management" element={<CustomerAppManagement />} />
            <Route path="/qr-promptpay" element={<QRCodePromptPayPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/printer-settings" element={<PrinterSettings />} />
            <Route path="/online-orders" element={<OnlineOrderManagement />} />
            <Route path="/security-recommendations" element={<SecurityRecommendationsPage />} />
            <Route path="/advanced-reports" element={<AdvancedReports />} />
            <Route path="/technology-system" element={<TechnologySystem />} />
            <Route path="/financial-system" element={<FinancialSystem />} />
            <Route path="/security-system" element={<SecuritySystem />} />
            <Route path="/staff-management" element={<StaffManagement />} />
            <Route path="/delivery-integration" element={<DeliveryIntegration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GlobalNotificationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
