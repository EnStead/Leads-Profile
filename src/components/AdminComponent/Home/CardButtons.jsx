import { ExternalLink, Plus } from "lucide-react";

const CardButtons = ({ openAddCustomerModal, openDeadlineModal }) => {
  return (
    <>
      {/* <button
        type="button"
        onClick={openDeadlineModal}
        className="inline-flex items-center gap-2 rounded-lg border border-brand-body bg-transparent px-4 py-2 text-sm font-semibold text-brand-body transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
      >
        Update Cut-Off
        <ExternalLink size={16} />
      </button> */}

      <button
        type="button"
        onClick={(e) => {
          const btn = e.currentTarget;
          const r = btn.getBoundingClientRect();

          // Button center in viewport
          const btnCx = r.left + r.width / 2;
          const btnCy = r.top + r.height / 2;

          // Viewport center (where modal lands)
          const vpCx = window.innerWidth / 2;
          const vpCy = window.innerHeight / 2;

          // Modal dimensions (approximate or measure)
          const modalW = 520;
          const modalH = 400; // rough height, adjust to yours

          // Origin % relative to modal box
          const ox = 50 + ((btnCx - vpCx) / modalW) * 100;
          const oy = 50 + ((btnCy - vpCy) / modalH) * 100;

          // Inject as CSS custom property on :root
          document.documentElement.style.setProperty(
            "--modal-origin-x",
            `${ox}%`,
          );
          document.documentElement.style.setProperty(
            "--modal-origin-y",
            `${oy}%`,
          );

          openAddCustomerModal(); // or setOpen(true)
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-lightblue px-6 py-2 text-sm font-semibold text-brand-blackish transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-lightblue/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
      >
        Add Customer
      </button>
    </>
  );
};

export default CardButtons;
