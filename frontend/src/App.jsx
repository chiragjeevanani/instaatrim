import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerProvider } from './modules/customer/context/CustomerContext';
import { CustomerRoutes } from './modules/customer/routes/CustomerRoutes';
import { SalonProvider } from './modules/salon/context/SalonContext';
import { SalonRoutes } from './modules/salon/routes/SalonRoutes';

function App() {
  return (
    <BrowserRouter>
      <CustomerProvider>
        <SalonProvider>
          <Routes>
            {/* Customer Module Routes */}
            <Route path="/customer/*" element={<CustomerRoutes />} />

            {/* Salon Partner Module Routes */}
            <Route path="/salon/*" element={<SalonRoutes />} />

            {/* Root redirect to Customer App */}
            <Route path="/" element={<Navigate to="/customer" replace />} />
            <Route path="*" element={<Navigate to="/customer" replace />} />
          </Routes>
        </SalonProvider>
      </CustomerProvider>
    </BrowserRouter>
  );
}

export default App;
