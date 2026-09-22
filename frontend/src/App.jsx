import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './shared/store/AppDataProvider';
import { CustomerProvider } from './modules/customer/context/CustomerContext';
import { CustomerRoutes } from './modules/customer/routes/CustomerRoutes';
import { SalonProvider } from './modules/salon/context/SalonContext';
import { SalonRoutes } from './modules/salon/routes/SalonRoutes';
import { AdminProvider } from './modules/admin/context/AdminContext';
import { AdminRoutes } from './modules/admin/routes/AdminRoutes';
import { DevPanel } from './shared/components/DevPanel';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

function App() {
  return (
    // AppDataProvider is the single source of truth shared by all modules
    // (see shared/store/AppDataProvider.jsx) — CustomerProvider, SalonProvider
    // and AdminProvider below are thin, module-specific views over it
    // rather than independent state of their own.
    //
    // ErrorBoundary is the outermost element so a render crash anywhere
    // in either app shows a recoverable screen instead of a blank page —
    // found necessary during testing when a timestamp-vs-Date mismatch in
    // the slot-hold countdown crashed checkout to white.
    <ErrorBoundary>
      <AppDataProvider>
        <BrowserRouter>
          <CustomerProvider>
            <SalonProvider>
              <AdminProvider>
                <Routes>
                  {/* Customer Module Routes */}
                  <Route path="/customer/*" element={<CustomerRoutes />} />

                  {/* Salon Partner Module Routes */}
                  <Route path="/salon/*" element={<SalonRoutes />} />

                  {/* Admin Super Console Routes */}
                  <Route path="/admin/*" element={<AdminRoutes />} />

                  {/* Root redirect to Customer App */}
                  <Route path="/" element={<Navigate to="/customer" replace />} />
                  <Route path="*" element={<Navigate to="/customer" replace />} />
                </Routes>
                <DevPanel />
              </AdminProvider>
            </SalonProvider>
          </CustomerProvider>
        </BrowserRouter>
      </AppDataProvider>
    </ErrorBoundary>
  );
}

export default App;
