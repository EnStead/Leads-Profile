import { Routes, Route, Outlet } from "react-router";
import Layout from "../container/Layout";
import Home from "../components/CustomerComponent/Home/Home";
import Orders from "../components/CustomerComponent/Orders/Orders";
import Transactions from "../components/CustomerComponent/Transactions/Transactions";
import OrderDetails from "../components/CustomerComponent/Orders/OrderDetails";
import AdminComponent from "../components/AdminComponent/AdminComponent";
import { useEffect, useState } from "react";
import AdminRoute from "../utility/AdminRoute";
import UserRoute from "../utility/UserRoute";
import { useAuth } from "../context/AuthContext";
import {
  AdminDashboardProvider,
  ClientDashboardProvider,
} from "../context/DashboardContext";
import {
    fetchOrderDetails,
} from "../context/dashboardApi";
import Logo from "../assets/Logo.svg";
import { useAppToast } from "../utility/appToastContext";


const ProtectedRoutes = () => {
    const { user } = useAuth();
    const { showToast } = useAppToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [openOrderModal, setOpenOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [isPaymentModalLoading, setIsPaymentModalLoading] = useState(false);
    // const navigate = useNavigate();

      const [isScrolled, setIsScrolled] = useState(false);
    
    
    
    
      useEffect(() => {
          const handleScroll = () => {
            setIsScrolled(window.scrollY > 20); // become fixed after 50px scroll
          };
      
          window.addEventListener("scroll", handleScroll);
          return () => window.removeEventListener("scroll", handleScroll);
      }, []);

    const handlePaymentSubmit = async (details = null) => {
        setPaymentDetails(details);
        setIsModalOpen(false);
        setOpenSuccessModal(true);
        showToast({
          type: "success",
          title: "Payment submitted",
          subtitle:
            "Your payment details have been received and are now awaiting confirmation.",
          actionLabel: "View Order Details",
          onAction: () => {
            setOpenSuccessModal(false);
            setOpenOrderModal(true);
          },
        });
        return details?.response ?? null;
    };
    const openAddModal = async (order) => {
      const orderId = order?._id || order?.id || order?.publicId || null;

      if (!orderId || !user?.token) {
        setSelectedOrder(order);
        setIsModalOpen(true);
        return;
      }

      try {
        setIsPaymentModalLoading(true);
        const detailedOrder = await fetchOrderDetails(user.token, orderId).catch(() => null);

        setSelectedOrder({
          ...(order || {}),
          ...(detailedOrder || {}),
        });
      } catch {
        setSelectedOrder(order);
      } finally {
        setIsModalOpen(true);
        setIsPaymentModalLoading(false);
      }
    };
    const openOrderDetails = (order) => {
      setOpenOrderModal(true);
        setSelectedOrder(order);
    };


  return (
    <>
      {isPaymentModalLoading ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 px-10 py-12">
            <img src={Logo} alt="Leeds Profile" className="h-14 w-14 animate-pulse" />
            <div className="text-center">
              <p className="font-park text-lg font-semibold text-brand-blackish">
                Preparing payment details
              </p>
              <p className="mt-1 text-sm text-brand-body">
                Please wait while we load the order summary.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <Routes>
        <Route
            element={
                <ClientDashboardProvider>
                    <Outlet />
                </ClientDashboardProvider>
            }
        >
        <Route
            path="/home"
            element={
                <UserRoute>
                    <Layout 
                        isScrolled={isScrolled}
                        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
                        <Home
                            isModalOpen={isModalOpen}
                            openAddModal={openAddModal}
                            setIsModalOpen={setIsModalOpen}
                            handlePaymentSubmit={handlePaymentSubmit}
                            openSuccessModal={openSuccessModal}
                            setOpenSuccessModal={setOpenSuccessModal}
                            paymentDetails={paymentDetails}
                            openOrderDetails={openOrderDetails}
                            selectedOrder={selectedOrder}
                            setOpenOrderModal={setOpenOrderModal}
                            openOrderModal={openOrderModal}
                        />
                    </Layout>
                </UserRoute>
            }
        />

        <Route
            path="/orders"
            element={
                <UserRoute>
                    <Layout 
                        isScrolled={isScrolled}>
                        <Orders  
                        isModalOpen={isModalOpen} 
                        openAddModal={openAddModal} 
                        setIsModalOpen={setIsModalOpen}
                        handlePaymentSubmit={handlePaymentSubmit} 
                        openSuccessModal={openSuccessModal}
                        setOpenSuccessModal={setOpenSuccessModal}
                        paymentDetails={paymentDetails}
                        />
                    </Layout>
                </UserRoute>
            }
        />
        <Route
            path="/orders/:id"
            element={
                <UserRoute>
                    <Layout 
                        isScrolled={isScrolled}>
                        <OrderDetails />
                    </Layout>
                </UserRoute>
            }
        />
        <Route
            path="/transactions"
            element={
                <UserRoute>
                    <Layout 
                        isScrolled={isScrolled}>
                        <Transactions  
                            isModalOpen={isModalOpen} 
                            openAddModal={openAddModal} 
                            handlePaymentSubmit={handlePaymentSubmit} 
                            openSuccessModal={openSuccessModal}
                            setIsModalOpen={setIsModalOpen}
                            setOpenSuccessModal={setOpenSuccessModal}
                            setOpenOrderModal={setOpenOrderModal}
                            openOrderModal={openOrderModal}
                            openOrderDetails={openOrderDetails}
                            selectedOrder={selectedOrder}
                            paymentDetails={paymentDetails}
                        // openViewLeads={openViewLeads}
                        />
                    </Layout>
                </UserRoute>
            }
        />
        </Route>
        <Route
            path="/admin/*"
            element={
                <AdminDashboardProvider>
                    <AdminRoute>
                        <AdminComponent isScrolled={isScrolled} />
                    </AdminRoute>
                </AdminDashboardProvider>
            }
        />
      </Routes>
    </>
  );
};

export default ProtectedRoutes;
