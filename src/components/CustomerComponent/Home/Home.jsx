import Cards from "./Cards";
import Table from "./Table";
import { useNavigate } from "react-router";
import OrderDetailsModal from "../Transactions/OrderDetailsModal";
import OrderModal from "../Transactions/OrderModal";
import SuccessModal from "../../../utility/SuccessModal";
import Header from "./Header";
import Request from "./Request";
import { useClientDashboard } from "../../../context/DashboardContext";
import Banner from "./Banner";

const Home = ({
  openAddModal,
  openOrderDetails,
  openOrderModal,
  selectedOrder,
  isModalOpen,
  setIsModalOpen,
  handlePaymentSubmit,
  openSuccessModal,
  setOpenSuccessModal,
  paymentDetails,
  setOpenOrderModal,
}) => {
  const navigate = useNavigate();
  const { setSelectedOrderHistoryId } = useClientDashboard();

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
    <section className="bg-brand-sky min-h-[90vh]">
      
      <Banner openAddModal={openAddModal} />
      {/* Welcome */}
      <Header/>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <div className="grid grid-cols-1 gap-4 xl:col-span-2">
          {/* TOP CARDS */}                                   
          <Cards /> 

          <div className=" h-full">
            <Table
              openAddModal={openAddModal}
              openViewLeads={openViewLeads}
              openOrderDetails={handleOpenOrderDetails}
            />
          </div>

        </div>

        {/* OrdersChart */}
        <div className="h-full xl:col-span-1 self-stretch">
          <Request />
        </div>
      </div>





      <OrderDetailsModal
        open={openOrderModal}
        onOpenChange={setOpenOrderModal}
        order={selectedOrder}
        openViewLeads={openViewLeads}
        openAddModal={openAddModal}
      />

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
    </section>
  );
};

export default Home;
