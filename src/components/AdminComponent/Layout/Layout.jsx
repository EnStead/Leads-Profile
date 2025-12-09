import Navbar from "./Navbar"

const Layout = ({children,isScrolled,open,onOpenChange}) => {

  return (
    <>
      <Navbar 
        isScrolled={isScrolled}
        open={open} onOpenChange={onOpenChange} 
      />
      <main className="bg-brand-offwhite min-h-[91vh] p-10">{children}</main>

    </>
  )
}

export default Layout