import { useState } from "react";
import CardButtons from "./CardButtons";
import Cards from "./Cards";
import CreateOrder from "./CreateOrder";
import Table from "./Table";
import AddCustomer from "./AddCustomer";
import { useNavigate } from "react-router";
import OrderModal from "../Orders/OrderModal";
import OrderDeadline from "./OrderDeadline";

const Home = ({ open, onOpenChange }) => {
  const [isModalOpenAddCustomer, setIsModalOpenAddCustomer] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null);
   const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);

  const openEditOrder = (order) => {
    setSelectedOrder(order);
    setOrderToEdit(order);
    setIsOrderDetailsOpen(false); // close details modal
    setIsCreateEditOpen(true); // open create/edit modal
  };

  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const openDeadlineModal = () => {
    setIsDeadlineOpen(true);
  };

  const openAddCustomerModal = () => {
    setIsModalOpenAddCustomer(true);
  };

  const openOrderDetailsModal = (order) => {
    setIsOrderDetailsOpen(true);
    setSelectedOrder(order);
  };

  return (
    <div>
      <Cards />
      <CardButtons
        openAddCustomerModal={openAddCustomerModal}
        onOpenChange={onOpenChange}
        openDeadlineModal={openDeadlineModal}
      />
      <Table openOrderDetails={openOrderDetailsModal} />
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
        onOpenChange={setIsOrderDetailsOpen}
        order={selectedOrder}
        onEdit={openEditOrder}
      />
    </div>
  );
};

export default Home;
