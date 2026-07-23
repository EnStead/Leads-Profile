import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Copy, Share2, UploadCloud, X } from "lucide-react";
import Shield from "../../../assets/Shield.svg";
import BTC from "../../../assets/Bitcoin.svg";
import Tick from "../../../assets/TickWhite.svg";
import DollarSign from "../../../assets/DollarSign.svg";
import GoldenDollar from "../../../assets/GoldenDollar.svg";
import LyingUsdt from "../../../assets/LyingUsdt.svg";
import TrcCoin from "../../../assets/TrcCoin.svg";
import TRON from "../../../assets/TRON.svg";
import BTCQR from "../../../assets/BTCQR.svg";
import TRONQR from "../../../assets/TRONQR.svg";
import { uploadToCloudinary } from "../../../utility/cloudinaryUpload";
import { submitCustomerOrderPayment } from "../../../context/dashboardApi";
import ToastPop from "../../../utility/ToastPop";
import { useAuth } from "../../../context/AuthContext";
import { toBlob as htmlToImageToBlob } from "html-to-image";

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

const OrderModal = ({ open, onOpenChange, handlePaymentSubmit, order }) => {
  const { user } = useAuth();
  const [network, setNetwork] = useState("btc");
  const [transactionUrl, setTransactionUrl] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreviewName, setReceiptPreviewName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef(null);
  const asideRef = useRef(null);
  const method = PAYMENT_METHODS[network];
  const derivedAmountPaid = Number(
    order?.amountPaid ?? order?.pricing?.amount ?? order?.amount ?? 250,
  );
  const defaultAmountPaid =
    Number.isFinite(derivedAmountPaid) && derivedAmountPaid > 0
      ? derivedAmountPaid
      : 250;
  useEffect(() => {
    if (!open) {
      setNetwork("btc");
      setTransactionUrl("");
      setReceiptFile(null);
      setReceiptPreviewName("");
      setIsUploading(false);
      setUploadError("");
      setToastMsg("");
      setIsSharingImage(false);
      setIsCopied(false);
    }
  }, [open]);

  const displayAmount =
    network === "tron"
      ? `$${defaultAmountPaid.toLocaleString()}`
      : `$${defaultAmountPaid.toLocaleString()}`;

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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setReceiptFile(file);
    setReceiptPreviewName(file?.name || "");
    setUploadError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!transactionUrl.trim() || !receiptFile || isUploading) return;

    try {
      setIsUploading(true);
      setUploadError("");

      const uploadedProof = await uploadToCloudinary(receiptFile);
      const orderId = order?._id ?? order?.id ?? null;

      if (!orderId) {
        throw new Error("Missing order id");
      }

      const payload = {
        network,
        amountPaid: defaultAmountPaid,
        txnUrl: transactionUrl.trim(),
        proofImageUrl: uploadedProof.secure_url,
      };

      const response = await submitCustomerOrderPayment(
        user?.token,
        orderId,
        payload,
      );

      await handlePaymentSubmit?.({
        network,
        amountPaid: defaultAmountPaid,
        transactionUrl,
        receiptUrl: uploadedProof.secure_url,
        receiptPublicId: uploadedProof.public_id,
        receiptFormat: uploadedProof.format,
        receiptFileName: receiptFile.name,
        orderId,
        response,
      });

      setTransactionUrl("");
      setReceiptFile(null);
      setReceiptPreviewName("");
    } catch (error) {
      setUploadError(error?.message || "Failed to upload proof.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `Amount: ${displayAmount}\nAddress: ${method.address}`;
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(1200px,96vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] bg-brand-sky shadow-[0_30px_80px_rgba(15,23,42,0.22)] focus:outline-none lg:h-[min(90vh,860px)] lg:overflow-hidden">
          <ToastPop
            message={toastMsg}
            type={toastType}
            onClose={() => setToastMsg("")}
          />

          <Dialog.Title className="sr-only">Make Payment</Dialog.Title>
          <Dialog.Description className="sr-only">
            Choose BTC or TRON, upload your receipt, and submit your payment.
          </Dialog.Description>

          <Dialog.Close className="absolute right-5 top-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-white text-brand-blackish shadow-sm transition hover:scale-[1.03]">
            <X size={24} />
          </Dialog.Close>

          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:h-full">
            <div className="relative flex flex-col overflow-hidden lg:h-full">
              <section className="flex flex-col px-8 pt-8 pb-20 md:px-10 lg:h-full overflow-y-auto hide-scrollbar">
                <div className="pr-12">
                  <h2 className="font-park text-2xl font-bold text-brand-blackish">
                    Make Payment
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-brand-body">
                    Choose the network you made your payment in so we can better
                    track it.
                  </p>
                </div>

                <div className="mt-6 inline-flex w-full max-w-[440px] rounded-full bg-brand-white p-1 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]">
                  {Object.values(PAYMENT_METHODS).map((item) => {
                    const isActive = item.key === network;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setNetwork(item.key)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm transition ${
                          isActive
                            ? "bg-brand-royalblue text-brand-white shadow-sm font-medium "
                            : "text-brand-body font-light"
                        }`}
                      >
                        <img src={item.sym} alt="" className="h-5 w-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <h3 className="font-park font-semibold text-brand-blackish">
                    How to Pay
                  </h3>
                  <ul className="mt-4 space-y-2 pl-6 text-brand-body leading-7">
                    <li className="list-disc">
                      Send exactly <strong>{displayAmount}</strong> worth of{" "}
                      <strong>{network === "btc" ? "BTC" : "USDT"}</strong> to
                      the wallet address provided. Only send{" "}
                      <span>
                        {network === "btc" ? "BTC (Bitcoin)" : "USDT (TRC 20)"}
                      </span>
                      . Sending any other token may result in loss of funds.
                    </li>
                    <li className="list-disc">
                      Make sure you&apos;re sending on{" "}
                      <strong>
                        {network === "btc" ? "Bitcoin" : "Tron (TRC 20)"}
                      </strong>{" "}
                      network to avoid loss of funds.
                    </li>
                  </ul>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-4 flex max-w-[450px] flex-1 flex-col"
                >
                  <div>
                    <label
                      className={`mb-3 block font-medium ${
                        receiptFile ? "text-brand-blackish" : "text-brand-label"
                      }`}
                    >
                      Transaction Image
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex w-full items-center justify-center gap-3 rounded-xl text-sm border font-medium bg-brand-lightblue px-4 py-3.5 text-brand-blue transition hover:opacity-90 ${
                        receiptFile
                          ? "border-brand-blue"
                          : "border-brand-skyblue"
                      }`}
                    >
                      <span className="rounded-full bg-brand-white p-1.5 shadow-sm">
                        <UploadCloud size={20} />
                      </span>
                      {receiptPreviewName || "Click to upload"}
                      {!receiptFile ? (
                        <span className="text-brand-label font-light">
                          or drag and drop
                        </span>
                      ) : null}
                    </button>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="transaction-url"
                      className={`mb-3 block font-medium ${
                        transactionUrl.trim()
                          ? "text-brand-blackish"
                          : "text-brand-label"
                      }`}
                    >
                      Transaction ID
                    </label>
                    <input
                      id="transaction-url"
                      type="text"
                      required
                      value={transactionUrl}
                      onChange={(event) =>
                        setTransactionUrl(event.target.value)
                      }
                      placeholder="Paste the transaction hash here..."
                      className={`w-full rounded-xl border bg-brand-white px-5 py-3 text-lg text-brand-blackish outline-none transition placeholder:text-brand-placeholder focus:border-brand-blackish ${
                        transactionUrl.trim()
                          ? "border-brand-blackish"
                          : "border-brnad-label"
                      }`}
                    />
                  </div>

                  {uploadError ? (
                    <p className="mt-3 text-sm font-medium text-brand-error">
                      {uploadError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={
                      !transactionUrl.trim() || !receiptFile || isUploading
                    }
                    className="mt-6 w-full max-w-[300px] rounded-xl bg-brand-blackish px-6 py-3 font-park font-semibold text-brand-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {isUploading ? "Uploading..." : "Submit Payment"}
                  </button>
                </form>
              </section>

              {/* Subtle fade effect at the bottom */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-brand-sky to-transparent" />
            </div>

            <aside
              ref={asideRef}
              className="relative flex items-center justify-center overflow-hidden bg-brand-lightblue px-6 py-20 sm:px-8 lg:h-full"
            >
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
                  <p className="mt-6 text-xs uppercase font-light  text-brand-body">
                    Send
                  </p>
                  <div className="mt-2 inline-flex items-center gap-3">
                    <span className="text-2xl font-park font-bold text-brand-blackish">
                      {displayAmount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          defaultAmountPaid,
                          `Copied! Amount: ${displayAmount}`,
                        )
                      }
                      className="text-brand-blue transition hover:opacity-80"
                    >
                      <Copy size={22} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 w-[430px] mx-auto rounded-xl bg-[#040A19] px-6 py-5">
                  <p className="text-center text-sm uppercase font-light text-[#E8E4E1]">
                    To
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(method.address, "Address copied!")
                    }
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
                      className="inline-flex items-center gap-3 rounded-full bg-brand-white px-7 py-4 text-sm font-medium text-brand-body disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Share2 size={20} fill="currentColor" />
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

export default OrderModal;
