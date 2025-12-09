import { Ellipsis, Dot, } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';


const dummyOrders = [
    { 
    id: "#LP-1042",
    request: "Chase, nationwide",
    quantity: 1200,
    status: "Completed",
    amount: 300,
    date: "11m ago",
                //     id: "#LP-1045",
            //     status: "Completed",
            //     price: "300",
            //     gateway: "Tron Network",
            //     quantity: 500,
            //     category: "Mixed Banks",
            //     bankNames: "-",
            //     createdAt: "22 Nov, 2025",
            //     openPaymentModal: openAddModal,
    },
    {
    id: "#LP-1043",
    request: "Chase, nationwide",
    quantity: 450,
    status: "In Progress",
    amount: 300,
    date: "11m ago",
    },
    {
    id: "#LP-1044",
    request: "Chase, nationwide",
    quantity: 980,
    status: "Completed",
    amount: 300,
    date: "11m ago",
    },
    {
    id: "#LP-1045",
    date: "11m ago",
    request: "Chase, nationwide",
    quantity: 300,
    amount: 300,
    status: "Completed",
},
];


const getStatusColor = (status) => {
    switch (status) {
    case "Completed":
    return "bg-brand-green/10 text-brand-green";
    case "In Progress":
    return "bg-brand-blue/10 text-brand-blue";
    default:
    return "bg-gray-100 text-gray-600";
    }
};


const Table = ({openOrderDetails}) => {
  return (
    <section className='w-full h-full'>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead className="bg-brand-white rounded-2xl">
                    <tr>
                        <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">Order ID</th>
                        <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">Date</th>
                        <th className="p-3 font-medium text-sm text-brand-muted">Leads Request</th>
                        <th className="p-3 font-medium text-sm text-brand-muted">Qty</th>
                        <th className="p-3 font-medium text-sm text-brand-muted">Status</th>
                        <th className="p-3 font-medium text-sm text-brand-muted text-right rounded-r-lg"></th>
                    </tr>
                </thead>


                <tbody>
                    {dummyOrders.map((order) => (
                    <tr key={order.id} className="border-b border-brand-stroke">
                        <td className="p-3 font-medium text-brand-subtext text-sm">{order.id}</td>
                        <td className="p-3 text-brand-muted font-light text-sm">{order.date}</td>
                        <td className="p-3 text-brand-muted font-light text-sm">{order.request}</td>
                        <td className="p-3 text-brand-muted font-light text-sm">{order.quantity}</td>
                        <td className="p-3 text-sm">
                            <span
                                className={`flex items-center w-fit px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status
                            )}`}
                            >
                                <Dot/>
                                {order.status}
                            </span>
                        </td>
                        <td className="p-3 text-right relative">
                            <button onClick={openOrderDetails} className='text-brand-blue font-semibold'>
                                View details 
                            </button> 
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
  )
}

export default Table