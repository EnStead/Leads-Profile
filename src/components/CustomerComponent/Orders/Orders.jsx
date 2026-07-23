import { useEffect, useRef, useState } from "react";
import SuccessModal from "../../../utility/SuccessModal";
import OrderModal from "../Transactions/OrderModal";
import Cards from "./Cards";
import { Search } from "lucide-react";
import { useClientDashboard } from "../../../context/DashboardContext";
import CreateOrderModal from "../Home/CreateOrderModal";

const Orders = ({
  handlePaymentSubmit,
  openAddModal,
  isModalOpen,
  setIsModalOpen,
  openSuccessModal,
  setOpenSuccessModal,
  paymentDetails,
}) => {
  const { tranSearch, setTranSearch, setSearchTerm } = useClientDashboard();
  const searchTimerRef = useRef(null);

  useEffect(() => {
    clearTimeout(searchTimerRef.current);

    const trimmed = tranSearch.trim();
    searchTimerRef.current = setTimeout(() => {
      setSearchTerm(trimmed);
    }, 250);

    if (trimmed === "") {
      setSearchTerm("");
    }

    return () => clearTimeout(searchTimerRef.current);
  }, [tranSearch, setSearchTerm]);

  const handleSearch = () => {
    const trimmed = tranSearch.trim();

    // If empty → show all customers
    if (!trimmed) {
      setSearchTerm(""); // triggers React Query with no search
      return;
    }

    // If input exists → search for it
    setSearchTerm(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }; 

  return (
    <section className="bg-brand-sky min-h-[screen]">
      <div className="xsm:flex justify-between items-center">
        <div>
          <h2 className="text-brand-blackish font-park font-bold text-2xl mb-2">
            Leads Orders
          </h2>
          <p className="text-brand-body">
            All leads you've purchased or been assigned.
          </p>
        </div>
        <div className="mt-8 flex justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-md">
            <input
              type="text"
              value={tranSearch}
              placeholder="Search by lead name or source"
              onChange={(e) => setTranSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 pr-12 text-brand-label border bg-brand-white rounded-xl border-brand-placeholder  focus:outline-none focus:ring-2 focus:ring-brand-gray"
            />

            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-label hover:text-brand-primary"
            >
              <Search />
            </button>
          </div>

          <CreateOrderModal
            customTrigger={
              <button
                type="button"
                className="mt-auto w-full max-w-[260px] rounded-xl bg-brand-blackish px-6 py-2 font-semibold text-brand-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create Order
              </button>
            }
          />
        </div>
      </div>

      <div className="pt-10">
        <Cards />
      </div>

      <OrderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        handlePaymentSubmit={handlePaymentSubmit}
      />

      {/* STEP 2 — Success Modal */}
      <SuccessModal
        open={openSuccessModal}
        onOpenChange={setOpenSuccessModal}
        paymentDetails={paymentDetails}
      />
    </section>
  );
};

export default Orders;
