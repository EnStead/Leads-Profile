import { useState } from "react";
import { CreditCard, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useClientDashboard } from "../../../context/DashboardContext";

const Banner = ({ openAddModal }) => {
  const { dashboardData, allOrdersData } = useClientDashboard();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const banner = dashboardData?.notificationBanner;

  if (!banner || !banner.orderPublicIds || banner.orderPublicIds.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, banner.orderPublicIds.length - 1);
  const targetId = banner.orderPublicIds[safeIndex];

  const handleMakePayment = () => {
    // Normalize targetId to handle potential whitespace or casing differences
    const normalizedTargetId = String(targetId).trim().toLowerCase();

    const isMatch = (o) => 
      (o.publicId && String(o.publicId).trim().toLowerCase() === normalizedTargetId) || 
      (o.customId && String(o.customId).trim().toLowerCase() === normalizedTargetId) || 
      o._id === targetId || 
      o.id === targetId;
    
    let transactionMatch = null;
    let recentOrderMatch = null;
    
    // Transaction history is useful for amount/pricing, but its `id` can be a transaction id.
    if (allOrdersData) {
      const ordersArray = Array.isArray(allOrdersData) ? allOrdersData : (allOrdersData.data || allOrdersData.orders || []);
      transactionMatch = ordersArray.find(isMatch) || null;
    }

    if (dashboardData?.recentOrders) {
      recentOrderMatch = dashboardData.recentOrders.find(isMatch) || null;
    }

    const targetOrder = {
      ...(recentOrderMatch || {}),
      ...(transactionMatch || {}),
      publicId:
        recentOrderMatch?.publicId ||
        transactionMatch?.publicId ||
        targetId,
      // Avoid passing a transaction/detail id as the order id.
      _id: recentOrderMatch?._id || null,
      id: recentOrderMatch?.id || recentOrderMatch?._id || null,
      amountPaid:
        transactionMatch?.amountPaid ??
        transactionMatch?.amount ??
        recentOrderMatch?.amountPaid ??
        recentOrderMatch?.amount ??
        null,
      amount:
        transactionMatch?.amount ??
        recentOrderMatch?.amount ??
        null,
    };

    openAddModal?.(targetOrder);
  };

  // Dynamically ensure the grammatical correctness when split
  const singularText = banner.text 
    ? banner.text.replace(/\d+\s+priced\s+orders?/i, "1 priced order") 
    : "";

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && safeIndex < banner.orderPublicIds.length - 1) {
      setCurrentIndex(safeIndex + 1);
    } else if (isRightSwipe && safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  return (
    <div className={banner.orderPublicIds.length === 1 ? "mb-0" : "-mb-8"}>
      <div 
        className="relative flex flex-col rounded-2xl bg-brand-accent/10 border border-brand-accent/20 px-6 sm:px-8 py-4 sm:py-5"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-park font-bold text-brand-blackish">
                Action Required: {banner.title || "Payment Required"}
              </h3>
              <p className="text-sm text-brand-body mt-0.5">
                <span className="font-semibold text-brand-blackish">
                  Order {targetId} {" "}
                </span>
                has been accepted and a price has been attached. Kindly Make your payment to start receiving your leads.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleMakePayment}
            className="shrink-0 inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-brand-accent px-6 py-3 text-sm font-semibold text-brand-white transition hover:opacity-90"
          >
            Complete Payment
          </button>
        </div>
      </div>

      {banner.orderPublicIds.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex(safeIndex - 1)}
            disabled={safeIndex === 0}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${safeIndex === 0 ? "text-brand-blackish/30 cursor-not-allowed" : "text-brand-blackish hover:bg-brand-blackish/10"}`}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center justify-center gap-1.5">
            {banner.orderPublicIds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === safeIndex 
                    ? "w-5 bg-brand-blackish" 
                    : "w-2 bg-brand-blackish/30 hover:bg-brand-blackish/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentIndex(safeIndex + 1)}
            disabled={safeIndex === banner.orderPublicIds.length - 1}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition ${safeIndex === banner.orderPublicIds.length - 1 ? "text-brand-blackish/30 cursor-not-allowed" : "text-brand-blackish hover:bg-brand-blackish/10"}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner;
