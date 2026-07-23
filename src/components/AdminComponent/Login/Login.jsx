import { Link, useNavigate } from "react-router";
import { useState } from "react";
import Eye from "../../../assets/Eye.svg";
import Logo from "../../../assets/AdminLogo.svg";
import { useAdminAuth } from "../../../context/AdminContext";
import { useAppToast } from "../../../utility/appToastContext";
import UnicornScene from "unicornstudio-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAdminAuth();
  const { showToast } = useAppToast();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!form.email || !form.password) {
      setLocalError("Please enter both email and password");
      return;
    }

    try {
      const res = await login({ email: form.email, password: form.password });
      // console.log("Admin login response:", res);

      if (res.adminData.success) {
        if (res.user.role !== "admin") {
          showToast({
            type: "error",
            title: "Login failed",
            subtitle:
              "The credentials provided are incorrect. Please try again.",
            duration: 1500,
          });
          return;
        }
        showToast({
          type: "success",
          title: "Logged in",
          subtitle: "Welcome back — your dashboard is locked and ready.",
          duration: 1500,
        });
        navigate("/admin/overview", { replace: true });
      } else {
        showToast({
          type: "error",
          title: "Login failed",
          subtitle:
            res.adminData?.message ||
            "The credentials provided are incorrect. Please try again.",
          duration: 1500,
        });
      }
    } catch (err) {
      console.log("Login error caught:", err);
      showToast({
        type: "error",
        title: "Login failed",
        subtitle:
          err.response?.data?.message ||
          "The credentials provided are incorrect. Please try again.",
        duration: 1500,
      });
    }
  };

  return (
    <section className="h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <UnicornScene
          projectId="w7ZYgayMb9QfCc2uaZ6z"
          width="100%"
          height="100%"
          lazyLoad
        />
      </div>
      <div className="relative z-10 flex justify-center items-center h-full">
        <div className="border z-30 w-lg border-brand-white bg-brand-white/30 backdrop-blur-[3px] rounded-2xl pb-10 pt-24 px-10 relative">
          <img
            src={Logo}
            alt="Logo"
            className="absolute -top-20 left-1/2 -translate-x-1/2"
          />

          <h2 className="font-semibold font-park text-4xl text-brand-blackish mb-2 text-center">
            Admin Panel
          </h2>
          <p className="text-brand-body text-center text-lg mb-8">
            Let's get you logged in to access your dashboard!
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className={`mb-1 font-medium text-lg  ${form.email?.trim() !== "" ? "text-brand-blackish" : "text-brand-label"}`}
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
                className="border border-brand-placeholder bg-brand-white text-brand-body rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-stroke"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col relative">
              <label
                className={`mb-1 font-medium text-lg  ${form.password?.trim() !== "" ? "text-brand-blackish" : "text-brand-label"}`}
              >
                Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="**************"
                value={form.password}
                onChange={handleChange}
                required
                className="border border-brand-placeholder bg-brand-white text-brand-body rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-stroke"
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
              className="bg-brand-blackish text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
            {localError && (
              <p className="text-brand-red mt-1 text-xs">{localError}</p>
            )}
          </form>
        </div>
      </div>
      <p className="text-brand-blackish text-[10px] lg:text-base  font-medium absolute top-4 right-8 ">
        © Leads Profile {new Date().getFullYear()}
      </p>

    </section>
  );
};

export default Login;
