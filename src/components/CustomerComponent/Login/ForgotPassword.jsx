import { useState } from 'react';
import { useEffect } from 'react';
import ForgotBg from '../../../assets/ForgotBg.jpg';
import ForgotDawn from '../../../assets/ForgotDawn.jpg';
import ForgotEvening from '../../../assets/ForgotEvening.jpg';
import ForgotNight from '../../../assets/ForgotNight.jpg';
import Logo from '../../../assets/Logo.svg';
import { Link, useNavigate } from 'react-router';
import api from '../../../utility/axios';
import { useAppToast } from '../../../utility/appToastContext';

const ForgotPassword = () => {
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useAppToast();
  const [bgImage, setBgImage] = useState(ForgotBg);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) {
      setBgImage(ForgotDawn);
    } else if (hour >= 8 && hour < 17) {
      setBgImage(ForgotBg);
    } else if (hour >= 17 && hour < 21) {
      setBgImage(ForgotEvening);
    } else {
      setBgImage(ForgotNight);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/api/v1/auth/forgot-password", form);

      if (res.data.success) {
        showToast({
          type: "success",
          title: "Password Reset Link Sent",
          subtitle: res.data.message,
          duration: 3000,
        });
        // Redirect to Change Password page after 2s
        setTimeout(() => navigate('/change-password', { state: { email: form.email } }), 2000);
      } else {
        showToast({
          type: "error",
          title: "Reset Failed",
          subtitle: res.data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      showToast({ type: "error", title: "Reset Failed", subtitle: error.response?.data?.message || "Network error, please try again." });
    } finally {
    setLoading(false);
    }
  };

  return (
    <section className='h-screen relative'
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className='flex justify-center items-center h-full'>
        <div className='border w-lg border-brand-white bg-brand-white/30 backdrop-blur-[3px] rounded-2xl pb-10 pt-24 px-10 relative'>
          <img src={Logo} alt="Logo" className="absolute -top-20 left-1/2 -translate-x-1/2" />
          <h2 className='font-semibold font-park text-4xl text-brand-blackish mb-2 text-center'>Forgot Password 🤔</h2>
          <p className='text-brand-body text-center text-lg mb-8'>Enter your email to reset your password.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="email" className={`mb-1 font-medium text-lg ${form.email?.trim() !== "" ? "text-brand-blackish" : "text-brand-label"}`}>
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
                className="border border-b-brand-placeholder text-brand-blackish bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-placeholder"
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

          <p className='text-center text-brand-blackish mt-10 text-sm'>
            Remember your password? <Link to={'/'} className='text-brand-blue'>Go to Login</Link> 
          </p>
        </div>
      </div>
      <p className='text-brand-blackish font-medium absolute top-4 right-8'>
        © Leads Profile {new Date().getFullYear()}
      </p>
    </section>
  );
};

export default ForgotPassword;
