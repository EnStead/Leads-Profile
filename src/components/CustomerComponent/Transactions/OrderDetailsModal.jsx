import * as Dialog from "@radix-ui/react-dialog";
import { Dot, X, ArrowUpRight } from "lucide-react";
import GreenTick from "../../../assets/GreenTick.svg";
import Reciept from "../../../assets/Reciept.png";
import { useClientDashboard } from "../../../context/DashboardContext";

const normalizeStatusValue = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const getStatusColor = (status) => {
  switch (normalizeStatusValue(status)) {
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

const toTitleCase = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (dateString, options) => {
  if (!dateString) return "Pending";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Pending";

  return date.toLocaleString(
    undefined,
    options || {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
};

const formatDateTime = (dateString) =>
  formatDate(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const formatMoney = (amount, currency = "USD") => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "Pending";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

const getBankNames = (summary, order, full = false) => {
  let banks = [];
  if (Array.isArray(summary?.bankNames) && summary.bankNames.length) {
    banks = summary.bankNames;
  } else if (
    Array.isArray(order?.targeting?.banks) &&
    order.targeting.banks.length
  ) {
    banks = order.targeting.banks;
  } else if (Array.isArray(order?.banks) && order.banks.length) {
    banks = order.banks;
  }

  if (!banks.length) return "-";
  if (full) return banks.join(", ");
  if (banks.length <= 2) return banks.join(", ");
  return `${banks.slice(0, 1).join(", ")} +${banks.length - 1}`;
};

const getTimelineLabel = (event) =>
  event?.displayTitle ||
  event?.title ||
  toTitleCase(event?.eventType || "Update");

const OrderDetailsModal = ({
  open,
  onOpenChange,
  order,
  openViewLeads,
  openAddModal,
}) => {
  const { orderHistoryData, orderHistoryLoading, setSelectedOrderHistoryId } =
    useClientDashboard();

  const historyOrder = orderHistoryData?.order || null;
  const summary = orderHistoryData?.summary || {};
  const timeline = Array.isArray(orderHistoryData?.timeline)
    ? [...orderHistoryData.timeline].sort((first, second) => {
        const firstTime = new Date(first?.createdAt || 0).getTime();
        const secondTime = new Date(second?.createdAt || 0).getTime();
        return secondTime - firstTime;
      })
    : [];
  const resolvedOrder = historyOrder || order || null;

  if (!resolvedOrder) return null;

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setSelectedOrderHistoryId("");
    }
    onOpenChange(nextOpen);
  };

  const handleViewLeads = (event) => {
    handleClose(false);
    openViewLeads?.(resolvedOrder, event);
  };

  const handleMakePayment = () => {
    const paymentOrder = {
      ...resolvedOrder,
      amountPaid:
        summary?.amountPaid ?? 
        resolvedOrder?.amountPaid ??
        resolvedOrder?.pricing?.amount ??
        resolvedOrder?.amount ??
        null,
      currency:
        summary?.currency ||
        resolvedOrder?.currency ||
        resolvedOrder?.pricing?.currency ||
        "USD",
      transactionUrl:
        summary?.transactionUrl || resolvedOrder?.transactionUrl || "",
    };

    handleClose(false);
    openAddModal?.(paymentOrder);
  };

  const quantity =
    summary?.totalLeadsRequested ??
    resolvedOrder?.totals?.requested ??
    resolvedOrder?.quantity ??
    0;
  const amount = summary?.amountPaid ?? resolvedOrder?.amountPaid ?? null;
  const currency = summary?.currency || resolvedOrder?.currency || "USD";
  const displayStatus =
    summary?.status ||
    resolvedOrder?.displayStatus ||
    resolvedOrder?.status ||
    "pending";
  const bankCriteria =
    summary?.bankCriteria ||
    resolvedOrder?.bankCriteria ||
    resolvedOrder?.targeting?.type ||
    "-";
  const deliveryType =
    summary?.deliveryType ||
    resolvedOrder?.deliveryType ||
    resolvedOrder?.deliveryScenario ||
    "-";
  const dailyQuantity =
    summary?.dailyQuantity ?? resolvedOrder?.dailyQuantity ?? "-";
  const transactionDate =
    summary?.transactionDate ||
    resolvedOrder?.transactionDate ||
    resolvedOrder?.updatedAt;
  const transactionUrl =
    summary?.transactionUrl || resolvedOrder?.transactionUrl || "-";
  const isAdminCreated =
    String(resolvedOrder?.createdBy || "").toLowerCase() === "admin" ||
    timeline.some((event) => event?.details?.adminCreated === true);

  const hasPaymentSubmitted = timeline.some(
    (event) =>
      String(event?.eventType || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_") === "payment_submitted"
  );

  const deliveryConfig = resolvedOrder?.deliveryConfig || {};
  const deliveryWindow = summary?.deliveryWindow || {};

  const summaryRows = [
    {
      label: "Order Date",
      value: formatDate(summary?.orderDate || resolvedOrder?.createdAt),
    },
    { label: "Bank Criteria", value: toTitleCase(bankCriteria) },
  ];

    // const criteriaLower = String(bankCriteria).toLowerCase();
    // if (!criteriaLower.includes("mixed") && !criteriaLower.includes("credit")) {
    //   summaryRows.push({
    //     label: "Bank Names",
    //     value: getBankNames(summary, resolvedOrder),
    //   });
    // }

    summaryRows.push({
      label: "Delivery Type",
      value: toTitleCase(deliveryType)
    });

  const normalizedDeliveryType = deliveryType.toLowerCase();

  if (normalizedDeliveryType === "staggered") {
    const startDay = deliveryWindow.startDay || deliveryConfig.startDay;
    const endDay = deliveryWindow.endDay || deliveryConfig.endDay;

    if (startDay && endDay) {
      summaryRows.push({
        label: "Delivery Days",
        value: `${toTitleCase(startDay).slice(0, 3)} - ${toTitleCase(endDay).slice(0, 3)}`,
      });
    }
  } else if (normalizedDeliveryType === "scheduled") {
    const weeks = deliveryWindow.weeks || deliveryConfig.weeks;

    if (weeks) {
      summaryRows.push({
        label: "Duration",
        value: `${weeks} Week${weeks > 1 ? "s" : ""}`,
      });
    }
  }

  if (normalizedDeliveryType !== "scheduled") {
    summaryRows.push({ label: "Daily Quantity", value: String(dailyQuantity ?? "-") });
  }
  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[3px]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[92vh] w-[min(1120px,96vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden hide-scrollbar rounded-[2rem] bg-brand-sky shadow-[0_30px_80px_rgba(15,23,42,0.22)] focus:outline-none">
          <Dialog.Title className="sr-only">Order Details</Dialog.Title>
          <Dialog.Description className="sr-only">
            Order status timeline and order summary.
          </Dialog.Description>

          <Dialog.Close className="absolute right-5 top-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-white text-brand-blackish shadow-sm transition hover:scale-[1.03]">
            <X size={24} />
          </Dialog.Close>

          <div className="grid h-full grid-cols-1 md:grid-cols-2">
            <section className="flex h-full flex-col overflow-hidden hide-scrollbar px-6 py-8 sm:px-8 md:px-10">
              <div className="pr-14">
                <h2 className="font-park text-2xl font-bold text-brand-blackish">
                  Order Status Timeline
                </h2>
                <p className="mt-2 text-sm font-light text-brand-body">
                  Manage your order activities here
                </p>
              </div>

              <div className="mt-8 min-h-0 flex-1 overflow-y-auto hide-scrollbar pr-2">
                {orderHistoryLoading && !timeline.length ? (
                  <div className="py-8 text-sm text-brand-label">
                    Loading order history...
                  </div>
                ) : timeline.length ? (
                  <div className="space-y-6">
                    {timeline.map((event, index) => {
                      const isLast = index === timeline.length - 1;
                      const eventType = String(event?.eventType || "")
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      const showMakePayment = [
                        "price_attached",
                        "pricing_set",
                        "price_set",
                      ].includes(eventType);
                      const showViewLeads =
                        [
                          "delivery_started"
                        ].includes(eventType);

                      const eventStr = String(event?.eventType || event?.title || event?.displayTitle).toLowerCase();
                      const isRejected = eventStr.includes("reject");
                      const isCreated = eventStr.includes("created");

                      let note = "";
                      let noteTone = "border-brand-stroke text-brand-body";

                      if (isRejected) {
                        note =
                          event.details?.reason ||
                          (event.details
                            ? Object.entries(event.details)
                                .map(([key, value]) => `${toTitleCase(key)}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
                                .join(" • ")
                            : "");
                        noteTone = "border border-brand-error p-2 rounded-lg bg-brand-white text-brand-blackish";
                      } else if (isCreated) {
                        const banks = getBankNames(summary, resolvedOrder, true);
                        if (banks && banks !== "-") {
                          note = `Bank Names: ${banks}`;
                          noteTone = "border border-brand-stroke p-2 rounded-lg bg-brand-offwhite text-brand-blackish";
                        }
                      }

                      return (
                        <div
                          key={
                            event._id ||
                            `${event.eventType}-${event.createdAt}-${index}`
                          }
                          className="relative flex gap-4"
                        >
                          <div className="relative flex w-7 shrink-0 justify-center">
                            <img
                              src={GreenTick}
                              alt=""
                              className="mt-1 h-[18px] w-[18px]"
                            />
                            {!isLast ? (
                              <span className="absolute top-7 h-[calc(100%+10px)] w-px bg-brand-lightblue" />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1 border-b border-transparent pb-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-light text-brand-label">
                                  {formatDateTime(event.createdAt)}
                                </p>
                                <p className="mt-1 font-park font-semibold leading-tight text-brand-blackish">
                                  {getTimelineLabel(event)}
                                </p>
                                {note ? (
                                  <div className={`mt-2 border-l-2 pl-2 text-[11px] leading-relaxed ${noteTone}`}>
                                    {note}
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex items-center gap-3 self-end">
                                {showMakePayment ? (
                                  <button
                                    type="button"
                                    onClick={handleMakePayment}
                                    disabled={hasPaymentSubmitted}
                                    className={`inline-flex rounded-full font-bold font-sans px-4 text-xs transition ${hasPaymentSubmitted ? "cursor-not-allowed opacity-50 text-brand-blue" : "text-brand-blue hover:opacity-90"}`}
                                  >
                                    Make Payment
                                  </button>
                                ) : null}

                                {showViewLeads ? (
                                  <button
                                    type="button"
                                    onClick={() => handleViewLeads(event)}
                                    className="inline-flex px-4 text-xs font-semibold text-brand-blackish transition hover:bg-brand-white"
                                  >
                                    View Leads
                                  </button>
                                ) : null}
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-1 text-sm text-brand-label">
                    No timeline events were returned for this order yet.
                  </div>
                )}
              </div>
            </section>

            <aside className="relative m-2 h-[calc(100%-16px)] overflow-y-auto overflow-x-hidden rounded-xl bg-brand-lightblue px-4 py-4 sm:px-4 hide-scrollbar">
              <div className="relative mx-auto flex min-h-full w-full max-w-[480px] items-center justify-center py-4">
                <div className="relative w-full">
                  <img
                    src={Reciept}
                    alt=""
                    className="pointer-events-none w-full h-auto object-contain drop-shadow-sm"
                  />

                  <div className="absolute inset-0 flex flex-col overflow-hidden px-[14%] pt-[20%] pb-[10%]">
                    <div className="pb-1">
                      <div className="flex items-center justify-between gap-1 sm:gap-2">
                        <h3 className="font-park font-bold text-black text-[13px] sm:text-base">
                        Order Summary
                      </h3>
                      <span
                        className={`inline-flex capitalize items-center justify-center w-max px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(displayStatus)}`}
                      >
                        <Dot size={18} className="-ml-1" />
                        {toTitleCase(displayStatus)}
                      </span>
                    </div>

                    <div className="mt-3 sm:mt-5 rounded-[12px] bg-brand-offwhite px-3 sm:px-5 py-3 sm:py-4 text-center">
                      <p className="text-[10px] font-medium text-brand-label">
                        Total Leads Requested
                      </p>
                      <p className="mt-1 sm:mt-2 text-base sm:text-lg font-bold text-brand-blackish">
                        {Number(quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="py-3 sm:py-4">
                    <div className="space-y-3 sm:space-y-4">
                      {summaryRows.map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr] items-start gap-2 text-xs sm:text-sm"
                        >
                          <span className="text-[11px] sm:text-xs text-brand-label">
                            {row.label}:
                          </span>
                          <span className="text-right text-xs sm:text-[12px] font-medium text-black">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-auto pb-2 sm:pb-4">
                    {!isAdminCreated ? (
                      <div className="mb-4 mt-3 sm:mb-6 space-y-2">
                        <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr] items-start gap-2 sm:gap-4">
                          <span className="text-[11px] sm:text-xs text-brand-label">
                            Amount Paid:
                          </span>
                          <span className="text-right text-xs sm:text-[12px] font-medium text-[#040A19]">
                            {formatMoney(amount, currency)}
                          </span>
                        </div>
                        <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr] items-start gap-2 sm:gap-4">
                          <span className="text-[11px] sm:text-xs text-brand-label">
                            Transaction Date:
                          </span>
                          <span className="text-right text-xs sm:text-[12px] font-medium text-[#040A19]">
                            {formatDate(transactionDate)}
                          </span>
                        </div>
                        <div className="grid grid-cols-[90px_minmax(0,1fr)] sm:grid-cols-[110px_minmax(0,1fr)] items-start gap-2 sm:gap-4">
                          <span className="text-[11px] sm:text-xs text-brand-label">
                            Transaction ID:
                          </span>
                          {transactionUrl === "-" ? (
                            <span className="text-right text-xs sm:text-[12px] font-medium text-[#040A19]">
                              -
                            </span>
                          ) : (
                            <span                             
                              className="block truncate text-right text-xs sm:text-[12px] font-medium text-[#040A19] transition-colors hover:text-brand-blue"
                              title={transactionUrl}
                            >
                              {transactionUrl}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="text-center text-[9px] sm:text-[10px] italic text-brand-placeholder">
                      Leads that you trust...
                    </div>
                  </div>
                </div>
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
