import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const OrderModal = ({ open, onOpenChange, order }) => {

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

  const formatStatus = (status = "") => {
  return status.replace(/_/g, " ");
};



  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

        <Dialog.Content 
            className="  fixed left-1/2 top-1/2 z-50
              w-[420px] xsm:w-[520px]
              max-h-[90vh]
              overflow-y-auto 
              hide-scrollbar
              -translate-x-1/2 -translate-y-1/2
              bg-white rounded-2xl p-8 shadow-xl  
            "    
        >
          {/* Close Button */}
          <Dialog.Close className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </Dialog.Close>

          {/* Header */}
          <Dialog.Title className="text-xl font-bold text-center text-brand-primary font-park mb-4" >
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
                        : order.status === "in progress" || "in_progress"
                        ? "text-brand-blue"
                        : "text-brand-muted"
                    }`}
                >
                {formatStatus(order.status)}
                </span>

            </Dialog.Description>

            <div className="flex justify-between items-center my-4">
                <p className="text-brand-primary font-park font-semibold">Order Summary</p>
                <p className="text-brand-subtext">ID: <span className="font-medium" >{order._id}</span></p>
            </div>

          {/* Account Details */}
          <div>
              <table className="w-full border-collapse text-sm ">        
                  <tbody>
                    <tr  className="border-b border-brand-stroke">
                        <td className="p-3  text-brand-muted">Customer Name</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{order?.client.name}</td>
                    </tr>
                    <tr className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Lead Quantity</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{order.quantity.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Bank Category</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{order.orderType}</td>
                    </tr>
                    <tr  className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Bank Names</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{order.banks}</td>
                    </tr>
                    <tr  className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Order Created</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{formatDate(order.createdAt)}</td>
                    </tr>
                  </tbody>
              </table>    
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Demo wrapper
export default OrderModal