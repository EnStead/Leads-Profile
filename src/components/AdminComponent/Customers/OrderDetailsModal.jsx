import * as Dialog from "@radix-ui/react-dialog";





const OrderDetailsModal = ({ open, onOpenChange, order }) => {



  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50" />

        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white p-6 rounded-2xl w-[600px] min-h-fit  shadow-xl z-50"
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
                        order.status === "Completed"
                        ? "Paid"
                        : order.status === "In Progress"
                        ? "Paid"
                        : order.status === "Processing"
                        ? "Paid"
                        : "Paid"
                    }
                    
                </span> {' '} || {' '}
                <span
                    className={`text-sm font-medium ml-1 ${
                        order.status === "Completed"
                        ? "text-brand-green"
                        : order.status === "In Progress"
                        ? "text-brand-blue"
                        : order.status === "Processing"
                        ? "text-brand-muted"
                        : "text-brand-muted"
                    }`}
                >
                {order.status}
                </span>

            </Dialog.Description>

            <div className="flex justify-between items-center my-4">
                <p className="text-brand-primary font-park font-semibold">Order Summary</p>
                <p className="text-brand-subtext">ID: <span className="font-medium" >{order.id}</span></p>
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
                            <td className="p-3 text-brand-muted">Bank Categoory</td>
                            <td className="p-3 text-brand-primary font-semibold text-right">{order.category}</td>
                        </tr>
                        <tr className="border-b border-brand-stroke">
                            <td className="p-3 text-brand-muted">Bank Names</td>
                            <td className="p-3 text-brand-primary font-semibold text-right">{order.bankNames}</td>
                        </tr>
                        <tr  className="border-b border-brand-stroke">
                            <td className="p-3 text-brand-muted">Order Created</td>
                            <td className="p-3 text-brand-primary font-semibold text-right">{order.createdAt}</td>
                        </tr>
                    </tbody>
                </table>    
            </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default OrderDetailsModal


