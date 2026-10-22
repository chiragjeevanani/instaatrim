import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './shared/store/AppDataProvider';
import { CustomerProvider } from './modules/customer/context/CustomerContext';
import { SalonProvider } from './modules/salon/context/SalonContext';
import { AdminProvider } from './modules/admin/context/AdminContext';
import { DevPanel } from './shared/components/DevPanel';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { ScrollToTop } from './shared/components/ScrollToTop';

// Code Splitting via dynamic imports for faster bundle loading
const CustomerRoutes = lazy(() => import('./modules/customer/routes/CustomerRoutes').then(m => ({ default: m.CustomerRoutes })));
const SalonRoutes = lazy(() => import('./modules/salon/routes/SalonRoutes').then(m => ({ default: m.SalonRoutes })));
const AdminRoutes = lazy(() => import('./modules/admin/routes/AdminRoutes').then(m => ({ default: m.AdminRoutes })));
const LandingPage = lazy(() => import('./modules/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const LegalPage = lazy(() => import('./modules/landing/LegalPage').then(m => ({ default: m.LegalPage })));
const AboutPage = lazy(() => import('./modules/landing/AboutPage').then(m => ({ default: m.AboutPage })));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#09090b', color: '#a1a1aa' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #3f3f46', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '13px', fontWeight: 500 }}>Loading Instaatrim...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

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
          <ScrollToTop />
          <CustomerProvider>
            <SalonProvider>
              <AdminProvider>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Customer Module Routes */}
                    <Route path="/customer/*" element={<CustomerRoutes />} />

                    {/* Salon Partner Module Routes */}
                    <Route path="/salon/*" element={<SalonRoutes />} />

                    {/* Admin Super Console Routes */}
                    <Route path="/admin/*" element={<AdminRoutes />} />

                    {/* Public marketing landing page (content managed in Admin → Landing Page) */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/privacy-policy" element={<LegalPage docKey="privacy" />} />
                    <Route path="/privacy" element={<LegalPage docKey="privacy" />} />
                    <Route path="/terms" element={<LegalPage docKey="terms" />} />
                    <Route path="*" element={<Navigate to="/customer" replace />} />
                  </Routes>
                </Suspense>
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
