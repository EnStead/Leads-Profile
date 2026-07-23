import { Link } from "react-router";
import Recent from "../../../assets/Recent.svg";
import UsaFlag from "../../../assets/usa.webp";
import CanadaFlag from "../../../assets/canada.png";
import { Ellipsis, MoveRight, Dot, ArrowUpRight } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAdminDashboard } from "../../../context/DashboardContext";
import TableSkeleton from "../../../utility/skeletons/TableSkeleton";
import GsapCounter from "../../AdminComponent/Leads/components/GsapCounter";
import Avater from "../../../assets/Avater.jpg";
import { getProfileImageSrc, PROFILE_BG_TONES } from "../../../utility/profilePresets";

const getStatusColor = (status = "") => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("complete"))
    return "bg-brand-success/10 text-brand-success";
  if (normalized.includes("progress") || normalized.includes("processing"))
    return "bg-brand-blue/10 text-brand-blue";
  if (normalized.includes("paid") || normalized.includes("verified"))
    return "bg-brand-accent/10 text-brand-accent";
  if (normalized.includes("pending") || normalized.includes("submitted"))
    return "bg-brand-info/10 text-brand-info";
  return "bg-brand-error/10 text-brand-error";
};

const getCountryFlag = (code) =>
  String(code || "US").trim().toUpperCase() === "CA" ? CanadaFlag : UsaFlag;

const formatStatus = (status = "") =>
  String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatSource = (value) => {
  if (!value) return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const timeAgo = (dateString) => {
  if (!dateString) return "-";
  const now = new Date();
  const past = new Date(dateString);
  const diff = (now - past) / 1000;

  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);
  const weeks = Math.floor(diff / 604800);

  if (Number.isNaN(past.getTime())) return "-";
  if (diff < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${weeks}w ago`;
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

const getOrderDropdownOptions = (order) => {
  const status = order?.displayStatus;
  const normalized = String(status).toLowerCase();
  const delivered = Number(
      order?.filled ??
      order?.quantityDisplay?.split?.("/")?.[0] ??
      0,
  );
  if (normalized.includes("pending")) {
    const options = [];
    if (!order?.priceAttached) {
      options.push(
        { key: "set-price", label: "Set A Price", action: "setPricing" },
        { key: "reject", label: "Reject Order", action: "reject" }
      );
    }
    options.push(
      { key: "details", label: "View Details", action: "details" },
      { key: "delete", label: "Delete Order", action: "delete" }
    );
    return options;
  } 

  if (normalized.includes("paid") || normalized.includes("verified")) {
    const options = [];
    if (!normalized.includes("paid")) {
      options.push({ key: "approve", label: "Approve Order", action: "approve" });
    }
    options.push(
      { key: "details", label: "View Details", action: "details" },
      { key: "delete", label: "Delete Order", action: "delete" }
    );
    return options;
  }

  if (normalized.includes("processing")) {
    const options = [];
    if (delivered <= 0) {
      options.push(
        { key: "edit", label: "Edit Order", action: "edit" },
        { key: "recall", label: "Recall Order", action: "recall" }
      );
    }
    options.push(
        { key: "details", label: "View Details", action: "details" }
    );
      if (delivered > 0) {
        options.push({ key: "delete", label: "Delete Order", action: "delete" });
      }
    return options;
  }

  if (normalized.includes("in progress") || normalized.includes("in_progress")) {
    return [
      { key: "recall", label: "Recall Order", action: "recall" },
      { key: "details", label: "View Details", action: "details" },
    ];
  }

  if (normalized.includes("cancelled") || normalized.includes("canceled")) {
    return [{ key: "details", label: "View Details", action: "details" }];
  }

  if (normalized.includes("complete") || normalized.includes("completed")) {
    return [{ key: "details", label: "View Details", action: "details" }];
  }

  return [{ key: "details", label: "View Details", action: "details" }];
};

const Table = ({ openOrderDetails, openOrderAction }) => {
  const { adminDashboardData, adminOrderData, adminOrderLoading, adminOrderError } =
    useAdminDashboard();

  const recentOrders = Array.isArray(adminDashboardData?.recentOrders)
    ? [...adminDashboardData.recentOrders].slice(0, 6)
    : Array.isArray(adminOrderData?.data)
      ? [...adminOrderData.data].slice(0, 6)
      : [];

  if (adminOrderLoading) {
    return <TableSkeleton rows={5} columns={8} />;
  }

  if (adminOrderError) {
    return <p className="text-brand-red">Failed to load recent orders</p>;
  }

  return (
    <section className="rounded-2xl border border-brand-offwhite bg-brand-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-fit items-center gap-3">
          <img src={Recent} alt="Recent orders" className="h-5 w-5 sm:h-6 sm:w-6" />
          <h3 className="font-park font-semibold text-brand-blackish ">
            Recent Orders
          </h3>
        </div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 rounded-full bg-brand-offwhite px-4 py-2 text-sm font-light text-brand-blackish transition hover:bg-brand-blue/10"
        >
          View All
          <ArrowUpRight size={16} />
        </Link>
        
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-xs uppercase font-medium tracking-[0.12em] text-brand-placeholder">
              <th className="px-3 py-3 font-medium">Order ID</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Country</th>
              <th className="px-3 py-3 font-medium">Leads Type</th>
              <th className="px-3 py-3 font-medium">Quantity</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Last Updated</th>
              <th className="px-3 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>

          {!recentOrders.length ? (
            <tbody>
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-10 text-center font-park text-brand-muted"
                >
                  No Data yet!!
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {recentOrders.map((order, index) => {
                const status =
                  order?.statusLabel ||
                  order?.displayStatus ||
                  order?.status ||
                  "Pending";
                const customerObj = order?.customer || order?.client || {};
                const customerName = customerObj?.name || order?.customerName || "Unknown Customer";
                const countryCode = String(order?.countryCode || "US").toUpperCase();
                const countryFlag = getCountryFlag(countryCode);
                const requested = Number(
                  order?.requested ??
                    order?.quantity ??
                    order?.quantityDisplay?.split?.("/")?.[1] ??
                    0,
                );
                const delivered = Number(
                  order?.delivered ??
                    order?.filled ??
                    order?.quantityDisplay?.split?.("/")?.[0] ??
                    0,
                );

                return (
                  <tr
                    key={order?._id ?? order?.id ?? index}
                    className="group border-b border-brand-stroke transition-colors duration-200 hover:bg-brand-offwhite/60"
                  >
                    <td className="px-3 py-2 text-xs font-medium text-brand-blackish">
                      {order?.publicId ?? order?.customId ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs font-light text-brand-label">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-stroke ${getAvatarBgTone(customerObj)}`}>
                          <img
                            src={getCustomerAvatarSrc(customerObj)}
                            alt={customerName}
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <span className="truncate max-w-[120px]" title={customerName}>
                          {customerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs font-light text-brand-label">
                      <div className="flex items-center gap-2">
                        <img
                          src={countryFlag}
                          alt={countryCode}
                          className="h-4 w-4 rounded-full object-cover"
                        />
                        <span>
                          {countryCode === "US" ? "US" : order?.country || countryCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs font-light text-brand-label">
                      {formatSource(
                        order?.leadType
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs font-light text-brand-label">
                      <span className="inline-flex items-center gap-1">
                        <GsapCounter value={delivered} />
                        <span>/</span>
                        <GsapCounter value={requested} />
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[10px]">
                      <span
                        className={`inline-flex capitalize items-center justify-center w-max pr-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(
                          status,
                        )}`}
                      >
                        <Dot size={28} />
                        {formatStatus(status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-brand-label font-light">
                      {timeAgo(
                        order?.lastUpdatedAt ||
                          order?.updatedAt ||
                          order?.lastEventAt ||
                          order?.createdAt,
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-brand-label transition hover:border-brand-offwhite hover:bg-brand-offwhite hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                            aria-label="Open actions"
                          >
                            <Ellipsis size={18} />
                          </button>
                        </DropdownMenu.Trigger>
 
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            align="end"
                            sideOffset={8}
                            className="z-50 min-w-[160px] rounded-lg border border-brand-offwhite bg-brand-white p-2 shadow-xl"
                          >
                            {getOrderDropdownOptions(order).map((option) =>
                              option.type === "link" ? (
                                <DropdownMenu.Item
                                  asChild
                                  key={option.key}
                                  className="outline-none text-brand-blackish"
                                >
                                  <Link
                                    to={option.to}
                                    className="block cursor-pointer rounded-xl px-3 py-2 text-sm text-brand-blackish transition hover:bg-brand-offwhite"
                                  >
                                    {option.label}
                                  </Link>
                                </DropdownMenu.Item>
                              ) : (
                              <DropdownMenu.Item
                                  key={option.key}
                                  onSelect={() => {
                                    if (option.action === "details") {
                                      openOrderDetails(order);
                                      return;
                                    }

                                    openOrderAction?.(order, option.action);
                                  }}
                                  className="cursor-pointer rounded-xl px-3 py-2 text-sm text-brand-blackish outline-none transition hover:bg-brand-offwhite"
                                >
                                  {option.label}
                                </DropdownMenu.Item>
                              ),
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </section>
  );
};

export default Table;
