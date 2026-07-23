import { useEffect, useMemo, useState } from "react";
import File from "../../../assets/File.svg";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceDot,
} from "recharts";
import { useClientDashboard } from "../../../context/DashboardContext";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "../../../context/dashboardApi";

const RANGE_TO_API = {
  "This Week": "this_week",
  "Last Week": "last_week",
  "This Month": "this_month",
  "Last Month": "last_month",
  "Last 3 Month": "last_3_month",
  "Last 6 Month": "last_6_month",
  "This Year": "this_year",
};

const OrdersChart = ({ range, onRangeChange }) => {
  const ranges = [
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "Last 3 Month",
    "Last 6 Month",
    "This Year",
  ];
  const [localRange, setLocalRange] = useState("This Month");
  const [isOpen, setIsOpen] = useState(false);
  const currentRange = range ?? localRange;
  const handleRangeChange = onRangeChange ?? setLocalRange;
  const { user } = useAuth();
  const { dashboardData } = useClientDashboard();

  const chartQuery = useQuery({
    queryKey: ["customerFulfillmentChart", currentRange],
    queryFn: () =>
      fetchDashboard(user?.token, {
        range: RANGE_TO_API[currentRange] || "this_month",
        breakdown: "types",
        recentLimit: 6,
      }),
    enabled: !!user?.token,
    refetchOnWindowFocus: false,
  });

  const chartData = chartQuery.data ?? dashboardData;

  const barData = useMemo(() => {
    const report = Array.isArray(chartData?.raw?.fulfillmentReport?.series)
      ? chartData.raw.fulfillmentReport.series
      : Array.isArray(chartData?.fulfillmentReport)
        ? chartData.fulfillmentReport
        : [];

    return report.map((item) => {
      const label = String(item?.label || item?.weekday || item?.name || "Unk");
      return {
        name: label,
        short: item?.short || label.slice(0, 3),
        value: Number(item?.planned ?? item?.value ?? item?.count ?? item?.total ?? 0),
        delivered: Number(item?.delivered ?? 0),
        remaining: Number(item?.remaining ?? 0),
      };
    });
  }, [chartData?.raw?.fulfillmentReport?.series, chartData?.fulfillmentReport]);

  const [animatedBarData, setAnimatedBarData] = useState([]);

  useEffect(() => {
    // Initialize with zero values to start the animation from the bottom
    const initialData = barData.map(item => ({ ...item, value: 0 }));
    setAnimatedBarData(initialData);

    // Stagger the animation for each bar
    const timers = barData.map((item, index) => 
      setTimeout(() => {
        setAnimatedBarData(prevData => {
          const newData = [...prevData];
          // Ensure the array is still valid before updating
          if (newData[index]) {
            newData[index] = { ...newData[index], value: item.value };
          }
          return newData;
        });
      }, index * 500) // Wait exactly 500ms for the previous bar to finish
    );

    // Cleanup timers on component unmount or when barData changes
    return () => timers.forEach(clearTimeout);
  }, [barData]);
  
  const maxValue = useMemo(() => barData.reduce((acc, item) => Math.max(acc, item.value), 0), [barData]);
  const getNiceMax = (max) => {
    if (max === 0) return 20;
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const fraction = max / magnitude;
    let step;
    if (fraction <= 1.2) step = 1.2;
    else if (fraction <= 2) step = 2;
    else if (fraction <= 4) step = 4;
    else if (fraction <= 5) step = 5;
    else if (fraction <= 8) step = 8;
    else step = 10;
    return step * magnitude;
  };

  const maxDomain = getNiceMax(maxValue);

  const today = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const todayIndex = today >= 1 && today <= 5 ? today - 1 : -1;
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverValue, setHoverValue] = useState(null);
  const activeIndex = hoverIndex ?? todayIndex;
  const hoverRatio = hoverValue != null && maxDomain ? 1 - hoverValue / maxDomain : 0;
  
  // Exactly matches Recharts internal math for margin { top: 24, bottom: 8 } + XAxis height (21)
  const lineTop = `calc(24px + ${hoverRatio} * (100% - 53px))`;
  const bubbleTop = `calc(24px + ${hoverRatio} * (100% - 53px) - 15px)`;
  
  const placeLeft = hoverIndex != null && hoverIndex >= 2;
  const barCount = animatedBarData.length || 1;
  const dotXPct = hoverIndex != null ? (hoverIndex + 0.5) / barCount : 0;
  const exactDotX = `calc(${dotXPct * 100}% + ${30 - 38 * dotXPct}px)`;

  const CustomTooltip = ({ active, payload, label }) => {
    useEffect(() => {
      if (active && payload && payload.length) {
        const value = payload[0]?.value ?? null;
        const nextIndex = animatedBarData.findIndex((item) => item.short === label);
        setHoverIndex(nextIndex >= 0 ? nextIndex : null);
        setHoverValue(value);
      } else {
        setHoverIndex(null);
        setHoverValue(null);
      }
    }, [active, payload, label, animatedBarData]);

    if (!active || !payload || !payload.length) return null;

    const point = animatedBarData.find((item) => item.short === label) || {};
    return (
      <div className="rounded-xl border border-brand-offwhite bg-brand-white px-3 py-2 shadow-lg">
        <p className="text-xs font-semibold text-brand-blackish">{point.name || label}</p>
        <p className="text-[11px] text-brand-label">
          Planned: {Number(point.value || 0).toLocaleString()}
        </p>
        <p className="text-[11px] text-brand-label">
          Delivered: {Number(point.delivered || 0).toLocaleString()}
        </p>
        <p className="text-[11px] text-brand-label">
          Remaining: {Number(point.remaining || 0).toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="bg-brand-white mt-2 rounded-2xl p-4 w-full">
        <div className="flex justify-between items-center mb-2">
          <div className="flex pl-2 items-center text-left gap-2 justify-start">
            <div>
              <img src={File} alt="icon" />
            </div>
            <h2 className="text-sm font-semibold font-park text-brand-blackish">
              Lead Fulfillment Report
            </h2>
          </div>
          
          <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu.Trigger className="flex items-center justify-between gap-2 min-w-[110px] text-xs px-3 py-1.5 rounded-full border border-brand-offwhite text-brand-label bg-transparent outline-none cursor-pointer">
              {currentRange}
              {isOpen ? (
                <ChevronUp className="w-3 h-3 text-brand-label" />
              ) : (
                <ChevronDown className="w-3 h-3 text-brand-label" />
              )}
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={5}
                align="end"
                className="bg-brand-white shadow-md border border-brand-offwhite rounded-lg p-1 z-50 text-left min-w-[120px]"
              >
                {ranges.map((r) => (
                  <DropdownMenu.Item
                    key={r}
                    onClick={() => handleRangeChange(r)}
                    className="px-3 py-2 text-xs outline-none text-brand-blackish hover:bg-brand-sky rounded-md cursor-pointer"
                  >
                    {r}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div className="relative w-full h-64 rounded-xl bg-brand-sky">
          {!animatedBarData.length ? (
            <div className="w-full font-park flex items-center justify-center text-brand-gray font-semibold">
              Not enough data for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={animatedBarData}
                barSize={36}
                margin={{ top: 24, right: 8, left: 0, bottom: 8 }}
              >
                {/* <CartesianGrid
                  vertical={false}
                  stroke="#D9E2F3"
                  strokeDasharray="6 6"
                /> */}
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={30}
                  domain={[0, maxDomain]}
                  allowDecimals={false}
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : value;
                  }}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                />
                <XAxis
                  dataKey="short"
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={0}
                  height={21}
                />
                <Tooltip
                  cursor={false}
                  content={<CustomTooltip />}
                  wrapperStyle={{ display: "none" }}
                />
                <Bar
                  dataKey="value"
                  radius={[12, 12, 12, 12]}
                  isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease"
                >
                  {animatedBarData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={index === activeIndex ? "#2F6BFF" : "#9DB7FF"}
                    />
                  ))}
                </Bar>
                {hoverIndex != null ? (
                  <ReferenceDot
                    x={animatedBarData[hoverIndex]?.short}
                    y={hoverValue ?? 0}
                    r={4.5}
                    fill="#E8F0FF"
                    stroke="#2F6BFF"
                    strokeWidth={2}
                    isFront
                  />
                ) : null}
                {/* {maxIndex >= 0 ? (
                  <ReferenceDot
                    x={barData[maxIndex]?.short}
                    y={maxValue}
                    r={5}
                    fill="#E8F0FF"
                    stroke="#2F6BFF"
                    strokeWidth={2}
                    isFront
                  />
                ) : null} */}
              </BarChart>
            </ResponsiveContainer>
          )}

          {hoverValue != null ? (
            <>
              <div
                className="pointer-events-none absolute border-t border-dashed border-[#D9E2F3] z-10"
                style={
                  placeLeft
                    ? { top: lineTop, left: "12px", width: `calc(${dotXPct * 100}% + ${30 - 38 * dotXPct - 12}px)` }
                    : { top: lineTop, left: exactDotX, right: "12px" }
                }
              />
              <div
                className={`pointer-events-none absolute inline-flex items-center gap-1 rounded-full bg-[#0B1220] text-white text-[10px] px-2.5 py-[7px] shadow-lg z-20 ${
                  placeLeft ? "left-3" : "right-3"
                }`}
                style={{ top: bubbleTop }}
              >
                <span className="font-semibold">{hoverValue}</span>
                <span className="text-white/80">Leads</span>
                <span
                  className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#0B1220] ${
                    placeLeft ? "right-[-3px]" : "left-[-3px]"
                  }`}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
  
    </>
  );
};

export default OrdersChart;
