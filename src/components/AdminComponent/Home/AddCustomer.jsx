import { Dialog } from "radix-ui";
import { useState } from "react";
import api from "../../../utility/axios";
import { useAdminAuth } from "../../../context/AdminContext";
import { useAdminDashboard } from "../../../context/DashboardContext";
import { useAppToast } from "../../../utility/appToastContext";
 
const AddCustomer = ({ open, onOpenChange }) => {
  const { user } = useAdminAuth();
  const { refetchCustomers } = useAdminDashboard();
  const [form, setForm] = useState({ email: "", fullName: "" });
  const [loading, setLoading] = useState(false);
  const { showToast } = useAppToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.fullName,
        email: form.email,
      };

      const res = await api.post("/api/v1/user/admin/clients", payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      //   console.log("Customer created:", res.data);
      showToast({
        type: "success",
        title: "Customer Added",
        subtitle: res.data.message || "Customer added successfully",
      });

      // optional: close modal after success
      onOpenChange(false);

      // optional: reset form
      setForm({ email: "", fullName: "" });

      // refresh customers list
      refetchCustomers();
    } catch (err) {
      showToast({
        type: "error",
        title: "Action failed",
        subtitle: err?.response?.data?.message || "Failed to create customer",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          {/* BACKDROP */}
          <Dialog.Overlay className="modal-overlay fixed inset-0 bg-black/35 z-50" />

          {/* MODAL */}
          <Dialog.Content
            // Tells Radix to wait for animation before unmounting
            onAnimationEnd={(e) => {
              if (e.animationName === "modalShrink") {
                // optional: any cleanup
              }
            }}
            className="modal-content fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[520px] min-h-fit focus:outline-none will-change-opacity"
          >
            <div className="modal-panel bg-brand-white rounded-2xl p-8 shadow-xl will-change-transform">
              {/* CLOSE BUTTON */}
              <Dialog.Close className="absolute top-4 right-6 text-brand-blackish hover:text-brand-body text-2xl font-light cursor-pointer">
                ×
              </Dialog.Close>

              {/* HEADER */}
              <Dialog.Title className="text-2xl font-bold mb-2 font-park text-center text-brand-blackish">
                Add Customer
              </Dialog.Title>
              <Dialog.Description className="text-brand-body font-light mb-6 text-center">
                Create a new customer profile for ordering and tracking.
              </Dialog.Description>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* fullName */}
                <div className="flex flex-col mb-4">
                  <label
                    htmlFor="fullName"
                    className={`mb-1 font-medium  ${
                      form.fullName?.trim() !== ""
                        ? "text-brand-blackish"
                        : "text-brand-label"
                    }`}
                  >
                    Full Name/Business Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter customer/business name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="border border-brand-placeholder bg-brand-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label
                    htmlFor="email"
                    className={`mb-1 font-medium ${
                      form.email?.trim() !== ""
                        ? "text-brand-blackish"
                        : "text-brand-label"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter their email address..."
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="border border-brand-placeholder bg-brand-wactiohite rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park transition-colors duration-200 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Customer Account"}
                </button>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </>
  );
};

export default AddCustomer;
