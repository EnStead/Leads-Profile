import { Routes, Route } from "react-router";
import Layout from "../container/Layout";
import Home from "../components/Home/Home";
import Orders from "../components/Orders/Orders";
import Transactions from "../components/Transactions/Transactions";
import OrderDetails from "../components/Orders/OrderDetails";
import AdminComponent from "../components/AdminComponent/AdminComponent";
import { useState } from "react";
import AdminRoute from "../utility/AdminRoute";
import UserRoute from "../utility/UserRoute";


const ProtectedRoutes = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [openOrderModal, setOpenOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    // const navigate = useNavigate();

    const handlePaymentSubmit = () => {
        // Close Payment Modal 
        setIsModalOpen(false);
        // Open Success Modal
        setOpenSuccessModal(true);
    };
    const openAddModal = (order) => {
        setSelectedOrder(order);
      setIsModalOpen(true);
    };
    const openOrderDetails = (order) => {
      setOpenOrderModal(true);
        setSelectedOrder(order);
    };


  return (
    <Routes>
        <Route
            path="/home"
            element={
                <UserRoute>
                    <Layout>
                        <Home                     
                            isModalOpen={isModalOpen} 
                            openAddModal={openAddModal} 
                            setIsModalOpen={setIsModalOpen}
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
                    <Layout>
                        <Orders  
                        isModalOpen={isModalOpen} 
                        openAddModal={openAddModal} 
                        setIsModalOpen={setIsModalOpen}
                        handlePaymentSubmit={handlePaymentSubmit} 
                        openSuccessModal={openSuccessModal}
                        setOpenSuccessModal={setOpenSuccessModal}
                        />
                    </Layout>
                </UserRoute>
            }
        />
        <Route
            path="/orders/:id"
            element={
                <UserRoute>
                    <Layout>
                        <OrderDetails />
                    </Layout>
                </UserRoute>
            }
        />
        <Route
            path="/transactions"
            element={
                <UserRoute>
                    <Layout>
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
                        // openViewLeads={openViewLeads}
                        />
                    </Layout>
                </UserRoute>
            }
        />
        <Route
            path="/admin/*"
            element={
                <AdminRoute>
                    <AdminComponent  />
                </AdminRoute>
            }
        />
    </Routes>
  );
};

export default ProtectedRoutes;
