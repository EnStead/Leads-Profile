import Image from '../assets/OrderEmpty.png'
import CreateOrderModal from '../components/CustomerComponent/Home/CreateOrderModal'

const OrderEmptyState = ({
  title = "No Order created yet",
  subtitle,
  subtext
}) => {
  const resolvedSubtitle =
    subtext ||
    subtitle ||
    "Your payment history will appear here once you request for an order.";

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
      {/* Icon/Illustration */}
      <div className="relative mb-6">
        {/* Stacked sheets illustration */}
        <img src={Image} alt="" className='w-40' />
      </div>

      {/* Text Content */}
      <h2 className="text-2xl font-park font-bold text-brand-blackish mb-3 text-center">
        {title}
      </h2>
      <p className="text-brand-body text-center max-w-md leading-relaxed mb-6">
        {resolvedSubtitle}
      </p>
      
      <CreateOrderModal
        customTrigger={
          <button
            type="button"
            className="rounded-xl bg-brand-blue px-8 py-3 font-semibold text-brand-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Place an Order
          </button>
        }
      />
    </div>
  )
}

export default OrderEmptyState