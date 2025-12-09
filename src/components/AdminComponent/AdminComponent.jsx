import Login from './Login/Login'
import Home from './Home/Home'
import Layout from './Layout/Layout'
import { Route, Routes } from 'react-router'
import { useState } from 'react'
import Leads from './Leads/Leads'
import LeadsDetails from './Leads/LeadsDetails'
import Orders from './Orders/Orders'
import Customers from './Customers/Customers'

const AdminComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openAddModal = () => {
        setIsModalOpen(true);
    };
  return (
    <>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route
                path="/dashboard"
                element={
                    <Layout open={isModalOpen} onOpenChange={openAddModal}>
                        <Home  open={isModalOpen} onOpenChange={setIsModalOpen} />
                    </Layout>
                }
            />
            <Route
                path="/leads"
                element={
                    <Layout open={isModalOpen} onOpenChange={openAddModal}>
                        <Leads  open={isModalOpen} onOpenChange={setIsModalOpen} />
                    </Layout>
                }
            />

            <Route
              path="/leads/:id"
              element={
                <Layout open={isModalOpen} onOpenChange={openAddModal} >
                  <LeadsDetails />
                </Layout>
              }
            />
            <Route
              path="/orders"
              element={
                <Layout open={isModalOpen} onOpenChange={openAddModal} >
                  <Orders />
                </Layout>
              }
            />
            <Route
              path="/customers"
              element={
                <Layout open={isModalOpen} onOpenChange={openAddModal} >
                  <Customers />
                </Layout>
              }
            />
        </Routes>
    </>
  )
}

export default AdminComponent