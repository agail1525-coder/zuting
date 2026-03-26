import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import ReligionsPage from './pages/ReligionsPage';
import HolySitesPage from './pages/HolySitesPage';
import TemplesPage from './pages/TemplesPage';
import PatriarchsPage from './pages/PatriarchsPage';
import TeachingsPage from './pages/TeachingsPage';
import SealsPage from './pages/SealsPage';
import TripsPage from './pages/TripsPage';
import OrdersPage from './pages/OrdersPage';
import JournalsPage from './pages/JournalsPage';
import AIConfigPage from './pages/AIConfigPage';
import LoginPage from './pages/LoginPage';
import { isAuthenticated } from './lib/auth';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
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
        <Route path="journals" element={<JournalsPage />} />
        <Route path="ai-config" element={<AIConfigPage />} />
      </Route>
    </Routes>
  );
}
