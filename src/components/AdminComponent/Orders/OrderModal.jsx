import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import ExpandableText from "../../../utility/ExpandableText";
import api from "../../../utility/axios";
import { useAdminAuth } from "../../../context/AdminContext";

const OrderModal = ({ open, onOpenChange, order, onEdit }) => {
  if (!order) {
    return null; // ⬅ prevents ALL errors until order loads
  }

  const { user } = useAdminAuth();
  // console.log(order);

  const [downloading, setDownloading] = useState(false);

  // Full date & time formatter (for dateTime)
  const formatDateTimeForCSV = (isoString) => {
    if (!isoString) return "";
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(isoString).toLocaleString("en-US", options);
  };

  // Birthday formatter (date only)
  const formatBirthdayForCSV = (isoString) => {
    if (!isoString) return "";
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return new Date(isoString).toLocaleDateString("en-US", options);
  };

  const CSV_FIELDS = [
    { key: "dateTime", label: "Date & Time" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "zipCode", label: "Zip" },
    { key: "bankName", label: "Bank" },
    { key: "loanAmount", label: "Loan Amount" },
    { key: "birthday	", label: "Birthday	" },
    { key: "address	", label: "address	" },
  ];

  const handleDownloadCSV = async () => {
    if (!order?._id) return;

    try {
      setDownloading(true);

      const res = await api.get(`/orders/admin/${order._id}/leads`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const leads = res.data?.data?.leads || [];

      if (!leads.length) {
        alert("No leads available for this order");
        return;
      }

      const headers = CSV_FIELDS.map((f) => f.label);

      const rows = leads.map((lead) =>
        CSV_FIELDS.map((f) => {
          if (f.key === "dateTime")
            return `"${formatDateTimeForCSV(lead[f.key])}"`;
          if (f.key === "birthday")
            return `"${formatBirthdayForCSV(lead[f.key])}"`;
          return `"${lead[f.key] ?? ""}"`;
        }).join(",")
      );

      const csvContent = [headers.join(","), ...rows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `order-${order.customId || order._id}-leads.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        onOpenChange(false);
      }, 300);
    } catch (err) {
      console.error("CSV download failed:", err);
      alert("Failed to download CSV.");
    } finally {
      setDownloading(false);
    }
  };

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

  const formatSource = (value) => {
    if (!value) return "-";
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
          <Dialog.Title className="text-xl font-bold text-center text-brand-primary font-park mb-4">
            Order Details
          </Dialog.Title>
          {/* Status */}
          <Dialog.Description className="flex justify-center items-center text-sm mb-2">
            <span className={`text-sm font-medium mr-1`}>
              {order.status === "completed"
                ? "Paid"
                : order.status === "in_progress"
                ? "Paid"
                : order.status === "processing"
                ? "Paid"
                : "Paid"}
            </span>{" "}
            ||{" "}
            <span
              className={`text-sm font-medium ml-1 capitalize ${
                order.status === "completed"
                  ? "text-brand-green"
                  : order.status === "in_progress"
                  ? "text-brand-blue"
                  : "text-brand-muted"
              }`}
            >
              {formatStatus(order.status)}
            </span>
          </Dialog.Description>

          <div className="flex justify-between items-center my-4">
            <p className="text-brand-primary font-park font-semibold">
              Order Summary
            </p>
            <p className="text-brand-subtext">
              ID: <span className="font-medium">{order.customId}</span>
            </p>
          </div>

          {/* Account Details */}
          <div>
            <table className="w-full border-collapse text-sm ">
              <tbody>
                <tr className="border-b border-brand-stroke">
                  <td className="p-3  text-brand-muted">Customer Name</td>
                  <td className="p-3 text-brand-primary font-semibold text-right">
                    {order?.client.name}
                  </td>
                </tr>
                <tr className="border-b border-brand-stroke">
                  <td className="p-3 text-brand-muted">Lead Quantity</td>
                  <td className="p-3 text-brand-primary font-semibold text-right">
                    {order.quantity.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-brand-stroke">
                  <td className="p-3 text-brand-muted">Bank Category</td>
                  <td className="p-3 text-brand-primary font-semibold text-right">
                    {formatSource(order.orderType)}
                  </td>
                </tr>
                <tr className="border-b border-brand-stroke">
                  <td className="p-3 text-brand-muted">Bank Names</td>
                  <td className="p-3 text-brand-primary font-semibold text-right">
                    <ExpandableText
                      text={order.banks?.join(", ")}
                      maxLength={25}
                    />
                  </td>
                </tr>
                <tr className="border-b border-brand-stroke">
                  <td className="p-3 text-brand-muted">Order Created</td>
                  <td className="p-3 text-brand-primary font-semibold text-right">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* EDIT ORDER BUTTON */}
            {order.status === "pending" && (
              <div className="mt-4 flex w-full justify-center">
                <button
                  type="button"
                  onClick={() => onEdit(order)}
                  className="px-6 py-2 w-full rounded-lg bg-brand-blue text-white font-medium hover:opacity-90 transition"
                >
                  Edit Order Info
                </button>
              </div>
            )}
            {/* CSV BUTTON */}
            {["completed", "in_progress"].includes(order.status) && (
              <div className="mt-4 flex w-full justify-center">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  disabled={downloading}
                  className={`px-6 py-2 w-full rounded-lg font-medium transition
                    ${
                      downloading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-brand-blue text-white hover:opacity-90"
                    }`}
                >
                  {downloading ? "Downloading..." : "Download CSV"}
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Demo wrapper
export default OrderModal;
