import CreateOrder from "../Home/CreateOrder"
import Navbar from "./Navbar"

const Layout = ({children,isScrolled,open,onOpenChange,onOpen}) => {

  return (
    <div className="bg-brand-offwhite">
      <Navbar 
        isScrolled={isScrolled}
        open={open} onOpenChange={onOpenChange} 
      />
      <div className={'cnt'}>
        <main className="bg-brand-offwhite min-h-[91vh] p-10">{children}</main>
        <CreateOrder open={open} onOpenChange={onOpen}   />
      </div>

    </div>
  )
}

export default Layout