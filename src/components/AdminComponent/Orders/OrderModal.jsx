import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const OrderModal = ({ open, onOpenChange, customer }) => {
  const accountInfo = {
    customerName: "Willow Garcia",
    emailAddress: "carlos.mendez@gmail.com",
    totalOrders: 10,
    totalLeadsDelivered: 45670,
    lastOrderDate: "Aug. 28, 2024"
  };

  const orderHistory = [
    {
      id: "#LP-32892",
      category: "Premium Banks",
      quantity: 1500,
      status: "In Progress",
      date: "Aug. 28, 2024"
    },
    {
      id: "#LP-32891",
      category: "Mixed Banks",
      quantity: 6500,
      status: "Completed",
      date: "Aug. 27, 2024"
    },
    {
      id: "#LP-32893",
      category: "Mixed Banks",
      quantity: 3000,
      status: "Completed",
      date: "Aug. 12, 2024"
    },
    {
      id: "#LP-32894",
      category: "Mixed Banks",
      quantity: 2000,
      status: "Completed",
      date: "Aug. 06, 2024"
    },
    {
      id: "#LP-32895",
      category: "Filter Banks",
      quantity: 7500,
      status: "Completed",
      date: "Jul. 31, 2024"
    },
    {
      id: "#LP-32896",
      category: "Furniture",
      quantity: 1200,
      status: "Completed",
      date: "Sept. 1, 2024"
    },
    {
      id: "#LP-32897",
      category: "Toys",
      quantity: 4000,
      status: "Completed",
      date: "Sept. 5, 2024"
    }
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

        <Dialog.Content className=" hide-scrollbar fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-[540px] max-h-[90vh] overflow-auto shadow-xl z-50 p-8">
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
                        <td className="p-3 text-brand-primary font-semibold text-right">{accountInfo.customerName}</td>
                    </tr>
                    <tr className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Email Address</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{accountInfo.emailAddress}</td>
                    </tr>
                    <tr className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Total Orders</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{accountInfo.totalOrders}</td>
                    </tr>
                    <tr  className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Total Leads Delivered</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{accountInfo.totalLeadsDelivered.toLocaleString()}</td>
                    </tr>
                    <tr  className="border-b border-brand-stroke">
                        <td className="p-3 text-brand-muted">Last Order Date</td>
                        <td className="p-3 text-brand-primary font-semibold text-right">{accountInfo.lastOrderDate}</td>
                    </tr>
                  </tbody>
              </table>    
          </div>

          {/* Order History */}
          <div>
            <h3 className="text-lg text-brand-primary font-semibold font-park mb-4">Order History</h3>
            
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <div key={order.id} className="pb-4 border-b border-brand-stroke last:border-b-0">
                  <div className="flex justify-between items-start mb-1 ">
                    <div>
                      <h4 className="font-medium text-brand-subtext text-sm">
                        Order {order.id}
                      </h4>
                      <p className="text-xs text-brand-subtext mt-1">
                        Category: {order.category} || Quantity: {order.quantity.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${
                        order.status === "In Progress" 
                          ? "text-brand-blue" 
                          : "text-brand-green"
                      }`}>
                        {order.status}
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