import { Link } from "react-router";
import Recent from "../../../assets/Recent.svg";
import FunnelIcon from "../../../assets/funnel.svg";
import { MoveRight, Ellipsis, Dot, Eclipse } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useClientDashboard } from "../../../context/DashboardContext";
import TableSkeleton from "../../../utility/skeletons/TableSkeleton";
import UsaFlag from "../../../assets/usa.webp";
import CanadaFlag from "../../../assets/canada.png";

const getStatusColor = (statusLabel = "") => {
  switch (String(statusLabel).toLowerCase()) {
    case "completed":
      return "bg-brand-success/10 text-brand-success";
    case "in_progress":
      return "bg-brand-inprogress/10 text-brand-inprogress";
    case "processing":
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

const formatStatus = (statusLabel = "") => {
  return String(statusLabel).replace(/_/g, " ");
};

const formatSource = (value) => {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCountry = (value) => {
  if (!value) return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getCountryFlag = (code) =>
  String(code || "US").trim().toUpperCase() === "CA" ? CanadaFlag : UsaFlag;

const normalizeStatus = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");

const Table = ({ openAddModal, openOrderDetails, openViewLeads }) => {
  const { dashboardData, dashboardLoading, dashboardError } = useClientDashboard();
  const recentOrders = dashboardData?.recentOrders ?? [];


  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = (now - past) / 1000; // seconds

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);
    const weeks = Math.floor(diff / 604800);

    if (diff < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${weeks}w ago`;
  };

  const getActionItems = (order) => {
    const status = normalizeStatus(order?.statusLabel || order?.displayStatus || order?.status);
    const priceAttached = Boolean(order?.priceAttached || Number(order?.amount) > 0);

    if (status === "in progress" || status === "completed") {
      return [
        { label: "View Orders", action: "details" },
        // { label: "View Leads", action: "leads" },
      ];
    }

    if (["pending", "processing", "awaiting payment"].includes(status) && priceAttached) {
      return [
        { label: "View Orders", action: "details" },
        { label: "Make Payment", action: "payment" },
      ];
    }

    return [{ label: "View Orders", action: "details" }];
  };

  if (dashboardLoading) {
    return <TableSkeleton rows={5} columns={7} />;
  }

  if (dashboardError) {
    return <p className="text-brand-red">Failed to load recent orders</p>;
  }

  return (
    <section className="bg-brand-white border border-brand-offwhite rounded-2xl p-4 w-full h-full">
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
      <div className="flex justify-between mb-4">
        <div className="flex gap-2 lg:gap-4 w-fit items-center">
          <img src={Recent} alt="image" className="w-6 lg:w-8" />
          <h3 className="font-park text-sm lg:text-base text-brand-blackish font-semibold w-fit ">
            Recent Orders
          </h3>
        </div>
        <Link
          to={"/transactions"}
          className="  w-fit text-brand-blue font-medium text-xs lg:text-base flex items-center gap-3 group transition-colors duration-200 hover:text-blue-700"
        >
          {" "}
          View All History{" "}
          <span className="hidden lg:block transition-transform duration-200 group-hover:translate-x-1">
            <MoveRight />
          </span>{" "}
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="uppercase border border-t-0 border-x-0 border-b-brand-offwhite">
            <tr>
              <th className="p-3 font-medium text-sm text-brand-placeholder ">
                Order ID
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">
                Country
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">
                Leads type
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">Quantity</th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">
                Status
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder">
                Last Updated
              </th>
              <th className="p-3 font-medium text-sm text-brand-placeholder text-right">Action</th>
            </tr>
          </thead>

          {!recentOrders.length ? (
            <tbody>
              <tr>
                <td colSpan={7} className="p-8 text-center text-lg font-park text-brand-label font-semibold">
              <img src={FunnelIcon} alt="funnel" className="mx-auto mb-4 w-25" />
                  <h3>
                    No Order created yet!!
                  </h3> 
                  <p className="text-base text-brand-placeholder font-sans font-normal">
                    You can place your order and start tracking it from here...
                  </p>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {recentOrders.map((order, index) => (
                <tr
                  key={order.publicId}
                  className="border-b border-brand-lightblue hover:bg-brand-offwhite transition-colors duration-200 row-animate"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-3 py-2 font-medium text-brand-body text-sm">
                    {order.customId || order.publicId}
                  </td>
                  <td className="px-3 py-2 text-brand-label font-light capitalize text-sm">
                    <div className="flex items-center gap-2">
                      <img
                        src={getCountryFlag(order.country || order.countryPool || order.countryCode)}
                        alt="flag"
                        className="h-4 w-4 rounded-full object-cover"
                      />
                      <span>
                        {formatCountry(order.country || order.countryPool || order.countryCode || "US")}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-brand-label font-light text-sm">
                    {formatSource(order.leadType)}
                  </td>
                  <td className="px-3 py-2 text-brand-label font-light text-sm">
                    {Number(order.quantity ?? 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span
                      className={`inline-flex capitalize items-center justify-center w-max pr-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                        order.statusLabel
                      )}`}
                    >
                      <Dot size={24} className=" -mr-1" />
                      {formatStatus(order.statusLabel)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-brand-label font-light text-sm">
                    {timeAgo(order.updatedAt)}
                  </td>
                  <td className="px-3 py-2 text-center relative">
                    <DropdownMenu.Root
                      className={"border-none shadow-md text-left"}
                    >
                      <DropdownMenu.Trigger className="p-2 rounded-full hover:bg-brand-white text-brand-blackish">
                        <Ellipsis size={18} />
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        sideOffset={5}
                        className="bg-brand-white shadow-md rounded-lg p-1 z-50 text-left"
                      >
                        {getActionItems(order).map((item) => (
                          <DropdownMenu.Item
                            key={item.label}
                            onClick={() => {
                              if (item.action === "details") {
                                openOrderDetails(order);
                              } else if (item.action === "payment") {
                                openAddModal?.(order);
                              } else if (item.action === "leads") {
                                openViewLeads(order);
                              }
                            }}
                            className="px-3 py-2 text-sm border-brand-white text-brand-blackish hover:bg-brand-sky cursor-pointer"
                          >
                            {item.label}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </section>
  );
};

export default Table;
