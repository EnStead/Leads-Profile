import { useState } from "react";
import RequestImage from "../../../assets/Request.png";
import OrdersChart from "./OrdersChart";
import LeadsChart from "./LeadsChart";
import CreateOrderModal from "./CreateOrderModal";

const Request = () => {
  const [chartRange, setChartRange] = useState("This Month");

  return (
    <section className="p-3 h-full min-h-full rounded-xl bg-brand-white">
      <div className="relative rounded-xl bg-linear-to-br from-brand-royalblue via-brand-blue to-brand-blue px-6 py-3 text-brand-white overflow-hidden flex items-center justify-between">
        <div className="">
          <h2 className="text-xl sm:text-2xl font-park font-semibold leading-snug text-brand-offwhite">
            Request a new batch of leads
          </h2>
          <CreateOrderModal />
        </div>

        <img
          src={RequestImage}
          alt="Request illustration"
          className="w-45"
        />
      </div>
      <div>
        <OrdersChart range={chartRange} onRangeChange={setChartRange} />
        <LeadsChart />
      </div>
    </section>
  );
};

export default Request;
