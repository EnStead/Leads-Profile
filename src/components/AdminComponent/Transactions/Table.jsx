import { useAdminDashboard } from "../../../context/DashboardContext";
import TableSkeleton from "../../../utility/skeletons/TableSkeleton";
import Pagination from "../../../utility/Pagination";
import EmptyState from "../../../utility/EmptyState";
import { Copy, Dot, ArrowUpRight } from "lucide-react";
import Avater from "../../../assets/Avater.jpg";
import {
  getProfileImageSrc,
  PROFILE_BG_TONES,
} from "../../../utility/profilePresets";
import { useAppToast } from "../../../utility/appToastContext";

const getStatusColor = (status) => {
  switch (String(status || "").trim().toLowerCase().replace(/\s+/g, "_")) {
    case "completed":
      return " text-brand-success";
    case "in_progress":
    return " text-brand-inprogress";
    case "rejected":
      return " text-brand-royalblue";
    case "paid":
      return " text-brand-sinfo";
    case "cancelled":
      return " text-brand-error";
    case "verified":
      return " text-brand-success";
    default:
      return " text-brand-info";
  }
};

const formatStatus = (status = "") => {
  return String(status || "").replace(/_/g, " ");
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

const Table = ({ openDetailsModal }) => {
  const {
    adminTransactionData,
    adminTransactionLoading,
    adminTransactionError,
    page,
    setSearchParams,
  } = useAdminDashboard();
  const { showToast } = useAppToast();

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > adminTransactionData?.pagination?.pages ||
      adminTransactionLoading
    )
      return;

    setSearchParams({ p: newPage });
  };

  const transactions = adminTransactionData?.data ?? [];

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast({
        type: "success",
        title: "Copied",
        subtitle: "Transaction ID copied to clipboard",
      });
    }).catch(err => console.error("Failed to copy text: ", err));
  };

  if (adminTransactionError) {
    return <p className="text-brand-red">Failed to load transactions</p>;
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
        {adminTransactionLoading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : !transactions.length ? (
          <EmptyState />
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="capitalize">
              <tr>
                <th className="p-3 font-medium text-sm text-brand-placeholder ">
                  Order Id
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder ">
                  Customer Name
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder ">
                  Network
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Amount
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Tx ID
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Submitted On
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder">
                  Status
                </th>
                <th className="p-3 font-medium text-sm text-brand-placeholder text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions?.map((transaction, index) => (
                <tr
                  key={transaction.id || transaction._id}
                  className="border-b border-brand-stroke hover:bg-brand-white transition-colors duration-200 row-animate"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-3 font-medium text-brand-body text-sm">
                    {transaction.orderId || transaction.order?._id || transaction.id || transaction._id}
                  </td>
                  <td className="p-3 font-light text-brand-body text-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-stroke ${getAvatarBgTone(transaction.customer)}`}
                      >
                        <img
                          src={getCustomerAvatarSrc(transaction.customer)}
                          alt={transaction.customer?.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span>{transaction.customer?.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    {transaction.network?.label}
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                  ${(Number.isFinite(Number(transaction.amountPaid))
                      ? Number(transaction.amountPaid)
                      : Number(transaction.amount ?? 0)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    <button
                      type="button"
                      onClick={() => handleCopy(transaction.txnUrl)}
                      className="flex items-center gap-1 w-max max-w-full transition-colors hover:text-brand-blue cursor-pointer"
                      title="Click to copy"
                    >
                      <span className="truncate max-w-[150px] sm:max-w-[200px]">
                        {transaction.txnUrl}
                      </span>
              <Copy size={14} className="shrink-0" />
                    </button>
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    {formatDate(transaction.submittedAt)}
                  </td>
                  <td className="p-3 text-brand-body font-light text-sm">
                    <span
                      className={`inline-flex capitalize items-center justify-center w-max pr-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                        transaction.displayStatus || transaction.status,
                      )}`}
                    >
                      <Dot size={24} className=" -mr-1" />
                      {formatStatus(transaction.displayStatus)}
                    </span>
                  </td>
                  <td className="p-3 text-right relative">
                    <button
                      onClick={() => openDetailsModal(transaction)}
                      className="inline-flex items-center gap-1 text-brand-blue text-sm font-semibold transition-all duration-200 hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-white rounded-sm"
                    >
                      View Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={adminTransactionData?.pagination?.pages}
        onPageChange={handlePageChange}
        loading={adminTransactionLoading}
      />
    </section>
  );
};

export default Table;
