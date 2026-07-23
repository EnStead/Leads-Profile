import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { Copy, Share2, X } from "lucide-react";
import { useNavigate } from "react-router";
import { toBlob as htmlToImageToBlob } from "html-to-image";
import ToastPop from "./ToastPop";
import Coin from "../assets/Coin.svg";
import Tick from "../assets/TickWhite.svg";
import Shield from "../assets/Shield.svg";
import BTC from "../assets/Bitcoin.svg";
import DollarSign from "../assets/DollarSign.svg";
import GoldenDollar from "../assets/GoldenDollar.svg";
import LyingUsdt from "../assets/LyingUsdt.svg";
import TrcCoin from "../assets/TrcCoin.svg";
import TRON from "../assets/TRON.svg";
import BTCQR from "../assets/BTCQR.svg";
import TRONQR from "../assets/TRONQR.svg";

const PAYMENT_METHODS = {
  btc: {
    key: "btc",
    label: "Bitcoin (BTC)",
    amount: "$250",
    shortAmount: "$250 USDT",
    symbol: "BTC",
    address: "16RNqvrYmfgD4nC5WiU6XihjCNMuFvJEb4",
    sym: BTC,
    logo: DollarSign,
    logo2: GoldenDollar,
    qr: BTCQR,
    accent: "from-[#2c49a5] to-[#346cff]",
    notice: "Send BTC to the address above. Other coins may result in loss.",
  },
  tron: {
    key: "tron",
    label: "Tron (TRC-20)",
    amount: "$250",
    shortAmount: "$250 USDT",
    symbol: "TRC-20",
    address: "TEenSY1rWJX4fjCjruxW7dbfWJGYs5e1E4",
    sym: TRON,
    logo: TrcCoin,
    logo2: LyingUsdt,
    qr: TRONQR,
    accent: "from-[#2846aa] to-[#325ce8]",
    notice: "Send USDT to the address above. Other coins may result in loss.",
  },
};

const SuccessModal = ({ open, onOpenChange, paymentDetails }) => {
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const asideRef = useRef(null);
  const network = paymentDetails?.network || "btc";
  const method = PAYMENT_METHODS[network] || PAYMENT_METHODS.btc;
  const tokenLogo = method.tokenLogo || method.logo;

  const rawAmount =
    paymentDetails?.amountPaid ??
    paymentDetails?.amount ??
    paymentDetails?.pricing?.amount;
  const numericAmount = Number(rawAmount);
  const displayAmount = Number.isFinite(numericAmount)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: paymentDetails?.currency || "USD", maximumFractionDigits: 0 }).format(numericAmount)
    : method.amount;

  useEffect(() => {
    if (!open) {
      setToastMsg("");
      setIsSharingImage(false);
      setIsCopied(false);
    }
  }, [open]);

  const copyToClipboard = async (value, message) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setToastMsg(message);
      setToastType("success");
    } catch {
      setToastMsg("Failed to copy to clipboard.");
      setToastType("error");
    }
  };

  const handleShare = async () => {
    const shareText = `${displayAmount} -> ${method.address}`;
    const shareTitle = "Deposit Details";

    try {
      setIsSharingImage(true);
      const targetNode = asideRef.current;
      if (!targetNode) {
        throw new Error("Could not locate payment details panel.");
      }

      const snapshot = await htmlToImageToBlob(targetNode, {
        cacheBust: true,
        pixelRatio: window.devicePixelRatio || 2,
        backgroundColor: "#BED8FF",
        filter: (node) => !node?.dataset?.shareHide,
        style: {
          transform: "none",
          overflow: "hidden",
          borderRadius: "0px",
        },
      });
      if (!snapshot) {
        throw new Error("Could not create share image.");
      }

      const file = new File([snapshot], `deposit-details-${network}.png`, {
        type: snapshot.type || "image/png",
      });

      const downloadUrl = URL.createObjectURL(snapshot);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `deposit-details-${network}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          files: [file],
        });
        return;
      }

      setToastMsg("Payment image downloaded.");
      setToastType("success");
    } catch (error) {
      setToastMsg(
        error?.message ||
          "Image sharing is not available in this browser. You can still copy the address.",
      );
      setToastType("error");
    } finally {
      setIsSharingImage(false);
    }
  };

  const handleViewHistory = () => {
    onOpenChange(false);
    navigate("/transactions");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(1120px,96vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] bg-brand-sky shadow-[0_30px_80px_rgba(15,23,42,0.22)] focus:outline-none lg:h-[min(90vh,860px)] lg:overflow-hidden">
          <ToastPop
            message={toastMsg}
            type={toastType}
            onClose={() => setToastMsg("")}
          />

          <Dialog.Title className="sr-only">Payment Submitted</Dialog.Title>
          <Dialog.Description className="sr-only">
            Your payment has been submitted and is being reviewed.
          </Dialog.Description>

          <Dialog.Close className="absolute right-5 top-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-white text-brand-blackish shadow-sm transition hover:scale-[1.03]">
            <X size={24} />
          </Dialog.Close>

          <div className="grid w-full grid-cols-1 md:grid-cols-[1fr_1.06fr] lg:h-full">
            <section className="flex flex-col items-center justify-center  px-8 py-10 text-center md:px-10 lg:h-full">
              <img src={Coin} alt="" className="w-28 sm:w-32" />

              <h2 className="mt-6 font-park text-2xl font-bold text-brand-blackish">
                Payment Submitted
              </h2>
              <p className="mt-4 max-w-md leading-7 text-brand-body">
                We&apos;re confirming your transaction. This usually takes a few
                minutes to an hour. After confirmation, your leads start
                generating for this order immediately.
              </p>

              <button
                type="button"
                onClick={handleViewHistory}
                className="mt-8 rounded-xl bg-brand-blackish px-8 py-3 font-park font-semibold text-brand-white transition hover:opacity-92"
              >
                View Order History
              </button>
            </section>

            <aside ref={asideRef} className="relative flex items-center justify-center overflow-hidden bg-brand-lightblue px-6 py-20 sm:px-8 lg:h-full">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.7),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />
              <img
                src={method.logo2}
                alt=""
                className="pointer-events-none absolute bottom-0 left-0 h-44 w-44  object-contain opacity-30 blur-[2px]"
              />
              <img
                src={method.logo}
                alt=""
                className="pointer-events-none absolute right-6 top-2 h-24 w-24  object-contain opacity-35 blur-[2px]"
              />

              <div className="relative z-1 w-full max-w-[530px]">
                <div className="text-center">
                  <h3 className="font-park text-lg font-semibold text-brand-blackish">
                    Deposit Details
                  </h3>
                  <p className="mt-6 text-xs uppercase  text-brand-body">
                    send
                  </p>
                  <div className="mt-2 inline-flex items-center gap-3">
                    <span className="text-2xl font-park font-bold text-brand-blackish">
                      {displayAmount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          Number.isFinite(numericAmount) ? numericAmount : method.amount,
                          `Copied! Amount: ${displayAmount}`
                        )
                      }
                      className="text-brand-blue transition hover:opacity-80"
                    >
                      <Copy size={22}  />
                    </button>
                  </div>
                </div>

                <div className="mt-4 w-[430px] mx-auto rounded-xl bg-[#040A19] px-6 py-5">
                  <p className="text-center text-sm uppercase text-[#E8E4E1]">
                    To
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(method.address, "Address copied!")}
                    className="mt-2 w-full rounded-xl bg-[#334155] px-4 py-3 text-center font-medium text-sm text-white transition hover:bg-opacity-90"
                  >
                    {method.address}
                  </button>

                  <div className="mt-3 flex justify-center">
                    <img
                      src={method.qr}
                      alt="QR code"
                      className="h-[170px] w-[170px] rounded-xl bg-white p-2"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#2FD3FF]/20 px-4 py-3 text-center text-[10px] text-[#2FD3FF]">
                   <img src={Shield} alt="" /> {method.notice}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-5">
                  <div
                    data-share-hide="true"
                    className="flex items-center gap-5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const textToCopy = `${method.address}`;
                        copyToClipboard(
                          textToCopy,
                          <span className="block text-left">
                            <span className="break-all">
                              Wallet: {method.address}
                            </span>
                          </span>,
                        );
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className={`inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-semibold text-white transition-all duration-300 ${
                        isCopied ? "bg-[#1A801D]" : `bg-[#2F6BFF] ${method.accent}`
                      }`}
                    >
                      {isCopied ? (
                        <img src={Tick} alt="Tick" className="h-5 w-5" />
                      ) : (
                        <Copy size={20} />
                      )}
                      {isCopied ? "Copied Address" : "Copy Address"}
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      disabled={isSharingImage}
                      className="inline-flex items-center gap-3 text-sm rounded-full bg-brand-white px-7 py-4 font-medium text-brand-body disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Share2 size={20} fill="#334155" />
                      {isSharingImage ? "Sharing..." : "Share"}
                    </button>
                  </div>
                </div>

                <p className="mt-8 text-right font-logo text-xs text-brand-blue">
                  Leads Profile
                </p>
              </div>
            </aside>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SuccessModal;
