import { useState } from 'react'
import CardButtons from './CardButtons'
import Cards from './Cards'
import CreateOrder from './CreateOrder'
import Table from './Table'
import AddCustomer from './AddCustomer'
import { useNavigate } from 'react-router'
import OrderModal from '../Orders/OrderModal'

const Home = ({open, onOpenChange}) => {

    const [isModalOpenAddCustomer, setIsModalOpenAddCustomer] = useState(false);
    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    const openAddCustomerModal = () => {
        setIsModalOpenAddCustomer(true);
    };

    
    const openOrderDetailsModal = (order) => {
        setIsOrderDetailsOpen(true);
        setSelectedOrder(order);
    };

  return (
    <div>
        <Cards/>
        <CardButtons openAddCustomerModal={openAddCustomerModal} onOpenChange={onOpenChange} />
        <Table openOrderDetails={openOrderDetailsModal} />
        <CreateOrder open={open} onOpenChange={onOpenChange} />
        <AddCustomer open={isModalOpenAddCustomer} onOpenChange={setIsModalOpenAddCustomer} />
        <OrderModal 
            open={isOrderDetailsOpen}
            onOpenChange={setIsOrderDetailsOpen}
            order={selectedOrder}
        />
    </div>
  )
}

export default Home