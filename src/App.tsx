
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import CustomerOrderApp from '@/pages/CustomerOrderApp';
import CustomerMobileApp from '@/pages/CustomerMobileApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/customer-order" element={<CustomerOrderApp />} />
        <Route path="/customer-mobile-app" element={<CustomerMobileApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
