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
      <div className='cnt'>
        <main className='p-5 xsm:p-10' >{children}</main>
      </div>

    </>
  )
}

export default Layout 