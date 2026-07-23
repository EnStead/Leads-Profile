import { Toast } from "radix-ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import GreenTick from "../assets/GreenTick.svg";
import Rejected from "../assets/RedTick.svg";
import { AppToastContext } from "./appToastContext";

const TOAST_PRESETS = [
  {
    match: ["logged in successfully", "login successful", "welcome back"],
    success: {
      title: "Logged in successfully",
      subtitle: "Welcome back — your dashboard is ready.",
      duration: 1500,
    },
  },
  {
    match: ["account created successfully"],
    success: {
      title: "Account created",
      subtitle:
        "Your account is ready to go. You can now start requesting orders.",
      duration: 1500,
    },
  },
  {
    match: [
      "sign in failed",
      "login failed",
      "unauthorized access",
      "incorrect",
      "invalid credentials",
      "invalid email or password",
    ],
    error: {
      title: "Sign-in failed",
      subtitle:
        "The email or password you entered is incorrect. Please try again.",
      duration: 1500,
    },
  },
  {
    match: ["account not found"],
    error: {
      title: "Account not found",
      subtitle: "We couldn’t find an account with those details.",
      duration: 1500,
    },
  },
  {
    match: ["too many attempts"],
    error: {
      title: "Too many attempts",
      subtitle:
        "You’ve tried signing in too many times. Please wait a moment and try again.",
      duration: 1500,
    },
  },
  {
    match: ["session expired"],
    error: {
      title: "Session expired",
      subtitle: "Your session has ended. Please log in again to continue.",
      actionLabel: "Log In",
    },
  },
  {
    match: ["password reset link sent", "reset link sent"],
    success: {
      title: "Reset link sent",
      subtitle: "Check your inbox for a password reset link.",
      actionLabel: "Dismiss",
    },
  },
  {
    match: ["password changed", "password updated", "reset successfully"],
    success: {
      title: "Password updated",
      subtitle: "Your password has been changed successfully.",
      duration: 1500,
    },
  },
  {
    match: ["profile updated", "changes saved successfully"],
    success: {
      title: "Changes saved",
      subtitle: "Your updates have been saved successfully.",
      duration: 1500,
    },
  },
  {
    match: ["order request submitted successfully", "order submitted"],
    success: {
      title: "Order submitted",
      subtitle:
        "Your request has been sent successfully and is now awaiting review.",
      actionLabel: "View Order History",
    },
  },
  {
    match: ["order submission failed", "failed to submit order", "operation failed"],
    error: {
      title: "Order submission failed",
      subtitle:
        "We couldn’t submit your request right now. Please try again.",
      actionLabel: "Retry",
    },
  },
  {
    match: ["payment submitted", "payment details received"],
    success: {
      title: "Payment submitted",
      subtitle:
        "Your payment details have been received and are now awaiting confirmation.",
      actionLabel: "View Order Details",
    },
  },
  {
    match: ["payment submission failed", "failed to submit payment"],
    error: {
      title: "Payment submission failed",
      subtitle:
        "We couldn’t submit your payment details right now. Please try again.",
      actionLabel: "Retry",
    },
  },
  {
    match: [
      "file imported",
      "upload complete",
      "uploaded successfully",
      "upload successful",
      "uploaded",
    ],
    success: {
      title: "Leads Added",
      subtitle: "Leads have been successfully added to the inventory.",
      actionLabel: "View Leads",
    },
  },
  {
    match: [
      "file import failed",
      "invalid file structure",
      "upload failed",
      "failed to upload proof",
    ],
    error: {
      title: "Import failed",
      subtitle:
        "We couldn’t process this file. Please check the format and try again.",
      actionLabel: "Retry Upload",
    },
  },
  {
    match: ["customer added", "customer created", "created customer"],
    success: {
      title: "Customer added",
      subtitle: "A new customer account has been created successfully.",
      duration: 1500,
    },
  },
  {
    match: ["order created", "order updated"],
    success: {
      title: "Order created",
      subtitle: "The order has been successfully created for the customer.",
      actionLabel: "View Order",
    },
  },
  {
    match: ["pricing set", "pricing added"],
    success: {
      title: "Pricing added",
      subtitle: "The order is now ready for customer payment.",
      duration: 1500,
    },
  },
  {
    match: ["order approved"],
    success: {
      title: "Order approved",
      subtitle: "The order has been approved and will begin processing.",
      duration: 1500,
    },
  },
  {
    match: ["order rejected"],
    error: {
      title: "Order rejected",
      subtitle:
        "The order has been cancelled and the customer has been notified.",
      duration: 1500,
    },
  },
  {
    match: ["order deleted"],
    success: {
      title: "Order deleted",
      subtitle: "The order has been permanently removed from the system.",
      duration: 1500,
    },
  },
  {
    match: ["order truncated", "order stopped"],
    success: {
      title: "Order stopped",
      subtitle:
        "Fulfillment has been stopped and the order is now marked as completed.",
      duration: 1500,
    },
  },
  {
    match: ["order recall success", "order recalled"],
    success: {
      title: "Order recalled",
      subtitle:
        "The order has been reassigned to another customer successfully.",
      duration: 1500,
    },
  },
  {
    match: ["order recall failed", "recall failed"],
    error: {
      title: "Recall failed",
      subtitle:
        "This order cannot be recalled because it has already been accessed by the customer.",
      duration: 1500,
    },
  },
  {
    match: ["changes saved", "saved successfully"],
    success: {
      title: "Changes saved",
      subtitle: "Your updates have been applied successfully.",
      duration: 1500,
    },
  },
  {
    match: ["action in progress", "processing request", "processing"],
    success: {
      title: "Processing request",
      subtitle: "Please wait while we complete your action.",
      actionLabel: "Dismiss",
    },
  },
  {
    match: [
      "something went wrong",
      "system error",
      "failed to update order",
      "failed to create deadline",
      "failed to create customer",
      "failed to delete user",
      "failed to create order",
    ],
    error: {
      title: "Something went wrong",
      subtitle: "We couldn’t complete that action. Please try again.",
      actionLabel: "Retry",
    },
  },
  {
    match: ["network error", "connection issue"],
    error: {
      title: "Connection issue",
      subtitle: "Please check your internet connection and try again.",
      actionLabel: "Retry",
    },
  },
];

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const resolveToastContent = ({ message, title, subtitle, type }) => {
  const normalized = normalizeText([title, subtitle, message].filter(Boolean).join(" "));
  const fallbackSubtitle = subtitle || message || "";
  const preset = TOAST_PRESETS.find((item) =>
    item.match.some((needle) => normalized.includes(needle)),
  );

  if (preset?.[type]) {
    return {
      title: title || preset[type].title,
      subtitle: subtitle || preset[type].subtitle || fallbackSubtitle,
      actionLabel: preset[type].actionLabel || "",
      duration: preset[type].duration,
    };
  }

  return {
    title: title || (type === "success" ? "Success" : "Error"),
    subtitle: fallbackSubtitle,
    actionLabel: "",
    duration: undefined,
  };
};

export const AppToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const resolveActionHandler = useCallback(
    (actionLabel, onAction) => {
      if (typeof onAction === "function") return onAction;

      const normalized = normalizeText(actionLabel);

      if (!normalized || normalized === "dismiss" || normalized === "retry" || normalized === "retry upload") {
        return () => hideToast();
      }

      if (normalized === "log in") {
        return () => {
          hideToast();
          navigate("/");
        };
      }

      if (normalized === "view order history") {
        return () => {
          hideToast();
          navigate("/transactions");
        };
      }

      if (normalized === "view leads") {
        return () => {
          hideToast();
          navigate("/admin/uploads");
        };
      }

      if (normalized === "view order") {
        return () => {
          hideToast();
          navigate("/admin/orders");
        };
      }

      if (normalized === "view order details") {
        return () => {
          hideToast();
          navigate("/transactions");
        };
      }

      return () => hideToast();
    },
    [hideToast, navigate],
  );

  const showToast = useCallback(
    (input = {}) => {
      const payload = typeof input === "string" ? { message: input } : input || {};
      const {
        message = "",
        title,
        subtitle,
        type = "success",
        duration,
        actionLabel: incomingActionLabel = "",
        onAction = null,
      } = payload;

      if (!message && !subtitle && !title) return;

      const resolved = resolveToastContent({
        message,
        title,
        subtitle,
        type,
      });

      const actionLabel = incomingActionLabel || resolved.actionLabel || "";
      const toastDuration =
        typeof duration === "number" ? duration : resolved.duration;

      setToast({
        message,
        type,
        title: resolved.title,
        subtitle: resolved.subtitle,
        open: true,
        duration: toastDuration,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        actionLabel,
        onAction: resolveActionHandler(actionLabel, onAction),
      });
    },
    [resolveActionHandler],
  );

  useEffect(() => {
    if (!toast?.open || !toast?.duration) return undefined;

    const timer = setTimeout(() => {
      hideToast();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [hideToast, toast]);

  const value = useMemo(
    () => ({
      showToast,
      hideToast,
    }),
    [hideToast, showToast],
  );

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) hideToast();
  };

  return (
    <Toast.Provider swipeDirection="right">
      <AppToastContext.Provider value={value}>
        {children}
        <Toast.Root
          open={Boolean(toast?.open)}
          onOpenChange={handleOpenChange}
          className={`z-[100] w-[min(420px,calc(100vw-24px))] rounded-2xl border px-4 py-4 text-brand-blackish shadow-[0_20px_60px_rgba(15,23,42,0.16)] ${
            toast?.type === "success"
              ? "border-brand-success/20 bg-brand-white"
              : "border-brand-error/20 bg-brand-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <img
              src={toast?.type === "success" ? GreenTick : Rejected}
              alt=""
              className="mt-1 h-8 w-8 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <Toast.Title className="font-park text-base font-semibold text-brand-blackish">
                {toast?.title}
              </Toast.Title>
              <Toast.Description className="mt-1 text-sm leading-6 text-brand-body">
                {toast?.subtitle}
              </Toast.Description>

              {toast?.actionLabel ? (
                <button
                  type="button"
                  onClick={() => {
                    toast?.onAction?.();
                    hideToast();
                  }}
                  className="mt-3 inline-flex items-center rounded-full text-xs font-semibold text-brand-skyblue transition hover:opacity-90"
                >
                  {toast.actionLabel}
                </button>
              ) : null}
            </div>

            <Toast.Close
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-placeholder transition hover:bg-brand-sky hover:text-brand-blackish"
              aria-label="Dismiss"
            >
              <X size={16} />
            </Toast.Close>
          </div>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 z-[100] p-4" />
      </AppToastContext.Provider>
    </Toast.Provider>
  );
};

export default AppToastProvider;
