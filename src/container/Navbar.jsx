import { Link, NavLink, useLocation, useNavigate } from "react-router";
import Logout from "../assets/Logout.svg";
import Profile from "../assets/Profile.svg";
import { DropdownMenu } from "radix-ui";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "../hooks/useTheme.jsx";
import DawnBlack from "../assets/Dawn_black.svg";
import DawnWhite from "../assets/Dawn_white.svg";
import DayBlack from "../assets/Day_black.svg";
import DayWhite from "../assets/Daytime_white.svg";
import EveningBlack from "../assets/Evening_black.svg";
import EveningWhite from "../assets/Evening_white.svg";
import NightBlack from "../assets/Night_black.svg";
import NightWhite from "../assets/Night_white.svg";
import ThemePill from "../utility/ThemePill.jsx";
import {
  DEFAULT_PROFILE_BG_TONE,
  getProfileImageSrc,
} from "../utility/profilePresets";
 
const Navbar = ({ isScrolled, openUpdateModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setThemeManually } = useTheme();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    const hour = new Date().getHours();
    let timeOfDayTheme = "day";
    if (hour >= 5 && hour < 8) timeOfDayTheme = "dawn";
    else if (hour >= 8 && hour < 17) timeOfDayTheme = "day";
    else if (hour >= 17 && hour < 21) timeOfDayTheme = "evening";
    else timeOfDayTheme = "midnight";

    setThemeManually(timeOfDayTheme);
    logout();
    navigate("/");

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const navLinks = [
    { to: "/home", label: "Overview" },
    { to: "/orders", label: "My Leads" },
    { to: "/transactions", label: "Order Transactions" },
  ];

  const themeOptions = [
    { id: "dawn", label: "Dawn", lightIcon: DawnBlack, darkIcon: DawnWhite },
    { id: "day", label: "Daytime", lightIcon: DayBlack, darkIcon: DayWhite },
    {
      id: "evening",
      label: "Evening",
      lightIcon: EveningBlack,
      darkIcon: EveningWhite,
    },
    {
      id: "midnight",
      label: "Night",
      lightIcon: NightBlack,
      darkIcon: NightWhite,
    },
  ];

  const activeTheme =
    themeOptions.find((option) => option.id === theme) || themeOptions[1];
  const isDarkTheme = theme === "evening" || theme === "midnight";
  const avatarSrc = getProfileImageSrc(user?.user?.imagePreset);
  const avatarBgTone = user?.user?.avatarBgTone || DEFAULT_PROFILE_BG_TONE;

  return (
    <>
      <style>{`
        @keyframes navSlideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .animate-nav-slide-down {
          animation: navSlideDown 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      <nav
        className={`w-full transition-all duration-500 z-50 font-sans pt-3 pb-3 px-5 xsm:px-10 sticky top-0 left-0 right-0 ${
          isScrolled
            ? "nav-glass border-b border-transparent animate-nav-slide-down"
            : "bg-brand-white border border-brand-stroke"
        }`}
      >
        <div className="cnt_nav flex justify-between items-center">
          {/* Logo */}
          <div className="text-[26px] ml-4 xsm:ml-0 text-brand-blue font-normal tracking-wide font-logo">
            <Link to="/home">Leads Profile</Link>
          </div>

          {/* Desktop Nav Links */}
          <ul className="gap-7 text-sm sm:text-xs lg:gap-5 font-normal  px-2 lg:text-base transition-all duration-300 text-brand-muted hidden ls:flex">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative inline-block px-10 text-sm  transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 rounded-md ${
                      isActive
                        ? "text-brand-darkblue py-1 font-medium after:content-[''] after:absolute after:left-0 after:-bottom-[18px] after:w-full after:h-0.5 after:bg-brand-darkblue"
                        : "text-brand-body p-0 font-light hover:text-brand-primary"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Theme Dropdown */}
          <div className="hidden ls:flex items-center gap-6">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="  bg-brand-them flex items-center gap-4 pl-2 pr-4 py-1 rounded-full w-[135px] h-fit transition-colors duration-400 ease-out">
                <img
                  src={
                    theme === "evening"
                      ? activeTheme.lightIcon
                      : activeTheme.darkIcon
                  }
                  alt={`${activeTheme.label} icon`}
                  className="icon-label w-8 h-8 p-2 rounded-full bg-brand-rou transition-colors duration-400 ease-out"
                />
                <span
                  key={activeTheme.label}
                  className="theme-label text-sm font-medium font-sans text-brand-let transition-colors duration-400 ease-out"
                >
                  {activeTheme.label}
                </span>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                sideOffset={20}
                
              >
                <ThemePill />
              </DropdownMenu.Content>
            </DropdownMenu.Root> 

            {/* Desktop Right Dropdown */}
            <DropdownMenu.Root className="border-none shadow-md text-left">
              <DropdownMenu.Trigger className=" rounded-full hover:bg-brand-offwhite transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40">
                <img
                  src={avatarSrc}
                  alt="User avatar"
                  className={`w-10 rounded-full border-2 border-brand-stroke ${avatarBgTone}`}
                />
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                sideOffset={5}
                className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
              >
                <DropdownMenu.Item
                  onClick={openUpdateModal}
                  className="px-3 py-2 text-sm flex text-brand-subtext font-medium items-center gap-2 hover:bg-brand-subtext/10 focus:bg-brand-subtext/10 focus:outline-none cursor-pointer"
                >
                  <img src={Profile} alt="Profile icon" className="w-5" />
                  <p className="text-sm">Update Profile</p>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm flex text-brand-red font-medium items-center gap-2 hover:bg-brand-red/10 focus:bg-brand-red/10 focus:outline-none cursor-pointer"
                >
                  <img src={Logout} alt="Logout icon" className="w-5" />
                  <p className="text-sm">Log Out</p>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>

          {/* Hamburger */}
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-sidebar-menu"
            className="ls:hidden p-2 rounded-md transition-colors duration-200 hover:bg-brand-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <div
        className={`ls:hidden fixed inset-0 z-[60] transition-opacity duration-200 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          aria-label="Close mobile menu overlay"
          className="absolute inset-0 bg-black/30"
          onClick={() => setIsMenuOpen(false)}
        />

        <aside
          id="mobile-sidebar-menu"
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-brand-white border-l border-brand-strok shadow-xl p-5 transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-base font-semibold text-brand-primary">Menu</p>
            <button
              aria-label="Close menu"
              className="p-2 rounded-md transition-colors duration-200 hover:bg-brand-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <ul className="flex flex-col gap-3 mb-6">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
                      isActive
                        ? "text-brand-darkblue font-medium bg-brand-offwhite"
                        : "text-brand-subtext font-light hover:bg-brand-offwhite"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-label mb-3">
              Theme
            </p>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="theme-glass w-full flex items-center gap-2 px-3 py-3 rounded-2xl shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40">
                <img
                  src={
                    isDarkTheme ? activeTheme.darkIcon : activeTheme.lightIcon
                  }
                  alt={`${activeTheme.label} icon`}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-brand-darkblue">
                  {activeTheme.label}
                </span>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                sideOffset={8}
                className=" p-3 rounded-full z-50 text-left"
              >
                <ThemePill size="sm" />
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="w-full flex items-center gap-3 p-3 rounded-md border-2 border-brand-stroke hover:bg-brand-offwhite transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40">
              <img
                src={avatarSrc}
                alt="User avatar"
                className={`w-8 rounded-full border-2 border-brand-stroke ${avatarBgTone}`}
              />
              <span className="text-sm text-brand-subtext">Account</span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              sideOffset={5}
              className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
            >
              <DropdownMenu.Item
                onClick={openUpdateModal}
                className="px-3 py-2 text-sm flex text-brand-subtext font-medium items-center gap-2 hover:bg-brand-subtext/10 focus:bg-brand-subtext/10 focus:outline-none cursor-pointer"
              >
                <img src={Profile} alt="Profile icon" className="w-5" />
                <p className="text-sm">Update Profile</p>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={handleLogout}
                className="px-3 py-2 text-sm flex text-brand-red font-medium items-center gap-2 hover:bg-brand-red/10 focus:bg-brand-red/10 focus:outline-none cursor-pointer"
              >
                <img src={Logout} alt="Logout icon" className="w-5" />
                <p className="text-sm">Log Out</p>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
