
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/hooks/useAuth';
import { CustomerAuthProvider } from '@/hooks/useCustomerAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import MenuManagement from "./pages/MenuManagement";
import MemberManagement from "./pages/MemberManagement";
import ShopSettings from "./pages/ShopSettings";
import Reports from "./pages/Reports";
import LoginPage from "./components/LoginPage";
import CustomerApp from "./pages/CustomerApp";
import MobileCustomerLayout from "./components/MobileCustomerLayout";
import Inventory from "./pages/Inventory";
import PrinterSettings from "./pages/PrinterSettings";
import Promotions from "./pages/Promotions";
import OnlineSystem from "./pages/OnlineSystem";
import MemberRegistration from "./pages/MemberRegistration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Customer App Routes */}
          <Route path="/customer" element={
            <CustomerAuthProvider>
              <MobileCustomerLayout>
                <CustomerApp />
              </MobileCustomerLayout>
            </CustomerAuthProvider>
          } />
          
          {/* Staff System Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <AuthProvider>
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/dashboard" element={
            <AuthProvider>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/pos" element={
            <AuthProvider>
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/menu" element={
            <AuthProvider>
              <ProtectedRoute>
                <MenuManagement />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/members" element={
            <AuthProvider>
              <ProtectedRoute>
                <MemberManagement />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/settings" element={
            <AuthProvider>
              <ProtectedRoute>
                <ShopSettings />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/reports" element={
            <AuthProvider>
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/inventory" element={
            <AuthProvider>
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/printer-settings" element={
            <AuthProvider>
              <ProtectedRoute>
                <PrinterSettings />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/promotions" element={
            <AuthProvider>
              <ProtectedRoute>
                <Promotions />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/online-system" element={
            <AuthProvider>
              <ProtectedRoute>
                <OnlineSystem />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="/member-registration" element={
            <AuthProvider>
              <ProtectedRoute>
                <MemberRegistration />
              </ProtectedRoute>
            </AuthProvider>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
