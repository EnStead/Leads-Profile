import { useMemo, useState, useEffect, useRef, useLayoutEffect } from "react";
import Chat from "../../../assets/Chat.svg";
import { useClientDashboard } from "../../../context/DashboardContext";
import { TextMorph } from "torph/react";
import { gsap } from "gsap";
import { useAuth } from "../../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "../../../context/dashboardApi";

const AnimatedProgressBar = ({ label, targetPercent, colorClass }) => {
  const [displayPercent, setDisplayPercent] = useState(0);
  const [widthPercent, setWidthPercent] = useState(0);
  const proxyRef = useRef({ val: 0 });

  useLayoutEffect(() => {
    const endValue = parseFloat(targetPercent) || 0;

    const ctx = gsap.context(() => {
      gsap.to(proxyRef.current, {
        val: endValue,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: () => {
          setDisplayPercent(Math.ceil(proxyRef.current.val));
        },
      });
    });

    return () => ctx.revert();
  }, [targetPercent]);

  useEffect(() => {
    const timer = setTimeout(() => setWidthPercent(targetPercent), 50);
    return () => clearTimeout(timer);
  }, [targetPercent]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-brand-blackish font-medium">{label}</span>
        <div className="flex items-center text-brand-blackish font-light">
          <span>{displayPercent}</span>
          <span>%</span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-brand-offwhite overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
};

const LeadsChart = () => {
  const {
    dashboardData,
    dashboardLoading,
  } = useClientDashboard();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("types");
  const isTypes = viewMode === "types";

  const chartQuery = useQuery({
    queryKey: ["customerTopPurchased", viewMode],
    queryFn: () =>
      fetchDashboard(user?.token, {
        range: dashboardData?.range || dashboardData?.raw?.range || "this_month",
        breakdown: viewMode,
        recentLimit: 6,
      }),
    enabled: !!user?.token,
    refetchOnWindowFocus: false,
  });
  const chartDashboardData = chartQuery.data ?? dashboardData;

  const chartItems = useMemo(() => {
    const topPurchased = Array.isArray(chartDashboardData?.raw?.topPurchased?.rows)
      ? chartDashboardData.raw.topPurchased.rows
      : Array.isArray(chartDashboardData?.topPurchased)
        ? chartDashboardData.topPurchased
        : [];
    const source =
      topPurchased.length > 0
        ? topPurchased
        : isTypes
          ? chartDashboardData?.leadTypeBreakdown ||
            chartDashboardData?.leadTypesBreakdown ||
            chartDashboardData?.leadTypeStats ||
            []
          : chartDashboardData?.bankBreakdown || [];
    const list = Array.isArray(source) ? source : [];
    const normalized = list
      .map((item) => ({
        label:
          item.type ||
          item.leadType ||
          item.label ||
          item.name ||
          item.bank ||
          item.title ||
          "Unknown",
        count: Number(
          item.count ??
            item.quantity ??
            item.requestedQuantity ??
            item.total ??
            item.value ??
            0,
        ),
      }))
      .filter((item) => Number.isFinite(item.count) && item.count > 0);

    // 1. Sort banks and leads by value
    const sorted = normalized.sort((a, b) => b.count - a.count);
    
    // 2. Take top 4
    const top = sorted.slice(0, 4);
    const rest = sorted.slice(4);

    // 3a. Sum rest into Others
    const othersSum = rest.reduce((acc, item) => acc + item.count, 0);
    
    // 3b. Average Others
    const othersAverage = rest.length > 0 ? othersSum / rest.length : 0;

    const itemsToConvert = [...top];
    if (rest.length > 0) {
      itemsToConvert.push({ label: "Others", count: othersAverage });
    }

    // 4. Convert to percentages
    const newTotal = itemsToConvert.reduce((acc, item) => acc + item.count, 0);
    if (newTotal === 0) return [];

    let itemsWithPct = itemsToConvert.map((item) => ({
      label: item.label,
      percent: (item.count / newTotal) * 100,
    }));

    // 5. If Others >= 4th item → cap it slightly lower and redistribute
    if (itemsWithPct.length > 4) {
      const fourthItem = itemsWithPct[3];
      const othersItem = itemsWithPct[4];

      if (othersItem.percent >= fourthItem.percent) {
        const cap = Math.max(0, fourthItem.percent - 1);
        const excess = othersItem.percent - cap;
        othersItem.percent = cap;

        // Redistribute excess proportionally among the top 4
        const top4Sum = itemsWithPct.slice(0, 4).reduce((acc, item) => acc + item.percent, 0);
        if (top4Sum > 0) {
          for (let i = 0; i < 4; i++) {
            itemsWithPct[i].percent += excess * (itemsWithPct[i].percent / top4Sum);
          }
        } else {
          for (let i = 0; i < 4; i++) {
            itemsWithPct[i].percent += excess / 4;
          }
        }
      }
    }

    // Round to integers and ensure they add exactly to 100%
    const finalItems = itemsWithPct.map((item) => ({
      ...item,
      percent: Math.round(item.percent),
    }));

    const roundedTotal = finalItems.reduce((acc, item) => acc + item.percent, 0);
    if (roundedTotal !== 100 && finalItems.length > 0) {
      const diff = 100 - roundedTotal;
      finalItems[0].percent += diff;
    }

    return finalItems;
  }, [chartDashboardData, isTypes]);

  if (dashboardLoading) {
    return (
      <div className="w-full h-52 flex items-center justify-center text-gray-400">
        Loading chart...
      </div>
    );
  }

  return (
    <div className=" p-4 w-full ">
      <style>{`
        @keyframes contentMorph {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        .animate-content-morph {
          animation: contentMorph 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      <div className="flex justify-between mb-4">
        <div className="flex gap-2 w-fit items-center">
          <div>
            <h3 className="font-park text-brand-blackish text-sm font-semibold w-fit">
              Top Order Purchased
            </h3>
            {/* {range ? (
              <p className="text-[10px] text-brand-label mt-0.5">{range}</p>
            ) : null} */}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const nextMode = isTypes ? "banks" : "types";
            setViewMode(nextMode === "banks" ? "banks" : "types");
          }}
          className="w-fit text-xs text-brand-blue font-medium"
        >
          <TextMorph as="span">
            {isTypes ? "Show by Banks" : "Show by Types"}
          </TextMorph>
        </button>
      </div>

      {!chartItems.length ? (
        <div key={`empty-${viewMode}`} className="w-full font-park flex items-center justify-center text-brand-label font-semibold animate-content-morph">
          No Data yet!!
        </div>
      ) : (
        <div key={`list-${viewMode}`} className="space-y-4 animate-content-morph">
          {chartItems.map((item, index) => {
            const colorClass = index === 0
              ? "bg-brand-darkblue"
              : index === 1
              ? "bg-brand-purple"
              : index === 2
              ? "bg-brand-blue"
              : "bg-brand-royalblue";

            return (
              <AnimatedProgressBar
                key={`${item.label}-${index}`}
                label={item.label}
                targetPercent={item.percent}
                colorClass={colorClass}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeadsChart;
