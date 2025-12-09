import { DropdownMenu } from 'radix-ui';
import Image from '../../assets/Stack.png'
import { MoreVertical } from 'lucide-react';
import { Link } from 'react-router';
import { useDashboard } from '../../context/DashboardContext';
import CardSkeleton from '../../utility/skeletons/CardSkeleton';
import EmptyState from '../../utility/EmptyState';
import Pagination from '../../utility/Pagination';



const Cards = () => { 
    const { allOrdersData, allOrdersLoading, allOrdersError,page,setPage  } = useDashboard();

        // console.log(allOrdersData)
        const formatDate = (dateString) => {
            const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            };
            return new Date(dateString).toLocaleString(undefined, options);
        };

        if (allOrdersLoading) {
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


    if (allOrdersError) {
      return <p className="text-brand-red">Failed to load dashboard data.</p>;
    }



  return (

    <>
        {
            !allOrdersData.data.length  ?  <EmptyState /> :
            <section className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {Array.isArray(allOrdersData?.data) && allOrdersData?.data.map((item) => (
                        <div key={item._id} className="bg-transparent rounded-t-xl overflow-hidden relative">
                            <Link to={`/orders/${item._id}`}>
                                {/* IMAGE */}
                                <img src={Image} alt={'image'} className="w-full h-40 object-cover bg-brand-white" />
                            
                                {/* DETAILS */}
            
                                {/* Top Row: Last Modified + Menu */}
                                <div className="flex justify-between items-center my-2">
                                    <span className="text-xs text-brand-muted font-light">{formatDate(item.createdAt)}</span>
            
                                    {/* RADIX DROPDOWN MENU */}
                                    <DropdownMenu.Root className={'border-none shadow-md text-left'}>
                                        <DropdownMenu.Trigger asChild>
                                            <button className="p-1 bg-brand-white hover:bg-gray-100 rounded-full ">
                                                <MoreVertical size={18} />
                                            </button>
                                        </DropdownMenu.Trigger>
            
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.Content
                                                align="end"
                                                sideOffset={5}
                                                className="bg-white shadow-md rounded-lg p-1 z-10 text-left"
                                            >
                                                <DropdownMenu.Item className="px-3 py-2 text-sm boder-none! hover:bg-brand-sky cursor-pointer">
                                                    <Link to={`/orders/${item._id}`}>
                                                        View Details                                        
                                                    </Link>
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item className="px-3 py-2 text-sm border border-brand-white hover:bg-brand-sky cursor-pointer">
                                                    Download as CSV
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Root>
                                </div>
            
                                <div>
                                    {/* Title */}
                                    <h3 className=" font-semibold font-park text-brand-primary">{item.orderType}</h3>
            
                                    {/* Leads Progress */}
                                    <p className="text-sm font-medium text-brand-subtext mt-1">
                                        Leads Progress: {item.filled} / {item.quantity}
                                    </p>
                                </div>
            
                            </Link>
            
                        </div>
                    ))}
            </section>
        }
        <Pagination
            page={page}
            totalPages={allOrdersData?.pagination.pages}
            onPageChange={setPage}
        />
    </>

  )
}

export default Cards