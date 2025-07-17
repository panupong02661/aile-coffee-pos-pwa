
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import MemberManagement from "./pages/MemberManagement";
import Reports from "./pages/Reports";
import ShopSettings from "./pages/ShopSettings";
import POS from "./pages/POS";
import Promotions from "./pages/Promotions";
import Inventory from "./pages/Inventory";
import QRCodePromptPayPage from "./pages/QRCodePromptPayPage";
import OnlineSystem from "./pages/OnlineSystem";
import StaffManagement from "./pages/StaffManagement";
import PrinterSettings from "./pages/PrinterSettings";
import CustomerSystem from "./pages/CustomerSystem";
import OnlineOrderManagement from "./pages/OnlineOrderManagement";
import TechnologySystem from "./pages/TechnologySystem";
import SecuritySystem from "./pages/SecuritySystem";
import FinancialSystem from "./pages/FinancialSystem";
import AdvancedReports from "./pages/AdvancedReports";
import CustomerMobileApp from "./pages/CustomerMobileApp";
import MemberRegistration from "./pages/MemberRegistration";
import NotFound from "./pages/NotFound";
import CustomerAppManagement from "./pages/CustomerAppManagement";
import SecurityRecommendationsPage from "./pages/SecurityRecommendationsPage";
import DeliveryIntegration from "./pages/DeliveryIntegration";
import NotificationSettings from "./pages/NotificationSettings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/members" element={<MemberManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<ShopSettings />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/qr-promptpay" element={<QRCodePromptPayPage />} />
            <Route path="/online-system" element={<OnlineSystem />} />
            <Route path="/staff-management" element={<StaffManagement />} />
            <Route path="/printer-settings" element={<PrinterSettings />} />
            <Route path="/customer-system" element={<CustomerSystem />} />
            <Route path="/online-order-management" element={<OnlineOrderManagement />} />
            <Route path="/technology-system" element={<TechnologySystem />} />
            <Route path="/security-system" element={<SecuritySystem />} />
            <Route path="/financial-system" element={<FinancialSystem />} />
            <Route path="/advanced-reports" element={<AdvancedReports />} />
            <Route path="/customer-mobile-app" element={<CustomerMobileApp />} />
            <Route path="/member-registration" element={<MemberRegistration />} />
            <Route path="/customer-app-management" element={<CustomerAppManagement />} />
            <Route path="/security-recommendations" element={<SecurityRecommendationsPage />} />
            <Route path="/delivery-integration" element={<DeliveryIntegration />} />
            <Route path="/notification-settings" element={<NotificationSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
