
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import GlobalNotificationProvider from "@/components/providers/GlobalNotificationProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import MemberManagement from "./pages/MemberManagement";
import Reports from "./pages/Reports";
import ShopSettings from "./pages/ShopSettings";
import POS from "./pages/POS";
import Promotions from "./pages/Promotions";
import OnlineSystem from "./pages/OnlineSystem";
import OnlineOrderManagement from "./pages/OnlineOrderManagement";
import CustomerSystem from "./pages/CustomerSystem";
import CustomerMobileApp from "./pages/CustomerMobileApp";
import MemberRegistration from "./pages/MemberRegistration";
import QRCodePromptPayPage from "./pages/QRCodePromptPayPage";
import Inventory from "./pages/Inventory";
import StaffManagement from "./pages/StaffManagement";
import PrinterSettings from "./pages/PrinterSettings";
import AdvancedReports from "./pages/AdvancedReports";
import FinancialSystem from "./pages/FinancialSystem";
import SecuritySystem from "./pages/SecuritySystem";
import TechnologySystem from "./pages/TechnologySystem";
import DeliveryIntegration from "./pages/DeliveryIntegration";
import CustomerAppManagement from "./pages/CustomerAppManagement";
import SecurityRecommendationsPage from "./pages/SecurityRecommendationsPage";
import NotificationPage from "./pages/NotificationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalNotificationProvider>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/menu" element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
                <Route path="/members" element={<ProtectedRoute><MemberManagement /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><ShopSettings /></ProtectedRoute>} />
                <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
                <Route path="/online-system" element={<ProtectedRoute><OnlineSystem /></ProtectedRoute>} />
                <Route path="/online-orders" element={<ProtectedRoute><OnlineOrderManagement /></ProtectedRoute>} />
                <Route path="/customer-system" element={<ProtectedRoute><CustomerSystem /></ProtectedRoute>} />
                <Route path="/customer-mobile-app" element={<CustomerMobileApp />} />
                <Route path="/member-registration" element={<MemberRegistration />} />
                <Route path="/qr-promptpay" element={<QRCodePromptPayPage />} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/staff" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
                <Route path="/printer-settings" element={<ProtectedRoute><PrinterSettings /></ProtectedRoute>} />
                <Route path="/advanced-reports" element={<ProtectedRoute><AdvancedReports /></ProtectedRoute>} />
                <Route path="/financial-system" element={<ProtectedRoute><FinancialSystem /></ProtectedRoute>} />
                <Route path="/security-system" element={<ProtectedRoute><SecuritySystem /></ProtectedRoute>} />
                <Route path="/technology-system" element={<ProtectedRoute><TechnologySystem /></ProtectedRoute>} />
                <Route path="/delivery-integration" element={<ProtectedRoute><DeliveryIntegration /></ProtectedRoute>} />
                <Route path="/customer-app-management" element={<ProtectedRoute><CustomerAppManagement /></ProtectedRoute>} />
                <Route path="/security-recommendations" element={<ProtectedRoute><SecurityRecommendationsPage /></ProtectedRoute>} />
                <Route path="/notify" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GlobalNotificationProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
