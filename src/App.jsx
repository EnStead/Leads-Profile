import { BrowserRouter as Router, Routes, Route } from "react-router";
import ScrollToTop from './utility/ScrollToTop'
import Login from './components/CustomerComponent/Login/Login';
import CreateAccount from './components/CustomerComponent/Login/CreateAccount';
import ForgotPassword from './components/CustomerComponent/Login/ForgotPassword';
import ProtectedRoutes from './container/ProtectedRoutes';
import ChangePassword from './components/CustomerComponent/Login/ChangePassword';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { AppToastProvider } from './utility/AppToastProvider.jsx';

function App() {


  return (
    <ThemeProvider>
      <Router>
        <AppToastProvider>

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
          <Route
            path="/change-password" 
            element={
              <ChangePassword  />
            }
          />
          {/* Authenticated Routes */}
          <Route 
            path="/*"
            element={
              <ProtectedRoutes />
            }
          />
        </Routes>

        </AppToastProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
