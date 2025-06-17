
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import POS from "./pages/POS";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import ShopSettings from "./pages/ShopSettings";
import MemberManagement from "./pages/MemberManagement";
import MemberRegistration from "./pages/MemberRegistration";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";
import Promotions from "./pages/Promotions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/menu" element={
              <ProtectedRoute>
                <MenuManagement />
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute>
                <MemberManagement />
              </ProtectedRoute>
            } />
            <Route path="/member-registration" element={<MemberRegistration />} />
            <Route path="/shop-settings" element={
              <ProtectedRoute>
                <ShopSettings />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/promotions" element={
              <ProtectedRoute>
                <Promotions />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
