import CreateOrder from "../Home/CreateOrder"
import Navbar from "./Navbar"

const Layout = ({children,isScrolled,open,onOpenChange,onOpen}) => {

  return (
    <>
      <Navbar 
        isScrolled={isScrolled}
        open={open} onOpenChange={onOpenChange} 
      />
      <main className="bg-brand-offwhite min-h-[91vh] p-10">{children}</main>
      <CreateOrder open={open} onOpenChange={onOpen}   />

    </>
  )
}

export default Layout