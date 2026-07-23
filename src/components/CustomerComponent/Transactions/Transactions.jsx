import { Search } from "lucide-react";
import Table from "./Table";
import OrderModal from "./OrderModal";
import SuccessModal from "../../../utility/SuccessModal";
import OrderDetailsModal from "./OrderDetailsModal";
import { useNavigate } from "react-router";
import { useClientDashboard } from "../../../context/DashboardContext";
import CreateOrderModal from "../Home/CreateOrderModal";

const Transactions = ({
  handlePaymentSubmit,
  openAddModal,
  isModalOpen,
  setIsModalOpen,
  selectedOrder,
  openSuccessModal,
  setOpenSuccessModal,
  openOrderModal,
  setOpenOrderModal,
  openOrderDetails,
  paymentDetails,
}) => {
  const navigate = useNavigate();

  const { tranSearch, setTranSearch, setSelectedOrderHistoryId } =
    useClientDashboard();

  const handleSearch = () => {
    return;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const openViewLeads = (order, event) => {
    if (!order) return;

    navigate(`/orders`, {
      state: {
        autoOpenOrder: order,
        autoOpenEvent: event,
        forceOpenFolderModal: true,
      },
    });
  };

  const handleOpenOrderDetails = (order) => {
    setSelectedOrderHistoryId(order?._id || order?.id || order?.publicId || "");
    openOrderDetails?.(order);
  };

  return (
    <section className="bg-brand-sky min-h-[screen]">
      <div className="xsm:flex justify-between items-center">
        <div>
          <h2 className="text-brand-blackish font-park font-bold text-xl mb-2">
            Order Transactions
          </h2>
          <p className="text-brand-body">
            Track all your order payments in one place.
          </p>
        </div>
        <div className="mt-8 flex justify-between items-center gap-4">
          <div className="relative w-md">
            <input
              type="text"
              value={tranSearch}
              placeholder="Search for anything on this page..."
              onChange={(e) => setTranSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 pr-12 text-brand-body border-brand-label border bg-brand-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gray"
            />

            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-body hover:text-brand-blackish transition-colors duration-300"
            >
              <Search />
            </button>
          </div>
 
          <CreateOrderModal
            customTrigger={
              <button
                type="button"
                className="rounded-xl bg-brand-blackish w-full max-w-[260px] px-8 py-3 font-semibold text-brand-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create Order
              </button>
            }
          />
        </div>
      </div>

      <div className="pt-10">
        <Table
          openAddModal={openAddModal}
          openOrderDetails={handleOpenOrderDetails}
          openViewLeads={openViewLeads}
        />
      </div>

      <OrderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        handlePaymentSubmit={handlePaymentSubmit}
        order={selectedOrder}
      />

      <SuccessModal
        open={openSuccessModal}
        onOpenChange={setOpenSuccessModal}
        paymentDetails={paymentDetails}
      />

      <OrderDetailsModal
        open={openOrderModal}
        onOpenChange={setOpenOrderModal}
        order={selectedOrder}
        openViewLeads={openViewLeads}
        openAddModal={openAddModal}
      />
    </section>
  );
};

export default Transactions;
