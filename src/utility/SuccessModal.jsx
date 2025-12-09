import { Dialog } from "radix-ui";
import Coin from '../assets/Coin.svg'


const SuccessModal = ({ open, onOpenChange }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50 backdrop-blur-[2px]" />


        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-brand-white p-6 rounded-2xl w-[500px] text-center shadow-xl z-50"
        >
          <div className="flex items-center justify-center mb-4">
              <img src={Coin} alt="" className="w-30" />
          </div>
          
          <Dialog.Title className="text-xl font-bold text-brand-primary">
            Payment Submitted
          </Dialog.Title>

          <Dialog.Description className="text-brand-subtext mt-4 text-sm">
            We’re confirming your transaction. This usually takes a few minutes to an hour. After confirmation, Your leads start generating for this order immediately.

          </Dialog.Description>

            <button
                onClick={() => {
                onOpenChange(false);
                // navigate to order page or callback
                }}
                className="text-brand-blue border border-brand-blue bg-transparent py-3 rounded-xl font-semibold mt-6 w-full"
            >
                View Order Details
            </button>

          <Dialog.Close className="absolute top-3 right-5 text-3xl cursor-pointer">
            ×
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default SuccessModal