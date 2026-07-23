import * as Dialog from "@radix-ui/react-dialog";
import Eye from "../../../assets/Eye.svg";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router";
import api from "../../../utility/axios";
import ToastPop from "../../../utility/ToastPop";
import {
  getRandomProfilePresetId,
  normalizeImagePreset,
} from "../../../utility/profilePresets";
import { X } from "lucide-react";

const UpdateProfile = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { user, updatePendingRegistration, logout, updateUserSession } = useAuth();
  const requiresImagePreset = !user?.user?.imagePreset;

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

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    if (!user?.user) return;

    setForm({
      name: user.user.name || "",
      email: user.user.email || "",
      oldPassword: "",
      newPassword: "",
      confirmpassword: "",
    });
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
      const nextImagePreset = normalizeImagePreset(getRandomProfilePresetId());
      const updateData = {
        name: form.name,
        imagePreset: nextImagePreset,
      };

      if (form.newPassword) {
        updateData.oldPassword = form.oldPassword;
        updateData.newPassword = form.newPassword;
      }

      const res = await api.put("/api/v1/user/profile", updateData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (res.data.success) {
        const nextSession = {
          ...user,
          user: {
            ...user?.user,
            ...(res.data.data?.user || {}),
            name: form.name,
            imagePreset:
              normalizeImagePreset(
                res.data.data?.user?.imagePreset || nextImagePreset,
              ) || nextImagePreset,
          },
          userData: {
            ...(user?.userData || {}),
            ...res.data,
          },
        };

        updateUserSession(nextSession);

        showToast(res.data.message || "Profile updated", "success");

        setTimeout(() => {
          onOpenChange(false);

          if (form.newPassword || requiresImagePreset) {
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
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (requiresImagePreset && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-brand-white p-6 shadow-xl focus:outline-none">
          {!requiresImagePreset ? (
            <Dialog.Close className="absolute right-4 top-2 cursor-pointer text-4xl font-medium text-brand-blackish">
                      <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-offwhite text-brand-blackish transition hover:bg-brand-white"
        >
          <X size={22} />
        </button>
            </Dialog.Close>
          ) : null}
          <Dialog.Title className="mb-1 text-center text-xl font-bold text-brand-blackish">
            Update Profile
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-center text-brand-body">
            {requiresImagePreset
              ? "We need to assign your profile icon before you continue. Update your profile to finish this setup."
              : "Manage & update your security details"}
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-brand-blackish">
                  Business Name / Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="E.g John Doe LTD"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="rounded-xl border border-brand-placeholder text-brand-blackish bg-brand-offwhite px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-brand-blackish">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="cursor-not-allowed rounded-xl border border-brand-placeholder text-brand-blackish bg-brand-offwhite px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
                />
              </div>
            </div>

            <div className="relative flex flex-col">
              <label className="mb-1 font-medium text-brand-blackish">
                Old Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="**************"
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                className="rounded-xl border border-brand-placeholder text-brand-blackish bg-brand-offwhite px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[70%] -translate-y-1/2 cursor-pointer text-brand-body"
              >
                <img src={Eye} alt="toggle" />
              </button>
            </div>

            <div className="relative flex flex-col">
              <label className="mb-1 font-medium text-brand-body">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="**************"
                value={form.newPassword}
                onChange={handleChange}
                className="rounded-xl border border-brand-placeholder text-brand-blackish bg-brand-offwhite px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[70%] -translate-y-1/2 cursor-pointer text-brand-body"
              >
                <img src={Eye} alt="toggle" />
              </button>
            </div>

            <div className="relative flex flex-col">
              <label className="mb-1 font-medium text-brand-body">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmpassword"
                placeholder="**************"
                value={form.confirmpassword}
                onChange={handleChange}
                className="rounded-xl border border-brand-placeholder text-brand-blackish bg-brand-offwhite px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[70%] -translate-y-1/2 cursor-pointer text-brand-body"
              >
                <img src={Eye} alt="toggle" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-brand-blue py-3 font-park font-semibold text-brand-white"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>

          {toastMsg ? (
            <ToastPop
              message={toastMsg}
              type={toastType}
              onClose={() => setToastMsg("")}
            />
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UpdateProfile;
