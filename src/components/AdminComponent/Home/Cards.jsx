import Process from '../../../assets/Process.svg'
import Pending from '../../../assets/Pending.svg'
import Completed from '../../../assets/Completed.svg'
import Leads from '../../../assets/Leads.svg'
import Head from '../../../assets/Head.svg'
import { Dot,MoveRight,UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { useDashboard } from '../../../context/DashboardContext'
import CardSkeleton from '../../../utility/skeletons/CardSkeleton'
import { TrendingUp, TrendingDown } from "lucide-react";



const Cards = () => { 

  const { adminDashboardData, adminDashboardLoading, adminDashboardError } = useDashboard();
  
    if (adminDashboardLoading) {
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


    if (adminDashboardError) {
      return <p className="text-brand-red">Failed to load dashboard data.</p>;
    }

    const processingOrders = adminDashboardData?.processingOrders;
    const completedToday = adminDashboardData?.completedToday;
    const leadsDeliveredToday = adminDashboardData?.leadsDeliveredToday;

    const renderChange = (value) => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  return (
    <span
      className={`flex items-center gap-1 text-sm font-medium ${
        isNegative ? "text-brand-red" : "text-brand-green"
      }`}
    >
      {isNegative ? (
        <TrendingDown size={16} className="text-brand-red" />
      ) : (
        <TrendingUp size={16} className="text-brand-green" />
      )}
      {absValue}%
      <span className="text-brand-muted font-light ml-1">
        vs yesterday
      </span>
    </span>
  );
};


  return (
    <section>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' >

        {/* CARD 2 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex items-center gap-4 justify-start' >
            <div className='p-1' >
              <img src={Process} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Processing Orders
            </h3>
          </div>

          <div className='w-full'>
              <h2 className='text-brand-primary font-bold text-4xl font-park '>
                {processingOrders}
              </h2>
            <div className='flex items-center justify-between mt-4 w-full '>
              {/* <span className='text-brand-muted text-xs font-light'>Amount: <span className='text-brand-muted font-light'> ~ $750</span></span> */}
              <Link to={'/admin/orders'} className='text-brand-blue font-medium flex items-center gap-3'  >View Orders <MoveRight size={18}/></Link>
            </div>
          </div>
        </div>

        {/* CARD 3 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex text-left gap-4 justify-start' >
            <div className='' >
              <img src={Completed} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Completed Today
            </h3>
          </div>

          <div className=''>
            <h2 className='text-brand-primary font-bold text-4xl font-park '>
              {completedToday}
            </h2>
            {renderChange(adminDashboardData?.completedTodayChangePct)}

          </div>

        </div>

        {/* CARD 4 */}
        <div className='bg-brand-white border border-brand-offwhite 
          rounded-2xl py-8 px-4 w-full h-50 flex flex-col justify-between items-start '
        >
          <div className='flex text-left gap-4 justify-start' >
            <div className='' >
              <img src={Leads} alt="image" />
            </div>
            <h3 className='text-brand-primary font-semibold font-park'>
              Leads Delivered today
            </h3>

          </div>

          <div className=''>
            <h2 className='text-brand-primary font-bold text-4xl font-park '>
              {leadsDeliveredToday}
            </h2>
            {renderChange(adminDashboardData?.leadsDeliveredTodayChangePct)}

          </div>

        </div>
      </div>

    </section>
  )
}

export default Cards