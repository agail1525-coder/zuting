import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

/* ── Lazy-loaded pages ── */
const Home = lazy(() => import("./pages/Home"));
const Religions = lazy(() => import("./pages/Religions"));
const ReligionDetail = lazy(() => import("./pages/ReligionDetail"));
const HolySites = lazy(() => import("./pages/HolySites"));
const HolySiteDetail = lazy(() => import("./pages/HolySiteDetail"));
const Temples = lazy(() => import("./pages/Temples"));
const TempleDetail = lazy(() => import("./pages/TempleDetail"));
const Patriarchs = lazy(() => import("./pages/Patriarchs"));
const PatriarchDetail = lazy(() => import("./pages/PatriarchDetail"));
const Teachings = lazy(() => import("./pages/Teachings"));
const TeachingDetail = lazy(() => import("./pages/TeachingDetail"));
const Seals = lazy(() => import("./pages/Seals"));
const SealDetail = lazy(() => import("./pages/SealDetail"));
const RoutesList = lazy(() => import("./pages/RoutesList"));
const RouteDetail = lazy(() => import("./pages/RouteDetail"));
const Trips = lazy(() => import("./pages/Trips"));
const TripDetail = lazy(() => import("./pages/TripDetail"));
const Orders = lazy(() => import("./pages/Orders"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Search = lazy(() => import("./pages/Search"));
const Chat = lazy(() => import("./pages/Chat"));
const MapPage = lazy(() => import("./pages/MapPage"));
const Community = lazy(() => import("./pages/Community"));
const Journals = lazy(() => import("./pages/Journals"));
const JournalDetail = lazy(() => import("./pages/JournalDetail"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const Membership = lazy(() => import("./pages/Membership"));
const Coupons = lazy(() => import("./pages/Coupons"));
const Promotions = lazy(() => import("./pages/Promotions"));
const PointsMall = lazy(() => import("./pages/PointsMall"));
const Prices = lazy(() => import("./pages/Prices"));
const Merchants = lazy(() => import("./pages/Merchants"));
const MerchantDetail = lazy(() => import("./pages/MerchantDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Messages = lazy(() => import("./pages/Messages"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          {/* Tab pages */}
          <Route index element={<Home />} />
          <Route path="holy-sites" element={<HolySites />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />

          {/* Content */}
          <Route path="religions" element={<Religions />} />
          <Route path="religions/:slug" element={<ReligionDetail />} />
          <Route path="holy-sites/:id" element={<HolySiteDetail />} />
          <Route path="temples" element={<Temples />} />
          <Route path="temples/:id" element={<TempleDetail />} />
          <Route path="patriarchs" element={<Patriarchs />} />
          <Route path="patriarchs/:id" element={<PatriarchDetail />} />
          <Route path="teachings" element={<Teachings />} />
          <Route path="teachings/:id" element={<TeachingDetail />} />
          <Route path="seals" element={<Seals />} />
          <Route path="seals/:id" element={<SealDetail />} />

          {/* Routes & trips */}
          <Route path="routes" element={<RoutesList />} />
          <Route path="routes/:slug" element={<RouteDetail />} />
          <Route path="trips" element={<Trips />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="checkout/:slug" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />

          {/* Community */}
          <Route path="community" element={<Community />} />
          <Route path="journals" element={<Journals />} />
          <Route path="journals/:id" element={<JournalDetail />} />
          <Route path="search" element={<Search />} />
          <Route path="map" element={<MapPage />} />

          {/* Collections & commerce */}
          <Route path="collections" element={<Collections />} />
          <Route path="collections/:id" element={<CollectionDetail />} />
          <Route path="membership" element={<Membership />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="points-mall" element={<PointsMall />} />
          <Route path="prices" element={<Prices />} />
          <Route path="merchants" element={<Merchants />} />
          <Route path="merchants/:id" element={<MerchantDetail />} />

          {/* User */}
          <Route path="login" element={<Login />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />

          {/* Info */}
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
