import { Link } from 'react-router'
import Recent from '../../../assets/Recent.svg'
import { MoveRight,Ellipsis, Dot, Eclipse } from 'lucide-react'
import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';


const dummyOrders = [
    {
    id: "#LP-1042",
    request: "Chase, nationwide",
    quantity: 1200,
    status: "Completed",
    lastUpdated: "11m ago",
    },
    {
    id: "#LP-1043",
    request: "Chase, nationwide",
    quantity: 450,
    status: "In Progress",
    lastUpdated: "11m ago",
    },
    {
    id: "#LP-1044",
    request: "Chase, nationwide",
    quantity: 980,
    status: "Pending",
    lastUpdated: "11m ago",
    },
    {
    id: "#LP-1045",
    request: "Chase, nationwide",
    quantity: 300,
    status: "Pending",
    lastUpdated: "11m ago",
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


const Table = () => {
  return (
    <section className='bg-brand-white border border-brand-offwhite rounded-2xl p-4 w-full h-full'>
        <div className='flex justify-between mb-4' >
            <div className='flex gap-4 w-fit items-center'>
                <img src={Recent} alt="image" className='w-8' />
                <h3 className='font-park text-brand-primary font-semibold w-fit '>
                    Recent Orders
                </h3>
            </div>
            <Link className=' w-fit text-brand-blue font-medium flex items-center gap-3'> View All Orders <MoveRight/> </Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead className="bg-brand-offwhite rounded-2xl">
                    <tr>
                        <th className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">Order ID</th>
                        <th className="p-3 font-medium text-sm text-brand-muted">Customer Name</th>
                        <th className="p-3 font-medium text-sm text-brand-muted">Leads Request</th>
                        <th className="p-3 font-medium text-sm text-brand-muted">Qty</th>
                        <th className="p-3 font-medium text-sm text-brand-muted">Status</th>
                        <th className="p-3 font-medium text-sm text-brand-muted">Date</th>
                        <th className="p-3 font-medium text-sm text-brand-muted text-right rounded-r-lg"></th>
                    </tr>
                </thead>


                <tbody>
                    {dummyOrders.map((order) => (
                    <tr key={order.id} className="border-b border-brand-stroke">
                        <td className="p-3 font-medium text-brand-subtext text-sm">{order.id}</td>
                        <td className="p-3 text-brand-muted font-light text-sm">{order.request}</td>
                        <td className="p-3 text-brand-muted font-light text-sm">{order.quantity}</td>
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
                        <td className="p-3 text-sm">{order.lastUpdated}</td>
                        <td className="p-3 text-right relative">
                            <DropdownMenu.Root className={'border-none shadow-md text-left'}>
                                <DropdownMenu.Trigger className='p-2 rounded-full hover:bg-brand-white'>
                                    <Ellipsis size={18} />
                                </DropdownMenu.Trigger>

                                <DropdownMenu.Content
                                    sideOffset={5}
                                    className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
                                >
                                    <DropdownMenu.Item className="px-3 py-2 text-sm border-brand-white hover:bg-brand-sky cursor-pointer">
                                        View Details
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className="px-3 py-2 text-sm border-brand-white hover:bg-brand-sky cursor-pointer">
                                        View Leads
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
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