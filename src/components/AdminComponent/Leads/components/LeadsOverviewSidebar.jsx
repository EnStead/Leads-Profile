import { TrendingDown, TrendingUp } from "lucide-react";
import usaFlag from "../../../../assets/usa.webp";
import canadaFlag from "../../../../assets/canada.png";
import Semi from "../../../../assets/Semi.svg";
import cop from "../../../../assets/Cop.svg";
import GsapCounter from "./GsapCounter";

const renderChange = (value) => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  return (
    <div
      className={`mt-4 flex flex-col gap-1 text-xs font-medium ${
        isNegative ? "text-brand-red" : "text-brand-success"
      }`}
    >
      <span className="flex gap-1">
        {isNegative ? (
          <TrendingDown size={16} className="text-brand-red" />
        ) : (
          <TrendingUp size={16} className="text-brand-success" />
        )}
        {absValue}%
      </span>
      <span className="ml-1 font-light text-brand-label">vs last week</span>
    </div>
  );
};

const StatTooltip = ({ lines = [], align = "center" }) => (
  <div
    className={`pointer-events-none absolute bottom-[calc(100%+14px)] z-20 min-w-max rounded-2xl bg-brand-blackish px-4 py-3 text-brand-white opacity-0 shadow-[0_18px_30px_rgba(15,23,42,0.24)] transition-all duration-300 ease-out group-hover/tooltip:-translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 ${
      align === "right"
        ? "right-0 origin-bottom-right"
        : align === "left"
        ? "left-0 origin-bottom-left"
        : "left-1/2 -translate-x-1/2 origin-bottom"
    } scale-95`}
  >
    <div
      className={`absolute -bottom-2 h-4 w-4 rotate-45 rounded-[2px] bg-brand-blackish ${
        align === "right" ? "right-6" : align === "left" ? "left-6" : "left-1/2 -translate-x-1/2"
      }`}
    />
    <div className="space-y-1 text-sm leading-5">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  </div>
);

const TooltipTrigger = ({ children, tooltipLines, align = "center", className = "" }) => (
  <div className={`group/tooltip relative inline-flex w-fit cursor-pointer ${className}`}>
    {children}
    {tooltipLines?.length ? <StatTooltip lines={tooltipLines} align={align} /> : null}
  </div>
);

const StatColumn = ({
  label,
  value,
  flag,
  suffix = "",
  decimals = 0,
  total,
  colorClass,
  tooltipLines,
}) => {
  const percentage = total > 0 ? (value / total) * 100 : total === 0 ? 0 : value;
  const barWidth = value > 0 ? `${Math.min(percentage, 100)}%` : "0%";

  return (
    <div className="group relative flex flex-col justify-between gap-2 rounded-br-xl pb-2 pt-3 first:pl-5 md:bg-right md:bg-repeat-y md:[background-size:1px_100%] md:[background-image:repeating-linear-gradient(to_bottom,theme(colors.brand-stroke)_0,theme(colors.brand-stroke)_4px,transparent_4px,transparent_8px)] last:md:bg-none">
      <div>
        <TooltipTrigger tooltipLines={tooltipLines} align="left">
          <div className="h-0.5 w-24 rounded-full bg-brand-stroke">
            <div
              className={`h-full rounded-full ${colorClass}`}
              style={{ width: barWidth }}
            />
          </div>
        </TooltipTrigger>

        <p className="mt-2 text-sm font-light text-brand-body">{label}</p>

        <TooltipTrigger tooltipLines={tooltipLines} className="mt-4" align="center">
          <p className="text-xl font-semibold leading-none text-brand-blackish">
            <GsapCounter value={value} decimals={decimals} />
            {suffix ? <span className="ml-1 text-lg">{suffix}</span> : null}
          </p>
        </TooltipTrigger>
      </div>

      {renderChange(0)}

      {flag ? (
        <div className="absolute bottom-0 right-0 inline-flex h-8 w-8 overflow-hidden rounded-tl-xl rounded-br-xl border border-brand-stroke group-last:border-0 group-last:rounded-none">
          <img
            src={flag}
            alt={label}
            className="h-full w-full object-cover group-last:object-contain"
          />
        </div>
      ) : null}
    </div>
  );
};

const LeadsOverviewSidebar = ({ overview = {}, onUpload, onManageHeaders }) => {
  const totalLeadsUploaded = Number(
    overview?.totalLeadsUploaded ??
      overview?.totalLeadsGenerated ??
      overview?.total ??
      0,
  );
  const usLeads = Number(
    overview?.averageDailyLeads ??
      overview?.usLeads ??
      overview?.usaLeads ??
      overview?.countryBreakdown?.us ??
      0,
  );
  const usThisMonth = Number(
    overview?.unitedStates ??
      overview?.usLeads ??
      overview?.usaLeads ??
      overview?.countryBreakdown?.us ??
      overview?.tooltips?.totalLeadsUploaded.thisMonth ??
      0,
  );
  const canadaLeads = Number(
    overview?.canada ??
      overview?.canadaLeads ??
      overview?.countryBreakdown?.canada ??
      0,
  );
  const duplicateRate = Number(
    overview?.duplicateRate ??
      overview?.duplicatePercentage ??
      overview?.duplicatePct ??
      0,
  );
  const usLastMonth = Number(
    overview?.tooltips?.totalLeadsUploaded.lastMonth ??
    overview?.unitedStatesLastMonth ??
      overview?.usLeadsLastMonth ??
      overview?.countryBreakdown?.usLastMonth ??
      0,
  );
  const canadaLastMonth = Number(
    overview?.canadaLastMonth ??
      overview?.countryBreakdown?.canadaLastMonth ??
      overview?.historicalDuplicateCount ??
      0,
  );
  const daysSinceSetup = Number(overview?.daysSinceSetup ?? 0);
  const statusLabel = overview?.statusLabel || "Active";
  const tooltips =
    overview?.tooltips && typeof overview.tooltips === "object" ? overview.tooltips : {};

  const duplicateTooltip =
    Array.isArray(tooltips?.duplicateRate) || typeof tooltips?.duplicateRate === "string"
      ? tooltips.duplicateRate
      : [
          `Rolling 24h duplicates: ${Number(
            overview?.rolling24hDuplicateCount ?? 0,
          ).toLocaleString()}`,
          `Historical duplicates: ${Number(
            overview?.historicalDuplicateCount ?? 0,
          ).toLocaleString()}`,
        ];

  const totalTooltip =
    Array.isArray(tooltips?.totalLeadsUploaded) || typeof tooltips?.totalLeadsUploaded === "string"
      ? tooltips.totalLeadsUploaded
      : [
          `Total clients: ${Number(overview?.totalClients ?? 0).toLocaleString()}`,
          `Total leads generated: ${Number(
            overview?.totalLeadsGenerated ?? totalLeadsUploaded,
          ).toLocaleString()}`,
        ];

  const usTooltip =
    Array.isArray(tooltips?.unitedStates) || typeof tooltips?.unitedStates === "string"
      ? tooltips.unitedStates
      : [
          `Last Month: ${usLastMonth.toLocaleString()}`,
          `This Month: ${usThisMonth.toLocaleString()}`,
        ];

  const canadaTooltip =
    Array.isArray(tooltips?.canada) || typeof tooltips?.canada === "string"
      ? tooltips.canada
      : [
          `Last Month: ${canadaLastMonth.toLocaleString()}`,
          `This Month: ${canadaLeads.toLocaleString()}`,
        ];

  return (
    <aside className="sticky top-28 self-start rounded-2xl border border-brand-stroke bg-brand-white py-5">
      <div className="flex items-center justify-between gap-4 px-5">
        <div className="inline-flex items-center gap-2">
          <div className="rounded-full bg-brand-label/25 p-1">
            <img src={Semi} alt="image" />
          </div>
          <h3 className="font-park font-semibold text-brand-blackish">
            Leads Overview
          </h3>
        </div>

        <p className="text-sm font-light text-brand-label">
          {daysSinceSetup} Days Since Setup | {statusLabel}
        </p>
      </div>

      <div className="mt-6 px-5">
        <TooltipTrigger tooltipLines={totalTooltip} align="center">
          <p className="text-sm font-medium text-brand-label">Total Leads Uploaded</p>
        </TooltipTrigger>

        <div className="mt-3 flex items-baseline gap-2">
          <p className="font-park text-3xl font-bold leading-none text-brand-blackish">
            <GsapCounter value={totalLeadsUploaded} />
          </p>
          <span className="font-light text-brand-label">Leads</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 border-y border-brand-stroke md:grid-cols-3">
        <StatColumn
          label="United States"
          value={usLeads}
          flag={usaFlag}
          total={totalLeadsUploaded}
          colorClass="bg-brand-purple"
          tooltipLines={usTooltip}
        />
        <StatColumn
          label="Canada"
          value={canadaLeads}
          flag={canadaFlag}
          total={totalLeadsUploaded}
          colorClass="bg-brand-accent"
          tooltipLines={canadaTooltip}
        />
        <StatColumn
          label="Duplicate Rate"
          flag={cop}
          value={duplicateRate}
          suffix="%"
          decimals={1}
          total={100}
          colorClass="bg-brand-placeholder"
          tooltipLines={duplicateTooltip}
        />
      </div>

      <div className="mt-8 space-y-4 px-5">
        <button
          type="button"
          onClick={onUpload}
          className="w-full rounded-xl bg-brand-blackish px-5 py-2 font-park font-semibold text-brand-white transition hover:opacity-95"
        >
          Upload Leads
        </button>
        <button
          type="button"
          onClick={onManageHeaders}
          className="w-full rounded-xl border border-brand-label bg-transparent px-5 py-2 font-park font-semibold text-brand-label transition hover:opacity-95"
        >
          Manage Header Settings
        </button>
      </div>
    </aside>
  );
};

export default LeadsOverviewSidebar;
