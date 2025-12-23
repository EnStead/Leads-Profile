import { useState } from 'react';
import UpdateProfile from '../components/Login/UpdateProfile'
import Navbar from '../components/Navbar'

const Layout = ({isScrolled, children, openAddModal,
    isModalOpen,setIsModalOpen
  }) => {
  
    const [isUpdateModal, setIsUpdateModal] = useState(false);
    const openUpdateModal = () => {
      setIsUpdateModal(true);
    };
  return (
    <>
      <Navbar 
        isScrolled={isScrolled} 
        isModalOpen={isModalOpen} 
        openAddModal={openAddModal} 
        setIsModalOpen={setIsModalOpen}
        openUpdateModal={openUpdateModal}
      />
      <div className='cnt'>
        <main className='p-5 xsm:p-10' >{children}</main>
        <UpdateProfile open={isUpdateModal} onOpenChange={setIsUpdateModal} />
      </div>

    </>
  )
}

export default Layout 