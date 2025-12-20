import { Dialog } from 'radix-ui'
import { useState } from 'react';
import api from '../../../utility/Axios';
import { useAdminAuth } from '../../../context/AdminContext';
import ToastPop from '../../../utility/ToastPop';
import { useDashboard } from '../../../context/DashboardContext';


const AddCustomer = ({open,onOpenChange}) => {

    const { user } = useAdminAuth();
    const{refetchCustomers} = useDashboard()
    const [form, setForm] = useState({ email: "", fullName: "" });
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState("success");
    const [loading, setLoading] = useState(false);


    const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    };

    
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

        const res = await api.post(
        "/user/admin/clients",
        payload,
        {
            headers: {
            Authorization: `Bearer ${user?.token}`,
            },
        }
        );

        console.log("Customer created:", res.data);
        showToast(res.data.message, "success");

        // optional: close modal after success
        onOpenChange(false);

        // optional: reset form
        setForm({ email: "", fullName: "" });

            // refresh customers list
         refetchCustomers();

    } catch (err) {
        showToast(
        err?.response?.data?.message || "Failed to create customer",
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
            {/* BACKDROP */}
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50 backdrop-blur-[2px]" />

            {/* MODAL */}
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[520px] min-h-fit   -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 shadow-xl focus:outline-none">
                {/* CLOSE BUTTON */}
                <Dialog.Close className="absolute top-4 right-6 text-brand-black hover:text-gray-600 text-2xl font-light cursor-pointer">
                ×
                </Dialog.Close>

                {/* HEADER */}
                <Dialog.Title className="text-2xl font-bold mb-2 font-park text-center text-gray-900">
                    Add Customer
                </Dialog.Title>
                <Dialog.Description className="text-brand-subtext mb-6 text-center">
                    Create a new customer profile for ordering and tracking.
                </Dialog.Description>

                {/* FORM */}
                <form onSubmit={handleSubmit}  className="flex flex-col gap-4">
                    {/* fullName */}
                    <div className="flex flex-col mb-4">
                        <label htmlFor="fullName" className={`mb-1 font-medium  ${form.fullName?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}
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
                        className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                        <label htmlFor="email" className={`mb-1 font-medium ${form.email?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}
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
                            className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                        />
                    </div>
                    <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
                    >
                    {loading ? "Creating..." : "Create Customer Account"}
                    </button>

                </form>
            </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>


        <ToastPop
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg("")}
        />

    </>

  )
}

export default AddCustomer