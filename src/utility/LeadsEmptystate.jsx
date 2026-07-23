import Image from '../assets/LeadsEmpty.png'
import CreateOrderModal from '../components/CustomerComponent/Home/CreateOrderModal'

const LeadsEmptystate = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
      {/* Icon/Illustration */}
      <div className="relative mb-6">
        {/* Stacked sheets illustration */}
        <img src={Image} alt="" className='w-40' />
      </div>

      {/* Text Content */}
      <h2 className="text-2xl font-park font-bold text-brand-blackish mb-3 text-center">
        You have no leads yet!
      </h2>
      <p className="text-brand-body text-center max-w-md leading-relaxed mb-6">
        Once a lead begins processing, you'll automatically receive the details here, and you can easily export them.
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

export default LeadsEmptystate