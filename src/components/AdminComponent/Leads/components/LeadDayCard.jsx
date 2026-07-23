import { CopyPlus } from "lucide-react";
import { Link } from "react-router";
import usaFlag from "../../../../assets/usa.webp";
import canadaFlag from "../../../../assets/canada.png";
import GsapCounter from "./GsapCounter";
import LeadFulfillmentBars from "./LeadFulfillmentBars";

const formatDate = (value) => {
  if (!value) return "No recent upload";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No recent upload";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getCountryFlag = (code) =>
  String(code || "US").trim().toUpperCase() === "CA" ? canadaFlag : usaFlag;

const LeadDayCard = ({
  lead,
  metrics, 
  onDownload,
  isDownloading,
}) => (
  <article className="rounded-2xl h-fit border border-brand-stroke bg-brand-offwhite transition-transform duration-300 hover:-translate-y-1">
    <Link to={`/admin/uploads/${lead.dayKey}`} className="block">

        <div>
          <h3 className=" font-semibold text-brand-blackish px-5 py-5">
            {lead.title}
          </h3>
        </div>

      <div className="bg-brand-white rounded-xl m-1 px-5 py-5">
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-park font-semibold text-brand-body">Leads Fulfilment</p>
          </div>
          <p className="text-sm text-brand-body font-light">
            <GsapCounter value={metrics.used} className="font-semibold text-brand-skyblue" /> out of{" "}
           {metrics.total}
          </p>
        </div>

        <LeadFulfillmentBars current={metrics.used} total={metrics.total} />

        <div className="mt-2 flex items-center justify-between gap-4 pt-4">
          <div className="inline-flex items-center gap-2 text-brand-body">
            <CopyPlus size={16} className="text-brand-body" />
            <span className="text-sm">Duplicates</span>
          </div>
          <GsapCounter value={metrics.duplicates} className="text-lg font-semibold text-brand-body" />
        </div>

        <div className="mt-1 pt-2 flex items-end justify-between gap-4  bg-top bg-repeat-x [background-size:100%_1px] [background-image:repeating-linear-gradient(to_right,theme(colors.brand-stroke)_0,theme(colors.brand-stroke)_5px,transparent_5px,transparent_10px)]">
          <p className="text-xs text-brand-label">
            Last uploaded on {formatDate(lead.lastUploadedAt || lead.lastUpdated || lead.updatedAt || lead.createdAt)}
          </p>

          <div className="flex items-center">
            <img
              src={getCountryFlag(lead.countryCode || lead.countryPool || lead.country)}
              alt="Country flag"
              className="h-4 w-4 rounded-full border-2 border-brand-lightblue object-cover"
            />
          </div>
        </div>

      </div>
    </Link>
  </article>
);

export default LeadDayCard;
