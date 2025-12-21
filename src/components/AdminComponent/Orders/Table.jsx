import { Ellipsis, Dot, } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useDashboard } from '../../../context/DashboardContext';
import TableSkeleton from '../../../utility/skeletons/TableSkeleton';
import Pagination from '../../../utility/Pagination';
import EmptyState from '../../../utility/EmptyState';



const getStatusColor = (status) => {
    switch (status) {
    case "completed":
    return "bg-brand-green/10 text-brand-green";
    case "in progress":
    return "bg-brand-blue/10 text-brand-blue";
    case "in_progress":
    return "bg-brand-blue/10 text-brand-blue";
    default:
    return "bg-gray-100 text-gray-600";
    }
};

const formatStatus = (status = "") => {
  return status.replace(/_/g, " ");
};


const Table = ({openOrderDetails,searchTerm}) => {

    const {adminOrderData,adminOrderLoading,adminOrderError,page,setPage } = useDashboard();

    const filteredOrders = adminOrderData?.data.filter((order) => {
        const term = searchTerm.toLowerCase();

        return (
            order.client?.name?.toLowerCase().includes(term) ||
            order._id?.toLowerCase().includes(term)
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

    if (adminOrderLoading) {
        return <TableSkeleton rows={5} columns={7} />; 
    }

    if (adminOrderError) {
        return <p className="text-brand-red">Failed to load recent orders</p>;
    }
  return (
    <section className='w-full h-full'>
        {
            !filteredOrders.length  ? <EmptyState /> :
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-brand-white rounded-2xl">
                        <tr>
                            <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">Order ID</th>
                            <th className="p-3 font-medium text-sm text-brand-muted">Date</th>
                            <th className="p-3 font-medium text-sm text-brand-muted">Customer Name</th>
                            <th className="p-3 font-medium text-sm text-brand-muted">Leads Category</th>
                            <th className="p-3 font-medium text-sm text-brand-muted">Qty</th>
                            <th className="p-3 font-medium text-sm text-brand-muted">Status</th>
                            <th className="p-3 font-medium text-sm text-brand-muted text-right rounded-r-lg"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOrders.map((order) => (
                        <tr key={order._id} className="border-b border-brand-stroke">
                            <td className="p-3 font-medium text-brand-subtext text-sm">{order.customId}</td>
                            <td className="p-3 text-brand-muted font-light text-sm">{formatDate(order.createdAt)}</td>
                            <td className="p-3 text-brand-muted font-light text-sm">{order.client?.name}</td>
                            <td className="p-3 text-brand-muted font-light text-sm">{formatStatus(order.orderType)}</td>
                            <td className="p-3 text-brand-muted font-light text-sm">{order.quantity.toLocaleString()}</td>
                            <td className="p-3 text-sm">
                                <span
                                    className={`flex items-center w-fit px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                                    order.status
                                )}`}
                                >
                                    <Dot/>
                                    {formatStatus(order.status)}
                                </span>
                            </td>
                            <td className="p-3 text-right relative">
                                <button onClick={() => openOrderDetails(order)} className='text-brand-blue font-semibold'>
                                    View details 
                                </button> 
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        }

      <Pagination
        page={page}
        totalPages={adminOrderData?.pagination.pages}
        onPageChange={setPage}
      />
    </section>
  )
}

export default Table