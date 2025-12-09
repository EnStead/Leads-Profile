import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router";
import ScrollToTop from './utility/ScrollToTop'
import Layout from './container/Layout';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import {DashboardProvider} from './context/DashboardContext'
import AdminRoute from './utility/AdminRoute'
import CreateAccount from './components/Login/CreateAccount';
import ForgotPassword from './components/Login/ForgotPassword';
import Transactions from './components/Transactions/Transactions';
import Orders from './components/Orders/Orders';
import OrderDetails from './components/Orders/OrderDetails';
import AdminComponent from './components/AdminComponent/AdminComponent';
import { Toast } from 'radix-ui';
import ProtectedRoutes from './container/ProtectedRoutes';

function App() {

  
  const [isScrolled, setIsScrolled] = useState(false);

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


    useEffect(() => {
        const handleScroll = () => {
          setIsScrolled(window.scrollY > 20); // become fixed after 50px scroll
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

  return (
      <Toast.Provider swipeDirection="right">
        <DashboardProvider>
            <Router>

              <ScrollToTop /> 
              
              <Routes>
                <Route path="/" element={<Login />}  />
                <Route
                  path="/create-account"
                  element={
                    <CreateAccount  />
                  }
                />
                <Route
                  path="/forgot-password" 
                  element={
                    <ForgotPassword  />
                  }
                />
                {/* Authenticated Routes */}
                <Route 
                  path="/*"
                  element={
                    <AdminRoute>
                      <DashboardProvider>
                        <ProtectedRoutes />
                      </DashboardProvider>
                    </AdminRoute>
                  }
                />
              </Routes>

            </Router>
        </DashboardProvider>

      </Toast.Provider>
  )
}

export default App
