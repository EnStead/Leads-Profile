import { Link } from "react-router";
import { ArrowUpRight, FileText } from "lucide-react";
import { useAdminDashboard } from "../../../context/DashboardContext";
import CardSkeleton from "../../../utility/skeletons/CardSkeleton";
import GsapCounter from "../../AdminComponent/Leads/components/GsapCounter";
import { getProfileImageSrc } from "../../../utility/profilePresets";
import UsaFlag from "../../../assets/usa.webp";
import CanadaFlag from "../../../assets/canada.png"; 
 
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatSource = (value) => {
  if (!value) return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getCountryFlag = (code) =>
  String(code || "US").trim().toUpperCase() === "CA" ? CanadaFlag : UsaFlag;

const getStatusTone = (status = "") => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("paid") || normalized.includes("verified"))
    return "bg-brand-accent/10 text-brand-accent";
  if (
    normalized.includes("pending") ||
    normalized.includes("submitted") ||
    normalized.includes("unpriced")
  )
    return "bg-brand-info/10 text-brand-info";
  if (normalized.includes("processing") || normalized.includes("progress"))
    return "bg-brand-royalblue/10 text-brand-royalblue";
  if (normalized.includes("complete"))
    return "bg-brand-success/10 text-brand-success";
  return "bg-gray-100 text-gray-600";
};

const normalizeStatusLabel = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("verified") || normalized.includes("paid")) return "Paid";
  if (
    normalized.includes("pending") ||
    normalized.includes("submitted") ||
    normalized.includes("unpriced")
  )
    return "Pending";
  if (normalized.includes("processing") || normalized.includes("progress"))
    return "Processing";
  if (normalized.includes("complete")) return "Completed";
  return String(value || "Pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const PendingApproval = ({ openOrderDetails }) => {
  const { adminDashboardData, adminOrderData, adminDashboardLoading } = useAdminDashboard();

  const orders = Array.isArray(adminDashboardData?.pendingApproval)
    ? adminDashboardData.pendingApproval
    : Array.isArray(adminOrderData?.data)
      ? adminOrderData.data
      : [];
  const sorted = [...orders].sort(
    (a, b) =>
      new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
      new Date(a?.updatedAt || a?.createdAt || 0).getTime(),
  );

  const filtered = sorted.filter((order) => {
    const status = String(
      order?.paymentStatus || order?.displayStatus || order?.status || "",
    ).toLowerCase();
    return !["completed", "fulfilled", "cancelled"].includes(status);
  });

  const pendingApprovalRows = (filtered.length ? filtered : sorted).slice(0, 5);

  if (adminDashboardLoading) {
    return <CardSkeleton />;
  }

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-brand-offwhite bg-brand-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-brand-label" />
          <h3 className=" font-semibold text-[15px] text-brand-blackish">
            Pending & Approval
          </h3>
        </div>
        <Link
          to="/admin/uploads"
          className="inline-flex items-center gap-1 rounded-full bg-brand-offwhite px-4 py-2 text-[13px] font-light text-brand-blackish transition hover:bg-brand-blue/10"
        >
          Leads Upload
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="mt-4 flex-1 divide-y divide-brand-offwhite overflow-y-auto pr-2">
        {pendingApprovalRows.length ? (
          pendingApprovalRows.map((order, index) => {
            const customer = order?.customer || {};
            const customerName = order?.customerName || customer?.name || "Unknown Customer";
            const imagePreset =
              customer?.imagePreset ?? order?.imagePreset ?? null;
            const avatarSrc = getProfileImageSrc(imagePreset);
            const tone =
              [
                "bg-brand-lightblue",
                "bg-brand-sky",
                "bg-brand-offwhite",
                "bg-brand-blue/15",
                "bg-brand-purple/20",
              ][index % 5] || "bg-brand-lightblue";
            const countryFlag = getCountryFlag(order?.countryCode);
            const countryCode = String(order?.countryCode || "US").toUpperCase();
            const category = formatSource(
              order?.leadType,
            );
            const amount =
              order?.pricing?.amount ?? order?.amount ?? order?.amountPaid;
            const statusLabel = normalizeStatusLabel(
                order?.displayStatus ||
                order?.status ||
                "Pending",
            );

            return (
              <div
                key={order?._id ?? order?.id ?? `${order?.customerName}-${index}`}
                onClick={() => openOrderDetails?.(order)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openOrderDetails?.(order);
                  }
                }}
                className="my-4 rounded-xl border border-brand-offwhite bg-brand-white text-left cursor-pointer transition-all hover:border-brand-blue/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                <div className="flex items-start justify-between gap-3 bg-brand-offwhite rounded-t-xl p-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}
                    >
                      <img
                        src={avatarSrc}
                      alt={customerName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                    <p 
                      className="truncate max-w-[130px] sm:max-w-[160px] text-base font-medium text-brand-body sm:text-lg"
                      title={customerName}
                    >
                      {customerName}
                      </p>
                      <p className="truncate text-sm font-light text-brand-body">
                        {category} •{" "}
                        <GsapCounter
                          value={toNumber(order?.quantity ?? order?.requested)}
                        />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-brand-blackish">
                    <img
                      src={countryFlag}
                      alt={countryCode}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                    <span>{countryCode}</span>
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between gap-3 bg-brand-white rounded-b-xl">
                  <p className="font-medium text-brand-body">
                    {amount !== null && amount !== undefined && amount !== ""
                      ? <GsapCounter value={amount} prefix="$" />
                      : "$0"}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                      statusLabel,
                    )}`}
                  >
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-14 text-center text-sm text-brand-muted">
            No pending orders yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApproval;
