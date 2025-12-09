import SuccessModal from "../../utility/SuccessModal"
import OrderModal from "../Transactions/OrderModal"
import Cards from "./Cards"


const Orders = ({    
    handlePaymentSubmit,openAddModal,
    isModalOpen,setIsModalOpen,
    openSuccessModal,setOpenSuccessModal
}) => {
  return (
    <section className='bg-brand-sky min-h-[screen] p-10'>
        <div className='flex justify-between items-center' >
            <div>
                <h2 className='text-brand-primary font-park font-bold text-xl mb-2' >
                    Leads Orders
                </h2>
                <p className='text-brand-subtext'>
                    All leads you've purchased or been assigned.
                </p>
            </div>
            <div className="mt-8 flex justify-between items-center gap-4" >                        
                {/* Search Bar */}
                <div className="relative w-full max-w-md">
                
                    <input
                        type="text"
                        placeholder="Search by lead name or source"
                        className="w-full px-4 py-2 border bg-brand-white border-t-0 border-x-0 rounded-xl  focus:outline-none focus:ring-2 focus:ring-brand-gray"
                    />
                </div>
  
                {/* <button onClick={openAddModal}  className=" cursor-pointer w-67 bg-brand-blue text-brand-white font-park text-sm sm:text-base px-2 sm:px-10 py-2  rounded-xl font-medium hover:opacity-90 transition">
                    Place Orders
                </button> */}
                
            </div>
        </div>


        
        <div className='pt-10'>
            <Cards/>
        </div>

        <OrderModal
          open={isModalOpen} onOpenChange={setIsModalOpen}
          handlePaymentSubmit={handlePaymentSubmit}
        />

        {/* STEP 2 — Success Modal */}
        <SuccessModal
            open={openSuccessModal}
            onOpenChange={setOpenSuccessModal}
        />


    </section>
  )
}

export default Orders