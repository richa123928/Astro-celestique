import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { TimezoneProvider } from './context/TimezoneContext';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Horoscopes from './pages/Horoscopes';
import AIChat from './pages/AIChat';
import Consultations from './pages/Consultations';
import Kundli from './pages/Kundli';
import Calculators from './pages/Calculators';
import Compatibility from './pages/Compatibility';
import Remedies from './pages/Remedies';
import Panchang from './pages/Panchang';
import AITools from './pages/AITools';
import Puja from './pages/Puja';
import Admin from './pages/Admin';

// Protected Route
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

// Page Loader
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--navy-deep)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '2px solid var(--border-light)',
          borderTop: '2px solid var(--gold)',
          animation: 'rotate 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
      </div>
    </div>
  );
}

// Layout wrapper
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                    element={<Layout><Home /></Layout>} />
      <Route path="/auth"                element={<Auth />} />
      <Route path="/horoscopes"          element={<Layout><Horoscopes /></Layout>} />
      <Route path="/horoscopes/:type"    element={<Layout><Horoscopes /></Layout>} />
      <Route path="/ai-chat"             element={<Layout><AIChat /></Layout>} />
      <Route path="/consultations"       element={<Layout><Consultations /></Layout>} />
      <Route path="/kundli"              element={<Layout><Kundli /></Layout>} />
      <Route path="/kundli/:type"        element={<Layout><Kundli /></Layout>} />
      <Route path="/calculators"         element={<Layout><Calculators /></Layout>} />
      <Route path="/calculators/:tool"   element={<Layout><Calculators /></Layout>} />
      <Route path="/compatibility"       element={<Layout><Compatibility /></Layout>} />
      <Route path="/compatibility/:type" element={<Layout><Compatibility /></Layout>} />
      <Route path="/remedies"            element={<Layout><Remedies /></Layout>} />
      <Route path="/panchang"            element={<Layout><Panchang /></Layout>} />
      <Route path="/ai-tools"            element={<Layout><AITools /></Layout>} />
      <Route path="/puja"                element={<Layout><Puja /></Layout>} />
      <Route path="/puja/:pujaKey"       element={<Layout><Puja /></Layout>} />
      <Route path="/admin"               element={<Layout><Admin /></Layout>} />
      <Route path="*"                    element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <TimezoneProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--navy-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }
              }}
            />
            <AppRoutes />
          </TimezoneProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}