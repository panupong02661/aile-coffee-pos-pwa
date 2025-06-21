
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import POS from "./pages/POS";
import MenuManagement from "./pages/MenuManagement";
import Reports from "./pages/Reports";
import ShopSettings from "./pages/ShopSettings";
import MemberManagement from "./pages/MemberManagement";
import MemberRegistration from "./pages/MemberRegistration";
import Dashboard from "./pages/Dashboard";
import Promotions from "./pages/Promotions";
import Inventory from "./pages/Inventory";
import PrinterSettings from "./pages/PrinterSettings";
import OnlineSystem from "./pages/OnlineSystem";
import CustomerMobileApp from "./pages/CustomerMobileApp";
import GiftManagement from "./pages/GiftManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/customer-app" element={<CustomerMobileApp />} />
          <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ShopSettings /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MemberManagement /></ProtectedRoute>} />
          <Route path="/member-registration" element={<ProtectedRoute><MemberRegistration /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/printer-settings" element={<ProtectedRoute><PrinterSettings /></ProtectedRoute>} />
          <Route path="/online-system" element={<ProtectedRoute><OnlineSystem /></ProtectedRoute>} />
          <Route path="/gift-management" element={<ProtectedRoute><GiftManagement /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
