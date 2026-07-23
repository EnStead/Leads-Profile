import { useMemo } from "react";
import { Ellipsis, Dot, CornerDownLeft } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import TableSkeleton from "../../../utility/skeletons/TableSkeleton";
import { useClientDashboard } from "../../../context/DashboardContext";
import OrderEmptyState from "../../../utility/OrderEmptyState";
import UsaFlag from "../../../assets/usa.webp";
import CanadaFlag from "../../../assets/canada.png";

const getStatusColor = (displayStatus) => {
  const normalizedStatus = String(displayStatus || "").trim().toLowerCase();
  switch (normalizedStatus) {
    case "completed":
      return "bg-brand-success/10 text-brand-success";
    case "in_progress":
    case "in progress":
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

const formatStatus = (status = "") => {
  return String(status || "").replace(/_/g, " ");
};

const formatSource = (value) => {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCountry = (countryCode) => {
  const normalized = String(countryCode || "US").trim().toLowerCase();
  const isCanada = normalized === "ca" || normalized === "canada";

  return (
    <div className="flex items-center gap-2">
      <img
        src={isCanada ? CanadaFlag : UsaFlag}
        alt={isCanada ? "Canada" : "USA"}
        className="h-6 w-6 rounded-full object-cover border border-brand-offwhite"
      />
      <span>{isCanada ? "Canada" : "United States"}</span>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleString(undefined, options);
};

const Table = ({ openAddModal, openOrderDetails, openViewLeads }) => {
  const {
    transactionHistoryData,
    transactionHistoryLoading,
    transactionHistoryError,
    tranSearch,
  } = useClientDashboard();


  const transactions = Array.isArray(transactionHistoryData?.data)
    ? transactionHistoryData.data
    : [];

  const filteredTransactions = useMemo(() => {
    const query = String(tranSearch || "").trim().toLowerCase();
    if (!query) return transactions;

    return transactions.filter((transaction) => {
      const haystack = [
        transaction?.publicId,
        formatDate(transaction?.date),
        transaction?.countryCode,
        transaction?.leadsCategory,
        transaction?.amount,
        transaction?.currency,
        transaction?.quantity,
        transaction?.fulfilled,
        transaction?.status,
        transaction?.displayStatus,
        transaction?.deliveryType,
        transaction?.createdBy,
      ]
        .filter((value) => value !== undefined && value !== null)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [transactions, tranSearch]);

  const getActionItems = (transaction) => {
    const status = String(
      transaction?.displayStatus,
    )
      .trim()
      .replace(/[\s_-]+/g, " ");
    const priceAttached = Number(transaction?.amount);

    if (status === "Pending" && priceAttached) {
      return [
        { label: "View Orders", action: "details" },
        { label: "Make Payments", action: "payment" },
      ];
    }

    if (status === "In Progress" || status === "completed") {
      return [
        { label: "View Orders", action: "details" },
        // { label: "View Leads", action: "leads" },
      ];
    }

    if (
      status === "Pending" ||
      status === "Paid" ||
      status === "Processing" ||
      status === "Cancelled"
    ) {
      return [{ label: "View Orders", action: "details" }];
    }

    return [{ label: "View Orders", action: "details" }];
  };

  if (transactionHistoryLoading) {
    return <TableSkeleton rows={5} columns={11} />;
  }

  if (transactionHistoryError) {
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

      <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="uppercase">
              <tr>
                <th className="px-3 py-2 font-medium text-xs text-brand-placeholder rounded-l-lg">
                  Order ID
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder rounded-l-lg">
                  Date
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder rounded-l-lg">
                  Country
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder">
                  Leads Category
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder">
                  Amount
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder">
                  Qty
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder">
                  Fulfield
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder">
                  Status
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder">
                  Delivery Type
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder">
                  Created By
                </th>
                <th className="px-3 font-medium text-xs text-brand-placeholder">
                  Action
                </th>
              </tr>
            </thead>

            {filteredTransactions.length ? (
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id || transaction.publicId || index}
                    className="border-b border-brand-stroke capitalize hover:bg-brand-offwhite transition-colors duration-200 row-animate"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-3 font-medium text-brand-body text-xs">
                      {transaction.publicId}
                    </td>
                    <td className="p-3 text-brand-body font-light text-xs">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="p-3 text-brand-body font-light text-xs">
                      {formatCountry(transaction.countryCode)}
                    </td>
                    <td className="p-3 text-brand-body font-light text-xs">
                      {formatSource(transaction.leadsCategory)}
                    </td>
                    <td className="p-3 text-brand-body font-light text-xs">
                      {transaction.amount === null || transaction.amount === undefined
                        ? "-"
                      : `$${Number(transaction.amount).toLocaleString()}`}
                    </td>
                    <td className="p-3 text-brand-body font-light text-xs">
                      {Number(transaction.quantity ?? 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-brand-body font-light text-xs">
                      {Number(transaction.fulfilled ?? 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-xs">
                      <span
                        className={`inline-flex capitalize items-center justify-center w-max pr-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor( transaction.displayStatus)}`}
                      >
                        <Dot className=" -mr-1"/>
                        {formatStatus(transaction.displayStatus)}
                      </span>
                    </td>
                    <td className="p-3 text-brand-body font-light text-xs">
                      {formatSource(transaction.deliveryType)}
                    </td>
                    <td className="p-3 text-brand-body font-light text-xs">
                      {transaction.createdBy}
                    </td>
                    <td className="p-3 text-center relative">
                      <DropdownMenu.Root
                        className={"border-none shadow-md text-left"}
                      >
                        <DropdownMenu.Trigger className="p-2 text-brand-body rounded-full hover:bg-brand-white">
                          <Ellipsis size={18} />
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            sideOffset={5}
                            className="bg-brand-white text-brand-body shadow-md rounded-lg p-1 z-50 text-left"
                          >
                            {getActionItems(transaction).map((item) => (
                              <DropdownMenu.Item
                                key={item.label}
                                onClick={() => {
                                  if (item.action === "details") {
                                    openOrderDetails(transaction);
                                    return;
                                  }
                                  if (item.action === "payment") {
                                    openAddModal?.(transaction);
                                    return;
                                  }
                                  if (item.action === "leads") {
                                    openViewLeads(transaction);
                                  }
                                }} 
                                className="px-3 py-2 text-xs hover:bg-brand-sky cursor-pointer"
                              >
                                {item.label}
                              </DropdownMenu.Item>
                            ))}

                            {/* <DropdownMenu.Item className="px-3 py-2 text-xs border-brand-white hover:bg-brand-sky cursor-pointer">
                              <a
                                href="https://teams.microsoft.com/l/chat/0/0?users=info@enstead.co"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex gap-3 "
                              >
                                Contact Support
                              </a>
                            </DropdownMenu.Item> */}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={11}>
                    <OrderEmptyState 
                      title={tranSearch?.trim() ? "No search result found" : undefined}
                      subtext={tranSearch?.trim() ? "Do you want to create your own order?" : undefined}
                      subtitle={tranSearch?.trim() ? "Do you want to create your own order?" : undefined}
                    />
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
    </section>
  );
};

export default Table;
