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
          <Dialog.Title className="text-xl font-bold mb-1 text-brand-primary font-park" >
            Account Information
          </Dialog.Title>
          <Dialog.Description>
              
          </Dialog.Description>

          {/* Account Details */}
          <div className=" bg-brand-offwhite rounded-xl mb-6">
              <table className="w-full border-collapse text-sm ">        
                  <tbody>
                    <tr  className="border-b border-brand-stroke">
                        <td className="p-3  text-brand-muted">Customer Name</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{order.name}</td>
                    </tr>
                    <tr className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Email Address</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{order.email}</td>
                    </tr>
                    <tr className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Total Orders</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{order.totalOrders}</td>
                    </tr>
                    <tr  className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Total Leads Delivered</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{order.totalLeadsDelivered.toLocaleString()}</td>
                    </tr>
                    <tr  className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Last Order Date</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{formatDate(order.lastOrderDate)}</td>
                    </tr>
                  </tbody>
              </table>    
          </div>

          {/* Order History */}
          <div>
            <h3 className="text-lg text-brand-primary font-semibold font-park mb-4">Order History</h3>
            
            <div className="space-y-4">
              {order?.orders.map((order) => (
                <div key={order._id} className="pb-4 border-b border-brand-stroke last:border-b-0">
                  <div className="flex justify-between items-start mb-1 ">
                    <div>
                      <h4 className="font-medium text-brand-subtext text-sm">
                        Order {order._id}
                      </h4>
                      <p className="text-xs text-brand-subtext mt-1">
                        Category: {order.orderType} || Quantity: {order.quantity.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
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
                      <p className="text-xs font-light text-brand-muted mt-1">{order.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Demo wrapper
export default OrderModal