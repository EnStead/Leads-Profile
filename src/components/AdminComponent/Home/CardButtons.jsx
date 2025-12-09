import CreateOrder from '../../../assets/CreateOrder.svg'
import AddCustomer from '../../../assets/AddCustomer.svg'
import Head from '../../../assets/Head.svg'
import ViewOrder from '../../../assets/ViewOrder.svg'
import Leads from '../../../assets/Leads.svg'
import System from '../../../assets/System.svg'
import { Link } from 'react-router'

const CardButtons = ({onOpenChange, openAddCustomerModal}) => {
  return (
    <section className='grid my-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' >
        {/* CARD 1 */}
        <div onClick={onOpenChange} className='bg-brand-white border border-brand-offwhite 
          rounded-xl py-2 px-4 w-full h-fit flex flex-col justify-between items-start cursor-pointer  '
        >
            <div className='flex items-center justify-start gap-4'>
                <div className='p-1 bg-brand-blue rounded-lg' >
                    <img src={CreateOrder} alt="image" />
                </div>
                <div>
                    <h3 className='text-brand-primary font-semibold font-park mb-2'>
                        Create Order
                    </h3>
                    <p className='text-brand-muted font-light text-[10px]'>
                        Start and attach an order to customer
                    </p>
                </div>
            </div>
        </div>

        {/* CARD 2 */}
        <div onClick={openAddCustomerModal} className='bg-brand-white border border-brand-offwhite 
          rounded-xl py-2 px-4 w-full h-fit flex flex-col justify-between items-start cursor-pointer '
        >
            <div className='flex items-center justify-start gap-4'>
                <div className='p-1 bg-brand-offwhite rounded-lg' >
                    <img src={AddCustomer} alt="image" />
                </div>
                <div>
                    <h3 className='text-brand-primary font-semibold font-park mb-2'>
                        Add Customer
                    </h3>
                    <p className='text-brand-muted font-light text-[10px]'>
                        Set up customer profile and details
                    </p>
                </div>
            </div>
        </div>

        {/* CARD 3 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-xl py-2 px-4 w-full h-fit flex flex-col justify-between items-start '
        >
            <div className='flex items-center justify-start gap-4'>
                <div className='p-1 bg-brand-offwhite rounded-lg' >
                    <img src={ViewOrder} alt="image" />
                </div>
                <div>
                    <h3 className='text-brand-primary font-semibold font-park mb-2'>
                        View Order History
                    </h3>
                    <p className='text-brand-muted font-light text-[10px]'>
                        Access past orders and details
                    </p>
                </div>
            </div>
        </div>

        {/* CARD 4 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-xl py-2 px-4 w-full h-fit flex flex-col justify-between items-start '
        >
            <div className='flex items-center justify-start gap-4'>
                <div className='p-1 bg-brand-offwhite rounded-lg' >
                    <img src={System} alt="image" />
                </div>
                <div>
                    <h3 className='text-brand-primary font-semibold font-park mb-2'>
                        System Status
                    </h3>
                    <p className='text-brand-muted font-light text-[10px]'>
                        Ping Tree: <span className='text-brand-green font-medium' >Online</span> || API Sync: <span className='text-brand-green font-medium' >Active</span>
                    </p>
                </div>
            </div>
        </div>
    </section>
  )
}

export default CardButtons