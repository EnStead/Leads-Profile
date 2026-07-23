import { Check } from "lucide-react";
import { COUNTRIES } from "./constants";

const StepCountry = ({ country, onSelectCountry, onNext, canGoNext }) => (
  <div className="flex flex-1 flex-col space-y-8">
    <div>
      <h3 className="text-lg font-park font-semibold text-brand-blackish">
        Where should your leads come from?
      </h3>
      <p className="mt-2 text-sm text-brand-body">
        Select the country pool you want to order from.
      </p>
    </div>

    <div className="space-y-4">
      {COUNTRIES.map((option) => {
        const isSelected = country === option.id;
        const isDisabled = Boolean(option.disabled);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              if (!isDisabled) {
                onSelectCountry(option.id);
              }
            }}
            disabled={isDisabled}
            className={`w-full rounded-xl border px-4 py-4 text-left transition ${
              isDisabled
                ? "cursor-not-allowed border-brand-stroke bg-brand-offwhite/70 opacity-65"
                : isSelected
                ? "border-2 border-brand-blue bg-brand-lightblue"
                : "border-brand-stroke bg-brand-white hover:border-brand-blue/45"
            }`}
          >
            <div className="flex relative items-start justify-between gap-4">
              <div className="space-y-2">
                <img
                  src={option.icon}
                  alt={option.name}
                  className="h-8 w-8 rounded-full border border-brand-stroke object-cover"
                />
                <h4 className="font-park font-semibold text-brand-blackish">
                  {option.name}
                </h4>
                <p className="text-xs font-light text-brand-body">{option.subtitle}</p>
              </div>

                {isDisabled ? (
                  <p className="text-[10px] absolute right-0 font-medium uppercase tracking-[0.12em] text-brand-label">
                    {option.disabledLabel || "Unavailable"}
                  </p>
                ) :               
                <span
                className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  isDisabled
                    ? "border-brand-stroke bg-brand-offwhite text-brand-label"
                    : isSelected
                    ? "border-brand-blue bg-brand-blue text-brand-white"
                    : "border-brand-label/70 text-transparent"
                }`}
              >
                <Check size={15} />
              </span>
                }


            </div>
          </button>
        );
      })}
    </div>

    <button
      type="button"
      onClick={onNext}
      disabled={!canGoNext}
      className="mt-auto w-full max-w-[260px] rounded-xl bg-brand-blackish px-6 py-2 font-semibold text-brand-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Next
    </button>
  </div>
);

export default StepCountry;
