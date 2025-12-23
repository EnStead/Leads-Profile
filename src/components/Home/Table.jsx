import { Link } from "react-router";
import Recent from "../../assets/Recent.svg";
import { MoveRight, Ellipsis, Dot, Eclipse } from "lucide-react";
import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDashboard } from "../../context/DashboardContext";
import TableSkeleton from "../../utility/skeletons/TableSkeleton";

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "bg-brand-green/10 text-brand-green";
    case "in progress":
      return "bg-brand-blue/10 text-brand-blue";
    case "in_progress":
      return "bg-brand-blue/10 text-brand-blue";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatStatus = (status = "") => {
  return status.replace(/_/g, " ");
};

const formatSource = (value) => {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const Table = ({ openOrderDetails, openViewLeads }) => {
  const { dashboardData, dashboardLoading, dashboardError } = useDashboard();
  const recentOrders = dashboardData?.recentOrders;

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

  if (dashboardLoading) {
    return <TableSkeleton rows={5} columns={7} />;
  }

  if (dashboardError) {
    return <p className="text-brand-red">Failed to load recent orders</p>;
  }

  return (
    <section className="bg-brand-white border border-brand-offwhite rounded-2xl p-4 w-full h-full">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2 lg:gap-4 w-fit items-center">
          <img src={Recent} alt="image" className="w-6 lg:w-8" />
          <h3 className="font-park text-sm lg:text-base text-brand-primary font-semibold w-fit ">
            Recent Orders
          </h3>
        </div>
        <Link
          to={"/transactions"}
          className="  w-fit text-brand-blue font-medium text-xs lg:text-base flex items-center gap-3"
        >
          {" "}
          View All History{" "}
          <span className="hidden lg:block">
            <MoveRight />
          </span>{" "}
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-brand-offwhite rounded-2xl">
            <tr>
              <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">
                Order ID
              </th>
              <th className="p-3 font-medium text-sm text-brand-muted">
                Leads Criteria
              </th>
              <th className="p-3 font-medium text-sm text-brand-muted">Qty</th>
              <th className="p-3 font-medium text-sm text-brand-muted">
                Status
              </th>
              <th className="p-3 font-medium text-sm text-brand-muted">
                Last Updated
              </th>
              <th className="p-3 font-medium text-sm text-brand-muted text-right rounded-r-lg"></th>
            </tr>
          </thead>

          {!recentOrders.length ? (
            <tbody>
              <tr>
                <td className="w-fit font-park flex items-center justify-center text-brand-gray font-semibold">
                  No Data yet!!
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-brand-stroke ">
                  <td className="p-3 font-medium text-brand-subtext text-sm">
                    {order.customId}
                  </td>
                  <td className="p-3 text-brand-muted font-light capitalize text-sm">
                    {formatSource(order.orderType)}
                  </td>
                  <td className="p-3 text-brand-muted font-light text-sm">
                    {order.quantity.toLocaleString()}
                  </td>
                  <td className="p-3 text-sm">
                    <span
                      className={`flex capitalize items-center w-fit px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <Dot />
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="p-3 text-brand-muted font-light text-sm">
                    {timeAgo(order.updatedAt)}
                  </td>
                  <td className="p-3 text-right relative">
                    <DropdownMenu.Root
                      className={"border-none shadow-md text-left"}
                    >
                      <DropdownMenu.Trigger className="p-2 rounded-full hover:bg-brand-white">
                        <Ellipsis size={18} />
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Content
                        sideOffset={5}
                        className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
                      >
                        <DropdownMenu.Item
                          onClick={() => openOrderDetails(order)}
                          className="px-3 py-2 text-sm border-brand-white hover:bg-brand-sky cursor-pointer"
                        >
                          View Details
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onClick={() => openViewLeads(order)}
                          className="px-3 py-2 text-sm border-brand-white hover:bg-brand-sky cursor-pointer"
                        >
                          View Leads
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
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
