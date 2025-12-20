import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import api from "../../../utility/axios";
import { useAdminAuth } from "../../../context/AdminContext";
import ToastPop from "../../../utility/ToastPop";
import { useDashboard } from "../../../context/DashboardContext";

const DeleteModal = ({ open, onOpenChange, userId }) => {
   if (!userId) {
    return null; 
  }
  const { user } = useAdminAuth();
  const { refetchCustomers } = useDashboard(); // assuming you have a users context
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleDelete = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await api.delete(`/user/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      showToast(res.data.message, "success");

      // close modal
      onOpenChange(false);

      // refresh users list
      refetchCustomers();
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to delete user",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-[580px] shadow-xl z-50 p-8">
            {/* Close Button */}
            <Dialog.Close className="absolute top-6 right-6 text-gray-900 hover:text-gray-600 cursor-pointer">
              <X className="w-6 h-6" />
            </Dialog.Close>

            {/* Header */}
            <Dialog.Title className="text-xl font-bold mb-1 text-brand-primary font-park">
              Delete Customer
            </Dialog.Title>

            {/* Warning Text */}
            <Dialog.Description className="text-brand-subtext font-light text-base mb-6 leading-relaxed">
              Are you sure you want to delete this customer?<br />
              This action is permanent and cannot be undone.
            </Dialog.Description>

            {/* What Will Be Removed */}
            <div className="mb-6">
              <p className="text-brand-subtext font-light mb-3">
                Deleting this customer will remove:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-brand-subtext font-light list-disc">Their profile</li>
                <li className="text-brand-subtext font-light list-disc">Access to their dashboard</li>
              </ul>
            </div>

            {/* Additional Info */}
            <p className="text-brand-subtext font-light mb-4 leading-relaxed">
              Orders and delivered leads will remain stored for records,<br />
              but the customer will no longer be able to view them.
            </p>

            {/* Final Warning */}
            <p className="text-brand-brown font-semibold text-base mb-8">
              Once deleted, this customer cannot be restored.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 py-3.5 bg-white border-2 border-brand-muted text-brand-muted rounded-xl font-medium text-base hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3.5 bg-brand-red text-white rounded-xl font-semibold text-base hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Customer"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ToastPop
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg("")}
      />
    </>
  );
};

export default DeleteModal;
