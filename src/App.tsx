
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as HotToaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '@/hooks/useAuth';
import POS from '@/pages/POS';
import Dashboard from '@/pages/Dashboard';
import MenuManagement from '@/pages/MenuManagement';
import Promotions from '@/pages/Promotions';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import LoginPage from '@/components/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient();

// Animation wrapper component
const AnimatedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <AnimatedRoute>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route 
                  path="/pos" 
                  element={
                    <ProtectedRoute>
                      <POS />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/menu-management" 
                  element={
                    <ProtectedRoute>
                      <MenuManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/promotions" 
                  element={
                    <ProtectedRoute>
                      <Promotions />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </AnimatedRoute>
            <Toaster />
            <HotToaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#8B4513',
                  color: '#fff',
                  fontWeight: '500',
                },
              }}
            />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
