import * as Dialog from '@radix-ui/react-dialog'
import Eye from '../../assets/Eye.svg';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';


const UpdateProfile = ({
    open, onOpenChange
}) => {

    const [showPassword, setShowPassword] = useState(false);
    const { pendingRegistration, updatePendingRegistration,login } = useAuth();
    const [form, setForm] = useState(pendingRegistration);

    const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    updatePendingRegistration({ [name]: value }); // update context
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, just log in dummy user
        login({ name: form.name, email: form.email, isAdmin: true });
        navigate("/home");
    };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
            {/* BACKDROP */}
            <Dialog.Overlay className="fixed inset-0 bg-black/20 z-50 backdrop-blur-[2px]" />

            {/* MODAL */}
            <Dialog.Content
                className="fixed left-1/2 top-1/2 z-50 w-[540px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-xl focus:outline-none"
            >
                {/* CLOSE BUTTON */}
                <Dialog.Close className="absolute top-2 right-4 text-black text-4xl font-medium cursor-pointer">
                    ×
                </Dialog.Close>

                {/* HEADER */}
                {/* Radix Title and Description */}
                <Dialog.Title className="text-xl text-center font-bold mb-1 text-brand-primary">
                    Update Profile
                </Dialog.Title>
                <Dialog.Description className="text-center text-brand-subtext mb-4">
                    Manage & update your security details
                </Dialog.Description>

                {/* FORM */}
                <form onSubmit={handleSubmit}  className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Business Name */}
                        <div className="flex flex-col">
                            <label htmlFor="name" className={`mb-1 font-medium  ${form.name?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}
                            >
                                Business Name/Full Name
                            </label>
                            <input
                                id="name"
                                type="name"
                                name="name"
                                placeholder="E.g John Doe LTD"
                                value={form.email}
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
                                placeholder="johndoe@gmail.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                            />
                        </div>

                    </div>

                    {/*Old Password */}
                    <div className="flex flex-col relative">
                        <label className={`mb-1 font-medium ${form.oldPassword?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}
                        >
                           Old Password
                        </label>

                        <input
                            type={showPassword ? "text" : "password"}
                            name="oldpassword"
                            placeholder="**************"
                            value={form.oldPassword}
                            onChange={handleChange}
                            required
                            className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                        />

                        {/* Eye Icon */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[70%] -translate-y-1/2 text-gray-500 cursor-pointer"
                        >
                            {showPassword ? <img src={Eye} /> : <img src={Eye} />}
                        </button>
                    </div>

                    {/*New Password */}
                    <div className="flex flex-col relative">
                        <label className={`mb-1 font-medium ${form.newPassword?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}
                        >
                          New Password
                        </label>

                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="**************"
                            value={form.newPassword}
                            onChange={handleChange}
                            required
                            className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                        />

                        {/* Eye Icon */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[70%] -translate-y-1/2 text-gray-500 cursor-pointer"
                        >
                            {showPassword ? <img src={Eye} /> : <img src={Eye} />}
                        </button>
                    </div>

                    {/*Confirm Password */}
                    <div className="flex flex-col relative">
                        <label className={`mb-1 font-medium ${form.confirmpassword?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}
                        >
                            Confirm Password
                        </label>

                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmpassword"
                            placeholder="**************"
                            value={form.confirmpassword}
                            onChange={handleChange}
                            required
                            className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                        />

                        {/* Eye Icon */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[70%] -translate-y-1/2 text-gray-500 cursor-pointer"
                        >
                            {showPassword ? <img src={Eye} /> : <img src={Eye} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
                    >
                        Update Profile 
                    </button>
                </form>
                
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
  )
}

export default UpdateProfile