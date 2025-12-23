import * as Dialog from "@radix-ui/react-dialog";
import Eye from "../../assets/Eye.svg";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import api from "../../utility/axios";
import ToastPop from "../../utility/ToastPop";

const UpdateProfile = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { user, updatePendingRegistration, logout } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmpassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(false);
  const passwordChanged = Boolean(form.newPassword);

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  // Populate form from user context on open
  useEffect(() => {
    if (user?.user) {
      setForm({
        name: user.user.name || "",
        email: user.user.email || "",
        oldPassword: "",
        newPassword: "",
        confirmpassword: "",
      });
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    updatePendingRegistration({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword || form.confirmpassword) {
      if (!form.newPassword || !form.confirmpassword) {
        showToast("Please fill both password fields.", "error");
        return;
      }

      if (form.newPassword !== form.confirmpassword) {
        showToast("Passwords do not match.", "error");
        return;
      }

      if (!form.oldPassword) {
        showToast("Old password is required.", "error");
        return;
      }
    }

    setLoading(true);

    try {
      const updateData = {
        name: form.name,
      };

      if (form.newPassword) {
        updateData.oldPassword = form.oldPassword;
        updateData.newPassword = form.newPassword;
      }

      const res = await api.put("/user/profile", updateData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (res.data.success) {
        showToast(res.data.message || "Profile updated", "success");

        setTimeout(() => {
          onOpenChange(false);

          if (form.newPassword) {
            logout();
            navigate("/");
          } else {
            navigate("/home");
          }
        }, 1200);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 z-50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[540px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-xl focus:outline-none">
          <Dialog.Close className="absolute top-2 right-4 text-black text-4xl font-medium cursor-pointer">
            ×
          </Dialog.Close>
          <Dialog.Title className="text-xl text-center font-bold mb-1 text-brand-primary">
            Update Profile
          </Dialog.Title>
          <Dialog.Description className="text-center text-brand-subtext mb-4">
            Manage & update your security details
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-brand-primary">
                  Business Name / Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="E.g John Doe LTD"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                />
              </div>

              {/* Email (disabled) */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-brand-muted">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="border border-b-brand-gray bg-gray-100 border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray cursor-not-allowed"
                />
              </div>
            </div>

            {/* Old Password */}
            <div className="flex flex-col relative">
              <label className="mb-1 font-medium text-brand-muted">
                Old Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="**************"
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[70%] -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                <img src={Eye} alt="toggle" />
              </button>
            </div>

            <div className="flex flex-col relative">
              <label className="mb-1 font-medium text-brand-muted">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="**************"
                value={form.newPassword}
                onChange={handleChange}
                className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[70%] -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                <img src={Eye} alt="toggle" />
              </button>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col relative">
              <label className="mb-1 font-medium text-brand-muted">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmpassword"
                placeholder="**************"
                value={form.confirmpassword}
                onChange={handleChange}
                className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[70%] -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                <img src={Eye} alt="toggle" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-4 w-full font-park"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>

          {toastMsg && (
            <ToastPop
              message={toastMsg}
              type={toastType}
              onClose={() => setToastMsg("")}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UpdateProfile;
