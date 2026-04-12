import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import AdminCockpitLayout from './layouts/AdminCockpitLayout';
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
const RoutesPage = lazy(() => import('./pages/RoutesPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const AIConfigPage = lazy(() => import('./pages/AIConfigPage'));
const SearchStatsPage = lazy(() => import('./pages/SearchStatsPage'));
const CommunityManagePage = lazy(() => import('./pages/CommunityManagePage'));
const PromotionManagePage = lazy(() => import('./pages/PromotionManagePage'));
const MembershipManagePage = lazy(() => import('./pages/MembershipManagePage'));
const PriceManagePage = lazy(() => import('./pages/PriceManagePage'));
const MerchantManagePage = lazy(() => import('./pages/MerchantManagePage'));
const I18nShareManagePage = lazy(() => import('./pages/I18nShareManagePage'));
const AnalyticsDashboardPage = lazy(() => import('./pages/AnalyticsDashboardPage'));
const ChatMonitorPage = lazy(() => import('./pages/ChatMonitorPage'));
const MediaPage = lazy(() => import('./pages/MediaPage'));
const MediaLibraryPage = lazy(() => import('./pages/MediaLibraryPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const TeamCultureManagePage = lazy(() => import('./pages/TeamCultureManagePage'));
const CultivationManagePage = lazy(() => import('./pages/CultivationManagePage'));
const HolySiteStudioPage = lazy(() => import('./pages/HolySiteStudioPage'));
const TempleStudioPage = lazy(() => import('./pages/TempleStudioPage'));
const PatriarchStudioPage = lazy(() => import('./pages/PatriarchStudioPage'));
const TeachingStudioPage = lazy(() => import('./pages/TeachingStudioPage'));
const ScriptureStudioPage = lazy(() => import('./pages/ScriptureStudioPage'));
const RouteStudioPage = lazy(() => import('./pages/RouteStudioPage'));
const CouponStudioPage = lazy(() => import('./pages/CouponStudioPage'));
const PromotionStudioPage = lazy(() => import('./pages/PromotionStudioPage'));
const GuideStudioPage = lazy(() => import('./pages/GuideStudioPage'));
const QuestionStudioPage = lazy(() => import('./pages/QuestionStudioPage'));
const ThemeStudioPage = lazy(() => import('./pages/ThemeStudioPage'));
const ThemesOverviewPage = lazy(() => import('./pages/ThemesOverviewPage'));
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
              <AdminCockpitLayout />
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
          <Route path="routes" element={<RoutesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="journals" element={<JournalsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="moderation" element={<ModerationPage />} />
          <Route path="ai-config" element={<AIConfigPage />} />
          <Route path="search-stats" element={<SearchStatsPage />} />
          <Route path="community" element={<CommunityManagePage />} />
          <Route path="promotions" element={<PromotionManagePage />} />
          <Route path="membership" element={<MembershipManagePage />} />
          <Route path="prices" element={<PriceManagePage />} />
          <Route path="merchants" element={<MerchantManagePage />} />
          <Route path="i18n-share" element={<I18nShareManagePage />} />
          <Route path="analytics" element={<AnalyticsDashboardPage />} />
          <Route path="chat-monitor" element={<ChatMonitorPage />} />
          <Route path="media" element={<MediaLibraryPage />} />
          <Route path="media-legacy" element={<MediaPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="team-culture" element={<TeamCultureManagePage />} />
          <Route path="cultivation" element={<CultivationManagePage />} />
          <Route path="holy-sites/:id" element={<HolySiteStudioPage />} />
          <Route path="temples/:id" element={<TempleStudioPage />} />
          <Route path="patriarchs/:id" element={<PatriarchStudioPage />} />
          <Route path="teachings/:id" element={<TeachingStudioPage />} />
          <Route path="scriptures/:id" element={<ScriptureStudioPage />} />
          <Route path="routes/:id" element={<RouteStudioPage />} />
          <Route path="coupons/:id" element={<CouponStudioPage />} />
          <Route path="promotions/:id" element={<PromotionStudioPage />} />
          <Route path="guides/:id" element={<GuideStudioPage />} />
          <Route path="questions/:id" element={<QuestionStudioPage />} />
          <Route path="themes" element={<ThemesOverviewPage />} />
          <Route path="team-culture/themes/:slug" element={<ThemeStudioPage kind="team-culture" />} />
          <Route path="personal-growth/themes/:slug" element={<ThemeStudioPage kind="personal-growth" />} />
          <Route path="family-harmony/themes/:slug" element={<ThemeStudioPage kind="family-harmony" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
