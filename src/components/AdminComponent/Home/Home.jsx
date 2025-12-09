import { useState } from 'react'
import CardButtons from './CardButtons'
import Cards from './Cards'
import CreateOrder from './CreateOrder'
import Table from './Table'
import AddCustomer from './AddCustomer'

const Home = ({open, onOpenChange}) => {

    const [isModalOpenAddCustomer, setIsModalOpenAddCustomer] = useState(false);
    const openAddCustomerModal = () => {
        setIsModalOpenAddCustomer(true);
    };

  return (
    <div>
        <Cards/>
        <CardButtons openAddCustomerModal={openAddCustomerModal} onOpenChange={onOpenChange} />
        <Table/>
        <CreateOrder open={open} onOpenChange={onOpenChange} />
        <AddCustomer open={isModalOpenAddCustomer} onOpenChange={setIsModalOpenAddCustomer} />
    </div>
  )
}

export default Home