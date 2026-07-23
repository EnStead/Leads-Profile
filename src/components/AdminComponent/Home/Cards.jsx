import { Link } from "react-router";
import {
  ArrowUpRight,
  CircleDot,
  CornerDownRight,
  Database,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useAdminDashboard } from "../../../context/DashboardContext";
import CardSkeleton from "../../../utility/skeletons/CardSkeleton";
import GsapCounter from "../../AdminComponent/Leads/components/GsapCounter";
import Process from "../../../assets/Process.svg";
import Pipeline from "../../../assets/Pipeline.svg";
import Leads from "../../../assets/Leads.svg";
import Time from "../../../assets/TimeIcon.svg";
import User from "../../../assets/UserIcon.svg";
import { useEffect, useState } from "react";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatRevenueTick = (value) => {
  if (value === 0) return "0";
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value));
};

const formatRevenueValue = (value) =>
  Number(toNumber(value)).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });

const ProgressBar = ({ items }) => {
  const [animateBars, setAnimateBars] = useState(false);
  const totalValue = items.reduce((sum, item) => sum + Number(item.value || 0), 0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimateBars(true));
    return () => {
      cancelAnimationFrame(raf);
      setAnimateBars(false);
    };
  }, [items]);

  return (
    <div className="mt-4 flex h-10 gap-2 overflow-visible">
      {items.map((item, index) => {
        const hasValue = Number(item.value) > 0;
        const fillPct = Number.isFinite(Number(item.pct))
          ? Math.max(0, Math.min(100, Number(item.pct)))
          : 0;

        if (totalValue > 0 && !hasValue) return null;

        return (
          <div
            key={item.label}
            className={`relative flex items-stretch overflow-hidden rounded-[8px] transition-all duration-1000 ease-out ${
              totalValue === 0 ? "bg-brand-sky" : item.barClass
            }`}
            style={{
              flex: animateBars ? (totalValue === 0 ? "1 1 0%" : `${fillPct} 1 0%`) : "0 1 0%",
              minWidth: animateBars ? (totalValue === 0 ? "18px" : "72px") : "0px",
              opacity: animateBars ? 1 : 0,
            }}
          >
            {hasValue ? (
              <div className="relative flex h-full w-full items-stretch overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.16)_50%,rgba(255,255,255,0.16)_75%,transparent_75%,transparent)] bg-[length:18px_18px] opacity-60" />
                <span className="relative z-10 flex w-full items-center justify-start px-4 text-sm font-semibold text-brand-offwhite">
                  {fillPct}%
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const RevenueChart = () => {
  const { adminDashboardData } = useAdminDashboard();
  const series = Array.isArray(adminDashboardData?.revenue?.series)
    ? adminDashboardData.revenue.series
    : [];
  const bars = series.map((item, index) => ({
    label: String(
      item?.label ?? item?.name ?? item?.month ?? item?.period ?? item?.key ?? "",
    ),
    totalRevenue: toNumber(item?.totalRevenue),
    adminOrderCount: toNumber(item?.adminOrderCount),
    customerOrderCount: toNumber(item?.customerOrderCount),
    orderCount: toNumber(item?.orderCount),
    index,
  }));

  const chartMax = Math.max(
    1,
    ...bars.map((bar) => toNumber(bar.orderCount)),
  );
  const tickStep = chartMax <= 4 ? 1 : Math.max(1, Math.ceil(chartMax / 4));
  const ticks = [chartMax];
  for (let tick = chartMax - tickStep; tick > 0; tick -= tickStep) {
    ticks.push(tick);
  }
  if (ticks[ticks.length - 1] !== 0) ticks.push(0);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3">
        <div className="relative h-[210px]">
          {ticks.map((tick, index) => (
            <div
              key={tick}
              className="absolute left-0 right-0 flex items-center -translate-y-1/2"
              style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
            >
              <span className="text-sm text-brand-blackish/80">
                {formatRevenueTick(tick)}
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex flex-col">
          <div className="relative h-[210px] w-full">
            <div className="absolute inset-0">
            {ticks.map((tick, index) => (
              <div
                key={tick}
                className={`absolute left-0 right-0 border-b border-dashed border-brand-offwhite/80 ${
                  index === ticks.length - 1 ? "border-solid border-brand-stroke" : ""
                }`}
                style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
              />
            ))}
          </div>

            <div className="absolute inset-0 z-10 flex items-end gap-4 sm:gap-5">
            {bars.map((bar) => {
              const baseHeight = Math.max(
                0,
                Math.min(100, (bar.orderCount / chartMax) * 100),
              );
              const customerPct = bar.orderCount > 0
                ? Math.max(
                    0,
                    Math.min(
                      100,
                      (bar.customerOrderCount / bar.orderCount) * 100,
                    ),
                  )
                : 0;

              return (
                  <div key={bar.label || bar.index} className="group flex h-full flex-1 items-end justify-center">
                    <div
                      className="relative w-[72%] max-w-[58px]"
                      style={{ height: `${baseHeight}%` }}
                    >
                      <div className="absolute inset-0 h-full w-full overflow-hidden rounded-[10px] bg-brand-lightblue">
                        <div
                          className="absolute bottom-0 left-0 w-full rounded-[10px] bg-brand-blue"
                          style={{ height: `${customerPct}%` }}
                        />
                      </div>
                      <div className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-20 w-max -translate-x-1/2 scale-95 rounded-xl bg-brand-blackish px-4 py-3 text-left text-brand-white opacity-0 shadow-[0_18px_30px_rgba(15,23,42,0.24)] transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100">
                        <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-[2px] bg-brand-blackish" />
                        <div className="space-y-1 text-xs leading-5 font-extralight text-brand-offwhite">
                          <p className="flex items-center gap-1.5 pb-1 border-0.5 border-b border-brand-stroke">
                            <span className="inline-block h-2 w-2 rounded-full bg-brand-lightblue" />
                            Orders by Admin: <span className="font-medium">{formatRevenueValue(bar.adminOrderCount)}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span className="inline-block h-2 w-2 rounded-full bg-brand-blue" />
                            Orders by Customer: <span className="font-medium">{formatRevenueValue(bar.customerOrderCount)}</span>
                          </p>
                          <p className="flex items-center gap-1.5 pt-1">
                            <span className="relative flex h-2 w-2 items-center justify-center">
                              <CornerDownRight size={14} className="absolute -top-1.5 left-0 text-brand-label" />
                            </span>
                            Revenue Earned: <span className="font-medium">${formatRevenueValue(bar.totalRevenue)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
              );
            })}
            </div>
          </div>

          <div className="relative z-10 mt-3 flex items-start gap-4 sm:gap-5">
            {bars.map((bar) => (
              <div key={bar.label || bar.index} className="flex flex-1 justify-center">
                <span className="text-sm text-brand-label">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-sm font-semibold text-brand-blackish">
        Order Sources Performance
      </p>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, changeValue, changeLabel }) => {
  const isNegative = Number(changeValue) < 0;
  const absChange = Math.round(Math.abs(Number(changeValue) || 0));

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-brand-offwhite bg-brand-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-center gap-3">
        {typeof icon === "string" ? (
          <img src={icon} alt="" className="h-7 w-7" />
        ) : (
          icon
        )}
        <h3 className="font-semibold text-[15px] text-brand-blackish">{title}</h3>
      </div>

      <div className="mt-auto pt-10">
        <GsapCounter
          value={value}
          className="font-park text-4xl font-bold tracking-tight text-brand-blackish"
        />
        {subtitle ? (
          <p className="mt-3 text-sm font-light text-brand-label">{subtitle}</p>
        ) : null}
        {changeLabel ? (
          <div className="mt-2 flex items-center gap-2 text-sm font-medium">
            {absChange > 0 ? (
              isNegative ? (
                <TrendingDown size={16} className="text-brand-error" />
              ) : (
                <TrendingUp size={16} className="text-brand-success" />
              )
            ) : null}
            <span className={isNegative ? "text-brand-error" : "text-brand-success"}>
              {absChange > 0 ? `${absChange}%` : "0%"}
            </span>
            <span className="text-brand-label font-light text-[10px]">{changeLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Cards = () => {
  const {
    adminDashboardData,
    adminDashboardLoading,
    adminDashboardError,
    adminOrderData,
    customersData,
    adminImportBatchesOverviewData,
  } = useAdminDashboard();

  const orders = Array.isArray(adminOrderData?.data) ? adminOrderData.data : [];
  const revenueBlock = adminDashboardData?.revenue ?? {};
  const customerStats = adminDashboardData?.customerStats ?? {};
  const ordersPipeline = adminDashboardData?.ordersPipeline ?? {};
  const pipelineStatuses = Array.isArray(ordersPipeline?.statuses)
    ? ordersPipeline.statuses
    : [];
  const getPipelineStatusMeta = (...aliases) => {
    const normalizedAliases = aliases.map((alias) => String(alias).toLowerCase());
    return (
      pipelineStatuses.find((item) => {
        const key = String(item?.key ?? item?.label ?? "").toLowerCase();
        return normalizedAliases.includes(key);
      }) || null
    );
  };
  const getPipelineStatusPct = (...aliases) => {
    const meta = getPipelineStatusMeta(...aliases);
    if (meta) {
      const explicitPct = Number(meta?.pct);
      if (Number.isFinite(explicitPct) && explicitPct > 0) return explicitPct;
      const pipelineTotal = toNumber(ordersPipeline?.total);
      const count = toNumber(meta?.count);
      if (pipelineTotal > 0 && count > 0) return (count / pipelineTotal) * 100;
    }
    return 0;
  };
  const totalCustomers = toNumber(
    customerStats?.totalCustomers ??
      customersData?.pagination?.total ??
      customersData?.meta?.total ??
      customersData?.data?.length,
  );
  const todaysLeads = toNumber(
    customerStats?.todaysLeads ??
      adminImportBatchesOverviewData?.todaysLeads ??
      adminDashboardData?.leadsDeliveredToday,
  );
  const leadsChange = toNumber(
    customerStats?.todaysLeadsChangePct ??
      revenueBlock?.changePct ??
      adminDashboardData?.leadsDeliveredTodayChangePct ??
      30,
    30,
  );
  const orderRevenue =
    toNumber(
      revenueBlock?.totalIncome ??
        revenueBlock?.totalRevenue ??
        revenueBlock?.amount ??
      orders.reduce(
        (sum, order) => sum + toNumber(order?.pricing?.amount ?? order?.amount),
        0,
      ),
    );
  const pipelineStatusMap = Array.isArray(ordersPipeline?.statuses)
    ? ordersPipeline.statuses.reduce((acc, item) => {
        const key = String(item?.key ?? item?.label ?? "").toLowerCase();
        if (key) acc[key] = toNumber(item?.count, 0);
        return acc;
      }, {})
    : {};

  const pipelineItems = [
    {
      label: "Pending",
      value:
        pipelineStatusMap.pending ??
        pipelineStatusMap.pending_pricing ??
        pipelineStatusMap.pendingpricing ??
        toNumber(ordersPipeline?.pendingPricing),
      pct: getPipelineStatusPct("pending", "pending pricing", "pending_pricing"),
      barClass: "bg-brand-info",
    },
    {
      label: "Paid",
      value:
        pipelineStatusMap.paid ??
        pipelineStatusMap.awaiting_payment ??
        pipelineStatusMap.awaitingpayment ??
        toNumber(ordersPipeline?.awaitingPayment),
      pct: getPipelineStatusPct("paid", "awaiting payment", "awaiting_payment"),
      barClass: "bg-brand-accent",
    },
    {
      label: "Processing",
      value:
        pipelineStatusMap.processing ??
        pipelineStatusMap.in_progress ??
        pipelineStatusMap.inprogress ??
        toNumber(ordersPipeline?.processingOrder),
      pct: getPipelineStatusPct("processing", "in progress", "in_progress"),
      barClass: "bg-brand-royalblue",
    },
  ];

  if (adminDashboardLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)]">
        <CardSkeleton />
        <div className="grid gap-4">
          <CardSkeleton />
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (adminDashboardError) {
    return <p className="text-brand-red">Failed to load dashboard data.</p>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-brand-offwhite bg-brand-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-brand-label" />
            <h3 className="font-semibold text-[15px] text-brand-blackish">Order Revenue</h3>
          </div>
          <Link
            to="/admin/history"
            className="inline-flex items-center gap-2 rounded-full bg-brand-offwhite px-4 py-2 text-sm font-light text-brand-blackish transition hover:bg-brand-blue/10"
          >
            View Transactions
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <p className="mt-4 text-sm font-light text-brand-body">Total Income Flow</p>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <GsapCounter
            prefix="$"
            value={orderRevenue}
            className="font-park text-4xl font-bold tracking-tight text-brand-blackish"
          />
          <div className="mb-2 flex items-center gap-2 text-base font-medium">
            <TrendingUp size={18} className="text-brand-success" />
            <span className="text-brand-success">
              +{Math.abs(Number(revenueBlock?.trendPctVsLastMonth ?? adminDashboardData?.orderRate ?? 12) || 12)}%
            </span>
            <span className="text-brand-label">vs last month</span>
          </div>
        </div>

        <RevenueChart />
      </div>

      <div className="grid gap-4">
        <div className="rounded-[28px] border border-brand-offwhite bg-brand-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={Pipeline} alt="" className="h-6 w-6" />
              <h3 className="font-semibold text-[15px] text-brand-blackish">
                Orders Pipeline
              </h3>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full bg-brand-offwhite px-4 py-2 text-sm font-light text-brand-blackish transition hover:bg-brand-blue/10"
            >
              View Orders
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
            {pipelineItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-light text-brand-blackish">
                  <CircleDot
                    size={12}
                    className={
                      item.label === "Pending"
                        ? "text-brand-info"
                        : item.label === "Paid"
                          ? "text-brand-accent"
                          : "text-brand-royalblue"
                    }
                    fill="currentColor"
                  />
                  <span>{item.label}</span>
                </div>
                <div className="pl-4 font-medium text-brand-label">
                  <GsapCounter value={item.value} />
                </div>
              </div>
            ))}
          </div>

          <ProgressBar items={pipelineItems} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            icon={User}
            title="Total Customer"
            value={totalCustomers}
            subtitle={`Active last 14 days - ${toNumber(customerStats?.activeCustomersLast14Days ?? customerStats?.activeOrders ?? adminDashboardData?.activeOrders)}`}
          />
          <StatCard
            icon={Time}
            title="Today's Leads"
            value={todaysLeads}
            subtitle={null}
            changeValue={leadsChange}
            changeLabel="vs yesterday"
          />
        </div>
      </div>
    </div>
  );
};

export default Cards;
