import { Ellipsis, Dot, } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';


const dummyOrders = [
  {
    name: "Oluwatobi Fash",
    email: "tobi.f@gmail.com",
    totalOrders: 10,
    lastOrderDate: "Oct 28, 2025",
  },
  {
    name: "Amina Hussain",
    email: "amina.h@gmail.com",
    totalOrders: 15,
    lastOrderDate: "Nov 12, 2025",
  },
  {
    name: "Zhang Wei",
    email: "zhang.wei@example.com",
    totalOrders: 20,
    lastOrderDate: "Dec 5, 2025",
  },
  {
    name: "Carlos Mendez",
    email: "carlos.mendez@gmail.com",
    totalOrders: 25,
    lastOrderDate: "Jan 15, 2026",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    totalOrders: 30,
    lastOrderDate: "Feb 20, 2026",
  },
  {
    name: "Liam O'Connor",
    email: "liam.oconnor@gmail.com",
    totalOrders: 12,
    lastOrderDate: "Mar 10, 2026",
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@gmail.com",
    totalOrders: 18,
    lastOrderDate: "Apr 8, 2026",
  },
  {
    name: "Nia Robinson",
    email: "nia.robinson@gmail.com",
    totalOrders: 22,
    lastOrderDate: "May 3, 2026",
  },
  {
    name: "Kofi Mensah",
    email: "kofi.mensah@gmail.com",
    totalOrders: 16,
    lastOrderDate: "Jun 17, 2026",
  },
  {
    name: "Emma Johnson",
    email: "emma.johnson@gmail.com",
    totalOrders: 19,
    lastOrderDate: "Jul 24, 2026",
  },
];




const Table = ({openDetailsModal, onOpenChange}) => {
  return (
    <section className='w-full h-full'>
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
                    {dummyOrders.map((order) => (
                    <tr key={order.name} className="border-b border-brand-stroke">
                        <td className="p-3 font-medium text-brand-subtext text-sm">{order.name}</td>
                        <td className="p-3 text-brand-muted font-light text-sm">{order.email}</td>
                        <td className="p-3 text-brand-muted font-light text-sm">{order.totalOrders}</td>
                        <td className="p-3 text-brand-muted font-light text-sm">{order.lastOrderDate}</td>
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
                                        onClick={openDetailsModal} 
                                        className="px-3 py-2 text-sm text-brand-primary hover:bg-brand-primary/10 cursor-pointer"
                                    >
                                        View Details
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Item  onClick={onOpenChange}     
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
    </section>
  )
}

export default Table