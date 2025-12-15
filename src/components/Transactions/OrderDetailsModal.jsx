import * as Dialog from "@radix-ui/react-dialog";
import Teams from '../../assets/Teams.svg'

const STATUS_STEPS = [
  { labelTop: "Order Created", labelBottom: "" },
  { labelTop: "", labelBottom: "Processing" },
  { labelTop: "Completed", labelBottom: "" },
];




const OrderDetailsModal = ({ open, onOpenChange, order,openViewLeads }) => {

    if (!order) {
    return null; // ⬅ prevents ALL errors until order loads
  }

    const formatDate = (dateString) => {
      const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      };
      return new Date(dateString).toLocaleString(undefined, options);
  };

  const getButton = () => {
    switch (order.status) {

      case "processing":
        return (
          <button
            disabled
            className="w-full bg-brand-muted text-brand-white py-3 rounded-xl font-semibold cursor-not-allowed"
          >
            Awaiting Confirmation
          </button>
        );

      case "in progress":
      case "completed":
        return (
          <button
            onClick={() => {
              onOpenChange(false);
              openViewLeads(order)
            }}
            className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold"
          >
            View Leads
          </button>
        );
    }
  };


    // Map order status to progress step (0–3)
    const getCurrentStep = () => {
    switch (order.status) {
        case "processing":
        case "in progress":
        return 1; // Order Created → Processing
        case "completed":
        return 2; // Processing → Completed
        default:
        return 0;
    }
    };

    const currentStep = getCurrentStep();



  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50" />

        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white p-6 rounded-2xl w-[600px] min-h-[90vh]  shadow-xl z-50"
        >
          {/* Header */}
            <Dialog.Close className="absolute top-2 right-4 text-black text-2xl font-medium cursor-pointer">
              x
            </Dialog.Close>
            <Dialog.Title className="text-xl text-center font-park font-bold mb-1 text-brand-primary">
                Order Details
            </Dialog.Title>

            {/* Status */}
            <Dialog.Description className="flex justify-center items-center text-sm mb-2">

                <span
                    className={`text-sm font-medium mr-1`}
                >
                    {
                        order.status === "completed"
                        ? "Paid"
                        : order.status === "in progress"
                        ? "Paid"
                        : order.status === "processing"
                        ? "Paid"
                        : "Paid"
                    }
                    
                </span> {' '} || {' '}
                <span
                    className={`text-sm font-medium ml-1 capitalize ${
                        order.status === "completed"
                        ? "text-brand-green"
                        : order.status === "in progress"
                        ? "text-brand-blue"
                        : order.status === "processing"
                        ? "text-brand-muted"
                        : "text-brand-muted"
                    }`}
                >
                {order.status}
                </span>

            </Dialog.Description>

            <div className="flex justify-between items-center my-4">
                <p className="text-brand-primary font-park font-semibold">Order Summary</p>
                <p className="text-brand-subtext">ID: <span className="font-medium" >{order._id}</span></p>
            </div>

            {/* Summary */}
            <div className=" bg-brand-offwhite p-4 rounded-xl mb-6">
                <table className="w-full border-collapse ">        
                    <tbody>
                        <tr  className="border-b border-brand-stroke">
                            <td className="p-3 text-brand-muted">Lead Quantity</td>
                            <td className="p-3 text-brand-primary font-semibold text-right">{order.quantity}</td>
                        </tr>
                        <tr className="border-b border-brand-stroke">
                            <td className="p-3 text-brand-muted">Bank Category</td>
                            <td className="p-3 text-brand-primary font-semibold text-right">{order.orderType}</td>
                        </tr>
                        <tr className="border-b border-brand-stroke">
                            <td className="p-3 text-brand-muted">Bank Names</td>
                            <td className="p-3 text-brand-primary font-semibold text-right">{order.bankNames}</td>
                        </tr>
                        <tr  className="border-b border-brand-stroke">
                            <td className="p-3 text-brand-muted">Order Created</td>
                            <td className="p-3 text-brand-primary font-semibold text-right">{formatDate(order.createdAt)}</td>
                        </tr>
                    </tbody>
                </table>    
            </div>


          {/* Progress Timeline */}
          <div className="mb-6">
            <div className="flex justify-between" >
              <h3 className="font-semibold mb-3">Status Timeline</h3>
              <div>
                <a href="http://" target="_blank" rel="noopener noreferrer" className="flex gap-3 text-brand-blue font-semibold underline">
                  <img src={Teams} alt="Image" />  Chat With Support
                </a>
              </div>

             </div>
            <div className="w-full bg-brand-offwhite p-6 rounded-2xl my-6">

              <div className="relative w-full">
                
                {/* TOP LABELS */}
                <div className="flex justify-between mb-3 px-1">
                  {STATUS_STEPS.map((step, index) => {
                    const isActive = index <= currentStep;
                    return (
                      <div key={`top-${index}`} className="flex-1 text-center">
                        <span className={`text-xs font-medium ${
                          isActive ? "text-black" : "text-gray-400"
                        }`}
                        >
                          {step.labelTop}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* PROGRESS BAR + DOTS */}
                <div className="relative">                  

                  {/* Background bar */}
                  <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                  
                  {/* Filled section */}
                  <div
                    className="absolute top-0 left-0 h-2 bg-[#1a1f2e] rounded-full transition-all"
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  ></div>

                  {/* Dots positioned absolutely on the bar */}
                  <div className="absolute top-0 left-0 w-full h-2 flex justify-between items-center">
                    {STATUS_STEPS.map((step, index) => {
                      const isCompleted = index < currentStep;
                      const isCurrent = index === currentStep;
                      const isPending = index > currentStep;
                      
                      return (
                        <div
                          key={`dot-${index}`}
                          className={`w-3 h-3 rounded-full border-2 ${
                            isCompleted
                              ? "bg-white border-[#1a1f2e]"
                              : isCurrent
                              ? "bg-[#3b82f6] border-[#3b82f6]"
                              : "bg-white border-gray-300"
                          }`}
                          style={{
                            position: 'absolute',
                            left: `${(index / (STATUS_STEPS.length - 1)) * 100}%`,
                            transform: 'translateX(-50%)'
                          }}
                        ></div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTTOM LABELS */}
                <div className="flex justify-between mt-3 px-1">
                  {STATUS_STEPS.map((step, index) => {
                    const isActive = index <= currentStep;
                    return (
                      <div key={`bottom-${index}`} className="flex-1 text-center">
                        <span className={`text-xs font-medium ${
                          isActive ? "text-black" : "text-gray-400"
                        }`}>
                          {step.labelBottom}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CTA button (Make Payment, Awaiting, View Leads) */}
          <div className="mt-7">
            {getButton()}
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default OrderDetailsModal


