import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import AdminLayout from './layouts/AdminLayout';
import { isAuthenticated } from './lib/auth';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ReligionsPage = lazy(() => import('./pages/ReligionsPage'));
const HolySitesPage = lazy(() => import('./pages/HolySitesPage'));
const TemplesPage = lazy(() => import('./pages/TemplesPage'));
const PatriarchsPage = lazy(() => import('./pages/PatriarchsPage'));
const TeachingsPage = lazy(() => import('./pages/TeachingsPage'));
const SealsPage = lazy(() => import('./pages/SealsPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const JournalsPage = lazy(() => import('./pages/JournalsPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const ModerationPage = lazy(() => import('./pages/ModerationPage'));
const CouponsPage = lazy(() => import('./pages/CouponsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const AIConfigPage = lazy(() => import('./pages/AIConfigPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="religions" element={<ReligionsPage />} />
          <Route path="holy-sites" element={<HolySitesPage />} />
          <Route path="temples" element={<TemplesPage />} />
          <Route path="patriarchs" element={<PatriarchsPage />} />
          <Route path="teachings" element={<TeachingsPage />} />
          <Route path="seals" element={<SealsPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="journals" element={<JournalsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="moderation" element={<ModerationPage />} />
          <Route path="ai-config" element={<AIConfigPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
