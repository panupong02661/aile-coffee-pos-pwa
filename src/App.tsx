import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalNotificationProvider } from "@/components/providers/GlobalNotificationProvider";
import Index from "./pages/Index";
import OnlineOrderManagement from "./pages/OnlineOrderManagement";
import SecurityRecommendationsPage from "./pages/SecurityRecommendationsPage";
import RestaurantOrderingSystem from "./components/RestaurantOrderingSystem";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GlobalNotificationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/online-order-management" element={<OnlineOrderManagement />} />
            <Route path="/security-recommendations" element={<SecurityRecommendationsPage />} />
            <Route path="/restaurant-ordering" element={<RestaurantOrderingSystem />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </GlobalNotificationProvider>
  </QueryClientProvider>
);

export default App;
