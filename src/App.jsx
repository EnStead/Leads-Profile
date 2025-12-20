import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router";
import ScrollToTop from './utility/ScrollToTop'
import Login from './components/Login/Login';
import {DashboardProvider} from './context/DashboardContext'
import CreateAccount from './components/Login/CreateAccount';
import ForgotPassword from './components/Login/ForgotPassword';
import { Toast } from 'radix-ui';
import ProtectedRoutes from './container/ProtectedRoutes';

function App() {

  
  const [isScrolled, setIsScrolled] = useState(false);




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
                  <DashboardProvider>
                    <ProtectedRoutes />
                  </DashboardProvider>
                }
              />
            </Routes>

          </Router>
      </DashboardProvider>

    </Toast.Provider>
  )
}

export default App
