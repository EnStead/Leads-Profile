import Cards from './Cards';
import OrdersChart from './OrdersChart';
import LeadsChart from './LeadsChart';
import Table from './Table';
import { useNavigate } from 'react-router';
import OrderDetailsModal from '../Transactions/OrderDetailsModal';


const Home = ({openOrderDetails,openOrderModal,selectedOrder,setOpenOrderModal}) => {

    const navigate = useNavigate();

    const openViewLeads = (order) => {
      navigate(`/orders/${order._id}`);
    };

  return (
    <section className='bg-brand-sky min-h-[89.3vh]' >
      {/* TOP CARDS */}
      <Cards/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 lg:grid-rows-2">
        {/* Table on the left, spans 2 rows */}
        <div className="lg:row-span-2 lg:col-span-2 h-full">
          <Table openViewLeads={openViewLeads} openOrderDetails={openOrderDetails} />
        </div>

        {/* OrdersChart */}
        <div className="h-50 lg:col-span-1 ">
          <OrdersChart />
        </div>

        {/* LeadsChart */}
        <div className="h-50 lg:col-span-1 ">
          <LeadsChart />
        </div>
      </div>

      <OrderDetailsModal
        open={openOrderModal}
        onOpenChange={setOpenOrderModal}
        order={selectedOrder}
      />

    </section>
  )
}

export default Home