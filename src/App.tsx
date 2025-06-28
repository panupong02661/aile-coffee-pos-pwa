
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/components/LoginPage";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import MemberManagement from "./pages/MemberManagement";
import MemberRegistration from "./pages/MemberRegistration";
import Reports from "./pages/Reports";
import ShopSettings from "./pages/ShopSettings";
import OnlineSystem from "./pages/OnlineSystem";
import CustomerMobileApp from "./pages/CustomerMobileApp";
import CustomerAppManagement from "./pages/CustomerAppManagement";
import Inventory from "./pages/Inventory";
import Promotions from "./pages/Promotions";
import PrinterSettings from "./pages/PrinterSettings";
import QRCodePromptPayPage from "./pages/QRCodePromptPayPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/member-registration" element={<MemberRegistration />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><MemberManagement /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ShopSettings /></ProtectedRoute>} />
            <Route path="/shop-settings" element={<ProtectedRoute><ShopSettings /></ProtectedRoute>} />
            <Route path="/online-system" element={<ProtectedRoute><OnlineSystem /></ProtectedRoute>} />
            <Route path="/customer-mobile-app" element={<ProtectedRoute><CustomerMobileApp /></ProtectedRoute>} />
            <Route path="/customer-app-management" element={<ProtectedRoute><CustomerAppManagement /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
            <Route path="/printer-settings" element={<ProtectedRoute><PrinterSettings /></ProtectedRoute>} />
            <Route path="/qr-promptpay" element={<ProtectedRoute><QRCodePromptPayPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
