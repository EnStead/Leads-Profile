import { useState } from "react";
import Table from "./Table";
import TransactionProofModal from "./TransactionProofModal";
import { useAdminDashboard } from "../../../context/DashboardContext";
import { Search } from "lucide-react";

const Transactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const {
    tranSearch,
    setTranSearch,
    setSelectedAdminTransactionId,
  } = useAdminDashboard();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const openDetailsModal = (order) => {
    setSelectedAdminTransactionId(order?.id || order?._id || "");
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

  const handleSearch = () => {
    setTranSearch(tranSearch.trim());
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
            All transactions
          </h2>
          <p className="text-brand-body">
            Here are past payments made by customers
          </p>
        </div>
        <div className="mt-8 flex justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by transaction, customer, or order"
              value={tranSearch}
              onChange={(e) => setTranSearch(e.target.value)}
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
      <TransactionProofModal
        open={isModalOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSelectedAdminTransactionId("");
            setSelectedOrder(null);
          }
          setIsModalOpen(nextOpen);
        }}
        transaction={selectedOrder}
      />

    </section>
  );
};

export default Transactions;

