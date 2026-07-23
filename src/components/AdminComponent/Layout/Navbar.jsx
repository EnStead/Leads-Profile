import { Link, NavLink, useLocation, useNavigate } from "react-router";
import Logout from "../../../assets/Logout.svg";
import Avater from "../../../assets/Avater.jpg";
import { DropdownMenu } from "radix-ui";
import UpdateProfile from "../../CustomerComponent/Login/UpdateProfile";
import { useAdminAuth } from "../../../context/AdminContext";
import { useEffect, useState } from "react";
import { Menu, Plus, X } from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";
import DayWhite from "../../../assets/Daytime_white.svg";
import NightWhite from "../../../assets/Night_white.svg";

const Navbar = ({
  isScrolled,
  openAddModal,
  onOpenChange,
  isModalOpen,
  setIsModalOpen,
}) => {
  const { logout } = useAdminAuth();
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
    const timeOfDayTheme = hour >= 6 && hour < 18 ? "day" : "midnight";

    setThemeManually(timeOfDayTheme);
    logout();
    navigate("/admin");
  };

  const navLinks = [
    { to: "/admin/overview", label: "Overview" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/uploads", label: "Uploads" },
    { to: "/admin/customers", label: "Customers" },
    { to: "/admin/history", label: "Transaction History" },
  ];

  const isDarkTheme = theme === "midnight";

  const toggleTheme = () => {
    setThemeManually(isDarkTheme ? "day" : "midnight");
  };

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
        className={`w-full transition-all duration-500 z-50 py-2 font-sans px-5 xsm:px-10 sticky top-0 left-0 right-0 ${
          isScrolled
            ? "nav-glass border-b border-transparent animate-nav-slide-down"
            : "bg-brand-white border border-brand-stroke"
        }`}
      >
        <div className=" cnt_nav flex justify-between items-center ">
          {/* Logo */}
          <div className="text-[26px] ml-4 xsm:ml-0 text-brand-blackish font-normal tracking-wide font-logo">
            <Link to="/admin/dashboard">Leads Profile</Link>
          </div>

          {/* Desktop Nav Links */}
          <ul className="gap-7 text-sm sm:text-xs lg:gap-5 font-normal  px-2 lg:text-base transition-all duration-300 text-brand-muted hidden ls:flex">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative inline-block px-6 text-sm  transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 rounded-md ${
                      isActive
                        ? "text-brand-darkblue py-1 font-medium after:content-[''] after:absolute after:left-0 after:-bottom-[22px] after:w-full after:h-0.5 after:bg-brand-darkblue"
                        : "text-brand-body p-0 font-light hover:text-brand-primary"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
 
          {/* Desktop Right-side Button + Dropdown */}
          <div className=" gap-6 hidden items-center ls:flex">
            <button
              onClick={(e) => {
                const btn = e.currentTarget;
                const r = btn.getBoundingClientRect();

                const btnCx = r.left + r.width / 2;
                const btnCy = r.top + r.height / 2;

                const vpCx = window.innerWidth / 2;
                const vpCy = window.innerHeight / 2;

                const modalW = 1100;
                const modalH = 720;

                const ox = 50 + ((btnCx - vpCx) / modalW) * 100;
                const oy = 50 + ((btnCy - vpCy) / modalH) * 100;

                document.documentElement.style.setProperty(
                  "--modal-origin-x",
                  `${ox}%`,
                );
                document.documentElement.style.setProperty(
                  "--modal-origin-y",
                  `${oy}%`,
                );

                onOpenChange(); // open the modal
              }}
              className="cursor-pointer w-50 bg-brand-blue text-brand-white font-park text-sm sm:text-base px-2 sm:px-8 py-2 rounded-xl font-medium hover:opacity-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
            >
              Create Order
            </button>

            {/* Theme Icon */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="bg-brand-them cursor-pointer flex items-center gap-4 p-1 rounded-full w-fit h-fit transition-colors duration-400 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
            >
              <img
                src={isDarkTheme ? NightWhite : DayWhite}
                alt={isDarkTheme ? "Night icon" : "Daytime icon"}
                className="icon-label w-8 h-8 p-2 rounded-full bg-brand-rou transition-colors duration-400 ease-out"
              />
            </button>

            {/* Profile Icon */}
            <DropdownMenu.Root className="border-none shadow-md text-left">
              <DropdownMenu.Trigger className="p-2 rounded-full hover:bg-brand-offwhite transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40">
                <img
                  src={Avater}
                  alt="User avatar"
                  className="w-10 rounded-full border border-brand-darkpurple"
                />
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                sideOffset={5}
                className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
              >
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

          {/* Hamburger for small screens */}
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="admin-mobile-sidebar-menu"
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
          id="admin-mobile-sidebar-menu"
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

          <button
            onClick={(e) => {
              const btn = e.currentTarget;
              const r = btn.getBoundingClientRect();

              const btnCx = r.left + r.width / 2;
              const btnCy = r.top + r.height / 2;

              const vpCx = window.innerWidth / 2;
              const vpCy = window.innerHeight / 2;

              const modalW = 1100;
              const modalH = 720;

              const ox = 50 + ((btnCx - vpCx) / modalW) * 100;
              const oy = 50 + ((btnCy - vpCy) / modalH) * 100;

              document.documentElement.style.setProperty(
                "--modal-origin-x",
                `${ox}%`,
              );
              document.documentElement.style.setProperty(
                "--modal-origin-y",
                `${oy}%`,
              );

              onOpenChange();
              setIsMenuOpen(false);
            }}
            className="group mb-4 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-brand-blackish px-4 py-2.5 font-park text-sm font-semibold text-brand-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            <span>Create Order</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-lightblue/70 text-brand-blue transition-transform duration-300 ease-in-out group-hover:rotate-90">
              <Plus size={15} />
            </span>
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="w-full flex items-center gap-3 p-3 rounded-md border border-brand-stroke hover:bg-brand-offwhite transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40">
              <img
                src={Avater}
                alt="User avatar"
                className="w-8 rounded-full border border-brand-stroke"
              />
              <span className="text-sm text-brand-subtext">Account</span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              sideOffset={5}
              className="bg-brand-white shadow-md rounded-lg p-1 z-50 text-left"
            >
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

      <UpdateProfile open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default Navbar;
