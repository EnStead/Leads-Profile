import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Chat from '../../assets/Chat.svg';
import { Link } from "react-router";
import { MoveRight } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const COLORS = ["#3b82f6", "#8b5cf6", "#6366f1", "#06b6d4", "#475569", "#f59e0b", "#10b981"]; // add more if needed

const LeadsChart = () => {
  const { dashboardData, dashboardLoading } = useDashboard();
  const bankBreakdown = dashboardData?.bankBreakdown;

  if (dashboardLoading) {
    return (
      <div className="w-full h-52 flex items-center justify-center text-gray-400">
        Loading chart...
      </div>
    );
  }



  const total = bankBreakdown.reduce((acc, item) => acc + item.count, 0);
  const pieData = bankBreakdown.map((item, index) => ({
    name: item.bank,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-brand-lightblue rounded-2xl p-3 w-full h-50 border-brand-white border">
      <div className="flex justify-between mb-2">
        <div className="flex gap-2 w-fit items-center">
          <img src={Chat} alt="image" />
          <h3 className="font-park text-brand-primary text-sm font-semibold w-fit">
            Top Lead Purchased
          </h3>
        </div>
        <Link to={`/transactions`} className="w-fit text-sm text-brand-royalblue font-medium flex items-center gap-3">
          View Leads <MoveRight />
        </Link>
      </div>

        {
          !bankBreakdown.length ?  <div className="w-full font-park flex items-center justify-center text-brand-primary font-semibold">
              No Data yet!!
            </div> : 
            <div className="flex gap-4 items-center">
              {/* PIE CHART */}
              <div className="w-1/2 h-30 flex justify-center items-center">
                  <ResponsiveContainer width="100%" aspect={1}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={35}
                        outerRadius={57}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
              </div>

              {/* LEGEND */}
              <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1">
                {pieData.map((item) => (
                  <div
                  key={item.name}
                  className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-lg w-30 text-[10px]"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                      ></span>
                    {item.name}: {((item.value / total) * 100).toFixed(0)}%
                  </div>
                ))}
              </div>
            </div>
        }
    </div>
  );
};

export default LeadsChart;
