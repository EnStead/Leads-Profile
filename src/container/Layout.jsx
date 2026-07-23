import { useEffect, useState } from "react";
import UpdateProfile from "../components/CustomerComponent/Login/UpdateProfile";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import TawkToWidget from "../utility/TawkToWidget";

const Layout = ({
  isScrolled,
  children,
  openAddModal,
  isModalOpen,
  setIsModalOpen,
}) => {
  const { user, authReady } = useAuth();
  const [isUpdateModal, setIsUpdateModal] = useState(false);

  const openUpdateModal = () => {
    setIsUpdateModal(true);
  };

  useEffect(() => {
    if (!authReady) return;
    if (!user?.user) return;
    if (user.user.imagePreset) return;

    setIsUpdateModal(true);
  }, [authReady, user?.user, user?.user?.imagePreset]);

  return (
    <>
      <TawkToWidget user={user} />
      <Navbar
        isScrolled={isScrolled}
        isModalOpen={isModalOpen}
        openAddModal={openAddModal}
        setIsModalOpen={setIsModalOpen}
        openUpdateModal={openUpdateModal}
      />
      <div className="cnt">
        <main className="p-5 xsm:px-10 xsm:py-5">{children}</main>
        <UpdateProfile open={isUpdateModal} onOpenChange={setIsUpdateModal} />
      </div>
    </>
  );
};

export default Layout;
