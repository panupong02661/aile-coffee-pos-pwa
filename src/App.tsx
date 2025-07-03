import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Home from './pages/Home';
import Menu from './pages/Menu';
import POS from './pages/POS';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import Category from './pages/Category';
import GlobalNotificationProvider from './components/GlobalNotificationProvider';
import Promotions from './pages/Promotions';
import SpecialPromotions from './pages/SpecialPromotions';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <GlobalNotificationProvider />
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/category" element={<Category />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/special-promotions" element={<SpecialPromotions />} />
          </Routes>
        </div>
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
