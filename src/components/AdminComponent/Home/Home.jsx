import { useState } from "react";
import CardButtons from "./CardButtons";
import Cards from "./Cards";
import CreateOrder from "./CreateOrder";
import Table from "./Table";
import AddCustomer from "./AddCustomer";
import OrderModal from "../Orders/OrderModal";
import OrderDeadline from "./OrderDeadline";
import Header from "./Header";
import PendingApproval from "./PendingApproval";
import { useAdminDashboard } from "../../../context/DashboardContext";

const Home = () => {
  const { adminOrderData, setSelectedAdminOrderHistoryId } = useAdminDashboard();
  const [isModalOpenAddCustomer, setIsModalOpenAddCustomer] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const [orderModalAction, setOrderModalAction] = useState(null);
  const getDetailedOrder = (order) => {
    const orderId = String(order?._id || order?.id || "");
    const detailedOrder = Array.isArray(adminOrderData?.data)
      ? adminOrderData.data.find(
          (item) => String(item?._id || item?.id || "") === orderId,
        )
      : null;

    return detailedOrder || order;
  };

  const openEditOrder = (order) => {
    const detailedOrder = getDetailedOrder(order);
    setSelectedOrder(detailedOrder);
    setOrderToEdit(detailedOrder);
    setOrderModalAction(null);
    setIsOrderDetailsOpen(false);
    setIsCreateEditOpen(true);
  };

  const openDeadlineModal = () => {
    setIsDeadlineOpen(true);
  };

  const openAddCustomerModal = () => {
    setIsModalOpenAddCustomer(true);
  };

  const openOrderDetailsModal = (order) => {
    setOrderModalAction(null);
    const orderId = order?._id || order?.id || "";
    const detailedOrder = getDetailedOrder(order);
    setSelectedOrder(detailedOrder);
    setSelectedAdminOrderHistoryId(orderId);
    setIsOrderDetailsOpen(true);
  };

  const openOrderAction = (order, action) => {
    if (action === "details") {
      openOrderDetailsModal(order);
      return;
    }

    if (action === "edit") {
      openEditOrder(order);
      return;
    }

    const detailedOrder = getDetailedOrder(order);
    setSelectedOrder(detailedOrder);
    setSelectedAdminOrderHistoryId(order?._id || order?.id || "");
    setOrderModalAction(action);
    setIsOrderDetailsOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-4 lg:px-6">
        <Header
          actions={
            <CardButtons
              openAddCustomerModal={openAddCustomerModal}
              openDeadlineModal={openDeadlineModal}
            />
          }
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2.5fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-4">
            <Cards />
            <Table
              openOrderDetails={openOrderDetailsModal}
              openOrderAction={openOrderAction}
            />
          </div>
          <PendingApproval 
            openOrderDetails={openOrderDetailsModal}

          />
        </div>
      </div>

      <CreateOrder
        open={isCreateEditOpen}
        onOpenChange={setIsCreateEditOpen}
        mode={orderToEdit ? "edit" : "create"}
        orderToEdit={orderToEdit}
      />
      <OrderDeadline open={isDeadlineOpen} onOpenChange={setIsDeadlineOpen} />
      <AddCustomer
        open={isModalOpenAddCustomer}
        onOpenChange={setIsModalOpenAddCustomer}
      />
      <OrderModal
        open={isOrderDetailsOpen}
        onOpenChange={(nextOpen) => {
          setIsOrderDetailsOpen(nextOpen);
          if (!nextOpen) {
            setOrderModalAction(null);
            setSelectedAdminOrderHistoryId("");
          }
        }}
        order={selectedOrder}
        onEdit={openEditOrder}
        initialAction={orderModalAction}
      />
    </div>
  );
};

export default Home;
