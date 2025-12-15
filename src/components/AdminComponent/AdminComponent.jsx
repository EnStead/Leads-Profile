import Login from './Login/Login'
import Home from './Home/Home'
import Layout from './Layout/Layout'
import { Route, Routes } from 'react-router'
import { useState } from 'react'
import Leads from './Leads/Leads'
import LeadsDetails from './Leads/LeadsDetails'
import Orders from './Orders/Orders'
import Customers from './Customers/Customers'
import CreateOrder from './Home/CreateOrder'

const AdminComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openAddModal = () => {
      setIsModalOpen(true);
    };

  return (
    <>
      
      <Routes>
          <Route index element={<Login />} />
          <Route
              path="/dashboard"
              element={
                  <Layout open={isModalOpen} onOpenChange={openAddModal} onOpen ={setIsModalOpen}>
                      <Home  open={isModalOpen} onOpenChange={setIsModalOpen} />
                  </Layout>
              }
          />
          <Route
              path="/leads"
              element={
                  <Layout open={isModalOpen} onOpenChange={openAddModal} onOpen ={setIsModalOpen}>
                      <Leads  open={isModalOpen} onOpenChange={setIsModalOpen} />
                  </Layout>
              }
          />

          <Route
            path="/leads/:id"
            element={
              <Layout open={isModalOpen} onOpenChange={openAddModal} onOpen ={setIsModalOpen} >
                <LeadsDetails />
              </Layout>
            }
          />
          <Route
            path="/orders"
            element={
              <Layout open={isModalOpen} onOpenChange={openAddModal} onOpen ={setIsModalOpen} >
                <Orders />
              </Layout>
            }
          />
          <Route
            path="/customers"
            element={
              <Layout open={isModalOpen} onOpenChange={openAddModal} onOpen ={setIsModalOpen} >
                <Customers />
              </Layout>
            }
          />
      </Routes>

      
    </>
  )
}

export default AdminComponent