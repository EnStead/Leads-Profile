import { Dialog } from 'radix-ui'
import { useState } from 'react';


const AddCustomer = ({open,onOpenChange}) => {

      const [form, setForm] = useState({ email: "", fullName: "" });
    
      const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form)
      };

  return (

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
                className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
                >
                    Create Customer Account 
                </button>
            </form>
        </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>

  )
}

export default AddCustomer