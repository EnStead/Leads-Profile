import { useEffect, useState } from "react";
import Table from "./Table";
import DeleteModal from "./DeleteModal";
import OrderDetailsModal from "./OrderDetailsModal";
import { useDashboard } from "../../../context/DashboardContext";
import { Search } from "lucide-react";

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { customerSearch, setCustomerSearch, setSearchTerm } = useDashboard();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const openDetailsModal = (order) => {
    setIsModalOpen(true);
    setSelectedOrder(order);
  };
  const openDeleteModal = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsDeleteOpen(true);
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

  return (
    <section>
      <div className="xsm:flex justify-between items-center">
        <div>
          <h2 className="text-brand-primary font-park font-bold text-xl mb-2">
            Customers Details
          </h2>
          <p className="text-brand-subtext">
            Manage all customers and their order activity.
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
        <Table
          openDetailsModal={openDetailsModal}
          onOpenChange={openDeleteModal}
        />
      </div>

      <OrderDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        order={selectedOrder}
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
