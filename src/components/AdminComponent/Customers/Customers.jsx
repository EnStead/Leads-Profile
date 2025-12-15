import { useState } from "react";
import Table from "./Table"
import DeleteModal from "./DeleteModal";
import OrderDetailsModal from "./OrderDetailsModal";


const Customers = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const openDetailsModal = (order) => {
        setIsModalOpen(true);
        setSelectedOrder(order);
    };
    const openDeleteModal = () => {
        setOpen(true);
    };
    const handleConfirmDelete = () => {
        console.log("Customer deleted!");
        // Add your delete logic here
    };

  return (
    <section>
        <div className='xsm:flex justify-between items-center' >
            <div>
                <h2 className='text-brand-primary font-park font-bold text-xl mb-2' >
                    Customers Details
                </h2>
                <p className='text-brand-subtext'>
                    Manage all customers and their order activity.
                </p>
            </div>
            <div className="mt-8 flex justify-between items-center gap-4" >                        
                {/* Search Bar */}
                <div className="relative w-full max-w-md">                
                    <input
                        type="text"
                        placeholder="Search by Customer or leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pr-12 border bg-brand-white border-t-0 border-x-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gray"
                    />

                </div>
                
            </div>
        </div>

        <div className='pt-10'>
            <Table  openDetailsModal={openDetailsModal} onOpenChange={openDeleteModal} searchTerm={searchTerm} />
        </div>

        <OrderDetailsModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            order={selectedOrder}
        />

        <DeleteModal
            open={open} 
            onOpenChange={setOpen}
            onConfirmDelete={handleConfirmDelete}
        />

    </section>
  )
}

export default Customers