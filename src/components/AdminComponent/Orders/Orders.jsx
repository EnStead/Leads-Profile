import { useEffect, useState } from "react";
import Table from "./Table";
import OrderDetailsModal from "./OrderModal";
import CreateOrder from "../Home/CreateOrder";
import { useDashboard } from "../../../context/DashboardContext";
import { Search } from "lucide-react";

const Orders = () => {
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { orderSearch, setOrderSearch, setSearchTerm } = useDashboard();
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const openOrderDetailsModal = (order) => {
    setIsOrderDetailsOpen(true);
    setSelectedOrder(order);
  };

  const openEditOrder = (order) => {
    setSelectedOrder(order);
    setOrderToEdit(order);
    setIsOrderDetailsOpen(false); // close details modal
    setIsCreateEditOpen(true); // open create/edit modal
  };

  useEffect(() => {
    if (orderSearch.trim() === "") {
      setSearchTerm(""); // triggers React Query to fetch all data
    }
  }, [orderSearch, setSearchTerm]);

  const handleSearch = () => {
    const trimmed = orderSearch.trim();

    // If empty → show all customers
    if (!trimmed) {
      setSearchTerm(""); // triggers React Query with no search
      return;
    }

    // If input exists → search for it
    setSearchTerm(trimmed);
  };

  return (
    <section>
      <div className="xsm:flex justify-between items-center">
        <div>
          <h2 className="text-brand-primary font-park font-bold text-xl mb-2">
            Order Transactions
          </h2>
          <p className="text-brand-subtext">
            Manage customer orders here. Track payment status, progress and
            delivery.
          </p>
        </div>
        <div className="mt-8 flex justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by name and ID..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full px-4 py-2 pr-12 border bg-brand-white border-t-0 border-x-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gray"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary"
            >
              <Search />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-10">
        <Table openOrderDetails={openOrderDetailsModal} />
      </div>

      <CreateOrder
        open={isCreateEditOpen}
        onOpenChange={setIsCreateEditOpen}
        mode={orderToEdit ? "edit" : "create"}
        orderToEdit={orderToEdit}
      />

      <OrderDetailsModal
        open={isOrderDetailsOpen}
        onOpenChange={setIsOrderDetailsOpen}
        order={selectedOrder}
        onEdit={openEditOrder}
      />
    </section>
  );
};

export default Orders;
