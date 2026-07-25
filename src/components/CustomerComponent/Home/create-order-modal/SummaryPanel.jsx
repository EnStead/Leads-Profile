import GlassUserIcon from "../../../../assets/GlassUserIcon.svg";
import BlueUserIcon from "../../../../assets/BlueUserIcon.svg";
  
const SummaryPanel = ({ rows, showReviewNote = true }) => (
  <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-brand-lightblue p-6">
    {/* Decorative background icons */}
    <img src={GlassUserIcon} alt="glass user" className="pointer-events-none absolute right-0 top-0" />
    <img src={BlueUserIcon} alt="blue user" className="pointer-events-none absolute bottom-0 left-0" />

    <div className="relative z-10 mt-10 space-y-5">
      <h4 className="text-center text-lg font-park font-semibold text-brand-blackish">
        Order Summary
      </h4>

      <div className="rounded-3xl bg-brand-sky p-4 backdrop-blur-xs">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-5 border-b border-brand-stroke mt-2 py-2 last:border-b-0"
          >
            <p className="text-base text-brand-label">{row.label}</p>
            <p className="text-right text-base font-semibold text-brand-blackish">
              {row.value}
            </p>
          </div>
        ))}
      </div> 
    </div>

    <div className="relative z-10 mt-6 flex min-h-0 flex-1 flex-col">
      {showReviewNote ? (
        <p className="text-center text-xs leading-relaxed text-brand-body">
          Our team will <strong>review</strong> and <strong>price your order</strong>{" "}
          before processing it. You&apos;ll receive a notification once a quote is
          attached to your order.
        </p>
      ) : null}
      <p className="mt-auto pt-6 text-right font-logo text-brand-skyblue">Leads Profile</p>
    </div>
  </div>
);

export default SummaryPanel;
