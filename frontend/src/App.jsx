import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './shared/store/AppDataProvider';
import { CustomerProvider } from './modules/customer/context/CustomerContext';
import { CustomerRoutes } from './modules/customer/routes/CustomerRoutes';
import { SalonProvider } from './modules/salon/context/SalonContext';
import { SalonRoutes } from './modules/salon/routes/SalonRoutes';
import { DevPanel } from './shared/components/DevPanel';

function App() {
  return (
    // AppDataProvider is the single source of truth shared by both modules
    // (see shared/store/AppDataProvider.jsx) — CustomerProvider and
    // SalonProvider below are now thin, module-specific views over it
    // rather than independent state of their own.
    <AppDataProvider>
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
            <DevPanel />
          </SalonProvider>
        </CustomerProvider>
      </BrowserRouter>
    </AppDataProvider>
  );
}

export default App;
