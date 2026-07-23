import { Link, useNavigate } from 'react-router';
import LoginBg from '../../../assets/LoginBg.jpg';
import LoginDawn from '../../../assets/LoginDawn.jpg';
import LoginEvening from '../../../assets/LoginEvening.jpg';
import LoginNight from '../../../assets/LoginNight.jpg';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Eye from '../../../assets/Eye.svg'
import Logo from '../../../assets/Logo.svg'
import { useAppToast } from '../../../utility/appToastContext';


const Login = () => {

  const navigate = useNavigate();
  const { login, loading, error } = useAuth(); // get login, loading, error from AuthProvider
  const { showToast } = useAppToast();
  const [showPassword, setShowPassword] = useState(false);
  const [bgImage, setBgImage] = useState(LoginBg);
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) {
      setBgImage(LoginDawn);
    } else if (hour >= 8 && hour < 17) {
      setBgImage(LoginBg);
    } else if (hour >= 17 && hour < 21) {
      setBgImage(LoginEvening);
    } else { 
      setBgImage(LoginNight);
    }
  }, []);

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


    // Role validation
    if (res.user.role !== "client") {
      showToast({
        type: "error",
        title: "Sign-in failed",
        subtitle: "You do not have access to the customer dashboard.",
        duration: 1500,
      });
      return;
    }


    // ✅ Correct place to get the message
    showToast({
      type: "success",
      title: "Logged in successfully",
      subtitle: "Welcome back — your dashboard is ready.",
      duration: 1500,
    });
    navigate('/home');

  } catch {
    // The global error is from the AuthContext
    showToast({
      message: error,
      type: "error",
      title: "Sign-in failed",
      subtitle:
        error ||
        "The email or password you entered is incorrect. Please try again.",
      duration: 1500,
    });
  }
};



  return (
    <section className='min-h-screen relative py-30'
      style={{
          backgroundImage: `url(${bgImage})`,
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

          <h2 className='font-semibold font-park text-4xl text-brand-blackish mb-2 text-center'  >
            Welcome Back 👋
          </h2>
          <p className='text-brand-body text-center text-lg mb-8'>
            Let's get you logged in to access your leads!
          </p>

          <form onSubmit={handleSubmit}  className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col">
                <label htmlFor="email" className={`mb-1 font-medium text-lg  ${form.email?.trim() !== "" ? "text-brand-blackish" : "text-brand-label"}`}
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
                  className="border border-b-brand-placeholder bg-brand-white text-brand-blackish border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blackish"
                />
            </div>

            {/* Password */} 
            <div className="flex flex-col relative">
                <label className={`mb-1 font-medium text-lg  ${form.password?.trim() !== "" ? "text-brand-blackish" : "text-brand-label"}`}
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
                    className="border border-b-brand-placeholder text-brand-blackish bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gray"
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

            <Link to={'/forgot-password'} className='text-brand-blue font-medium'>
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
          <p className='text-center text-brand-blackish mt-10 text-sm'  >
            New to Leads Profile? <Link to={'/create-account'} className='text-brand-blue' >Create An Account</Link> 
          </p>
        </div>
      </div>
        <p className='text-brand-blackish font-medium text-[10px] lg:text-base absolute top-4 right-8 ' >
          © Leads Profile {new Date().getFullYear()}
        </p>

    </section>
  )
}

export default Login
