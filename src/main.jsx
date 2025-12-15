import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {AuthProvider} from './context/AuthContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminProvider } from './context/AdminContext.jsx'


const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <AuthProvider>
            <App />
        </AuthProvider>
      </AdminProvider>
    </QueryClientProvider>
  </StrictMode>,
)
