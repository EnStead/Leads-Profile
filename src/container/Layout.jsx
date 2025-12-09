import Navbar from '../components/Navbar'

const Layout = ({isScrolled, children, openAddModal,
    isModalOpen,setIsModalOpen
  }) => {
  return (
    <>
      <Navbar 
        isScrolled={isScrolled} 
        isModalOpen={isModalOpen} 
        openAddModal={openAddModal} 
        setIsModalOpen={setIsModalOpen}
      />
        <main>{children}</main>

    </>
  )
}

export default Layout