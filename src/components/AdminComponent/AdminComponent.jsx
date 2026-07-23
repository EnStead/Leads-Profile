import Login from "./Login/Login";
import Home from "./Home/Home";
import Layout from "./Layout/Layout";
import { Route, Routes } from "react-router";
import { useState } from "react";
import Leads from "./Leads/Leads";
import LeadsDetails from "./Leads/LeadsDetails";
import Orders from "./Orders/Orders";
import Customers from "./Customers/Customers";
import Transactions from "./Transactions/Transactions";

const AdminComponent = ({ isScrolled }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openAddModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Routes>
        <Route index element={<Login />} />
        <Route
          path="/overview"
          element={
            <Layout
              isScrolled={isScrolled}
              open={isModalOpen}
              onOpenChange={openAddModal}
              onOpen={setIsModalOpen}
            >
              <Home open={isModalOpen} onOpenChange={setIsModalOpen} />
            </Layout>
          }
        />
        <Route
          path="/uploads"
          element={
            <Layout
              isScrolled={isScrolled}
              open={isModalOpen}
              onOpenChange={openAddModal}
              onOpen={setIsModalOpen}
            >
              <Leads open={isModalOpen} onOpenChange={setIsModalOpen} />
            </Layout>
          }
        />

        <Route
          path="/uploads/:id"
          element={
            <Layout
              isScrolled={isScrolled}
              open={isModalOpen}
              onOpenChange={openAddModal}
              onOpen={setIsModalOpen}
            >
              <LeadsDetails />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout
              isScrolled={isScrolled}
              open={isModalOpen}
              onOpenChange={openAddModal}
              onOpen={setIsModalOpen}
            >
              <Orders />
            </Layout>
          }
        />
        <Route
          path="/customers"
          element={
            <Layout
              isScrolled={isScrolled}
              open={isModalOpen}
              onOpenChange={openAddModal}
              onOpen={setIsModalOpen}
            >
              <Customers />
            </Layout>
          }
        />
        <Route
          path="/history"
          element={
            <Layout
              isScrolled={isScrolled}
              open={isModalOpen}
              onOpenChange={openAddModal}
              onOpen={setIsModalOpen}
            >
              <Transactions />
            </Layout>
          }
        />
      </Routes>
    </>
  );
};

export default AdminComponent;
