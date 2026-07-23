import * as Dialog from "@radix-ui/react-dialog";
import { Copy, X } from "lucide-react";
import { useAdminDashboard } from "../../../context/DashboardContext";
import Avater from "../../../assets/Avater.jpg";
import AdminRec from "../../../assets/AdminRec.png";
import Paid from "../../../assets/Paid.svg";
import Verified from "../../../assets/Verified.svg";
import Rejected from "../../../assets/Rejected.svg";
import Logo from "../../../assets/Logo.svg"; // Adjust to .png or the correct filename if needed
import {
  getProfileImageSrc,
  PROFILE_BG_TONES,
} from "../../../utility/profilePresets";
import { useAppToast } from "../../../utility/appToastContext";


const formatDateTime = (value) => {
  if (!value) return "Pending";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatMoney = (value, currency = "USD") => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const getProofImage = (transaction) =>
  transaction?.payment?.receiptUrl ||
  transaction?.payment?.proofOfPaymentUrl ||
  transaction?.payment?.proofImageUrl ||
  transaction?.payment?.transactionScreenshot ||
  transaction?.payment?.proofImage ||
  transaction?.receiptUrl ||
  transaction?.proofOfPaymentUrl ||
  transaction?.proofImageUrl ||
  transaction?.transactionScreenshot ||
  transaction?.proofImage ||
  AdminRec;

const getAvatarBgTone = (customer) => {
  const seed = String(
    customer?.imagePreset || customer?._id || customer?.id || customer?.email || customer?.name || "",
  );
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PROFILE_BG_TONES[total % PROFILE_BG_TONES.length];
};

const getCustomerAvatarSrc = (customer) => {
  const presetId = String(customer?.imagePreset || "").trim();
  return presetId ? getProfileImageSrc(presetId) : Avater;
};

const TransactionProofModal = ({ open, onOpenChange, transaction }) => {
  const {
    adminTransactionDetailData,
    adminTransactionDetailLoading,
    adminTransactionDetailError,
  } = useAdminDashboard();
  const { showToast } = useAppToast();

  const resolvedTransaction = adminTransactionDetailData || transaction;

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

  if (!resolvedTransaction) return null;

  const title =
    resolvedTransaction?.publicId ||
    resolvedTransaction?.customId ||
    `#LP-${String(resolvedTransaction?._id || "").slice(-4)}`;
  const amount =
    resolvedTransaction?.amount ??
    resolvedTransaction?.amountPaid ??
    resolvedTransaction?.payment?.amount ??
    resolvedTransaction?.payment?.amountPaid ??
    resolvedTransaction?.pricing?.amount ??
    resolvedTransaction?.transactionAmount ??
    0;
  const currency =
    resolvedTransaction?.currency ||
    resolvedTransaction?.payment?.currency ||
    resolvedTransaction?.pricing?.currency ||
    "USD";
  const network =
    resolvedTransaction?.payment?.network?.label ||
    resolvedTransaction?.payment?.network?.key ||
    resolvedTransaction?.network?.label ||
    resolvedTransaction?.network?.key ||
    resolvedTransaction?.selectedPaymentNetwork ||
    resolvedTransaction?.paymentNetwork ||
    "BTC";
  const customerName =
    resolvedTransaction?.customer?.name ||
    resolvedTransaction?.payment?.customer?.name ||
    resolvedTransaction?.client?.name ||
    resolvedTransaction?.customerName ||
    resolvedTransaction?.name ||
    "Customer";
  const customerAvatar = resolvedTransaction?.customer || resolvedTransaction?.payment?.customer || {};
    
  const normalizedStatus = String(
    resolvedTransaction?.displayStatus || resolvedTransaction?.status || ""
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[5px]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(980px,96vw)] -translate-x-1/2 -translate-y-1/2 focus:outline-none">
          <Dialog.Title className="sr-only">Transaction Proof</Dialog.Title>
          <Dialog.Description className="sr-only">
            Transaction proof screenshot, customer name, amount, and payment stamp.
          </Dialog.Description>

          <Dialog.Close className="absolute right-0 top-0 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0A1020] shadow-sm">
            <X size={16} />
            Close
          </Dialog.Close>

          {adminTransactionDetailLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-white">
              <img src={Logo} alt="Loading..." className="h-16 w-auto animate-pulse object-contain" />
            </div>
          ) : adminTransactionDetailError ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-white">
              <p className="text-sm text-red-200">
                Failed to load transaction details.
              </p>
            </div>
          ) : (
            <>
              <div className=" text-center text-white">
                <h2 className="font-park text-2xl font-bold">{title}</h2>
                <p className="mt-2 text-xs">
                  Submitted on {formatDateTime(resolvedTransaction?.submittedAt || resolvedTransaction?.createdAt || resolvedTransaction?.updatedAt)}
                </p>
              </div>

              <div className="relative mt-6 rounded-[1.6rem] bg-white px-4 pt-4 shadow-[0_25px_60px_rgba(15,23,42,0.3)]">
                <div className="relative flex h-[490px] w-full items-center justify-center overflow-hidden rounded-[1.2rem] border border-[#e9edf5] bg-[#0f1320]">
                  <img
                    src={getProofImage(resolvedTransaction)}
                    alt="Transaction proof"
                    className="max-h-full max-w-full object-contain"
                  />
                  
                  {resolvedTransaction?.txnUrl && (
                    <div className="absolute bottom-4 left-1/2 flex w-max max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-xl bg-white px-4 py-1 shadow-md">
                      <span className="max-w-[200px] truncate text-sm font-light underline text-[#2F6BFF] sm:max-w-[300px]">
                        {resolvedTransaction.txnUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(resolvedTransaction.txnUrl)}
                        className="shrink-0 cursor-pointer text-[#2F6BFF] transition-colors hover:text-[#2F6BFF]"
                        title="Click to copy"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center justify-between gap-4 px-3 pb-2 pt-5">
                  <div className="inline-flex items-center gap-3 rounded-full bg-[#F3F8FF] px-4 py-2">
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full  ${getAvatarBgTone(customerAvatar)}`}
                    >
                      <img
                        src={getCustomerAvatarSrc(customerAvatar)}
                        alt={customerName}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="font-semibold text-[#334155]">{customerName}</span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-[#334155]">{network}</p>
                    <p className=" text-4xl font-semibold font-num text-[#2F6BFF]">
                      {formatMoney(amount, currency)}
                    </p>
                  </div>

                  {["paid", "verified", "rejected", "cancelled"].includes(normalizedStatus) ? (
                    <div
                      className={`pointer-events-none absolute left-1/2 top-15 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center `}
                    >
                      <div className="flex flex-col items-center justify-center">
                        {normalizedStatus === "rejected" || normalizedStatus === "cancelled" ? (
                          <img src={Rejected} alt="Rejected" className="h-[120px] w-[120px] object-contain" />
                        ) : normalizedStatus === "verified" ? (
                          <img src={Verified} alt="Verified" className="h-[120px] w-[120px] object-contain" />
                        ) : (
                          <img src={Paid} alt="Paid" className="h-[120px] w-[120px] object-contain" />
                        )}

                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TransactionProofModal;
