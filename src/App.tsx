
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import POS from './pages/POS';
import Promotions from './pages/Promotions';
import SpecialPromotions from './pages/SpecialPromotions';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<POS />} />
            <Route path="/pos" element={<POS />} />
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
