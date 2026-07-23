import { ArrowLeft } from "lucide-react";

const StepHeader = ({ step, onBack, totalSteps = 3 }) => (
  <div className="mb-6 flex items-center justify-between">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-2 font-semibold text-brand-body"
    >
      <ArrowLeft size={18} />
      <span>Back</span>
    </button>

    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, index) => index + 1).map((bar) => (
          <span
            key={bar}
            className={`h-[4px] w-8 rounded-full ${
              bar <= step ? "bg-brand-accent" : "bg-brand-stroke"
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-brand-placeholder">
        <span className="text-brand-blackish">Step {step} </span>of {totalSteps}
      </p>
    </div>
  </div>
);

export default StepHeader;
