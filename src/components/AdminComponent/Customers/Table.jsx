import { Ellipsis, Dot, } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useDashboard } from '../../../context/DashboardContext';
import TableSkeleton from '../../../utility/skeletons/TableSkeleton';
import Pagination from '../../../utility/Pagination';





const Table = ({openDetailsModal, onOpenChange, searchTerm }) => {

  const {customersData,customersLoading,customersError,page,setPage } = useDashboard();
    
  const filteredCustomers = customersData?.data.filter((customer) => {
    const term = searchTerm.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term)
    );
  });

  
    const formatDate = (dateString) => {
        const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        };
        return new Date(dateString).toLocaleString(undefined, options);
    };

    if (customersLoading) {
        return <TableSkeleton rows={5} columns={7} />; 
    }

    if (customersError) {
        return <p className="text-brand-red">Failed to load customers</p>;
    }

  return (
    <section className='w-full h-full'>
        {
          !filteredCustomers.length  ? <EmptyState /> :
          <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                  <thead className="bg-brand-white rounded-2xl">
                      <tr>
                          <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">Full/Business Name</th>
                          <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">Email Address</th>
                          <th className="p-3 font-medium text-sm text-brand-muted">Total Orders</th>
                          <th className="p-3 font-medium text-sm text-brand-muted">Last Order Date</th>
                          <th className="p-3 font-medium text-sm text-brand-muted text-right rounded-r-lg">Action</th>
                      </tr>
                  </thead>


                  <tbody>
                      {filteredCustomers?.map((order) => (
                      <tr key={order._id} className="border-b border-brand-stroke">
                          <td className="p-3 font-medium text-brand-subtext text-sm">{order.name}</td>
                          <td className="p-3 text-brand-muted font-light text-sm">{order.email}</td>
                          <td className="p-3 text-brand-muted font-light text-sm">{order.totalOrders}</td>
                          <td className="p-3 text-brand-muted font-light text-sm">{formatDate(order.updatedAt)}</td>
                          <td className="p-3 text-right relative">
                              <DropdownMenu.Root className={'border-none shadow-md text-left'}>
                                  <DropdownMenu.Trigger className='p-2 rounded-full hover:bg-brand-white'>
                                      <Ellipsis size={18} />
                                  </DropdownMenu.Trigger>

                                  <DropdownMenu.Content
                                      sideOffset={5}
                                      className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
                                  >
                                      <DropdownMenu.Item 
                                          onClick={() => openDetailsModal(order)}
                                          className="px-3 py-2 text-sm text-brand-primary hover:bg-brand-primary/10 cursor-pointer"
                                      >
                                          View Details
                                      </DropdownMenu.Item>

                                      <DropdownMenu.Item  onClick={()=> onOpenChange(order._id)}     
                                          className="px-3 py-2 text-sm text-brand-red hover:bg-brand-red/10 cursor-pointer"
                                      >
                                          Delete Customer
                                      </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                              </DropdownMenu.Root>
                          </td>
                      </tr>
                      ))}
                  </tbody>
              </table>
          </div>

        }

      <Pagination
        page={page}
        totalPages={customersData?.pagination.pages}
        onPageChange={setPage}
      />
    </section>
  )
}

export default Table