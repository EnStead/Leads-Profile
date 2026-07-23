import { cloneElement, useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import { useClientDashboard } from "../../../context/DashboardContext";
import { useAppToast } from "../../../utility/appToastContext";
import api from "../../../utility/axios";
import RightPanel from "./create-order-modal/RightPanel";
import StepBankCriteria from "./create-order-modal/StepBankCriteria";
import StepCountry from "./create-order-modal/StepCountry";
import StepDelivery from "./create-order-modal/StepDelivery";
import StepHeader from "./create-order-modal/StepHeader";
import SuccessStep from "./create-order-modal/SuccessStep";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_ID,
  PREMIUM_BANKS,
  PREVIEW_BANKS,
  criteriaLabel,
  deliveryLabel,
  findCountry,
  getAllowedEndDays,
  getDeliveryWindowDays,
} from "./create-order-modal/constants";

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

const CreateOrderModal = ({ customTrigger }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useAppToast();
  const { refetchDashboard, refetchTransactionHistory } = useClientDashboard();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [country, setCountry] = useState(DEFAULT_COUNTRY_ID);
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
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const triggerRef = useRef(null);

  const activeCountry = findCountry(country);
  const canGoStep2 = Boolean(country) && !activeCountry?.disabled;
  const canGoStep3 =
    bankCriteria !== "filtered" || selectedBanks.length > 0;

  useEffect(() => {
    if (activeCountry?.disabled) {
      setCountry(DEFAULT_COUNTRY_ID);
    }
  }, [activeCountry?.disabled]);

  useEffect(() => {
    if (bankCriteria !== "filtered") return;

    let isMounted = true;

    const fetchBanks = async () => {
      try {
        setBanksLoading(true); 
        const res = await api.get("/api/v1/leads/banks", {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
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
      return `${selectedDay.slice(0, 3)} • ${selectedWeek} Week${selectedWeek > 1 ? "s" : ""}`;
    }
    return selectedDay.slice(0, 3);
  }, [deliveryType, selectedDay, selectedEndDay, selectedWeek]);

  const bankPreviewBanks = useMemo(() => {
    if (bankCriteria === "filtered") return selectedBanks;
    if (bankCriteria === "premium_bank") return selectedBanks;
    return PREVIEW_BANKS[bankCriteria] || PREVIEW_BANKS.mixed;
  }, [bankCriteria, selectedBanks]);

  const summaryRows = useMemo(() => {
    const rows = [
      {
        label: "Country Pool",
        value: (
          <span className="inline-flex items-center gap-2 font-semibold text-brand-blackish">
            <img
              src={activeCountry.icon}
              alt={activeCountry.name}
              className="h-6 w-6 rounded-full object-cover"
            />
            {activeCountry.name}
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
    selectedEndDay,
    selectedBanks,
    selectedWeek,
    totalQuantity,
  ]);

  const resetFlow = () => {
    setStep(1);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setSubmitError("");
    setCountry(DEFAULT_COUNTRY_ID || COUNTRIES[0].id);
    setBankCriteria("mixed");
    setSelectedBanks([]);
    setQuantity(500);
    setDeliveryType("standard");
    setSelectedDay("Monday");
    setSelectedEndDay("Friday");
    setSelectedWeek(2);
  };

  const handleOpenChange = (nextOpen) => {
    if (nextOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
      setOrigin({ x, y });
    }

    if (!nextOpen) {
      resetFlow();
    }

    setOpen(nextOpen);
  };

  const handleBack = () => {
    if (isSubmitted) {
      setIsSubmitted(false);
      setStep(3);
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

  const toApiTargetingType = (criteria) => {
    if (criteria === "premium_bank") return "filtered";
    return criteria;
  };

  const toApiStartDay = (day) => String(day || "").trim().toUpperCase();

  const buildOrderPayload = () => {
    const normalizedQuantity = Number(quantity);
    const safeQuantity = Number.isInteger(normalizedQuantity)
      ? normalizedQuantity
      : 0;
    const deliveryScenario = deliveryType;
    const targetingType = toApiTargetingType(bankCriteria);
    const normalizedBanks = selectedBanks
      .map((bank) => String(bank || "").trim())
      .filter(Boolean);

    const targeting = {
      type: targetingType,
      banks: targetingType === "filtered" ? normalizedBanks : [],
    };

    if (deliveryScenario === "standard") {
      return {
        deliveryScenario,
        targeting,
        deliveryConfig: {
          timezone: "America/New_York",
          selectedDay: toApiStartDay(selectedDay),
          totalLeads: safeQuantity,
          dailyQuantity: safeQuantity,
        },
      };
    }

    if (deliveryScenario === "scheduled") {
      const weeks = Number(selectedWeek);
      return {
        deliveryScenario,
        targeting,
        deliveryConfig: {
          timezone: "America/New_York",
          weeks,
          leadsPerWeek: safeQuantity,
          dailyQuantity,
        },
      };
    }

    if (deliveryScenario === "staggered") {
      return {
        deliveryScenario,
        targeting,
        deliveryConfig: {
          timezone: "America/New_York",
          startDay: toApiStartDay(selectedDay),
          endDay: toApiStartDay(selectedEndDay),
          leadsPerDay: safeQuantity,
          dailyQuantity,
        },
      };
    }

    return {
      deliveryScenario,
      targeting,
      deliveryConfig: {
        timezone: "America/New_York",
      },
    };
  };

  const validatePayload = (payload) => {
    const allowedDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    const quantityByScenario =
      payload.deliveryScenario === "standard"
        ? payload.deliveryConfig?.totalLeads
        : payload.deliveryScenario === "scheduled"
          ? payload.deliveryConfig?.leadsPerWeek
          : payload.deliveryConfig?.leadsPerDay;

    if (!Number.isInteger(quantityByScenario) || quantityByScenario <= 0) {
      return "Lead quantity must be a positive whole number.";
    }

    if (payload.targeting?.type === "filtered" && payload.targeting.banks.length === 0) {
      return "Select at least one bank for filtered/premium targeting.";
    }

    if (payload.deliveryScenario === "scheduled") {
      const weeks = payload.deliveryConfig?.weeks;
      if (![2, 3, 4].includes(weeks)) {
        return "Scheduled delivery supports 2, 3, or 4 weeks.";
      }
      return null;
    }

    if (payload.deliveryScenario === "standard") {
      if (!allowedDays.includes(payload.deliveryConfig?.selectedDay)) {
        return "Choose a valid delivery day between Monday and Friday.";
      }
      return null;
    }

    if (payload.deliveryScenario === "staggered") {
      const startDay = payload.deliveryConfig?.startDay;
      const endDay = payload.deliveryConfig?.endDay;
      if (!allowedDays.includes(startDay) || !allowedDays.includes(endDay)) {
        return "Choose valid start and end days between Monday and Friday.";
      }
      if (allowedDays.indexOf(endDay) <= allowedDays.indexOf(startDay)) {
        return "End day must be later than the start day.";
      }
      return null;
    }

    return "Invalid delivery scenario.";
  };

  const handleSubmitOrder = async () => {
    const token = user?.token;
    if (!token) {
      setSubmitError("Session expired. Please log in again.");
      return;
    }

    const payload = buildOrderPayload();
    const validationError = validatePayload(payload);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await api.post("/api/v2/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsSubmitted(true);
      showToast({
        type: "success",
        title: "Order submitted",
        subtitle:
          "Your request has been sent successfully and is now awaiting review.",
        actionLabel: "View Order History",
        onAction: handleViewOrderHistory,
      });
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          "Unable to submit order now. Please try again.",
      );
      showToast({
        type: "error",
        title: "Order submission failed",
        subtitle:
          "We couldn’t submit your request right now. Please try again.",
        actionLabel: "Retry",
        onAction: handleSubmitOrder,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewOrderHistory = async () => {
    try {
      await Promise.allSettled([
        refetchDashboard?.(),
        refetchTransactionHistory?.(),
      ]);
    } finally {
      handleOpenChange(false);
      navigate("/transactions");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {customTrigger ? (
          cloneElement(customTrigger, { ref: triggerRef })
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className="group mt-6 inline-flex items-center gap-4 rounded-full bg-brand-white px-3 py-2 text-xs font-semibold text-brand-blackish shadow-soft"
          >
            <span>Create Order</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-lightblue/70 p-1 text-brand-blue transition-transform duration-300 ease-in-out group-hover:rotate-90">
              <Plus size={15} />
            </span>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content
          style={{
            "--modal-origin-x": `${origin.x}%`,
            "--modal-origin-y": `${origin.y}%`,
          }}
          className=" fixed left-1/2 top-1/2 z-50 h-[90vh] max-h-[91vh] w-full max-w-[1100px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto md:overflow-hidden rounded-[1.75rem] bg-brand-offwhite shadow-xl focus:outline-none md:h-[720px]"
        >
          <Dialog.Title className="sr-only">Create Order</Dialog.Title>
          <Dialog.Description className="sr-only">
            Create a new lead order across country, bank criteria, and delivery settings.
          </Dialog.Description>

          <div className="relative grid min-h-full grid-cols-1 bg-brand-sky md:h-full md:grid-cols-2">
            <div className="relative z-20 flex h-full flex-col p-5 sm:p-7 md:overflow-y-auto md:p-8 hide-scrollbar">
              {!isSubmitted ? (
                <StepHeader step={step} onBack={handleBack} />
              ) : null}

              {!isSubmitted && step === 1 ? (
                <StepCountry
                  country={country}
                  onSelectCountry={setCountry}
                  onNext={() => setStep(2)}
                  canGoNext={canGoStep2}
                />
              ) : null}

              {!isSubmitted && step === 2 ? (
                <StepBankCriteria
                  bankCriteria={bankCriteria}
                  onChangeCriteria={handleBankPreferenceChange}
                  selectedBanks={selectedBanks}
                  onToggleBank={toggleBank}
                  banks={banks}
                  banksLoading={banksLoading}
                  premiumBanks={PREMIUM_BANKS}
                  onNext={() => setStep(3)}
                  canGoNext={canGoStep3}
                />
              ) : null}

              {!isSubmitted && step === 3 ? (
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
                    setQuantity((prev) => Math.max(100, prev - 50))
                  }
                  onIncreaseQuantity={() =>
                    setQuantity((prev) => Math.min(10000, prev + 50))
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
                  onSubmit={handleSubmitOrder}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
              ) : null}

              {isSubmitted ? (
                <SuccessStep onViewOrderHistory={handleViewOrderHistory} />
              ) : null}
            </div>

            <RightPanel
              step={step}
              isSubmitted={isSubmitted}
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
  );
};

export default CreateOrderModal;
