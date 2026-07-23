import Semi from "../../../assets/Semi.svg";
import Pipeline from "../../../assets/Pipeline.svg";
import File from "../../../assets/File.svg";
import {
  Dot,
  MoveRight,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import OrderModal from "./OrderModal";
import { useClientDashboard } from "../../../context/DashboardContext";
import CardSkeleton from "../../../utility/skeletons/CardSkeleton";
import { gsap } from "gsap";

const GsapCounter = ({ value, className }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const proxyRef = useRef({ val: 0 });

  useLayoutEffect(() => {
    const endValue = parseFloat(value) || 0;

    const ctx = gsap.context(() => {
      gsap.to(proxyRef.current, {
        val: endValue,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: () => {
          setDisplayValue(Math.ceil(proxyRef.current.val));
        },
      });
    });

    return () => ctx.revert();
  }, [value]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
    </span>
  );
};

const normalizeStatusKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const Cards = () => {
  const { dashboardData, dashboardLoading, dashboardError } = useClientDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Delay animation slightly so it plays smoothly after the card pop-in
    const timer = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (dashboardLoading) {
    return (
      <section>
        <div className="grid  grid-cols-2  gap-4 h-full">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    );
  }

  if (dashboardError) {
    return <p className="text-brand-red">Failed to load dashboard data.</p>;
  }

  const weeklyLeads = dashboardData?.kpis?.weeklyLeads || {};
  const todaysLeads = Number(
    weeklyLeads?.value ?? weeklyLeads?.todaysLeads ?? dashboardData?.leadsDeliveredToday ?? 0,
  );
  const totalLeads = Number(
    weeklyLeads?.totalLeadsReceived ??
      weeklyLeads?.totalReceived ??
      dashboardData?.totalLeadsReceived ??
      0,
  );
  const weeklyTarget = Number(weeklyLeads?.target ?? dashboardData?.weeklyTarget ?? 2500);
  const progressPct = Number(
    weeklyLeads?.progressPct ??
      (weeklyTarget ? Math.min((todaysLeads / weeklyTarget) * 100, 100) : 0),
  );
  const changePct = Number(
    weeklyLeads?.trendPctVsLastWeek ??
      weeklyLeads?.changePct ??
      dashboardData?.leadsDeliveredTodayChangePct ??
      0,
  );
  const pipeline = dashboardData?.ordersPipeline || {};
  const pipelineStatuses = Array.isArray(pipeline.statuses) ? pipeline.statuses : [];
  const pendingStatus =
    pipelineStatuses.find((status) =>
      ["pending", "pending pricing"].includes(
        normalizeStatusKey(status?.key ?? status?.label),
      ),
    ) || {};
  const paidStatus =
    pipelineStatuses.find((status) =>
      ["paid", "awaiting payment"].includes(
        normalizeStatusKey(status?.key ?? status?.label),
      ),
    ) || {};
  const processingStatus =
    pipelineStatuses.find((status) =>
      ["processing", "processing order", "in progress", "in progress order"].includes(
        normalizeStatusKey(status?.key ?? status?.label),
      ),
    ) || {};
  const pendingPricing = Number(
    pendingStatus?.count ??
      pipeline.pendingPricing ??
      0,
  );
  const awaitingPayment = Number(
    paidStatus?.count ??
      pipeline.awaitingPayment ??
      0,
  );
  const processingOrder = Number(
    processingStatus?.count ??
      pipeline.processingOrder ??
      0,
  );
  const activeOrders = Number(
    pipeline.activeCreatedOrders ?? dashboardData?.activeOrders ?? 0,
  );
  const pipelineData = {
    pending: Number(
      pendingStatus?.pct ??
        (activeOrders ? (pendingPricing / activeOrders) * 100 : 0),
    ),
    awaiting: Number(
      paidStatus?.pct ??
        (activeOrders ? (awaitingPayment / activeOrders) * 100 : 0),
    ),
    processing: Number(
      processingStatus?.pct ??
        (activeOrders ? (processingOrder / activeOrders) * 100 : 0),
    ),
  };

  const hasNoPipelineData = pipelineData.pending === 0 && pipelineData.awaiting === 0 && pipelineData.processing === 0;

  const renderChange = (value) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);

    return (
      <span
        className={`flex items-center gap-1 text-sm font-medium mt-4 ${
          isNegative ? "text-brand-red" : "text-brand-success"
        }`}
      >
        {isNegative ? (
          <TrendingDown size={16} className="text-brand-red" />
        ) : (
          <TrendingUp size={16} className="text-brand-success" />
        )}
        {absValue}%
        <span className="text-brand-label font-light ml-1">vs last week</span>
      </span>
    );
  };

  return (
    <section>
      <style>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .card-animate {
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
      `}</style>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">

        {/* CARD 1 */}
        <div
          className="bg-brand-white border border-brand-offwhite 
          rounded-xl py-4 px-4 w-full h-full flex flex-col justify-between items-start card-animate hover:scale-101 transition-transform duration-300"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-start gap-4">
              <div className="bg-brand-label/25 rounded-full p-1">
                <img src={Semi} alt="image" />
              </div>
              <h3 className="text-brand-blackish font-semibold font-park">
                Leads Delivered this Week
              </h3>
            </div>
          
            {
              weeklyLeads?.liveStatus === "live" &&
            <div>
              <span
                className={`inline-flex bg-brand-purple/10 text-brand-purple capitalize items-center justify-center w-max pr-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap `}
              >
                <Dot size={24} className="animate-pulse -mr-1" />
                  Live
              </span>
            </div>
            }


          

          </div>

          <p className="text-brand-body text-sm font-light my-4">
            Current Leads Delivery
          </p>

          {/* Percentage Leads */}
          <div className="w-full">
            <div className="flex items-baseline justify-between">

              <div className="flex items-end gap-4">
                <h2 className="text-brand-blackish font-bold text-4xl font-park">
                  <GsapCounter value={todaysLeads} />
                </h2>
                <span className="text-brand-label text-sm mb-1">Leads</span>
              </div>

              <div className="mt-2 font-medium text-right text-brand-label text-xs">
                Out of {weeklyTarget.toLocaleString()} Leads
              </div>
            </div>

            <div className="mt-3 h-2 rounded-full bg-brand-offwhite overflow-hidden ">
              <div
                className="h-full rounded-full bg-brand-blue transition-all duration-1000 ease-out"
                style={{ width: isMounted ? `${progressPct}%` : "0%" }}
              />
            </div>

            {renderChange(changePct)}

          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4 w-full">
            <div className="border border-brand-stroke rounded-xl p-4">
              <p className="text-brand-label text-sm font-light">
                Total Leads Received
              </p>
              <h4 className="text-brand-blackish font-semibold text-lg mt-2 flex items-baseline">
                <GsapCounter value={totalLeads} />
                <span className="text-brand-label text-xs font-light ml-1">
                  Leads
                </span>
              </h4>
            </div>
            <div className="border border-brand-stroke rounded-xl p-4">
              <p className="text-brand-label text-sm font-light">Today's Leads</p>
              <h4 className="text-brand-blackish font-semibold text-lg mt-2 flex items-baseline">
                <GsapCounter value={todaysLeads} />
                <span className="text-brand-label text-xs font-light ml-1">
                  Leads
                </span>
              </h4>
            </div>
          </div>

        </div>

        {/* CARD 2 */}
        <div
          className="bg-brand-white border border-brand-offwhite 
          rounded-xl py-4 px-4 w-full h-full flex flex-col justify-between items-start card-animate hover:scale-101 transition-transform duration-300"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-4 justify-start">
            <div className="">
              <img src={Pipeline} alt="image" />
            </div>
            <h3 className="text-brand-blackish font-semibold font-park">
              Orders Pipeline
            </h3>
          </div>

          <p className="text-brand-body text-sm font-light my-3">
            Created Orders
          </p>

          <div className="w-full">
            <div className="flex items-end gap-3">
              <h2 className="text-brand-blackish font-bold text-4xl font-park ">
                <GsapCounter value={activeOrders} />
              </h2>
              <span className="text-brand-label text-sm mb-1">Active</span>
            </div>

            <div className="mt-4 flex w-full gap-2">
              {hasNoPipelineData || pipelineData.pending > 0 ? (
                <div 
                  className="flex flex-col gap-2 transition-all duration-500 ease-out"
                  style={{ flex: hasNoPipelineData ? "1 1 0%" : `${pipelineData.pending} 1 0%` }}
                >
                  <div className={`h-2 w-full rounded-full overflow-hidden ${hasNoPipelineData ? "bg-brand-sky" : "bg-brand-offwhite"}`}>
                    <div 
                      className="h-full bg-brand-info rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: isMounted && !hasNoPipelineData ? "100%" : "0%" }} 
                    />
                  </div>
                  <span className="text-[11px] text-brand-label text-left whitespace-nowrap">{pipelineData.pending}%</span>
                </div>
              ) : null}
              {hasNoPipelineData || pipelineData.awaiting > 0 ? (
                <div 
                  className="flex flex-col gap-2 transition-all duration-500 ease-out"
                  style={{ flex: hasNoPipelineData ? "1 1 0%" : `${pipelineData.awaiting} 1 0%` }}
                >
                  <div className={`h-2 w-full rounded-full overflow-hidden ${hasNoPipelineData ? "bg-brand-sky" : "bg-brand-offwhite"}`}>
                    <div 
                      className="h-full bg-brand-accent rounded-full transition-all duration-1000 ease-out delay-75" 
                      style={{ width: isMounted && !hasNoPipelineData ? "100%" : "0%" }} 
                    />
                  </div>
                  <span className="text-[11px] text-brand-label text-left whitespace-nowrap">{pipelineData.awaiting}%</span>
                </div>
              ) : null}
              {hasNoPipelineData || pipelineData.processing > 0 ? (
                <div 
                  className="flex flex-col gap-2 transition-all duration-500 ease-out"
                  style={{ flex: hasNoPipelineData ? "1 1 0%" : `${pipelineData.processing} 1 0%` }}
                >
                  <div className={`h-2 w-full rounded-full overflow-hidden ${hasNoPipelineData ? "bg-brand-sky" : "bg-brand-offwhite"}`}>
                    <div 
                      className="h-full bg-brand-royalblue rounded-full transition-all duration-1000 ease-out delay-150" 
                      style={{ width: isMounted && !hasNoPipelineData ? "100%" : "0%" }} 
                    />
                  </div>
                  <span className="text-[11px] text-brand-label text-left whitespace-nowrap">{pipelineData.processing}%</span>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-1 mt-6">
              <div className="relative overflow-hidden rounded-l-xl p-3 bg-brand-offwhite">
                <p className="text-brand-label text-xs">Pending Pricing</p>
                <h4 className="text-brand-blackish font-semibold text-lg mt-3 flex items-baseline">
                  <GsapCounter value={pendingPricing} />
                  <span className="text-brand-label text-xs font-normal ml-1">
                    Orders
                  </span>
                </h4>
                <span className="absolute -right-1 -bottom-1 w-6 h-6 rounded-tl-full bg-brand-info" />
              </div>
              <div className="relative overflow-hidden p-3 bg-brand-offwhite">
                <p className="text-brand-label text-xs">Awaiting Payment</p>
                <h4 className="text-brand-blackish font-semibold text-lg mt-3 flex items-baseline">
                  <GsapCounter value={awaitingPayment} />
                  <span className="text-brand-label text-xs font-normal ml-1">
                    Orders
                  </span>
                </h4>
                <span className="absolute -right-1 -bottom-1 w-6 h-6 rounded-tl-full bg-brand-accent" />
              </div>
              <div className="relative overflow-hidden rounded-r-xl p-3 bg-brand-offwhite">
                <p className="text-brand-label text-xs">Processing Order</p>
                <h4 className="text-brand-blackish font-semibold text-lg mt-3 flex items-baseline">
                  <GsapCounter value={processingOrder} />
                  <span className="text-brand-label text-xs font-normal ml-1">
                    Orders
                  </span>
                </h4>
                <span className="absolute -right-1 -bottom-1 w-6 h-6 rounded-tl-full bg-brand-royalblue" />
              </div>
            </div>
          </div>
          
        </div>

       


      </div>

      <OrderModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default Cards;
