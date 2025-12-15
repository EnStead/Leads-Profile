import Semi from '../../assets/Semi.svg'
import Head from '../../assets/Head.svg'
import File from '../../assets/File.svg'
import { Dot,MoveRight,UserRound } from 'lucide-react';
import { Link } from 'react-router';
import Image from '../../assets/CardBg.png';
import { useState } from 'react';
import OrderModal from './OrderModal';
import { useDashboard } from '../../context/DashboardContext';
import CardSkeleton from '../../utility/skeletons/CardSkeleton';

 
const Cards = () => {
  const { dashboardData, dashboardLoading, dashboardError } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openAddModal = () => {
    setIsModalOpen(true);
  }; 

  
    if (dashboardLoading) {
      return (
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    );;
    }


    if (dashboardError) {
      return <p className="text-brand-red">Failed to load dashboard data.</p>;
    }

    const todaysLeads = dashboardData?.leadsDeliveredToday;
    const totalLeads = dashboardData?.totalLeadsReceived;
    const activeOrders = dashboardData?.activeOrders;

  return (
    <section>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' >
        {/* CARD 1 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex items-center justify-start gap-4' >
            <div className='bg-brand-blue/10 rounded-full p-1' >
              <img src={Semi} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Leads Delivered today
            </h3>

          </div>

          <div className=''>
            <div className='flex gap-4' >
              <h2 className='text-brand-primary font-bold text-4xl font-park '>
                {todaysLeads}
              </h2>
              <p className='text-brand-purple flex items-center w-fit font-medium text-xs rounded-xl pr-2 h-6 my-auto bg-brand-purple/10'>
                <Dot/> Live
              </p>
            </div>
            <div className='flex items-center gap-3 mt-4'>
              <img src={Head} alt="Image" />
              <span className='text-brand-green font-sm font-medium'>+30% <span className='text-brand-muted font-light'>vs yesterday</span></span>
            </div>
          </div>

        </div>

        {/* CARD 2 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex items-center gap-4 justify-start' >
            <div className='bg-brand-blue/10 text-brand-blue rounded ' >
              <UserRound fill='#2F6BFF' />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Total Leads received
            </h3>

          </div>

          <div className=''>
            <h2 className='text-brand-primary font-bold text-4xl font-park '>
              {totalLeads}
            </h2>
            <p className='text-brand-muted font-light mt-4'>Since account activation</p>
          </div>

        </div>

        {/* CARD 3 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex text-left gap-4 justify-start' >
            <div className='' >
              <img src={File} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Active Orders
            </h3>

          </div>

          <div className='w-full'>
            <h2 className='text-brand-primary font-bold text-4xl font-park '>
              {activeOrders}
            </h2>
            <div className='flex w-full justify-between items-center gap-4 mt-4 text-sm' >
              <p className='text-brand-brown font-light'>1 awaiting pricing</p>
              <Link to={'/orders'} className='text-brand-blue font-medium flex items-center gap-3'  >View Orders <MoveRight size={18}/></Link>
            </div>
          </div>

        </div>

        {/* CARD 4 */}
        <div className='bg-brand-darkblue border border-brand-offwhite 
          rounded-2xl py-4 px-4 w-full h-50 flex flex-col justify-between items-start '
          style={{
            backgroundImage: `url(${Image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div>
            <h3 className='text-brand-offwhite text-lg font-semibold font-park'>
              Need help with your existing orders?
            </h3>
            <p className='text-brand-stroke text-xs font-light mt-2'>We are here to guide you through tracking, delivery, and any related questions.</p>

          </div>

          <button onClick={openAddModal}
            className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-4 w-full font-park"
          >
            Contact Support 
          </button>

        </div>
      </div>

        <OrderModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

    </section>
  )
}

export default Cards