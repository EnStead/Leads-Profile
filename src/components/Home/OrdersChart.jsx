import { useState } from "react";
import Money from '../../assets/Money.svg';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const OrdersChart = () => {
  const [range, setRange] = useState("6M");
  const ranges = ["7D", "3M", "6M", "1M", "1Y"];
  const [hoverIndex, setHoverIndex] = useState(null);

  const { dashboardData, dashboardLoading,dashboardError } = useDashboard();
  const orderRate = dashboardData?.orderRate;

  // Transform API data for Recharts
  const lineData = orderRate?.map(item => ({
    name: MONTHS[item.month - 1], // Convert month number to short name
    value: item.count,
  }));

  if (dashboardLoading) {
    return (
      <div className="w-full h-52 flex items-center justify-center">
        <p className="text-gray-400">Loading chart...</p>
      </div>
    );
  }


  return (
    <div className="bg-brand-white border-brand-offwhite rounded-2xl p-3 w-full h-52 border">
      <div className="flex justify-between items-center mb-4">
        <div className='flex items-center text-left gap-2 justify-start' >
          <div>
            <img src={Money} alt="icon" />
          </div>
          <h2 className="text-sm font-semibold font-park">Total Order Rate</h2>
        </div>
        <div className="flex items-center gap-2 border-y py-2 border-brand-stroke font-medium">
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-md font-medium ${
                range === r ? "bg-brand-white text-brand-subtext shadow-md" : "text-brand-muted bg-transparent"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-32">
        {
          !lineData.length ?       <div className="w-full font-park flex items-center justify-center text-brand-gray font-semibold">
            No Data yet!!
          </div> : 
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={lineData}
              onMouseMove={(e) => {
                if (e?.activeTooltipIndex !== undefined) setHoverIndex(e.activeTooltipIndex);
              }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B2FFF" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#5B2FFF" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="name" tick={{ fill: "#333333" }} axisLine={false} tickLine={false} />

              <Tooltip
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  return (
                    <div className="bg-brand-darkblue text-brand-white shadow-md px-3 py-2 rounded-md text-sm font-medium">
                      {payload[0].payload.name}: {payload[0].value} Orders
                    </div>
                  );
                }}
              />

              {hoverIndex !== null && (
                <ReferenceArea
                  x1={hoverIndex - 0.5}
                  x2={hoverIndex + 0.5}
                  fill="#5B2FFF"
                  fillOpacity={0.1}
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke="#5B2FFF"
                strokeWidth={2}
                fill="url(#areaGradient)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        }
      </div>
    </div>
  );
};

export default OrdersChart;
