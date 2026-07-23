import { Link, useNavigate } from 'react-router';
import CreateBg from '../../../assets/CreateBg.jpg';
import CreateDawn from '../../../assets/CreateDawn.jpg';
import CreateEvening from '../../../assets/CreateEvening.jpg';
import CreateNight from '../../../assets/CreateNight.jpg';
import Logo from '../../../assets/Logo.svg'
import Eye from '../../../assets/Eye.svg'
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { getRandomProfilePresetId } from '../../../utility/profilePresets';
import { useAppToast } from '../../../utility/appToastContext';

const CreateAccount = () => {

    const navigate = useNavigate();
    const { pendingRegistration, updatePendingRegistration, signup, loading, error } = useAuth();
    const { showToast } = useAppToast();
    const [form, setForm] = useState(pendingRegistration);
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [bgImage, setBgImage] = useState(CreateBg);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) {
      setBgImage(CreateDawn);
    } else if (hour >= 8 && hour < 17) {
      setBgImage(CreateBg);
    } else if (hour >= 17 && hour < 21) {
      setBgImage(CreateEvening);
    } else {
      setBgImage(CreateNight);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    updatePendingRegistration({ [name]: value }); // update context
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Confirm password validation
    if (form.password !== form.confirmpass) {
      setLocalError("Passwords do not match");
      return;
    }
    setLocalError('');

    try {
      const imagePreset = getRandomProfilePresetId();
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'client', // or dynamic role if needed
        imagePreset,
      });
        showToast({
          type: "success",
          title: "Account created",
          subtitle:
            "Your account is ready to go. You can now start requesting orders.",
          duration: 1500,
        });
      navigate('/');
    } catch {
      showToast({
        message: error,
        type: 'error',
        title: "Account creation failed",
        subtitle:
          error || "We couldn’t create your account. Please try again.",
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
                    Create Account 👩🏻‍💻
                </h2>
                <p className='text-brand-body text-center text-lg mb-8'>
                    Welcome to Leads Profile, your go-to hub for timely access to top-quality leads.
                </p>
                {/* 
                {(localError || error) && (
                    <p className="text-brand-red mb-4 text-center">{localError || error}</p>
                )} */}

                <form onSubmit={handleSubmit}  className="flex flex-col gap-4">
                    {/* Business Name */}
                    <div className="flex flex-col">
                        <label htmlFor="name" className={`mb-1 font-medium text-lg  ${form.name?.trim() !== "" ? "text-brand-blackish" : "text-brand-body"}`}
                        >
                            Business Name/Full Name
                        </label>
                        <input
                            id="name"
                            type="name"
                            name="name"
                            placeholder="E.g John Doe LTD"
                            value={form.name || ''}
                            onChange={handleChange}
                            required
                            className="border border-b-brand-placeholder  text-brand-blackish bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-placeholder"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                        <label htmlFor="email" className={`mb-1 font-medium text-lg  ${form.email?.trim() !== "" ? "text-brand-blackish" : "text-brand-body"}`}
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="johndoe@gmail.com"
                            value={form.email || ''}
                            onChange={handleChange}
                            required
                            className="border border-b-brand-placeholder text-brand-blackish bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-placeholder"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col relative">
                        <label className={`mb-1 font-medium text-lg  ${form.password?.trim() !== "" ? "text-brand-blackish" : "text-brand-body"}`}
                        >
                            Password
                        </label>

                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="**************"
                            value={form.password || ''}
                            onChange={handleChange}
                            required
                            className="border border-b-brand-placeholder text-brand-blackish bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-placeholder"
                        />

                        {/* Eye Icon */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[70%] -translate-y-1/2 text-placeholder-500 cursor-pointer"
                        >
                            {showPassword ? <img src={Eye} /> : <img src={Eye} />}
                        </button>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col relative">
                        <label className={`mb-1 font-medium text-lg  ${form.confirmpass?.trim() !== "" ? "text-brand-blackish" : "text-brand-body"}`}
                        >
                            Confirm Password
                        </label>

                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmpass"
                            placeholder="**************"
                            value={form.confirmpass || ''}
                            onChange={handleChange}
                            className="border border-b-brand-placeholder text-brand-blackish bg-brand-white border-t-0 border-x-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-placeholder"
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

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-blue text-brand-white py-3 rounded-xl font-semibold mt-8 w-full font-park"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <p className='text-center text-brand-blackish mt-10 text-sm'  >
                    Already have an account? <Link to={'/'} className='text-brand-blue' >Log In</Link> 
                </p>
            </div>
        </div>
        <p className='text-brand-blackish font-medium absolute top-4 right-8 ' >
          © Leads Profile {new Date().getFullYear()}
        </p>

      </section>
  )
}

export default CreateAccount
