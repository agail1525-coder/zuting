import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { fetchRouteBySlug, fetchTrip, createTrip, createOrder, payOrder, verifyCoupon, type Route, type CouponVerifyResult } from "@/lib/api";
import { toast } from "@/lib/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import PageHeader from "@/components/PageHeader";

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isTripCheckout = searchParams.get("type") === "trip";
  const nav = useNavigate();
  const { t } = useTranslation();
  const [route, setRoute] = useState<Route | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [persons, setPersons] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponVerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    if (isTripCheckout) {
      // slug is actually a tripId from TripDetail
      setTripId(slug);
      fetchTrip(slug)
        .then((trip) => {
          // Use trip info to populate route-like data for checkout display
          setRoute({
            title: trip.title,
            priceFrom: trip.totalBudget ?? 0,
            coverImage: "", images: [], duration: 0, nights: 0,
          } as unknown as Route);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      fetchRouteBySlug(slug)
        .then(setRoute)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [slug, isTripCheckout]);

  const subtotal = route ? route.priceFrom * persons : 0;
  const discount = couponResult?.valid ? (couponResult.discount ?? 0) : 0;
  const total = Math.max(0, subtotal - discount);

  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) return;
    setVerifying(true);
    try {
      const result = await verifyCoupon(couponCode.trim(), subtotal);
      setCouponResult(result);
    } catch { setCouponResult({ valid: false, reason: t("orders.actionFailed") }); }
    finally { setVerifying(false); }
  };

  const handlePay = async () => {
    if (!route || paying) return;
    setPaying(true);
    try {
      let finalTripId = tripId;
      if (!finalTripId) {
        const trip = await createTrip({
          title: route.title,
          persons,
          contactName: contactName || undefined,
          contactPhone: contactPhone || undefined,
          totalBudget: total,
        });
        finalTripId = trip.id;
      }
      const order = await createOrder({
        tripId: finalTripId!,
        totalAmount: total,
        couponCode: couponResult?.valid ? couponCode : undefined,
      });
      await payOrder(order.id, { paidAmount: total, paymentMethod: "WECHAT" });
      nav(`/orders`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("orders.actionFailed"));
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <><PageHeader title={t("checkout.title")} /><LoadingSpinner /></>;
  if (error || !route) return <><PageHeader title={t("checkout.title")} /><ErrorState message={error} onRetry={() => window.location.reload()} /></>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title={t("checkout.title")} />

      {/* Route summary */}
      <div className="mx-4 mt-3 bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="flex gap-3 p-3">
          {route.coverImage && <img src={route.coverImage} alt="" className="w-20 h-20 rounded-lg object-cover" />}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{route.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{route.duration}{t("routeDetail.days")}{route.nights}{t("routeDetail.nights")}</p>
            <p className="text-sm font-bold text-orange-600 mt-1">¥{route.priceFrom}{t("routeDetail.perPerson")}</p>
          </div>
        </div>
      </div>

      {/* Persons */}
      <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm">
        <label className="text-sm font-medium text-gray-900">{t("checkout.travelers")}</label>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => setPersons(Math.max(1, persons - 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600">-</button>
          <span className="text-lg font-bold w-8 text-center">{persons}</span>
          <button onClick={() => setPersons(Math.min(20, persons + 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-lg text-gray-600">+</button>
          <span className="text-xs text-gray-400 ml-2">{t("checkout.persons")}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-medium text-gray-900">{t("checkout.contactInfo")}</h3>
        <input
          type="text"
          placeholder={t("checkout.contactPerson")}
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
        />
        <input
          type="tel"
          placeholder={t("checkout.contactPhone")}
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      {/* Coupon */}
      <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900 mb-2">{t("checkout.couponCode")}</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t("checkout.couponPlaceholder")}
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
          />
          <button
            onClick={handleVerifyCoupon}
            disabled={verifying || !couponCode.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50"
          >
            {verifying ? t("checkout.verifying") : t("checkout.verify")}
          </button>
        </div>
        {couponResult && (
          <p className={`text-xs mt-2 ${couponResult.valid ? "text-green-600" : "text-red-500"}`}>
            {couponResult.valid ? t("checkout.couponValid") : (couponResult.reason || "Invalid")}
          </p>
        )}
      </div>

      {/* Price breakdown */}
      <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm space-y-2">
        <h3 className="text-sm font-medium text-gray-900">{t("checkout.priceBreakdown")}</h3>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{t("checkout.tripFee")} x {persons}</span>
          <span>¥{subtotal}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs text-green-600">
            <span>{t("checkout.couponDiscount")}</span>
            <span>-¥{discount}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
          <span>{t("checkout.totalDue")}</span>
          <span className="text-orange-600">¥{total}</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-xs text-gray-400">{t("checkout.totalDue")}</span>
          <span className="text-xl font-bold text-orange-600 ml-1">¥{total}</span>
        </div>
        <button
          onClick={handlePay}
          disabled={paying}
          className="px-8 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full disabled:opacity-50 active:bg-blue-700"
        >
          {paying ? t("checkout.processing") : t("checkout.confirmPay")}
        </button>
      </div>
    </div>
  );
}
