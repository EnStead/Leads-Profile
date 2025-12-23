import { useState } from 'react';
import Image from '../../assets/LoginBg.jpg';
import Logo from '../../assets/Logo.svg';
import { useNavigate, useLocation } from 'react-router';
import api from '../../utility/axios';
import ToastPop from '../../utility/ToastPop';
import Eye from '../../assets/Eye.svg';

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation(); // get state from navigate
  const email = location.state?.email || "";

  const [form, setForm] = useState({ password: "", confirmpass: "", token: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password || !form.confirmpass || !form.token) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (form.password !== form.confirmpass) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        password: form.password,
        otp: form.token
      });

      if (res.data.success) {
        showToast(res.data.message || "Password reset successfully");
        setTimeout(() => navigate('/'), 2000);
      } else {
        showToast(res.data.message || "Something went wrong", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='min-h-screen relative py-30'
      style={{
        backgroundImage: `url(${Image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className='flex justify-center items-center h-full'>
        <div className='border w-lg border-brand-white bg-brand-white/30 backdrop-blur-[3px] rounded-2xl pb-10 pt-24 px-10 relative'>
          <img src={Logo} alt="Logo" className="absolute -top-20 left-1/2 -translate-x-1/2" />
          <h2 className='font-semibold font-park text-4xl text-brand-primary mb-2 text-center'>Change Password 🔐</h2>
          <p className='text-brand-subtext text-center text mb-8'>Updating password for <span className='text-brand-purple'>"{email}"</span> </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Password */}
            <div className="flex flex-col relative">
              <label className={`mb-1 font-medium text-lg ${form.password?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}>
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="**************"
                value={form.password}
                onChange={handleChange}
                required
                className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[70%] -translate-y-1/2 cursor-pointer">
                <img src={Eye} alt="toggle" />
              </button>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col relative">
              <label className={`mb-1 font-medium text-lg ${form.confirmpass?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}>
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmpass"
                placeholder="**************"
                value={form.confirmpass}
                onChange={handleChange}
                required
                className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[70%] -translate-y-1/2 cursor-pointer">
                <img src={Eye} alt="toggle" />
              </button>
            </div>

            {/* Token / OTP */}
            <div className="flex flex-col">
            <label className="mb-1 font-medium text-lg text-brand-muted">
                Reset Token
            </label>
            <input
                type="text" // using text to control length easily
                name="token"
                placeholder="Enter the 4-digit token from your email"
                value={form.token}
                onChange={(e) => {
                // Remove non-digit characters and limit to 6 digits (adjust as needed)
                const numericValue = e.target.value.replace(/\D/g, '').slice(0, 6);
                setForm({ ...form, token: numericValue });
                }}
                inputMode="numeric"   // brings numeric keyboard on mobile
                pattern="\d*"         // hint for numeric input
                required
                className="border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
            />
</div>


            <button
              type="submit"
              disabled={loading}
              className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
            >
              {loading ? "Reseting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      <p className='text-brand-darkblue font-medium text-[10px] lg:text-base absolute top-4 right-8'>
        © Leads Profile 2025
      </p>

      {toastMsg && <ToastPop message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />}
    </section>
  );
};

export default ChangePassword;
