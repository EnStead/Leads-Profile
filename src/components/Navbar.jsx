import { Link, NavLink, useNavigate } from 'react-router'
import Logout from '../assets/Logout.svg'
import Profile from '../assets/Profile.svg'
import Avater from '../assets/Avater.jpg'
import { DropdownMenu } from 'radix-ui'
import UpdateProfile from './Login/UpdateProfile'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'

const Navbar = ({
  isScrolled,
  openAddModal,
  isModalOpen,
  setIsModalOpen
}) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)


  useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target)
    ) {
      setIsMenuOpen(false)
    }
  }

  if (isMenuOpen) {
    document.addEventListener("mousedown", handleClickOutside)
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [isMenuOpen])



  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const navLinks = [
    { to: "/home", label: "My Home" },
    { to: "/orders", label: "My Orders" },
    { to: "/transactions", label: "My Transactions" },
  ]

  return (
    <>
      <nav
        className={`w-full transition-all duration-500 z-50 font-sans p-5 xsm:px-10 border border-brand-stroke bg-brand-white ${
          isScrolled
            ? "fixed top-0 shadow h-22 left-0 right-0"
            : "relative bg-brand-white h-21"
        }`}
      > 
        <div className="cnt_nav flex justify-between items-center">
          {/* Logo */}
          <div className="text-3xl ml-4 xsm:ml-0 text-brand-blue font-normal tracking-wide font-logo">
            <Link to="/home">Leads Profile</Link>
          </div>

          {/* Desktop Nav Links */}
          <ul className="gap-7 text-sm sm:text-xs lg:gap-10 font-normal py-2 px-2 lg:text-base transition-all duration-300 text-brand-muted hidden ls:flex">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative inline-block transition ${
                      isActive
                        ? "text-brand-darkblue py-1 px-4 font-medium after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:top-11 after:bg-brand-darkblue"
                        : "text-brand-subtext p-0 font-light"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop Right Dropdown */}
          <div className="hidden ls:flex gap-6">
            <DropdownMenu.Root className="border-none shadow-md text-left">
              <DropdownMenu.Trigger className="p-2 rounded-full hover:bg-brand-white">
                <img
                  src={Avater}
                  alt="Image"
                  className="w-10 rounded-full border border-brand-darkpurple"
                />
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                sideOffset={5}
                className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
              >
                <DropdownMenu.Item
                  onClick={openAddModal}
                  className="px-3 py-2 text-sm flex text-brand-subtext font-medium items-center gap-2 hover:bg-brand-subtext/10 cursor-pointer"
                >
                  <img src={Profile} alt="Image" className="w-5" />
                  <p className="text-sm">Update Profile</p>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm flex text-brand-red font-medium items-center gap-2 hover:bg-brand-red/10 cursor-pointer"
                >
                  <img src={Logout} alt="Image" className="w-5" />
                  <p className="text-sm">Log Out</p>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>

          {/* Hamburger */}
          <button
            className="ls:hidden p-2"
              ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div   ref={menuRef}
             className="ls:hidden flex flex-col gap-4 bg-brand-white p-4 shadow-md">
            <ul className="flex flex-col gap-3">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      isActive
                        ? "text-brand-darkblue font-medium"
                        : "text-brand-subtext font-light"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="flex items-center gap-3 p-2 rounded-md">
                <img
                  src={Avater}
                  alt="Image"
                  className="w-8 rounded-full border border-brand-darkpurple"
                />
                <span className="text-sm text-brand-subtext">Account</span>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                sideOffset={5}
                className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
              >
                <DropdownMenu.Item
                  onClick={openAddModal}
                  className="px-3 py-2 text-sm flex text-brand-subtext font-medium items-center gap-2 hover:bg-brand-subtext/10 cursor-pointer"
                >
                  <img src={Profile} alt="Image" className="w-5" />
                  <p className="text-sm">Update Profile</p>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm flex text-brand-red font-medium items-center gap-2 hover:bg-brand-red/10 cursor-pointer"
                >
                  <img src={Logout} alt="Image" className="w-5" />
                  <p className="text-sm">Log Out</p>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        )}
      </nav>

      <UpdateProfile open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}

export default Navbar
