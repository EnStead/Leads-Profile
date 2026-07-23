import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Search, X } from "lucide-react";
import { gsap } from "gsap";
import Avater from "../../../assets/Avater.jpg";
import GlassUserIcon from "../../../assets/glassusericon.svg";
import BlueUserIcon from "../../../assets/blueusericon.svg";
import UserBlue from "../../../assets/UserBlue.svg";
import { useAdminDashboard } from "../../../context/DashboardContext";
import { useAdminAuth } from "../../../context/AdminContext";
import { useAppToast } from "../../../utility/appToastContext";
import api from "../../../utility/axios";
import { createAdminOrder, updateAdminOrder } from "../../../context/dashboardApi";
import RightPanel from "../../CustomerComponent/Home/create-order-modal/RightPanel";
import StepBankCriteria from "../../CustomerComponent/Home/create-order-modal/StepBankCriteria";
import StepCountry from "../../CustomerComponent/Home/create-order-modal/StepCountry";
import StepDelivery from "../../CustomerComponent/Home/create-order-modal/StepDelivery";
import StepHeader from "../../CustomerComponent/Home/create-order-modal/StepHeader";
import SendIcon from "../../../assets/send.svg";
import {
  getProfileImageSrc,
  PROFILE_BG_TONES,
} from "../../../utility/profilePresets";

import {
  PREMIUM_BANKS,
  PREVIEW_BANKS,
  criteriaLabel,
  deliveryLabel,
  findCountry,
  getAllowedEndDays,
  getDeliveryWindowDays,
} from "../../CustomerComponent/Home/create-order-modal/constants";

const applyDeliveryTypeDefaults = ({
  nextType,
  setDeliveryType,
  setSelectedDay,
  setSelectedEndDay,
  setSelectedWeek,
  setSubmitError,
}) => {
  setDeliveryType(nextType);

  if (nextType === "standard") {
    setSelectedDay("Monday");
  }

  if (nextType === "staggered") {
    setSelectedDay("Monday");
    setSelectedEndDay("Friday");
  }

  if (nextType === "scheduled") {
    setSelectedDay("Monday");
    setSelectedEndDay("Friday");
    setSelectedWeek(2);
  }

  setSubmitError("");
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

const GsapCounter = ({
  value,
  className = "",
  prefix = "",
  suffix = "",
  fallback = "--",
}) => {
  const numericValue = Number(value);
  const [displayValue, setDisplayValue] = useState(0);
  const proxyRef = useRef({ val: 0 });

  useLayoutEffect(() => {
    if (!Number.isFinite(numericValue)) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(proxyRef.current, {
        val: numericValue,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          setDisplayValue(Math.ceil(proxyRef.current.val));
        },
      });
    });

    return () => ctx.revert();
  }, [numericValue]);

  if (!Number.isFinite(numericValue)) {
    return <span className={className}>{fallback}</span>;
  }

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

const CustomerSelectionStep = ({
  searchTerm,
  onSearchTermChange,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onNext,
}) => {
  const hasSearch = searchTerm.trim().length > 0;
  const heading = hasSearch
    ? `Search Results for "${searchTerm.trim()}"`
    : "Suggested Customers";

  return (
    <div className="flex flex-1 flex-col space-y-8">
      <div>
        <h3 className="text-lg font-park font-semibold text-brand-blackish">
          Who do you want to create this order for?
        </h3>
        <p className="mt-2 font-light text-sm text-brand-body">
          Search or select the customer you want to attach this order to.
        </p>
      </div>

      <div className="space-y-3">
        <label
          className={`block text-sm font-medium transition-colors ${
            hasSearch ? "text-brand-blackish" : "text-brand-body"
          }`}
        >
          Customer Name
        </label>
        <div
          className={`flex items-center gap-3 rounded-xl border bg-brand-white px-4 py-3 transition-colors ${
            hasSearch ? "border-brand-blackish" : "border-brand-label/50"
          }`}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search for customer"
            className="w-full bg-transparent text-sm text-brand-blackish outline-none placeholder:text-brand-label"
          />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-brand-body">{heading}</p>

        {customers.length ? (
          <div className="grid grid-cols-4 gap-4">
            {customers.map((customer) => {
              const isSelected = selectedCustomer?._id === customer._id;
              const isNotSelected = selectedCustomer && !isSelected;

              return (
                <button
                  key={customer._id}
                  type="button"
                  onClick={() => onSelectCustomer(customer)}
                  className={`group text-center transition-opacity duration-300 ${
                    isNotSelected ? "opacity-40 hover:opacity-70" : "opacity-100"
                  }`}
                >
                  <div className="relative mx-auto h-16 w-16 transition group-hover:scale-[1.02]">
                <span className={`inline-flex h-full w-full items-center justify-center overflow-hidden rounded-full ${getAvatarBgTone(customer)}`}>
                  <img
                    src={getCustomerAvatarSrc(customer)}
                    alt={customer.name}
                    className="relative h-full w-full rounded-full object-cover"
                  />
                </span>
                    {isSelected ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-white text-brand-blue shadow-sm">
                          <Check size={14} />
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-light text-brand-body">
                    {customer.name}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-label/50 bg-brand-white px-5 py-6 text-center text-sm text-brand-label">
            No customers match your search yet.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!selectedCustomer}
        className="mt-auto w-full max-w-[260px] rounded-xl bg-brand-blackish px-6 py-2 font-semibold text-brand-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

const CustomerProfilePanel = ({ customer }) => {
  const cardRef = useRef(null);
  const avatarRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const joinedRef = useRef(null);
  const statsRefs = useRef([]);

  useLayoutEffect(() => {
    if (!customer) return undefined;

    const animatedNodes = [
      avatarRef.current,
      nameRef.current,
      emailRef.current,
      joinedRef.current,
      ...statsRefs.current.filter(Boolean),
    ].filter(Boolean);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.985, autoAlpha: 0.75 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.42,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        animatedNodes,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.52,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "all",
        },
      );
    }, cardRef);

    return () => ctx.revert();
  }, [customer]);

  const stats = [
    {
      label: "Total Orders",
      value: customer?.totalOrders ?? 0,
      type: "number",
    },
    {
      label: "Active Orders",
      value: customer?.activeOrders ?? 0,
      type: "number",
    },
    {
      label: "Total Leads Received",
      value: customer?.totalLeadsReceived,
      type: "number",
    },
    {
      label: "Total Spent",
      value: customer?.totalSpent,
      type: "currency",
    },
  ];

  return (
    <div className="relative m-2 rounded-xl bg-brand-lightblue">
      <Dialog.Close asChild>
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-offwhite text-brand-blackish transition hover:bg-brand-white"
        >
          <X size={22} />
        </button>
      </Dialog.Close>

      <div className="relative flex min-h-full flex-col overflow-hidden rounded-xl bg-brand-lightblue p-6">
        <img
          src={BlueUserIcon}
          alt=""
          className="pointer-events-none absolute bottom-0 -left-3 h-44 w-44  object-contain"
        />
        <img
          src={GlassUserIcon}
          alt=""
          className="pointer-events-none absolute right-9 top-7 h-24 w-24  object-contain "
        />
        <div className="absolute inset-0 z-[1] bg-brand-lightblue/16 backdrop-blur-[10px] rounded-xl" />

        <div className="relative z-10 mt-8 py-5 space-y-5">
          <h4 className="text-center text-lg font-park font-semibold text-brand-blackish">
            Profile Information
          </h4>

          <div
            ref={cardRef}
            className="mx-auto max-w-[380px] mt-15 rounded-xl bg-brand-sky p-5 text-center"
          >
            <div
              ref={avatarRef}
            className={`mx-auto -mt-14 inline-flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-brand-sky p-1 ${customer ? getAvatarBgTone(customer) : "bg-brand-sky"}`}
            >

              {customer ? (
              <img src={getCustomerAvatarSrc(customer)} alt={customer.name} className="relative h-full w-full rounded-full object-cover" />
              ) : null}            
            </div>

            {customer ? (
              <>
                <h5
                  ref={nameRef}
                  className="mt-4 text-2xl font-park font-semibold text-brand-blackish"
                >
                  {customer.name}
                </h5>
                <p
                  ref={emailRef}
                  className="mt-1 text-sm text-brand-accent underline underline-offset-2"
                >
                  {customer.email || "No email available"}
                </p>
                <p
                  ref={joinedRef}
                  className="mt-2 text-xs font-medium text-brand-blackish"
                >
                  Joined on{" "}
                  {new Date(
                    customer.createdAt || 0,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      ref={(node) => {
                        statsRefs.current[index] = node;
                      }}
                      className="rounded-xl border-brand-offwhite bg-brand-white px-4 py-3"
                    >
                      <p className="text-xs font-light text-brand-label">{stat.label}</p>
                      <p className="mt-1 text-lg font-semibold text-brand-blackish">
                        {stat.type === "currency" ? (
                          <GsapCounter value={stat.value} prefix="$" />
                        ) : (
                          <GsapCounter value={stat.value} />
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </> 
            ) : (
              <div className="py-12">
                <div className="mx-auto  h-20 w-20  ">
                  <img src={UserBlue} alt="" className="h-full w-full rounded-full object-contain" />
                </div>
                <p className="mt-5 text-lg text-brand-label">
                  Choose a customer for this to view their profile here...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminRightPanel = ({
  step,
  isSubmitted,
  selectedCustomer,
  activeCountry,
  bankCriteria,
  bankPreviewBanks,
  enablePuff,
  summaryRows,
}) => {
  if (!isSubmitted && step === 1) {
    return <CustomerProfilePanel customer={selectedCustomer} />;
  }

  return (
    <RightPanel
      step={Math.max(1, step - 1)}
      isSubmitted={isSubmitted}
      activeCountry={activeCountry}
      bankCriteria={bankCriteria}
      bankPreviewBanks={bankPreviewBanks}
      enablePuff={enablePuff}
      summaryRows={summaryRows}
      showReviewNote={false}
    />
  );
};

const WEEKDAY_INDEX = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
};

const getStartOfNextWeek = (fromDate = new Date()) => {
  const date = new Date(fromDate);
  const day = date.getDay();
  const mondayBasedDay = day === 0 ? 6 : day - 1;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - mondayBasedDay + 7);
  return date;
};

const formatCommencementDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

const buildCommencementCopy = ({
  deliveryType,
  selectedDay,
  selectedEndDay,
  selectedWeek,
  fromDate = new Date(),
}) => {
  const nextWeekStart = getStartOfNextWeek(fromDate);
  const normalizedDay = String(selectedDay || "Monday").trim().toLowerCase();
  const targetDayOffset = WEEKDAY_INDEX[normalizedDay] ?? 0;

  if (deliveryType === "scheduled") {
    const weekLabel = formatCommencementDate(nextWeekStart);
    const duration = selectedWeek > 1 ? ` and continue for ${selectedWeek} weeks` : "";
    return `The filling process for this order will commence ${weekLabel}${duration}.`;
  }

  const commenceDate = new Date(nextWeekStart);
  commenceDate.setDate(nextWeekStart.getDate() + targetDayOffset);

  if (deliveryType === "staggered") {
    return `The filling process for this order will commence on ${formatCommencementDate(commenceDate)} and continue through ${selectedEndDay}.`;
  }

  return `The filling process for this order will commence on ${formatCommencementDate(commenceDate)}.`;
};

const toBackendWeekday = (value) => String(value || "").trim().toUpperCase();

const buildAdminOrderPayload = ({
  customerId,
  bankCriteria,
  selectedBanks,
  deliveryType,
  quantity,
  selectedDay,
  selectedEndDay,
  selectedWeek,
  dailyQuantity,
}) => {
  const normalizedQuantity = Number(quantity);
  const safeQuantity = Number.isFinite(normalizedQuantity)
    ? Math.max(1, Math.floor(normalizedQuantity))
    : 1;
  const normalizedBanks = selectedBanks
    .map((bank) => String(bank || "").trim())
    .filter(Boolean);

  const targeting = {
    type: bankCriteria,
    banks:
      bankCriteria === "filtered" || bankCriteria === "premium_bank"
        ? normalizedBanks
        : [],
  };

  const baseDeliveryConfig = {
    timezone: "America/New_York",
  };

  if (deliveryType === "staggered") {
    return {
      customerId,
      targeting,
      deliveryScenario: "staggered",
      deliveryConfig: {
        ...baseDeliveryConfig,
        startDay: toBackendWeekday(selectedDay),
        endDay: toBackendWeekday(selectedEndDay),
        leadsPerDay: safeQuantity,
        dailyQuantity,
      },
    };
  }

  if (deliveryType === "scheduled") {
    return {
      customerId,
      targeting,
      deliveryScenario: "scheduled",
      deliveryConfig: {
        ...baseDeliveryConfig,
        weeks: Math.max(2, Number(selectedWeek) || 2),
        leadsPerWeek: safeQuantity,
        dailyQuantity,
      },
    };
  }

  return {
    customerId,
    targeting,
    deliveryScenario: "standard",
    deliveryConfig: {
      ...baseDeliveryConfig,
      selectedDay: toBackendWeekday(selectedDay),
      totalLeads: safeQuantity,
      dailyQuantity: safeQuantity,
    },
  };
};

const findMatchingCustomer = (customers, identifiers = {}) =>
  customers.find((entry) => {
    const entryId = String(entry?._id || entry?.id || "").trim();
    const entryEmail = String(entry?.email || "").trim().toLowerCase();
    const entryName = String(entry?.name || "").trim().toLowerCase();

    return (
      (identifiers.id && entryId === identifiers.id) ||
      (identifiers.email && entryEmail === identifiers.email) ||
      (identifiers.name && entryName === identifiers.name)
    );
  }) || null;

const AdminSuccessStep = ({
  customerName,
  deliveryType,
  selectedDay,
  selectedWeek,
  onViewOrderHistory,
}) => (
  <div className="flex h-full flex-col items-center justify-center px-4 text-center">
    <div className="inline-flex h-30 w-30 items-center justify-center">
      <img src={SendIcon} alt="send" className="w-full" />
    </div>
    <h3 className="mt-6 text-2xl font-park font-bold text-brand-blackish">
      Order Created
    </h3>
    <p className="mt-4 max-w-[460px] text-lg leading-relaxed text-brand-body">
      The order has been successfully created and is now assigned to{" "}
      <strong>{customerName || "this customer"}</strong>.{" "}
      {buildCommencementCopy({
        deliveryType,
        selectedDay,
        selectedWeek,
      })}
    </p>
    <button
      type="button"
      onClick={onViewOrderHistory}
      className="mt-8 w-full max-w-[260px] rounded-xl bg-brand-blackish px-6 py-2 font-semibold text-brand-white transition hover:opacity-90"
    >
      View Order History
    </button>
  </div>
);

const CreateOrder = ({
  open,
  onOpenChange,
  mode = "create",
  orderToEdit,
  initialCustomer = null,
  startAtStep = 1,
}) => {
  const {
    usersData,
    usersLoading,
    usersError,
    customersData,
    allCustomersForOrderData,
    allCustomersForOrderLoading,
    allCustomersForOrderError,
    refetchadminOrder,
    refetchAdminDashboard,
  } = useAdminDashboard();
  const { user } = useAdminAuth();
  const { showToast } = useAppToast();

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [country, setCountry] = useState("us");
  const [bankCriteria, setBankCriteria] = useState("mixed");
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [quantity, setQuantity] = useState(500);
  const [deliveryType, setDeliveryType] = useState("standard");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedEndDay, setSelectedEndDay] = useState("Friday");
  const [selectedWeek, setSelectedWeek] = useState(2);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const allCustomers = useMemo(
    () =>
      Array.isArray(allCustomersForOrderData?.data)
        ? allCustomersForOrderData.data
        : [],
    [allCustomersForOrderData],
  );

  const suggestedCustomers = useMemo(
    () => (Array.isArray(usersData) ? usersData : []),
    [usersData],
  );

  const customerMetrics = useMemo(
    () =>
      Array.isArray(customersData?.data)
        ? customersData.data.reduce((acc, entry) => {
            acc[entry._id] = entry;
            return acc;
          }, {})
        : {},
    [customersData],
  );

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    const source = allCustomers.slice().sort((left, right) =>
      String(left?.name || left?.email || left?._id || "").localeCompare(
        String(right?.name || right?.email || right?._id || ""),
      ),
    );

    if (!query) return suggestedCustomers;

    return source
      .filter((entry) =>
        [entry.name, entry.email, entry.customId, entry._id].some((value) =>
          String(value || "").toLowerCase().includes(query),
        ),
      );
  }, [allCustomers, customerSearch, suggestedCustomers]);

  const selectedCustomer = useMemo(() => {
    const selectedCustomerBase =
      findMatchingCustomer(allCustomers, {
        id: String(selectedCustomerId || "").trim(),
        email: String(customerSearch || "").trim().toLowerCase(),
        name: String(customerSearch || "").trim().toLowerCase(),
      }) || null;

    if (selectedCustomerBase) {
      return {
        ...selectedCustomerBase,
        ...(customerMetrics[selectedCustomerBase._id] || {}),
      };
    }

    // Fallback for edit mode if the customer isn't in the immediate list
    if (mode === "edit" && orderToEdit) {
      const fallbackCustomer = orderToEdit.customer || orderToEdit.client || {};
      const fbId = fallbackCustomer?._id || fallbackCustomer?.id || orderToEdit.customerId || orderToEdit.clientUserId || orderToEdit.customerEmail || "edit-fallback-id";
      if (fbId === selectedCustomerId) return fallbackCustomer;
    }

    return null;
  }, [allCustomers, customerMetrics, customerSearch, selectedCustomerId, mode, orderToEdit]);

  const activeCountry = findCountry(country);
  const shouldSkipCustomerStep = Boolean(initialCustomer?._id && startAtStep > 1) || mode === "edit";
  const canGoStep3 = Boolean(country);
  const canGoStep4 =
    bankCriteria !== "filtered" || selectedBanks.length > 0;

  useEffect(() => {
    if (bankCriteria !== "filtered") return;

    let isMounted = true;

    const fetchBanks = async () => {
      try {
        setBanksLoading(true);
        const res = await api.get("/api/v1/leads/banks", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        if (!isMounted) return;
        setBanks(res.data.data || []);
      } catch {
        if (!isMounted) return;
        setBanks([]);
      } finally {
        if (isMounted) {
          setBanksLoading(false);
        }
      }
    };

    fetchBanks();

    return () => {
      isMounted = false;
    };
  }, [bankCriteria, user?.token]);

  useEffect(() => {
    if (!open || mode === "edit") return;

    if (initialCustomer?._id) {
      setSelectedCustomerId(initialCustomer._id);
      setCustomerSearch(initialCustomer.name || "");
      setStep(Math.max(2, startAtStep));
      return;
    }

    setStep(1);
  }, [open, initialCustomer?._id, initialCustomer?.name, mode, startAtStep]);

  useEffect(() => {
    if (!open || mode !== "edit" || !orderToEdit) return;

    const rawCustomer = orderToEdit.customer || orderToEdit.client || null;
    const customerObj =
      rawCustomer && typeof rawCustomer === "object" ? rawCustomer : null;
    const customerRef =
      (typeof rawCustomer === "string" ? rawCustomer : null) ||
      orderToEdit.customerId ||
      orderToEdit.clientUserId ||
      null;
    const matchedCustomer = findMatchingCustomer(allCustomers, {
      id: String(customerRef || customerObj?._id || customerObj?.id || "").trim(),
      email: String(
        customerObj?.email ||
          orderToEdit.customerEmail ||
          orderToEdit.clientEmail ||
          "",
      )
        .trim()
        .toLowerCase(),
      name: String(customerObj?.name || orderToEdit.customerName || orderToEdit.clientName || "")
        .trim()
        .toLowerCase(),
    });
    const customerId =
      matchedCustomer?._id ||
      matchedCustomer?.id ||
      customerObj?._id ||
      customerObj?.id ||
      customerRef ||
      "";
    const customerLabel =
      matchedCustomer?.name ||
      customerObj?.name ||
      matchedCustomer?.email ||
      customerObj?.email ||
      orderToEdit.customerName ||
      orderToEdit.clientName ||
      orderToEdit.customerEmail ||
      orderToEdit.clientEmail ||
      "Unknown Customer";

    setSelectedCustomerId(String(customerId));
    setCustomerSearch(customerLabel);

    const cty = String(orderToEdit.countryCode || orderToEdit.country || orderToEdit.countryPool || "us").toLowerCase();
    setCountry(cty === "ca" || cty.includes("canada") ? "ca" : "us");

    const typeRaw = String(orderToEdit.targeting?.type || orderToEdit.orderType || orderToEdit.leadType || "mixed").toLowerCase();
    if (typeRaw.includes("premium")) setBankCriteria("premium_bank");
    else if (typeRaw.includes("filter")) setBankCriteria("filtered");
    else if (typeRaw.includes("credit")) setBankCriteria("credit_unions");
    else setBankCriteria("mixed");

    const banks = Array.isArray(orderToEdit.targeting?.banks)
      ? orderToEdit.targeting.banks
      : Array.isArray(orderToEdit.bankNames)
        ? orderToEdit.bankNames
        : Array.isArray(orderToEdit.banks)
          ? orderToEdit.banks
          : [];
    setSelectedBanks(banks);

    const scenario = String(orderToEdit.deliveryScenario || orderToEdit.deliveryType || "standard").toLowerCase();
    const isStaggered = scenario.includes("staggered");
    const isScheduled = scenario.includes("scheduled");
    setDeliveryType(isStaggered ? "staggered" : isScheduled ? "scheduled" : "standard");

    const config = orderToEdit.deliveryConfig || {};
    const defaultQty = Number(orderToEdit.totals?.requested ?? orderToEdit.requested ?? orderToEdit.quantity ?? 500);
    const qty = isStaggered ? (config.leadsPerDay ?? orderToEdit.perDay ?? orderToEdit.dailyQuantity ?? defaultQty) : isScheduled ? (config.leadsPerWeek ?? defaultQty) : (config.totalLeads ?? defaultQty);
    setQuantity(Number(qty) || 500);

    const day = config.startDay || config.selectedDay || "Monday";
    setSelectedDay(day.charAt(0).toUpperCase() + day.slice(1).toLowerCase());
    const endDay = config.endDay || "Friday";
    setSelectedEndDay(
      endDay.charAt(0).toUpperCase() + endDay.slice(1).toLowerCase(),
    );
    setSelectedWeek(Number(config.weeks) || 2);

    // Skip the customer step automatically so the user immediately sees the populated fields
    setStep(2);
  }, [allCustomers, open, mode, orderToEdit]);

  const totalQuantity = useMemo(() => {
    if (deliveryType === "staggered") {
      return quantity * getDeliveryWindowDays(selectedDay, selectedEndDay);
    }
    if (deliveryType === "scheduled") return quantity * selectedWeek;
    return quantity;
  }, [deliveryType, quantity, selectedDay, selectedEndDay, selectedWeek]);

  const dailyQuantity = useMemo(() => {
    if (deliveryType === "staggered") return quantity;
    if (deliveryType === "scheduled") return quantity;
    return null;
  }, [deliveryType, quantity]);

  const estimatedDelivery = useMemo(() => {
    if (deliveryType === "staggered") {
      return `${selectedDay.slice(0, 3)} -> ${selectedEndDay.slice(0, 3)}`;
    }
    if (deliveryType === "scheduled") {
      return `${selectedDay.slice(0, 3)} -> ${selectedEndDay.slice(0, 3)} • ${selectedWeek} Week${selectedWeek > 1 ? "s" : ""}`;
    }
    return selectedDay;
  }, [deliveryType, selectedDay, selectedEndDay, selectedWeek]);

  const bankPreviewBanks = useMemo(() => {
    if (bankCriteria === "filtered") return selectedBanks;
    if (bankCriteria === "premium_bank") return selectedBanks;
    return PREVIEW_BANKS[bankCriteria] || PREVIEW_BANKS.mixed;
  }, [bankCriteria, selectedBanks]);

  const summaryRows = useMemo(() => {
    const rows = [
      {
        label: "Customer",
        value: selectedCustomer ? (
          <span className="inline-flex items-center gap-2">
            <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full ${getAvatarBgTone(selectedCustomer)}`}>
              <img
                src={getCustomerAvatarSrc(selectedCustomer)}
                alt={selectedCustomer.name}
                className="h-full w-full object-cover"
              />
            </span>
            <span>{selectedCustomer.name}</span>
          </span>
        ) : (
          "Not selected"
        ),
      },
      {
        label: "Country Pool",
        value: (
          <span className="inline-flex items-center gap-2">
            <img
              src={activeCountry.icon}
              alt={activeCountry.name}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span>{activeCountry.name}</span>
          </span>
        ),
      },
      { label: "Bank Criteria", value: criteriaLabel(bankCriteria) },
    ];

    if (bankCriteria === "filtered" || bankCriteria === "premium_bank") {
      rows.push({
        label: "Bank Names",
        value:
          selectedBanks.length > 0
            ? selectedBanks.length > 3
              ? `${selectedBanks.slice(0, 3).join(", ")} +${selectedBanks.length - 3}`
              : selectedBanks.join(", ")
            : "Not selected",
      });
    }

    rows.push({ label: "Total Quantity", value: `${totalQuantity.toLocaleString()} Leads` });

    if (dailyQuantity) {
      rows.push({ label: "Daily Quantity", value: `${dailyQuantity.toLocaleString()} Leads` });
    }

    rows.push({ label: "Delivery Type", value: deliveryLabel(deliveryType) });

    if (deliveryType === "scheduled") {
      rows.push({
        label: "Estimated Duration",
        value: `${selectedWeek} Week${selectedWeek > 1 ? "s" : ""}`,
      });
    } else {
      rows.push({ label: "Estimated Delivery", value: estimatedDelivery });
    }

    return rows;
  }, [
    activeCountry.icon,
    activeCountry.name,
    bankCriteria,
    dailyQuantity,
    deliveryType,
    estimatedDelivery,
    selectedDay,
    selectedBanks,
    selectedCustomer,
    selectedWeek,
    totalQuantity,
  ]);

  const resetFlow = () => {
    setStep(1);
    setIsSubmitted(false);
    setCustomerSearch("");
    setSelectedCustomerId("");
    setCountry("us");
    setBankCriteria("mixed");
    setSelectedBanks([]);
    setQuantity(500);
    setDeliveryType("standard");
    setSelectedDay("Monday");
    setSelectedEndDay("Friday");
    setSelectedWeek(2);
    setSubmitError("");
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      resetFlow();
    }

    onOpenChange(nextOpen);
  };

  const handleBack = () => {
    if (isSubmitted) {
      setIsSubmitted(false);
      setStep(4);
      return;
    }

    if (shouldSkipCustomerStep && step <= Math.max(2, startAtStep)) {
      handleOpenChange(false);
      return;
    }

    if (step > 1) {
      setStep((prev) => prev - 1);
      return;
    }

    handleOpenChange(false);
  };

  const handleBankPreferenceChange = (value) => {
    setBankCriteria(value);
    setSelectedBanks([]);
    setSubmitError("");
  };

  const toggleBank = (bankName) => {
    setSelectedBanks((prev) =>
      prev.includes(bankName)
        ? prev.filter((item) => item !== bankName)
        : [...prev, bankName],
    );
    setSubmitError("");
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      setSubmitError("Select a customer before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const payload = buildAdminOrderPayload({
        customerId: selectedCustomerId,
        bankCriteria,
        selectedBanks,
        deliveryType,
        quantity,
        selectedDay,
        selectedEndDay,
        selectedWeek,
        dailyQuantity,
      });

      if (mode === "edit") {
        await updateAdminOrder(user?.token, orderToEdit._id, payload);
      } else {
        await createAdminOrder(user?.token, payload);
      }

      setIsSubmitted(true);
      refetchadminOrder(); 
      refetchAdminDashboard();
      showToast({
        type: "success",
        title: mode === "edit" ? "Order updated" : "Order created",
        subtitle:
          mode === "edit"
            ? "Changes to this order have been saved successfully."
            : "The order has been successfully created for the customer.",
        actionLabel: mode === "edit" ? "Dismiss" : "View Order",
        duration: 0,
      });
    } catch (error) {
      const message = error?.response?.data?.message || "Operation failed";
      setSubmitError(message);
      showToast({
        message,
        type: "error",
        title: "Action failed",
        subtitle: "We couldn’t complete this action on the order. Please try again.",
        actionLabel: "Retry",
        duration: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-black/35" />
          <Dialog.Content
            // Tells Radix to wait for animation before unmounting
            onAnimationEnd={(e) => {
              if (e.animationName === "modalShrink") {
                // optional: any cleanup
              }
            }}
            className="modal-content fixed left-1/2 top-1/2 z-50 h-[90vh] max-h-[91vh] w-full max-w-[1100px] overflow-y-hidden rounded-[1.75rem] bg-brand-offwhite shadow-xl focus:outline-none md:h-[720px]"
          >
            
            <Dialog.Title className="sr-only">Create Order</Dialog.Title>
            <Dialog.Description className="sr-only">
              Create an order for a customer in the admin dashboard.
            </Dialog.Description>

            <div className="relative grid min-h-full grid-cols-1 bg-brand-sky md:grid-cols-2">
              <div className="relative z-20 flex h-full flex-col p-5 sm:p-7 md:p-8">
                {!isSubmitted ? (
                  <StepHeader step={step} onBack={handleBack} totalSteps={4} />
                ) : null}

                {!isSubmitted && !shouldSkipCustomerStep && step === 1 ? (
                  usersLoading || allCustomersForOrderLoading ? (
                    <div className="flex flex-1 items-center justify-center text-brand-body">
                      Loading customers...
                    </div>
                  ) : usersError || allCustomersForOrderError ? (
                    <div className="flex flex-1 items-center justify-center text-brand-red">
                      Failed to load customers.
                    </div>
                  ) : (
                    <CustomerSelectionStep
                      searchTerm={customerSearch}
                      onSearchTermChange={setCustomerSearch}
                      customers={filteredCustomers}
                      selectedCustomer={selectedCustomer}
                      onSelectCustomer={(customer) => setSelectedCustomerId(customer._id)}
                      onNext={() => setStep(2)}
                    />
                  )
                ) : null}

                {!isSubmitted && step === 2 ? (
                  <StepCountry
                    country={country}
                    onSelectCountry={setCountry}
                    onNext={() => setStep(3)}
                    canGoNext={canGoStep3}
                  />
                ) : null}

                {!isSubmitted && step === 3 ? (
                  <StepBankCriteria
                    bankCriteria={bankCriteria}
                    onChangeCriteria={handleBankPreferenceChange}
                    selectedBanks={selectedBanks}
                    onToggleBank={toggleBank}
                    banks={banks}
                    banksLoading={banksLoading}
                    premiumBanks={PREMIUM_BANKS}
                    onNext={() => setStep(4)}
                    canGoNext={canGoStep4}
                  />
                ) : null} 

                {!isSubmitted && step === 4 ? (
                  <StepDelivery
                    deliveryType={deliveryType}
                    onChangeDeliveryType={(value) =>
                      applyDeliveryTypeDefaults({
                        nextType: value,
                        setDeliveryType,
                        setSelectedDay,
                        setSelectedEndDay,
                        setSelectedWeek,
                        setSubmitError,
                      })
                    }
                    quantity={quantity}
                    onDecreaseQuantity={() =>
                      setQuantity((prev) => Math.max(100, Number(prev) - 50))
                    }
                    onIncreaseQuantity={() =>
                      setQuantity((prev) => Math.min(10000, Number(prev) + 50))
                    }
                    onSetQuantity={(value) => {
                      setQuantity(value);
                      setSubmitError("");
                    }}
                    selectedDay={selectedDay}
                    onSetSelectedDay={(value) => {
                      setSelectedDay(value);
                      const allowedEndDays = getAllowedEndDays(value).filter((d) => d !== value);
                      setSelectedEndDay((prev) =>
                        allowedEndDays.includes(prev)
                          ? prev
                          : allowedEndDays[allowedEndDays.length - 1] || "",
                      );
                      setSubmitError("");
                    }}
                    selectedEndDay={selectedEndDay}
                    onSetSelectedEndDay={(value) => {
                      setSelectedEndDay(value);
                      setSubmitError("");
                    }}
                    selectedWeek={selectedWeek}
                    onSetSelectedWeek={(value) => {
                      setSelectedWeek(value);
                      setSubmitError("");
                    }}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                  />
                ) : null}

                {isSubmitted ? (
                  <AdminSuccessStep
                    customerName={selectedCustomer?.name}
                    deliveryType={deliveryType}
                    selectedDay={selectedDay}
                    selectedWeek={selectedWeek}
                    onViewOrderHistory={() => handleOpenChange(false)}
                  />
                ) : null}
              </div>

              <AdminRightPanel
                step={step}
                isSubmitted={isSubmitted}
                selectedCustomer={selectedCustomer}
                activeCountry={activeCountry}
                bankCriteria={bankCriteria}
                bankPreviewBanks={bankPreviewBanks}
                enablePuff={bankCriteria === "filtered" || bankCriteria === "premium_bank"}
                summaryRows={summaryRows}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </>
  );
};

export default CreateOrder;
