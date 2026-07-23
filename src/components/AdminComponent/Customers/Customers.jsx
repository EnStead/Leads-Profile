import { useEffect, useState } from "react";
import Table from "./Table";
import DeleteModal from "./DeleteModal";
import OrderDetailsModal from "./OrderDetailsModal";
import CreateOrder from "../Home/CreateOrder";
import { useAdminDashboard } from "../../../context/DashboardContext";
import { Search } from "lucide-react";

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const {
    customerSearch,
    setCustomerSearch,
    setSearchTerm,
    setSelectedCustomerHistoryId,
  } = useAdminDashboard();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const openDetailsModal = (order) => {
    setSelectedCustomerHistoryId(order._id);
    setIsModalOpen(true);
    setSelectedOrder(order);
  };
  const openDeleteModal = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsDeleteOpen(true);
  };
  const openCreateOrderModal = (customer) => {
    setSelectedCustomer(customer);
    setIsCreateOrderOpen(true);
  };

  useEffect(() => {
    if (customerSearch.trim() === "") {
      setSearchTerm(""); // triggers React Query to fetch all data
    }
  }, [customerSearch, setSearchTerm]);

  const handleSearch = () => {
    const trimmed = customerSearch.trim();

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
    <section>
      <div className="xsm:flex justify-between items-center">
        <div>
          <h2 className="text-brand-blackish  font-bold text-xl mb-2">
            My Customers
          </h2>
          <p className="text-brand-body">
            Manage customer activity, orders, and lead usage.
          </p>
        </div>
        <div className="mt-8 flex justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by Customer"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 pr-12 text-brand-body border bg-brand-white border-brand-placeholder rounded-xl focus:outline-none "
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
        <Table
          openDetailsModal={openDetailsModal}
          onOpenChange={openDeleteModal}
        />
      </div>

      <OrderDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        order={selectedOrder}
        onCreateOrder={openCreateOrderModal}
        onDeleteCustomer={(customer) => openDeleteModal(customer._id)}
      />

      <CreateOrder
        open={isCreateOrderOpen}
        onOpenChange={setIsCreateOrderOpen}
        initialCustomer={selectedCustomer}
        startAtStep={2}
      />

      <DeleteModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        userId={selectedCustomerId}
      />
    </section>
  );
};

export default Customers;

