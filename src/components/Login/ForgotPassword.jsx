import { useState } from 'react';
import Image from '../../assets/ForgotBg.jpg';
import Logo from '../../assets/Logo.svg';
import { Link, useNavigate } from 'react-router';
import api from '../../utility/axios';
import ToastPop from '../../utility/ToastPop';

const ForgotPassword = () => {
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => {
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
      const res = await api.post("/auth/forgot-password", form);

      if (res.data.success) {
        showToast(res.data.message);
        // Redirect to Change Password page after 2s
        setTimeout(() => navigate('/change-password', { state: { email: form.email } }), 2000);
      } else {
        showToast(res.data.message || "Something went wrong", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Network error, please try again.", "error");
    }

    setLoading(false);
  };

  return (
    <section className='h-screen relative'
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
          <h2 className='font-semibold font-park text-4xl text-brand-primary mb-2 text-center'>Forgot Password 🤔</h2>
          <p className='text-brand-subtext text-center text-lg mb-8'>Enter your email to reset your password.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="email" className={`mb-1 font-medium text-lg ${form.email?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}>
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

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
            >
              {loading ? "Sending..." : "Send Reset Link"} 
            </button>
          </form>

          <p className='text-center text-brand-primary mt-10 text-sm'>
            Remember your password? <Link to={'/'} className='text-brand-blue'>Go to Login</Link> 
          </p>
        </div>
      </div>

      <p className='text-brand-darkblue font-medium absolute top-4 right-8'>© Leads Profile 2025</p>

      {toastMsg && <ToastPop message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />}
    </section>
  );
};

export default ForgotPassword;
