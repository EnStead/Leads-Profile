import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import BankDropScene from "./BankDropScene";
import SummaryPanel from "./SummaryPanel";

const RightPanel = ({
  step,
  isSubmitted,
  activeCountry,
  bankCriteria,
  bankPreviewBanks,
  enablePuff,
  summaryRows,
  showReviewNote = true,
}) => {
  const emptyMessage =
    bankCriteria === "filtered" || bankCriteria === "premium_bank"
      ? "Your banks will appear here after selection."
      : "No bank tags available for this criteria.";

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

      {!isSubmitted && step === 1 ? (
        <video
          key={activeCountry.id}
          src={activeCountry.media}
          autoPlay
          muted
          loop
          playsInline
          className="h-[310px] w-full rounded-xl object-cover sm:h-[420px] md:h-full"
        />
      ) : null}

      {!isSubmitted && step === 2 ? (
        <BankDropScene
          key={bankCriteria}
          bankNames={bankPreviewBanks}
          emptyMessage={emptyMessage}
          enablePuff={enablePuff}
          dropMode={bankCriteria === "filtered" ? "filtered_fast" : "default"}
        />
      ) : null}

      {step === 3 || isSubmitted ? (
        <SummaryPanel rows={summaryRows} showReviewNote={showReviewNote} />
      ) : null}
    </div>
  );
};

export default RightPanel;
