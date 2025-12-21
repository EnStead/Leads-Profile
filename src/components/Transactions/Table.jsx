import { Ellipsis, Dot, } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'; 
import TableSkeleton from '../../utility/skeletons/TableSkeleton';
import { useDashboard } from '../../context/DashboardContext';
import Pagination from '../../utility/Pagination';
import EmptyState from '../../utility/EmptyState';


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

    const formatSource = (value) => {
    if (!value) return "-";
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    };


const Table = ({openAddModal,openOrderDetails,openViewLeads, searchTerm}) => {
    const { allOrdersData, allOrdersLoading, allOrdersError,page,setPage } = useDashboard();
    
    const filteredOrders = allOrdersData?.data.filter((order) => {
        const term = searchTerm.toLowerCase();

        return (
            order.customId?.toLowerCase().includes(term)
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

    if (allOrdersLoading) {
        return <TableSkeleton rows={5} columns={7} />; 
    }

    if (allOrdersError) {
        return <p className="text-brand-red">Failed to load recent orders</p>;
    }


  return (
    <section className='w-full h-full'>

        {
            !filteredOrders.length  ? <EmptyState /> :
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-brand-offwhite rounded-2xl">
                        <tr>
                            <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">Order ID</th>
                            <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">Date</th>
                            <th className="p-3 font-medium text-sm text-brand-muted">Leads Category</th>
                            <th className="p-3 font-medium text-sm text-brand-muted">Qty</th>
                            <th className="p-3 font-medium text-sm text-brand-muted">Status</th>
                            <th className="p-3 font-medium text-sm text-brand-muted text-right rounded-r-lg"></th>
                        </tr>
                    </thead>


                    <tbody>
                        {filteredOrders.map((order) => (
                        <tr key={order._id} className="border-b border-brand-stroke capitalize">
                            <td className="p-3 font-medium text-brand-subtext text-sm">{order.customId}</td>
                            <td className="p-3 text-brand-muted font-light text-sm">{formatDate(order.createdAt)}</td>
                            <td className="p-3 text-brand-muted font-light text-sm">{formatSource(order.orderType)}</td>
                            <td className="p-3 text-brand-muted font-light text-sm">{order.quantity.toLocaleString()}</td>
                            <td className="p-3 text-sm">
                                <span
                                    className={`flex items-center w-fit px-3 py-1 rounded-full text-xs capitalize font-semibold ${getStatusColor(
                                    order.status
                                )}`}
                                >
                                    <Dot/>
                                    {formatStatus(order.status)}
                                </span>
                            </td>
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
                                            onClick={() => openOrderDetails(order)} 
                                            className="px-3 py-2 text-sm hover:bg-brand-sky cursor-pointer"
                                            >
                                            View Order
                                        </DropdownMenu.Item>

                                        <DropdownMenu.Item 
                                            onClick={() => openViewLeads(order)} 
                                            className="px-3 py-2 text-sm hover:bg-brand-sky cursor-pointer"
                                            >
                                            View Leads
                                        </DropdownMenu.Item>

                                        {order.status === "Pending" && (
                                            <DropdownMenu.Item 
                                                onClick={() => openAddModal(order)}  
                                                className="px-3 py-2 text-sm hover:bg-brand-sky cursor-pointer"
                                            >
                                                Make Payment
                                            </DropdownMenu.Item>
                                        )}

                                        <DropdownMenu.Item className="px-3 py-2 text-sm border-brand-white hover:bg-brand-sky cursor-pointer">
                                            Contact Support
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
        totalPages={allOrdersData?.pagination.pages}
        onPageChange={setPage}
      />


    </section>
  )
}

export default Table