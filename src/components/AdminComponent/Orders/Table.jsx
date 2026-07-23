import { Dot, MoveRight } from "lucide-react";
import { useAdminDashboard } from "../../../context/DashboardContext";
import TableSkeleton from "../../../utility/skeletons/TableSkeleton";
import Pagination from "../../../utility/Pagination";
import EmptyState from "../../../utility/EmptyState";
import UsaFlag from "../../../assets/usa.webp";
import CanadaFlag from "../../../assets/canada.png";
import Avater from "../../../assets/Avater.jpg";
import {
  getProfileImageSrc,
  PROFILE_BG_TONES,
} from "../../../utility/profilePresets";

const normalizeStatus = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const getStatusColor = (displayStatus) => {
  switch (normalizeStatus(displayStatus)) { 
    case "completed":
      return "bg-brand-success/10 text-brand-success";
    case "in_progress":
    case "partially_fulfilled":
    case "fulfilled":
      return "bg-brand-inprogress/10 text-brand-inprogress";
    case "processing":
    case "scheduled":
      return "bg-brand-royalblue/10 text-brand-royalblue";
    case "paid":
      return "bg-brand-accent/10 text-brand-accent";
    case "cancelled":
      return "bg-brand-error/10 text-brand-error";
    case "pending":
      return "bg-brand-info/10 text-brand-info";  
    default:
      return "bg-brand-info/10 text-brand-info";
  }
};

const toTitleCase = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatCountry = (order) => {
  const country = String(
    order?.countryCode || order?.country || order?.countryPool || "",
  )
    .trim()
    .toLowerCase();

  if (country.includes("canada") || country === "ca") {
    return { label: "Canada", flag: CanadaFlag };
  }

  return { label: "United States", flag: UsaFlag };
};

const getAvatarBgTone = (customer) => {
  const seed = String(
    customer?.imagePreset || customer?._id || customer?.email || customer?.name || "",
  );
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PROFILE_BG_TONES[total % PROFILE_BG_TONES.length];
};

const getCustomerAvatarSrc = (customer) => {
  const presetId = String(customer?.imagePreset || "").trim();
  return presetId ? getProfileImageSrc(presetId) : Avater;
};

const formatDeliveryDays = (order) => {
  const config = order?.deliveryConfig;
  const scenario = order?.deliveryScenario;

  if (scenario === "staggered") {
    if (config?.startDay && config?.endDay) {
      return `${toTitleCase(config.startDay).slice(0, 3)} - ${toTitleCase(config.endDay).slice(0, 3)}`;
    }
  } else if (scenario === "scheduled" && config?.weeks) {
    return `${config.weeks} Week${config.weeks > 1 ? "s" : ""}`;
  } else if (scenario === "standard") {
    if (config?.selectedDay) {
      return toTitleCase(config.selectedDay);
    }
  }
  return order?.deliveryDaysLabel || "-";
};

const Table = ({ openOrderDetails }) => {
  const {
    adminOrderData,
    adminOrderLoading,
    adminOrderError,
    page,
    setSearchParams,
  } = useAdminDashboard();
  let debounceTimer;
  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > adminOrderData?.pagination?.pages ||
      adminOrderLoading
    )
      return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setSearchParams({ p: newPage });
    }, 200); // 200ms delay
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  if (adminOrderLoading) {
    return <TableSkeleton rows={5} columns={10} />;
  }

  if (adminOrderError) {
    return <p className="text-brand-red">Failed to load recent orders</p>;
  }


  return (
    <section className="w-full h-full">
      <style>{`
        @keyframes rowFadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .row-animate {
          animation: rowFadeInUp 300ms ease-out both;
        }
      `}</style>
      {!adminOrderData?.data.length ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="uppercase">
              <tr>
                <th className="p-3 font-medium text-sm text-brand-placeholder rounded-l-lg">
                  Order ID
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Customer Name
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Created By
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Date
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Country
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Leads Category
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Qty Usage
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Delivery Day(s)
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Status
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {adminOrderData?.data.map((order, index) => {
                const country = formatCountry(order);

                return (
                  <tr
                    key={order._id}
                    className="group capitalize row-animate transition-colors duration-200 hover:bg-brand-white focus-within:bg-brand-offwhite/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-3 text-sm font-medium text-brand-body">
                      {order.publicId}
                    </td>
                    <td className="p-3 text-sm font-light text-brand-body">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-stroke ${getAvatarBgTone(order.customer)}`}
                        >
                          <img
                            src={getCustomerAvatarSrc(order.customer)}
                            alt={order.customer?.name}
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <span>{order.customer?.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm font-light text-brand-body">
                      {order.createdByLabel}
                    </td>
                    <td className="p-3 text-sm font-light text-brand-body">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-3 text-sm font-light text-brand-body">
                      <span className="inline-flex items-center gap-2">
                        <img
                          src={country.flag}
                          alt={country.label}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                        <span>{order.countryCode}</span>
                      </span>
                    </td>
                    <td className="p-3 text-sm font-light text-brand-body">
                      {toTitleCase(
                         order.targeting?.type
                      )}
                    </td>
                    <td className="p-3 text-sm font-light text-brand-body">
                      {order.quantityUsage}
                    </td>
                    <td className="p-3 text-sm font-light text-brand-body">
                      {formatDeliveryDays(order)}
                    </td>
                    <td className="p-3 text-sm">
                      <span
                        className={`inline-flex w-max items-center justify-center whitespace-nowrap rounded-full pr-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusColor(
                          order.displayStatus
                        )}`}
                      >
                        <Dot className="-mr-1" />
                        {toTitleCase(order.displayStatus)}
                      </span>
                    </td>
                    <td className="relative p-3 text-right">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-brand-blue transition-all duration-200 hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-white"
                      >
                        View
                        <MoveRight
                          size={14}
                          className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100"
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={adminOrderData?.pagination?.pages}
        onPageChange={handlePageChange}
        loading={adminOrderLoading}
      />
    </section>
  );
};

export default Table;
