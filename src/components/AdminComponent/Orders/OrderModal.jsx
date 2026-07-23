import { useEffect, useMemo, useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Link,
  Pencil,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import ExpandableText from "../../../utility/ExpandableText";
import { useAdminAuth } from "../../../context/AdminContext";
import { useAdminDashboard } from "../../../context/DashboardContext";
import {
  approveAdminOrderPayment,
  deleteAdminOrder,
  fetchCustomerOrderLeadsByDay,
  recallAdminOrder,
  setAdminOrderPrice,
  truncateAdminOrder,
  rejectAdminOrderPayment,
} from "../../../context/dashboardApi";
import GreenTick from "../../../assets/GreenTick.svg";
import Reciept from "../../../assets/AdminRec.png";
import Avater from "../../../assets/Avater.jpg";
import UsaFlag from "../../../assets/usa.webp";
import CanadaFlag from "../../../assets/canada.png";
import {
  getProfileImageSrc,
  PROFILE_BG_TONES,
} from "../../../utility/profilePresets";
import { useAppToast } from "../../../utility/appToastContext";

const normalizeStatus = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

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

const formatSource = (value) => (value ? toTitleCase(value) : "-");

const formatCountry = (order) => {
  const country = String(
    order?.country ||
      order?.countryPool ||
      order?.countryCode ||
      order?.deliveryCountry ||
      "",
  )
    .trim()
    .toLowerCase();

  if (country.includes("canada") || country === "ca") {
    return { label: "Canada", flag: CanadaFlag };
  }

  return { label: "United States", flag: UsaFlag };
};

const getCreatedByLabel = (order, timeline = []) => {
  const createdByRole = normalizeStatus(
    order?.createdBy?.role ||
      order?.createdByRole ||
      order?.createdByType ||
      order?.source,
  );
  const createdById = String(
    order?.createdBy?._id || order?.createdBy || "",
  );
  const customerId = String(
    order?.client?._id || order?.customer || order?.clientUserId || "",
  );

  if (
    order?.adminCreated ||
    order?.createdByAdmin ||
    createdByRole === "admin" ||
    (createdById && customerId && createdById !== customerId)
  ) {
    return "Admin";
  }

  if (Array.isArray(timeline) && timeline.length > 0) {
    const createEvent = timeline.find(
      (t) => t.eventType === "order_created" || t.eventType === "order_created_admin"
    );
    if (createEvent) {
      if (
        createEvent.actorType === "admin" ||
        createEvent.details?.adminCreated ||
        createEvent.details?.createdByAdmin
      ) {
        return "Admin";
      }
    }
  }

  return "Customer";
};

const getFinalOrderStatus = (order) => {
  const explicitStatus = normalizeStatus(order?.status || order?.orderStatus);
  if (explicitStatus) return explicitStatus;

  const fulfillmentStatus = normalizeStatus(order?.fulfillmentStatus);
  if (["fulfilled", "completed", "delivered"].includes(fulfillmentStatus)) {
    return "completed";
  }
  if (["partially_fulfilled", "in_progress", "in_delivery"].includes(fulfillmentStatus)) {
    return "in_progress";
  }

  const approvalStatus = normalizeStatus(order?.approvalStatus);
  if (["approved", "processing"].includes(approvalStatus)) {
    return "processing";
  }
  if (["rejected", "cancelled", "canceled"].includes(approvalStatus)) {
    return "cancelled";
  }

  const paymentStatus = normalizeStatus(order?.paymentStatus);
  if (["verified", "confirmed", "paid", "completed"].includes(paymentStatus)) {
    return "paid";
  }

  return "pending";
};

const getStatusTone = (status) => {
  switch (normalizeStatus(status)) {
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

const getBankNames = (order, full = false) => {
  let banks = [];
  if (Array.isArray(order?.targeting?.banks) && order.targeting.banks.length) {
    banks = order.targeting.banks;
  } else if (Array.isArray(order?.banks) && order.banks.length) {
    banks = order.banks;
  }

  if (!banks.length) return "-";
  if (full) return banks.join(", ");
  if (banks.length === 1) return banks[0];
  return `${banks[0]} +${banks.length - 1}`;
};

const getBankNamesFromSummary = (summary, full = false) => {
  if (Array.isArray(summary?.bankNames) && summary.bankNames.length) {
    const banks = summary.bankNames;
    if (full) return banks.join(", ");
    if (banks.length === 1) return banks[0];
    return `${banks[0]} +${banks.length - 1}`;
  }

  return null;
};

const getCustomerActivity = (order, timeline = []) => {
  const hasOpenedEvent = timeline.some((t) => t.eventType === "order_opened");
  const hasDownloadedEvent = timeline.some(
    (t) => t.eventType === "order_downloaded" || t.eventType === "delivery_downloaded"
  );

  return {
    opened:
      order?.hasOpened ||
      order?.opened ||
      order?.customerOpened ||
      hasOpenedEvent ||
      false,
    openedAt:
      order?.openedAt ??
      order?.openedTime ??
      order?.customerOpenedAt ??
      null,
    downloaded:
      order?.hasDownloaded ||
      order?.downloaded ||
      order?.customerDownloaded ||
      hasDownloadedEvent ||
      false,
    downloadedAt:
      order?.downloadedAt ??
      order?.downloadedTime ??
      order?.customerDownloadedAt ??
      null,
    downloadCount:
      order?.downloadCount ??
      order?.downloads ??
      order?.customerDownloadCount ??
      0,
  };
};

const getReceiptInfo = (order) => ({
  transactionUrl:
    order?.transactionUrl ??
    order?.paymentLink ??
    order?.receiptUrl ??
    order?.paymentReceiptUrl ??
    null,
  receiptName:
    order?.receiptName ??
    order?.paymentReceiptName ??
    order?.proofOfPaymentName ??
    null,
  receiptUrl:
    order?.receiptUrl ??
    order?.paymentReceiptUrl ??
    order?.proofOfPaymentUrl ??
    null,
});

const getProofLink = (receiptInfo) =>
  receiptInfo.transactionUrl || receiptInfo.receiptUrl || null;

const shouldShowViewProof = (item) => {
  const eventKey = normalizeStatus(
    item?.eventType || item?.title || item?.displayTitle,
  );

  return eventKey === "payment_submitted";
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

const canRecallOrder = (order, timeline = []) => {
  const customerActivity = getCustomerActivity(order, timeline);
  return (
    getCreatedByLabel(order, timeline) === "Admin" &&
    !customerActivity.opened &&
    !customerActivity.downloaded
  );
};

const getTimelineItems = (order, timeline = []) => {
  const status = getFinalOrderStatus(order);
  const createdBy = getCreatedByLabel(order, timeline);
  const rejectionReason =
    order?.rejectionReason || order?.cancelReason || order?.reason || "";
  const banks = getBankNames(order, true);

  const items = [
    {
      key: "created",
      title: `Order Created by ${createdBy}`,
      timestamp: order?.createdAt,
      reached: true,
      note: banks !== "-" ? `Bank Names: ${banks}` : "",
      noteTone: "border border-brand-stroke p-2 rounded-lg bg-brand-offwhite text-brand-blackish",
    },
  ];

  if (["paid", "processing", "in_progress", "completed"].includes(status)) {
    items.push({
      key: "paid",
      title: "Payment Confirmed",
      timestamp: order?.paymentConfirmedAt || order?.updatedAt,
      reached: true,
    });
  }

  if (["processing", "in_progress", "completed"].includes(status)) {
    items.push({
      key: "processing",
      title: "Order Approved for Delivery",
      timestamp: order?.approvedAt || order?.updatedAt,
      reached: true,
    });
  }

  if (["in_progress", "completed"].includes(status)) {
    items.push({
      key: "in-progress",
      title: "Order In Progress",
      timestamp: order?.startedAt || order?.updatedAt,
      reached: true,
    });
  }

  if (status === "completed") {
    items.push({
      key: "completed",
      title: "Order Completed",
      timestamp: order?.completedAt || order?.updatedAt,
      reached: true,
    });
  }

  if (status === "cancelled") {
    items.unshift({
      key: "cancelled",
      title: "Order Rejected",
      timestamp: order?.cancelledAt || order?.updatedAt,
      reached: true,
      note: rejectionReason,
      noteTone: "border-brand-error text-brand-body",
    });
  }

  return items.reverse();
};

const getActionButtons = (status, order, summary, timeline, { onEdit, openDialog }) => {
  const recallAllowed = canRecallOrder(order, timeline);
  const adminCreated = getCreatedByLabel(order, timeline) === "Admin";
  const hasPrice = order?.pricing?.amount != null || order?.amount != null || summary?.amountPaid != null;
  const fulfillmentStarted = 
    Number(order?.filled ?? order?.totals?.delivered ?? order?.delivered ?? 0) > 0 ||
    ["in_progress", "partially_fulfilled", "fulfilled", "completed", "in_delivery"].includes(normalizeStatus(order?.fulfillmentStatus));

  switch (status) {
    case "pending":
      if (hasPrice) {
        return [
          {
            key: "delete",
            label: "Delete",
            variant: "dangerGhost",
            icon: <Trash2 size={16} />,
            onClick: () => openDialog("delete"),
          },
        ];
      }
      return [
        {
          key: "set-price",
          label: "Accept order",
          variant: "dark",
          icon: <ThumbsUp size={16} />,
          onClick: () => openDialog("setPricing"),
        },
        {
          key: "reject",
          label: "Reject Order",
          variant: "dangerSolid",
          icon: <ThumbsDown size={16} />,
          onClick: () => openDialog("reject"),
        },
      ];
    case "paid":
      return [
        ...(!adminCreated
          ? [
              {
                key: "approve",
                label: "Approve Order",
                variant: "primary",
                icon: <UserRoundCheck size={16} />,
                onClick: () => openDialog("approve"),
              },
            ]
          : []),
        {
          key: "delete",
          label: "Delete",
          variant: "dangerGhost",
          icon: <Trash2 size={16} />,
          onClick: () => openDialog("delete"),
        },
      ];
    case "processing":
        const showEdit = adminCreated && !fulfillmentStarted;
        const showRecall = recallAllowed;
      return [
          ...(showEdit
          ? [
              {
                key: "edit",
                label: "Edit Order",
                variant: "primary",
                icon: <Pencil size={16} />,
                onClick: onEdit,
              },
            ]
          : []),
          ...(!(showEdit && showRecall)
            ? [
                {
                  key: "delete",
                  label: "Delete",
                  variant: "dangerGhost",
                  icon: <Trash2 size={16} />,
                  onClick: () => openDialog("delete"),
                },
              ]
            : []),
          ...(showRecall
          ? [
              {
                key: "recall",
                label: "Recall Order",
                variant: "ghost",
                icon: <Copy size={16} />,
                onClick: () => openDialog("recall"),
              },
            ]
          : []),
      ];
    case "in_progress":
    case "in_delivery":
      if (recallAllowed) {
        return [
          {
            key: "recall",
            label: "Recall Order",
            variant: "ghost",
            icon: <Copy size={16} />,
            onClick: () => openDialog("recall"),
          },
        ];
      }
      break;

    case "completed":
    case "delivered":
    case "fulfilled":
      if (recallAllowed) {
        return [
          {
            key: "recall",
            label: "Recall Order",
            variant: "ghost",
            icon: <Copy size={16} />,
            onClick: () => openDialog("recall"),
          },
        ];
      }
      return [];
    case "cancelled":
      return [];
    default:
      return [];
  }

  return [];
};

const ActionDialog = ({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  actionTone = "primary",
  onAction,
  actionDisabled = false,
  actionLoading = false,
  children,
}) => {
  const { showToast } = useAppToast();
  const actionClass =
    actionTone === "danger"
      ? "bg-brand-error text-brand-white"
      : actionTone === "warning"
      ? "bg-brand-info text-brand-white"
      : actionTone === "dark"
      ? "bg-brand-blackish text-brand-white"
      : "bg-brand-blue text-brand-white";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/25 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[1.8rem] bg-brand-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.18)] focus:outline-none">
          <Dialog.Close className="absolute right-6 top-6 text-brand-blackish">
            <X size={22} />
          </Dialog.Close>
          <Dialog.Title className="font-park text-lg font-bold text-brand-blackish">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-4 text-sm leading-7 text-brand-body">
            {description}
          </Dialog.Description>
          {children ? <div className="mt-6">{children}</div> : null}
          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-brand-label px-8 py-3 font-semibold text-brand-label"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await onAction?.();
                  onOpenChange(false);
                } catch (error) {
                  console.error(error);
                  showToast({
                    type: "error",
                    title: "Action failed",
                    subtitle: error?.response?.data?.message || error?.message || "Something went wrong. Please try again.",
                  });
                }
              }}
              disabled={actionDisabled || actionLoading}
              className={`rounded-xl w-100 px-8 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${actionClass}`}
            >
              {actionLoading ? "Saving..." : actionLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const OrderModal = ({ open, onOpenChange, order, onEdit, initialAction = null }) => {
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const {
    adminOrderHistoryData,
    adminOrderHistoryLoading,
    adminOrderHistoryError,
    allCustomersForOrderData,
    refetchadminOrder,
    refetchAdminOrderHistory,
    setSelectedAdminOrderHistoryId,
  } = useAdminDashboard();
  const { showToast } = useAppToast();
  const [downloadingId, setDownloadingId] = useState(null);
  const [activeDialog, setActiveDialog] = useState(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isSettingPrice, setIsSettingPrice] = useState(false);
  const [isApprovingPayment, setIsApprovingPayment] = useState(false);
  const [isRejectingPayment, setIsRejectingPayment] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [isTruncatingOrder, setIsTruncatingOrder] = useState(false);
  const [isRecallingOrder, setIsRecallingOrder] = useState(false);
  const [recallTargetCustomerId, setRecallTargetCustomerId] = useState("");
  const [recallAcknowledged, setRecallAcknowledged] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isRecallSelectOpen, setIsRecallSelectOpen] = useState(false);
  const recallSearchInputRef = useRef(null);
  const recallDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        recallDropdownRef.current &&
        !recallDropdownRef.current.contains(event.target)
      ) {
        setIsRecallSelectOpen(false);
      }
    };

    if (isRecallSelectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      const timeoutId = setTimeout(() => {
        recallSearchInputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    } else {
      setCustomerSearch("");
    }
  }, [isRecallSelectOpen]);

  useEffect(() => {
    if (!open) {
      setActiveDialog(null);
      return;
    }
    setActiveDialog(initialAction);
  }, [open, initialAction]);

  useEffect(() => {
    if (activeDialog !== "recall") {
      setRecallTargetCustomerId("");
      setRecallAcknowledged(false);
    }
  }, [activeDialog]);

  const historyOrder = adminOrderHistoryData?.order || null;
  const historySummary = adminOrderHistoryData?.summary || {};
  const historyTimeline = Array.isArray(adminOrderHistoryData?.timeline)
    ? adminOrderHistoryData.timeline
    : [];
  const sourceOrder = historyOrder || order;
  const actionSourceOrder = {
    ...(historyOrder || {}),
    ...(order || {}),
    targeting: historyOrder?.targeting ?? order?.targeting,
    deliveryConfig: historyOrder?.deliveryConfig ?? order?.deliveryConfig,
    deliveryScenario: historyOrder?.deliveryScenario ?? order?.deliveryScenario,
    customer: order?.customer ?? historyOrder?.customer,
    client: order?.client ?? historyOrder?.client,
    customerId:
      order?.customerId ??
      (typeof order?.customer === "string" ? order.customer : null) ??
      historyOrder?.customerId ??
      (typeof historyOrder?.customer === "string" ? historyOrder.customer : null),
    clientUserId:
      order?.clientUserId ??
      historyOrder?.clientUserId ??
      (typeof order?.client === "string" ? order.client : null) ??
      (typeof historyOrder?.client === "string" ? historyOrder.client : null),
  };
  const customerObj =
    order?.customer ||
    order?.client ||
    sourceOrder?.customer ||
    sourceOrder?.client ||
    (order?.customerName || order?.clientName || sourceOrder?.customerName || sourceOrder?.clientName
      ? {
          name:
            order?.customerName ||
            order?.clientName ||
            sourceOrder?.customerName ||
            sourceOrder?.clientName ||
            "Unknown Customer",
          email:
            order?.customerEmail ||
            order?.clientEmail ||
            sourceOrder?.customerEmail ||
            sourceOrder?.clientEmail ||
            "",
        }
      : {});

  const status =
    normalizeStatus(historySummary?.status) || getFinalOrderStatus(sourceOrder);
  const availableCustomers = Array.isArray(allCustomersForOrderData?.data)
    ? allCustomersForOrderData.data
    : [];
  const currentCustomerId = String(
    actionSourceOrder?.customerId ||
      actionSourceOrder?.clientUserId ||
      actionSourceOrder?.customer?._id ||
      actionSourceOrder?.customer?.id ||
      (typeof actionSourceOrder?.customer === "string"
        ? actionSourceOrder.customer
        : "") ||
      actionSourceOrder?.client?._id ||
      actionSourceOrder?.client?.id ||
      (typeof actionSourceOrder?.client === "string" ? actionSourceOrder.client : ""),
  ).trim();
  const recallCustomerOptions = availableCustomers.filter(
    (entry) => String(entry?._id || entry?.id || "").trim() !== currentCustomerId,
  );

  const filteredRecallOptions = useMemo(() => {
    if (!customerSearch) return recallCustomerOptions;
    return recallCustomerOptions.filter((customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()),
    );
  }, [recallCustomerOptions, customerSearch]);
  const quantity = Number(
    historySummary?.totalLeadsRequested ??
      sourceOrder?.quantity ??
      sourceOrder?.totals?.requested ??
      0,
  );
  const country = formatCountry(sourceOrder);
  const customerActivity = getCustomerActivity(sourceOrder, historyTimeline);
  const deliveredCount = Number(
    sourceOrder?.filled ??
      sourceOrder?.totals?.delivered ??
      sourceOrder?.delivered ??
      0,
  );
  const receiptInfo = getReceiptInfo(historySummary?.transactionUrl ? historySummary : sourceOrder);
  const proofUrl = getProofLink(receiptInfo);
  const handleViewProof = () => {
    onOpenChange(false);
    navigate("/admin/history");
  };
  const timelineItems = historyTimeline.length
    ? historyTimeline.map((item) => {
        const eventStr = normalizeStatus(
          item.eventType || item.title || item.displayTitle
        );
        const isRejected = eventStr.includes("reject");
        const isCreated = eventStr.includes("created");

        let note = "";
        let noteTone = "border-brand-stroke text-brand-body";

        if (isRejected) {
          note =
            item.details?.reason ||
            (item.details
              ? Object.entries(item.details)
                  .map(([key, value]) => `${toTitleCase(key)}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
                  .join(" • ")
              : "");
          noteTone = "border border-brand-error p-2 rounded-lg bg-brand-white text-brand-blackish";
        } else if (isCreated) {
          const banks = getBankNamesFromSummary(historySummary, true) || getBankNames(sourceOrder, true);
          if (banks && banks !== "-") {
            note = `Bank Names: ${banks}`;
            noteTone = "border border-brand-stroke p-2 rounded-lg bg-brand-offwhite text-brand-blackish";
          }
        }

        return {
          key: item._id || item.id || `${item.eventType}-${item.createdAt}`,
          title: item.displayTitle || item.title || toTitleCase(item.eventType),
          timestamp: item.createdAt,
          reached: true,
          note,
          noteTone,
          originalItem: item,
        };
      })
    : getTimelineItems(sourceOrder, historyTimeline);
  const actions = getActionButtons(status, actionSourceOrder, historySummary, historyTimeline, {
    onEdit: () => onEdit?.(actionSourceOrder),
    onDownload: () => handleDownloadCSV(),
    onViewLeads: () => setActiveDialog("viewLeads"),
    openDialog: setActiveDialog,
  }) || [];

  const bankCriteria = historySummary?.bankCriteria || sourceOrder?.orderType || sourceOrder?.targeting?.type || "-";
  const deliveryType = historySummary?.deliveryType || sourceOrder?.deliveryScenario || sourceOrder?.deliveryType || "standard";

  const summaryRows = [
    { label: "Order Date", value: formatDate(historySummary?.orderDate || sourceOrder?.createdAt) },
    {
      label: "Customer Name",
      value: (
        <span className="inline-flex items-center gap-2">
          <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-stroke ${getAvatarBgTone(customerObj)}`}>
            <img
              src={getCustomerAvatarSrc(customerObj)}
              alt={customerObj.name || "Unknown Customer"}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="truncate max-w-[80px]" title={customerObj.name || "Unknown Customer"}>
            {customerObj.name || "Unknown Customer"}
          </span>
        </span>
      ),
    },
    {
      label: "Country Pool",
      value: (
        <span className="inline-flex items-center gap-2">
          <img src={country.flag} alt={country.label} className="h-3 w-3 rounded-full object-cover" />
          <span>{country.label}</span>
        </span>
      ),
    },
    {
      label: "Bank Criteria",
      value: formatSource(bankCriteria),
    },
  ];

  // const criteriaLower = String(bankCriteria).toLowerCase();
  // if (!criteriaLower.includes("mixed") && !criteriaLower.includes("credit")) {
  //   summaryRows.push({
  //     label: "Bank Names",
  //     value: (
  //       <ExpandableText
  //         text={getBankNamesFromSummary(historySummary) || getBankNames(sourceOrder)}
  //         maxLength={8}
  //       />
  //     ),
  //   });
  // }

  summaryRows.push({
    label: "Delivery Type",
    value: formatSource(deliveryType),
  });

  const normalizedDeliveryType = String(deliveryType).toLowerCase();
  if (normalizedDeliveryType === "staggered") {
    const deliveryConfig = sourceOrder?.deliveryConfig || {};
    const deliveryWindow = historySummary?.deliveryWindow || {};
    const startDay = deliveryWindow.startDay || deliveryConfig.startDay;
    const endDay = deliveryWindow.endDay || deliveryConfig.endDay;

    if (startDay && endDay) {
      summaryRows.push({
        label: "Delivery Days",
        value: `${toTitleCase(startDay).slice(0, 3)} - ${toTitleCase(endDay).slice(0, 3)}`,
      });
    }
  } else if (normalizedDeliveryType === "scheduled") {
    const deliveryConfig = sourceOrder?.deliveryConfig || {};
    const deliveryWindow = historySummary?.deliveryWindow || {};
    const weeks = deliveryWindow.weeks || deliveryConfig.weeks;

    if (weeks) {
      summaryRows.push({
        label: "Duration",
        value: `${weeks} Week${weeks > 1 ? "s" : ""}`,
      });
    }
  }

  if (normalizedDeliveryType !== "scheduled") {
    summaryRows.push({
      label: "Daily Quantity",
      value: `${Number(
        historySummary?.dailyQuantity ??
          sourceOrder?.dailyQuantity ??
          sourceOrder?.perDay ??
          sourceOrder?.deliveryConfig?.leadsPerDay,
      ).toLocaleString()} Leads`,
    });
  }

  async function handleDownloadCSV(item = null) {
    const parentOrderId =
      actionSourceOrder?._id || actionSourceOrder?.id || order?._id || order?.id;

    if (!parentOrderId) return;

    try {
      setDownloadingId(item ? item.key : "all");

      const dailyRows = Array.isArray(actionSourceOrder?.daily)
        ? actionSourceOrder.daily
        : Array.isArray(order?.daily)
          ? order.daily
          : [];

      const selectedDaily = (() => {
        if (item?.originalItem?.details) {
          const itemDetails = item.originalItem.details;
          const targetDeliveryDate = itemDetails?.deliveryDate
            ? String(itemDetails.deliveryDate).slice(0, 10)
            : null;
          const targetWeekday = normalizeStatus(itemDetails?.weekday || "");

          const matchedDay = dailyRows.find((day) => {
            const dayDeliveryDate = day?.deliveryDate
              ? String(day.deliveryDate).slice(0, 10)
              : null;
            const dayWeekday = normalizeStatus(day?.weekday || "");

            return (
              (targetDeliveryDate && dayDeliveryDate === targetDeliveryDate) ||
              (targetWeekday && dayWeekday === targetWeekday)
            );
          });

          if (matchedDay) return matchedDay;
        }

        return dailyRows[0] || null;
      })();

      const dayId = selectedDaily?._id || selectedDaily?.id;

      if (!dayId) {
        throw new Error("Missing day id");
      }

      const firstPage = await fetchCustomerOrderLeadsByDay(
        user?.token,
        parentOrderId,
        dayId,
        1,
        100,
      );

      const pageCount = Number(firstPage?.pagination?.pages || 1);
      const leads = Array.isArray(firstPage?.data) ? [...firstPage.data] : [];

      for (let page = 2; page <= pageCount; page += 1) {
        const nextPage = await fetchCustomerOrderLeadsByDay(
          user?.token,
          parentOrderId,
          dayId,
          page,
          100,
        );
        if (Array.isArray(nextPage?.data) && nextPage.data.length) {
          leads.push(...nextPage.data);
        }
      }

      if (!leads.length) {
        showToast({
          type: "error",
          title: "No Leads",
          subtitle: "No leads available for this order.",
        });
        return;
      }

      const headers = [
        "Date & Time",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "City",
        "State",
        "Zip",
        "Bank",
        "Loan Amount",
        "Birthday",
        "Address",
      ];

      const rows = leads.map((lead) =>
        [
          lead.dateTime,
          lead.firstName,
          lead.lastName,
          lead.email,
          lead.phone,
          lead.city,
          lead.state,
          lead.zipCode,
          lead.bankName,
          lead.loanAmount,
          lead.birthday,
          lead.address,
        ]
          .map((value) => `"${value ?? ""}"`)
          .join(","),
      );

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      
      const suffix = selectedDaily?.weekday
        ? `-${String(selectedDaily.weekday).toLowerCase()}`
        : "";
      link.download = `order-${order.customId || parentOrderId}${suffix}-leads.csv`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("CSV download failed:", error);
      showToast({
        type: "error",
        title: "Download Failed",
        subtitle: "Failed to download CSV.",
      });
    } finally {
      setDownloadingId(null);
    }
  }

  const handleSetPrice = async () => {
    const amount = Number(String(priceDraft).replace(/[^0-9.]/g, ""));
    const orderId = actionSourceOrder?._id || actionSourceOrder?.id || order?._id || order?.id;

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Please enter a valid amount greater than 0.");
    }

    if (!orderId) {
      throw new Error("Missing order id");
    }

    setIsSettingPrice(true);
    try {
      await setAdminOrderPrice(user?.token, orderId, {
        amount,
        currency: "USD",
      });
      setPriceDraft("");
      await refetchadminOrder?.();
      await refetchAdminOrderHistory?.();
      showToast({
        type: "success",
        title: "Price Set",
        subtitle: "Pricing has been set successfully.",
      });
    } catch (error) {
      throw error;
    } finally {
      setIsSettingPrice(false);
    }
  };

  const handleApprovePayment = async () => {
    const orderId = actionSourceOrder?._id || actionSourceOrder?.id || order?._id || order?.id;

    if (!orderId) {
      throw new Error("Missing order id");
    }

    setIsApprovingPayment(true);
    try {
      await approveAdminOrderPayment(user?.token, orderId);
      await refetchadminOrder?.();
      await refetchAdminOrderHistory?.();
      showToast({
        type: "success",
        title: "Order Approved",
        subtitle: "The order has been approved successfully.",
      });
    } catch (error) {
      throw error;
    } finally {
      setIsApprovingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    const orderId = actionSourceOrder?._id || actionSourceOrder?.id || order?._id || order?.id;
    const reason = String(rejectReason || "").trim();

    if (!reason) {
      throw new Error("Please provide a reason for rejecting this order.");
    }

    if (!orderId) {
      throw new Error("Missing order id");
    }

    setIsRejectingPayment(true);
    try {
      await rejectAdminOrderPayment(user?.token, orderId, { reason });
      setRejectReason("");
      await refetchadminOrder?.();
      await refetchAdminOrderHistory?.();
      showToast({
        type: "success",
        title: "Order Rejected",
        subtitle: "The order has been rejected successfully.",
      });
    } catch (error) {
      throw error;
    } finally {
      setIsRejectingPayment(false);
    }
  };

  const handleDeleteOrder = async () => {
    const orderId = actionSourceOrder?._id || actionSourceOrder?.id || order?._id || order?.id;

    if (!orderId) {
      throw new Error("Missing order id");
    }

    setIsDeletingOrder(true);
    try {
      await deleteAdminOrder(user?.token, orderId);
      setSelectedAdminOrderHistoryId("");
      await refetchadminOrder?.();
      onOpenChange(false);
      showToast({
        type: "success",
        title: "Order Deleted",
        subtitle: "The order has been deleted successfully.",
      });
    } catch (error) {
      throw error;
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const handleTruncateOrder = async () => {
    const orderId = actionSourceOrder?._id || actionSourceOrder?.id || order?._id || order?.id;

    if (!orderId) {
      throw new Error("Missing order id");
    }

    setIsTruncatingOrder(true);
    try {
      await truncateAdminOrder(user?.token, orderId);
      await refetchadminOrder?.();
      await refetchAdminOrderHistory?.();
      setActiveDialog(null);
      showToast({
        type: "success",
        title: "Order Truncated",
        subtitle: "The order has been truncated successfully.",
      });
    } catch (error) {
      throw error;
    } finally {
      setIsTruncatingOrder(false);
    }
  };

  const handleRecallOrder = async () => {
    const orderId = actionSourceOrder?._id || actionSourceOrder?.id || order?._id || order?.id;

    if (!orderId) {
      throw new Error("Missing order id");
    }
    if (!recallTargetCustomerId) {
      throw new Error("Select a customer to reassign this order to.");
    }

    setIsRecallingOrder(true);
    try {
      await recallAdminOrder(user?.token, orderId, {
        targetCustomerId: recallTargetCustomerId,
      });
      await refetchadminOrder?.();
      await refetchAdminOrderHistory?.();
      setActiveDialog(null);
      showToast({
        type: "success",
        title: "Order Reassigned",
        subtitle: "The order has been reassigned successfully.",
      });
    } catch (error) {
      throw error;
    } finally {
      setIsRecallingOrder(false);
    }
  };

  const renderActionButton = (action) => {
    const className =
      action.variant === "dangerSolid"
        ? "bg-brand-error text-brand-white"
        : action.variant === "dangerGhost"
        ? "bg-brand-white text-brand-red"
        : action.variant === "dark"
        ? "bg-brand-blackish text-brand-white"
        : action.variant === "ghost"
        ? "bg-brand-white text-brand-blackish"
        : "bg-brand-blue text-brand-white";

    return (
      <button
        key={action.key}
        type="button"
        onClick={action.onClick}
        disabled={action.key === "download" && downloadingId === "all"}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold shadow-sm transition hover:opacity-90 ${className}`}
      >
        {action.icon}
        {action.key === "download" && downloadingId === "all" ? "Downloading..." : action.label}
      </button>
    );
  };

  if (!order) return null;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[3px]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[92vh] w-[min(1180px,96vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] bg-brand-sky shadow-[0_30px_80px_rgba(15,23,42,0.22)] focus:outline-none">
            <Dialog.Title className="sr-only">Admin Order Timeline</Dialog.Title>
            <Dialog.Description className="sr-only">
              Admin order timeline, receipt summary, customer activity, and actions.
            </Dialog.Description>

            <Dialog.Close className="absolute right-5 top-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-white text-brand-blackish shadow-sm transition hover:scale-[1.03]">
              <X size={24} />
            </Dialog.Close>

            <div className="grid h-full grid-cols-1 overflow-y-auto md:grid-cols-[1fr_1.02fr] md:overflow-hidden">
              <section className="flex flex-col bg-brand-sky px-8 py-8 md:h-full md:overflow-hidden md:px-10">
                <div className="pr-10">
                  <h2 className="font-park text-2xl font-bold text-brand-blackish">
                    Order Status Timeline
                  </h2>
                  <p className="mt-2 text-sm font-light text-brand-body">
                    Manage your order activities here
                  </p>
                </div>

                <div className="mt-8 min-h-0 flex-1 overflow-y-auto hide-scrollbar pr-2">
                  <div className="space-y-6">
                    {adminOrderHistoryLoading ? (
                      <p className="text-sm text-brand-body">Loading timeline...</p>
                    ) : adminOrderHistoryError ? (
                      <p className="text-sm text-brand-error">Failed to load timeline.</p>
                    ) : timelineItems.map((item, index) => {
                      const isLast = index === timelineItems.length - 1;
                      return (
                        <div key={item.key} className="relative flex gap-4">
                          <div className="relative flex w-8 shrink-0 justify-center">
                            <img src={GreenTick} alt="" className="mt-1 h-[18px] w-[18px]" />
                            {!isLast ? (
                              <span className="absolute top-7 h-[calc(100%+10px)] w-px bg-brand-lightblue" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1 pb-1">
                            <p className="text-xs font-light text-brand-label">
                              {formatDateTime(item.timestamp)}
                            </p>
                            <div>
                            <div className="mt-1 flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <p className="font-park font-semibold text-brand-blackish">
                                  {item.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 self-end">
                                {item.originalItem?.eventType === "delivery_started" || ["in_delivery", "partially_fulfilled"].includes(item.originalItem?.details?.fulfillmentStatus) ? (
                                  (() => {
                                    const isEnded = historyTimeline.some((i) =>
                                      i.eventType === "order_completed" ||
                                      ((i.eventType === "delivery_completed" || i.eventType === "delivery_truncated") &&
                                      i.details?.deliveryDate === item.originalItem?.details?.deliveryDate)
                                    );
                                    return (
                                      <>
                                    <button
                                      type="button"
                                      onClick={() => setActiveDialog("truncate")}
                                      disabled={isEnded}
                                      className="inline-flex shrink-0 font-sans items-center rounded-full px-1 py-2 text-xs font-semibold text-brand-blackish transition hover:text-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Truncate
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadCSV(item)}
                                      disabled={downloadingId === item.key}
                                      className="inline-flex shrink-0 font-sans items-center rounded-full px-1 py-2 text-xs font-semibold text-brand-blue transition hover:text-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {downloadingId === item.key ? "Downloading..." : "Download"}
                                    </button>
                                  </>
                                    );
                                  })()
                                ) : null}
                                {shouldShowViewProof(item.originalItem || item) ? (
                                  <button
                                    type="button"
                                    onClick={handleViewProof}
                                    className="inline-flex shrink-0 font-sans items-center rounded-full px-1 py-2 text-xs font-semibold text-brand-blue transition "
                                  >
                                    View Proof
                                  </button>
                                ) : null}
                              </div>
                            </div>
                            {/* {shouldShowViewProof(item.originalItem || item) && (item.originalItem?.details?.txnUrl || item.originalItem?.details?.proofImageUrl || proofUrl) ? (
                                  <a
                                href={item.originalItem?.details?.txnUrl || item.originalItem?.details?.proofImageUrl || proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex gap-2 w-max max-w-full items-center text-[11px] text-brand-purple transition-colors hover:text-brand-blue"
                                  >
                                    <Link size={12} className="shrink-0" />
                                    <span className="truncate max-w-[200px] sm:max-w-[350px]">
                                  {item.originalItem?.details?.txnUrl || item.originalItem?.details?.proofImageUrl || proofUrl}
                                    </span>
                                    <ArrowUpRight size={12} className="shrink-0" />
                                  </a>
                                ) : null} */}
                                {item.note ? (
                                  <div className={`mt-2 border-l-2 pl-2 text-[11px] leading-relaxed ${item.noteTone || "border-brand-stroke text-brand-body"}`}>
                                    {item.note}
                                  </div>
                                ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <aside className="relative m-2 rounded-xl bg-brand-lightblue px-4 py-4 sm:px-4 md:h-[calc(100%-16px)] overflow-y-auto overflow-x-hidden hide-scrollbar">
                <div className="flex flex-col min-h-full">
                  <div className="relative mx-auto flex w-full max-w-[480px] flex-1 items-center justify-center py-4">
                    <div className="relative w-full">
                      <img
                        src={Reciept}
                        alt=""
                        className="pointer-events-none w-full h-auto object-contain drop-shadow-sm"
                      />

                      <div className="absolute inset-0 flex flex-col overflow-hidden px-[14%] pt-[20%] pb-[10%]">
                        <div className="pb-1">
                          <div className="flex items-center justify-between gap-1 sm:gap-2">
                            <h3 className="font-park font-bold text-[#040A19] text-[13px] sm:text-base">
                              Order Summary
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium ${getStatusTone(status)}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {toTitleCase(status)}
                            </span>
                          </div>

                          <div className="mt-3 sm:mt-5 rounded-xl bg-brand-offwhite px-3 sm:px-5 py-3 sm:py-4 text-center">
                            <p className="text-[10px] font-medium text-brand-label">
                              Total Leads Requested
                            </p>
                            <p className="mt-1 sm:mt-2 font-park text-base font-bold text-brand-blackish sm:text-lg">
                              {Number.isFinite(quantity) ? quantity.toLocaleString() : "0"}
                            </p>
                          </div>
                        </div>

                        <div className="py-3 sm:py-4">
                          <div className="space-y-3 sm:space-y-4">
                            {summaryRows.map((row) => (
                              <div key={row.label} className="grid grid-cols-[90px_1fr] items-start gap-2 text-xs sm:grid-cols-[110px_1fr] sm:text-sm">
                                <span className="text-[11px] font-light text-[#7A8294] sm:text-xs">{row.label}:</span>
                                <span className="text-right text-xs font-medium text-[#040A19] sm:text-[12px]">
                                  {row.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {actions.length ? (
                    <div className="mt-auto mb-4 flex flex-shrink-0 flex-wrap items-center justify-center gap-4 pt-4">
                      {actions.map(renderActionButton)}
                    </div>
                  ) : null}
                </div>
              </aside>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ActionDialog
        open={activeDialog === "setPricing"}
        onOpenChange={(nextOpen) => setActiveDialog(nextOpen ? "setPricing" : null)}
        title="Accept & Set Order Price"
        description="You are confirming that this order has been received and accepted. Please assign a price to this order below before the customer makes payment."
        actionLabel="Set Price"
        actionDisabled={!String(priceDraft).trim()}
        actionLoading={isSettingPrice}
        onAction={handleSetPrice}
      >
        <div className="space-y-3">
        <label className={`text-base font-medium transition-colors ${
          priceDraft.trim() ? "text-brand-blackish" : "text-brand-label"
        }`}>Attach A Price (USD)</label>
          <input
            type="text"
            value={priceDraft}
            onChange={(event) => setPriceDraft(event.target.value)}
            placeholder="$ 100.00"
          className={`w-full text-brand-body rounded-2xl border px-5 py-3 mt-1 outline-none transition-colors focus:border-brand-blackish ${
            priceDraft.trim() ? "border-brand-blackish" : "border-brand-stroke"
          }`}
          />
          <p className="text-sm text-brand-info">Order can be paid in BTC or TRC-20 network</p>
        </div>
      </ActionDialog>

      <ActionDialog
        open={activeDialog === "approve"}
        onOpenChange={(nextOpen) => setActiveDialog(nextOpen ? "approve" : null)}
        title="Approve Order for Delivery"
        description="You are confirming that the payment has been verified. This will initiate the order processing and transition to lead fulfillment after the cutoff deadline."
        actionLabel="Approve & Confirm"
        actionLoading={isApprovingPayment}
        onAction={handleApprovePayment}
      >
        <p className="text-base font-medium text-[#a86417]">
          Leads will start being assigned after you upload the daily leads.
        </p>
      </ActionDialog>

      <ActionDialog
        open={activeDialog === "delete"}
        onOpenChange={(nextOpen) => setActiveDialog(nextOpen ? "delete" : null)}
        title="Delete Order"
        description="Are you certain you want to permanently delete this order? This action cannot be undone."
        actionLabel="Delete Order"
        actionTone="danger"
        actionLoading={isDeletingOrder}
        onAction={handleDeleteOrder}
      >
        <ul className="space-y-3 pl-5 text-base leading-7 text-brand-body">
          <li className="list-disc">The transaction proof (if applicable)</li>
          <li className="list-disc">The order from both customer and admin views</li>
          <li className="list-disc">The order status timeline</li>
        </ul>
        <p className="mt-4 text-base font-medium text-[#a86417]">
          Once deleted, this order cannot be recovered.
        </p>
      </ActionDialog>

      <ActionDialog
        open={activeDialog === "truncate"}
        onOpenChange={(nextOpen) => setActiveDialog(nextOpen ? "truncate" : null)}
        title="Stop and Finalize This Order"
        description="This will halt the delivery of additional leads and mark this order as complete. Only the leads that have already been delivered will remain available to the customer."
        actionLabel="Truncate Order"
        actionTone="dark"
        actionLoading={isTruncatingOrder}
        onAction={handleTruncateOrder}
      >
        <p className="text-base font-medium text-brand-body">
          Delivered: {Number(order?.filled ?? 0).toLocaleString()}/{quantity.toLocaleString()} Leads
        </p>
      </ActionDialog>

      <ActionDialog
        open={activeDialog === "reject"}
        onOpenChange={(nextOpen) => setActiveDialog(nextOpen ? "reject" : null)}
        title="Reject This Order"
        description="Are you sure you want to reject this order? This order will be cancelled and the customer will be notified via email."
        actionLabel="Reject Order"
        actionTone="warning"
        actionDisabled={!String(rejectReason).trim()}
        actionLoading={isRejectingPayment}
        onAction={handleRejectPayment}
      >
        <div className="space-y-3">
          <label className={`text-base font-medium transition-colors ${
            rejectReason.trim() ? "text-brand-blackish" : "text-brand-body"
          }`}>
            Why Are you Rejecting This Order?
          </label>
          <textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Type the reason for rejection here..."
            className={`min-h-[150px] mt-2 w-full rounded-2xl border px-5 py-4 text-base text-brand-body outline-none transition-colors focus:border-brand-blackish ${
              rejectReason.trim() ? "border-brand-blackish" : "border-brand-stroke"
            }`}
          />
        </div>
      </ActionDialog>

      <ActionDialog
        open={activeDialog === "recall"}
        onOpenChange={(nextOpen) => setActiveDialog(nextOpen ? "recall" : null)}
        title="Recall & Reassign this Order"
        description="This will remove the order from the current customer and reassign the remaining leads to another customer. The current customer will lose access to this order."
        actionLabel="Reassign Order"
        actionTone="primary"
        actionDisabled={
          !canRecallOrder(actionSourceOrder, historyTimeline) ||
          !recallTargetCustomerId ||
          !recallAcknowledged
        }
        actionLoading={isRecallingOrder}
        onAction={handleRecallOrder}
      >
        <div className="space-y-5 text-brand-body">
          <div className="space-y-3">
            <h4 className="font-park text-base font-semibold text-brand-blackish">
              Order Summary
            </h4>
            <div className="space-y-2 text-base text-brand-body">
              <p>
                Order ID:{" "}
                <span className="font-semibold text-brand-body">
                  {actionSourceOrder?.publicId || actionSourceOrder?.customId || "#--"}
                </span>
              </p>
              <p>
                Customer:{" "}
                <span className="font-semibold text-brand-body">
                  {customerObj?.name || "Unknown Customer"}
                </span>
              </p>
              <p>
                Delivered:{" "}
                <span className="font-semibold text-brand-body">
                  {deliveredCount.toLocaleString()}/{quantity.toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label
              className={`block text-base font-medium transition-colors ${
                recallTargetCustomerId ? "text-brand-blackish" : "text-brand-label"
              }`}
            >
              Reassign to customer
            </label>
            <div className="relative" ref={recallDropdownRef}>
              {isRecallSelectOpen ? (
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-placeholder"
                  />
                  <input
                    ref={recallSearchInputRef}
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer..."
                    className="w-full rounded-lg border border-brand-blue bg-brand-white px-5 py-3 pl-12 text-base text-brand-blackish outline-none ring-2 ring-brand-blue/40"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRecallSelectOpen(true)}
                  className={`inline-flex w-full items-center justify-between rounded-lg border bg-brand-white px-5 py-3 text-base outline-none transition-colors hover:border-brand-blackish focus:border-brand-blackish focus:ring-2 focus:ring-brand-blue/40 ${
                    recallTargetCustomerId
                      ? "border-brand-blackish"
                      : "border-brand-label"
                  }`}
                >
                  <span className={recallTargetCustomerId ? "text-brand-blackish" : "text-brand-body"}>
                    {recallTargetCustomerId
                      ? recallCustomerOptions.find(
                          (c) => (c._id || c.id) === recallTargetCustomerId
                        )?.name || "Select customer"
                      : "Search or select customer"}
                  </span>
                  <ChevronDown size={20} className="text-brand-body" />
                </button>
              )}

              {isRecallSelectOpen && (
                <div className="absolute left-0 top-full z-[100] mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-brand-stroke bg-brand-white p-2 shadow-lg">
                  {filteredRecallOptions.length > 0 ? (
                    filteredRecallOptions.map((customer) => {
                      const isSelected = recallTargetCustomerId === (customer._id || customer.id);
                      return (
                        <button
                          key={customer._id || customer.id}
                          type="button"
                          onClick={() => {
                            setRecallTargetCustomerId(customer._id || customer.id);
                            setIsRecallSelectOpen(false);
                            setCustomerSearch("");
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 text-left text-base outline-none transition-colors hover:bg-brand-sky hover:text-brand-blackish focus:bg-brand-sky focus:text-brand-blackish ${
                            isSelected ? "bg-brand-sky text-brand-blackish" : "text-brand-body"
                          }`}
                        >
                          <span>{customer.name}</span>
                          {isSelected && <Check size={16} className="text-brand-blue" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-2.5 text-center text-sm text-brand-body">
                      No customers found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-brand-body">
            <input
              type="checkbox"
              checked={recallAcknowledged}
              onChange={(event) => setRecallAcknowledged(event.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border border-brand-label accent-brand-blue"
            />
            <span>I understand the current customer will lose access</span>
          </label>

          {!canRecallOrder(actionSourceOrder, historyTimeline) ? (
            <p className="text-sm font-medium text-brand-red">
              This order cannot be recalled because the customer has already opened or downloaded the leads, or the order was not created by admin.
            </p>
          ) : null}
        </div>
      </ActionDialog>

      <ActionDialog
        open={activeDialog === "viewLeads"}
        onOpenChange={(nextOpen) => setActiveDialog(nextOpen ? "viewLeads" : null)}
        title="View Leads"
        description="This state is ready for the lead-view flow. For now, you can download the CSV while the dedicated admin leads view is being connected."
        actionLabel="Download CSV"
        actionTone="primary"
        onAction={() => handleDownloadCSV()}
      >
        <p className="text-base font-medium text-brand-body">
          Delivered: {Number(order?.filled ?? order?.totals?.delivered ?? 0).toLocaleString()} / {quantity.toLocaleString()} leads
        </p>
      </ActionDialog>
    </>
  );
};

export default OrderModal;
