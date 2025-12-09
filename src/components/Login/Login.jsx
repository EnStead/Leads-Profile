import { Link, useNavigate } from 'react-router';
import Image from '../../assets/LoginBg.jpg'
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Eye from '../../assets/Eye.svg'
import Logo from '../../assets/Logo.svg'
import ToastPop from '../../utility/ToastPop';


const Login = () => {

  const navigate = useNavigate();
  const { login, loading, error } = useAuth(); // get login, loading, error from AuthProvider
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");
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
  setLocalError("");

  if (!form.email || !form.password) {
    setLocalError("Please enter both email and password");
    return;
  }

  try {
    const res = await login({
      email: form.email,
      password: form.password,
    });

    // ✅ Correct place to get the message
    const message = res.userData?.message || "Login successful";
    showToast(message);

    setTimeout(() => {
      navigate('/home');
    }, 1500);

  } catch (err) {
    // The global error is from the AuthContext
    showToast(error, "error");
  }
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
      <div className=' flex justify-center items-center h-full '>


        <div className='border w-lg border-brand-white bg-brand-white/30 backdrop-blur-[3px] rounded-2xl pb-10 pt-24 px-10 relative' >
          <img 
            src={Logo} 
            alt="" 
            className="absolute -top-20 left-1/2 -translate-x-1/2"
          />

          <h2 className='font-semibold font-park text-4xl text-brand-primary mb-2 text-center'  >
            Welcome Back 👋
          </h2>
          <p className='text-brand-subtext text-center text-lg mb-8'>
            Let's get you logged in to access your leads!
          </p>

          <form onSubmit={handleSubmit}  className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col">
                <label htmlFor="email" className={`mb-1 font-medium text-lg  ${form.email?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}
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

            {/* Password */} 
            <div className="flex flex-col relative">
                <label className={`mb-1 font-medium text-lg  ${form.email?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}
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
                {(localError) && (
                  <p className="text-brand-red mt-1 text-xs">{localError}</p>
                )}
            </div>

            <Link to={'/forgot-password'} className='text-brand-purple font-medium'>
              Forgot Password?
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <p className='text-center text-brand-primary mt-10 text-sm'  >
            New to Leads Profile? <Link to={'/create-account'} className='text-brand-blue' >Create An Account</Link> 
          </p>
        </div>
      </div>
        <p className='text-brand-darkblue font-medium absolute top-4 right-8 ' >
          © Leads Profile 2025
        </p>

        {toastMsg && <ToastPop message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />}

    </section>
  )
}

export default Login