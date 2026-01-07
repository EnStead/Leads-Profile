import { Search } from 'lucide-react'
import Table from './Table'
import OrderModal from './OrderModal';
import SuccessModal from '../../utility/SuccessModal';
import OrderDetailsModal from './OrderDetailsModal';
import { useNavigate } from 'react-router';
import { useDashboard } from '../../context/DashboardContext';
import { useEffect, useState } from 'react';

const Transactions = ({
    handlePaymentSubmit,openAddModal,
    isModalOpen,setIsModalOpen, selectedOrder,
    openSuccessModal,setOpenSuccessModal,
    openOrderModal,setOpenOrderModal,openOrderDetails
}) => {
    const navigate = useNavigate();

      const { tranSearch, setTranSearch, setSearchTerm } = useDashboard();
    
      useEffect(() => {
        if (tranSearch.trim() === "") {
          setSearchTerm(""); // triggers React Query to fetch all data
        }
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

    const openViewLeads = (order) => {
      navigate(`/orders/${order._id}`);
    };
    


  return (
    <section className='bg-brand-sky min-h-[screen]'>
        <div className='xsm:flex justify-between items-center' >
            <div>
                <h2 className='text-brand-primary font-park font-bold text-xl mb-2' >
                    Order Transactions
                </h2>
                <p className='text-brand-subtext'>
                    Track all your order payments in one place.
                </p>
            </div>
            <div className="mt-8 flex justify-between items-center gap-4" >                        
                {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={tranSearch}
              placeholder="Search by ID"
              onChange={(e) => setTranSearch(e.target.value)}
              className="w-full px-4 py-2 pr-12 border bg-brand-white border-t-0 border-x-0 rounded-xl  focus:outline-none focus:ring-2 focus:ring-brand-gray"
            />

            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary"
            >
              <Search />
            </button>
          </div>
  
                {/* <button onClick={openAddModal}  className=" cursor-pointer w-67 bg-brand-blue text-brand-white font-park text-sm sm:text-base px-2 sm:px-10 py-2  rounded-xl font-medium hover:opacity-90 transition">
                    Place Orders
                </button> */}
                
            </div>
        </div>

        <div className='pt-10'>
            <Table  openAddModal={openAddModal} openOrderDetails={openOrderDetails} openViewLeads={openViewLeads}  />
        </div>


        {/* <OrderModal
          open={isModalOpen} onOpenChange={setIsModalOpen}
          handlePaymentSubmit={handlePaymentSubmit}
        /> */}

        {/* STEP 2 — Success Modal */}
        {/* <SuccessModal
            open={openSuccessModal}
            onOpenChange={setOpenSuccessModal}
        /> */}

        <OrderDetailsModal
            open={openOrderModal}
            onOpenChange={setOpenOrderModal}
            order={selectedOrder}
            openViewLeads={openViewLeads}
        />

        

    </section>
  )
}

export default Transactions