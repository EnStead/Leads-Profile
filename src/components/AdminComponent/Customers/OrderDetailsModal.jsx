import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, X } from "lucide-react";
import { useAdminDashboard } from "../../../context/DashboardContext";
import Avater from "../../../assets/Avater.jpg";
import BlueUserIcon from "../../../assets/BlueUserIcon.svg";
import GlassUserIcon from "../../../assets/GlassUserIcon.svg";
import {
  getProfileImageSrc,
  PROFILE_BG_TONES,
} from "../../../utility/profilePresets";

const formatDate = (dateString) => {
  if (!dateString) return "Pending";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Pending";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMoney = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const formatStatus = (value = "") =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusTone = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "completed":
      return "text-brand-success";
    case "cancelled":
      return "text-brand-error";
    case "in_progress":
    case "in progress":
      return "text-brand-blue";
    default:
      return "text-brand-blackish";
  }
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

const CustomerStatCard = ({ label, value }) => (
  <div className="rounded-xl bg-brand-white px-4 py-3 shadow-sm">
    <p className="text-xs font-light text-brand-label">{label}</p>
    <p className="mt-1 text-lg font-semibold text-brand-blackish">{value}</p>
  </div>
);

const OrderDetailsModal = ({
  open,
  onOpenChange,
  order,
  onCreateOrder,
  onDeleteCustomer,
}) => {
  const {
    customerHistoryData,
    customerHistoryLoading,
    setSelectedCustomerHistoryId,
  } = useAdminDashboard();

  const historyData = customerHistoryData;
  const customer = historyData?.customer || order || null;
  const summary = historyData?.summary || {};
  const historyOrders = Array.isArray(historyData?.orders) ? historyData.orders : [];

  if (!order) return null;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setSelectedCustomerHistoryId("");
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[90vh] w-[min(1120px,96vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] bg-brand-sky shadow-[0_35px_90px_rgba(15,23,42,0.22)] focus:outline-none">
          <Dialog.Title className="sr-only">Customer Order History</Dialog.Title>
          <Dialog.Description className="sr-only">
            View customer details, account summary, and order history from the V2 API.
          </Dialog.Description>

          <Dialog.Close className="absolute right-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-white text-brand-blackish">
            <X size={20} />
          </Dialog.Close>

          <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_0.95fr]">
            <section className="overflow-y-auto hide-scrollbar px-8 py-8">
              <div className="pr-10">
                <h2 className="font-park text-3xl font-bold text-brand-blackish">
                  Order History
                </h2>
                <p className="mt-2 text-sm text-brand-body">
                  Manage this customer's orders and leads delivery here
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {customerHistoryLoading ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[#d6e1f1] bg-white px-6 py-10 text-center text-brand-label">
                    Loading customer history...
                  </div>
                ) : historyOrders.length ? (
                  historyOrders.map((historyItem) => (
                    <div
                      key={historyItem._id}
                      className="rounded-xl border border-brand-lightblue bg-brand-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-brand-body">
                            Order {historyItem.publicId || `#${historyItem._id?.slice(-6) || ""}`}
                          </h3>
                          <p className="mt-2 flex items-center text-sm font-light text-brand-body">
                            {formatStatus(historyItem.orderTypeLabel || historyItem.orderType || historyItem.targeting?.type)}
                            {" | "}
                            {Number(historyItem.filled ?? 0).toLocaleString()}/
                            {Number(historyItem.quantity ?? 0).toLocaleString()}
                            {" | "}
                            {historyItem.amount === null || historyItem.amount === undefined
                              ? "Pending"
                              : formatMoney(historyItem.amount, historyItem.currency)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className={`text-sm font-medium ${getStatusTone(historyItem.displayStatus || historyItem.status)}`}>
                            {formatStatus(historyItem.displayStatus || historyItem.status || "pending")}
                          </p>
                          <p className="mt-1 text-sm font-light text-brand-label">
                            {formatDate(historyItem.createdAt || historyItem.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-[#d6e1f1] bg-white px-6 py-10 text-center text-brand-label">
                    No order history yet for this customer.
                  </div>
                )}
              </div>
            </section>

            <aside className="relative m-2 overflow-hidden rounded-[1.5rem] bg-brand-lightblue px-5 py-6">
              <img
                src={BlueUserIcon}
                alt=""
                className="pointer-events-none absolute bottom-0 -left-3 h-44 w-44 object-contain"
              />
              <img
                src={GlassUserIcon}
                alt=""
                className="pointer-events-none absolute right-9 top-7 h-24 w-24 object-contain"
              />
              <div className="absolute inset-0 z-[1] rounded-xl bg-brand-lightblue/16 backdrop-blur-[10px]" />

              <div className="relative z-[1] flex h-full flex-col items-center justify-center">
                <h4 className="text-center text-lg font-park font-semibold text-brand-blackish">
                  Account Information
                </h4>

                <div className="mx-auto mt-15 w-full max-w-[380px] rounded-xl bg-brand-sky p-5 text-center">
                  <div className={`mx-auto -mt-18 inline-flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-brand-sky p-1 ${customer ? getAvatarBgTone(customer) : "bg-brand-sky"}`}>
                    <img
                      src={getCustomerAvatarSrc(customer)}
                      alt={customer?.name || order.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>

                  <h3 className="mt-4 font-park text-2xl font-semibold text-brand-blackish">
                    {customer?.name || order.name}
                  </h3>
                  <p className="mt-1 text-sm font-light text-brand-accent underline underline-offset-2">
                    {customer?.email || order.email}
                  </p>
                  <p className="mt-2 text-xs font-medium text-brand-blackish">
                    Joined on {formatDate(customer?.createdAt || order.createdAt || order.updatedAt)}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                    <CustomerStatCard
                      label="Total Orders"
                      value={Number(summary.totalOrders ?? order.totalOrders ?? 0).toLocaleString()}
                    />
                    <CustomerStatCard
                      label="Active Orders"
                      value={Number(summary.activeOrders ?? order.activeOrders ?? 0).toLocaleString()}
                    />
                    <CustomerStatCard
                      label="Total Leads Received"
                      value={Number(summary.totalLeadsReceived ?? order.totalLeadsReceived ?? 0).toLocaleString()}
                    />
                    <CustomerStatCard
                      label="Total Spent"
                      value={formatMoney(summary.totalSpent ?? order.totalSpent)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onCreateOrder?.(customer || order);
                    }}
                    className="group inline-flex items-center gap-4 rounded-full bg-brand-blue px-5 py-2 text-sm font-semibold text-brand-white shadow-soft"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-lightblue/70 p-1 text-brand-blue transition-transform duration-300 ease-in-out group-hover:rotate-90">
                      <Plus size={15} />
                    </span>
                    <span>Create Order</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onDeleteCustomer?.(customer || order);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-white px-6 py-2 font-semibold text-brand-error transition hover:bg-[#fff5f5]"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default OrderDetailsModal;
