import { Link, NavLink } from 'react-router'
import Logout from '../../../assets/Logout.svg'
import Profile from '../../../assets/Profile.svg'
import Avater from '../../../assets/Avater.jpg'
import { DropdownMenu } from 'radix-ui'
import UpdateProfile from '../../Login/UpdateProfile'

const Navbar = ({isScrolled,openAddModal,onOpenChange,
    isModalOpen,setIsModalOpen
}) => {
  return (
    <>
      <nav
        className={`w-full transition-all duration-500 z-50 font-sans px-10 border border-brand-stroke bg-brand-white  ${
          isScrolled
            ? "fixed top-0 shadow h-22 left-0 right-0   "
            : "relative bg-brand-white h-21" 
        }`}
      >
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="text-3xl ml-4 xsm:ml-0 text-brand-primary font-normal tracking-wide font-logo">
            <Link to="/">Leads Profile</Link>
          </div>

          <ul className= {`gap-7 text-sm ml:flex sm:text-xs lg:gap-10 font-normal py-2 px-2 lg:text-base transition-all duration-300
            text-brand-muted`}
          >
            {[
              { to: "/admin/dashboard", label: "Dashboard" },
              { to: "/admin/leads", label: "Leads" },
              { to: "/admin/orders", label: "Orders" },
              { to: "/admin/customers", label: "Customers" },
            ].map((item) => (
              <li key={item.to} >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative inline-block transition ${
                      isActive
                        ? "text-brand-darkblue  py-1 px-4  font-medium after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:top-14  after:bg-brand-darkblue  "
                        : "text-brand-subtext p-0 font-light"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex gap-6">         

            <button onClick={onOpenChange} className=" cursor-pointer w-50 bg-brand-blue text-brand-white font-park text-sm sm:text-base px-2 sm:px-8 py-1  rounded-xl font-medium hover:opacity-90 transition">
                Create Order
            </button>

            <DropdownMenu.Root className={'border-none shadow-md text-left'}>
              <DropdownMenu.Trigger className='p-2 rounded-full hover:bg-brand-white'>
                  <img src={Avater} alt="Image" className='w-10 rounded-full border border-brand-darkpurple' />
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                  sideOffset={5}
                  className="bg-white shadow-md rounded-lg p-1 z-50 text-left"
              >
                  <DropdownMenu.Item onClick={openAddModal} className="px-3 py-2 text-sm flex text-brand-subtext font-medium w-fit items-center gap-2 hover:bg-brand-subtext/10 cursor-pointer">
                    <img src={Profile} alt="Image" className='w-5  ' />
                    <p className='text-sm' >Update Profile</p>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm flex text-brand-red font-medium  items-center gap-2 hover:bg-brand-red/10 cursor-pointer">
                    <img src={Logout} alt="Image" className='w-5  ' />
                    <p className='text-sm' >Log Out</p>
                  </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </nav>
      <UpdateProfile
        open={isModalOpen} onOpenChange={setIsModalOpen}
      />
    </>
  )
}

export default Navbar