
import React from 'react';
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
import PrinterSettings from "./pages/PrinterSettings";
import NotFound from "./pages/NotFound";
import Promotions from "./pages/Promotions";
import OnlineSystem from "./pages/OnlineSystem";
import Reports from "./pages/Reports";

// Create QueryClient instance inside the component to avoid SSR issues
const App = () => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
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
              <Route path="/printer-settings" element={
                <ProtectedRoute>
                  <PrinterSettings />
                </ProtectedRoute>
              } />
              <Route path="/promotions" element={
                <ProtectedRoute>
                  <Promotions />
                </ProtectedRoute>
              } />
              <Route path="/online-system" element={
                <ProtectedRoute>
                  <OnlineSystem />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
