import { createContext, useContext, useEffect, useState } from "react";
import api from "../utility/axios";
import { useAuth } from "./AuthContext";
import { useAdminAuth } from "./AdminContext";
import { useQuery } from "@tanstack/react-query";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children, orderId }) => {
  const { user } = useAuth(); // Client user
  const { user: adminUser } = useAdminAuth(); // Admin user
  const [page, setPage] = useState(1);



    // Check if user is logged in when component mounts

  // -------------------------
  // CLIENT DASHBOARD API CALLS
  // -------------------------

  const fetchDashboard = async () => {
    const res = await api.get("/orders/dashboard", {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    return res.data.data;
  };

  const fetchAllOrders = async ({ queryKey }) => {
    const [, page] = queryKey;
    const res = await api.get(`/orders?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    return res.data;
  };

  const fetchOrderDetails = async () => {
    const res = await api.get(`/leads/order/${orderId}`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    return res.data.data;
  };

  // -------------------------
  // CLIENT DASHBOARD REACT QUERY
  // -------------------------

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled: !!user?.token,
    refetchOnWindowFocus: false,
  });

  const {
    data: allOrdersData,
    isLoading: allOrdersLoading,
    error: allOrdersError,
    refetch: refetchAllOrders,
  } = useQuery({
    queryKey: ["allOrders", page],
    queryFn: fetchAllOrders,
    enabled: !!user?.token,
    refetchOnWindowFocus: false,
  });

  const {
    data: OrderDetailsData,
    isLoading: OrderDetailsLoading,
    error: OrderDetailsError,
    refetch: refetchOrderDetails,
  } = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: fetchOrderDetails,
    enabled: !!orderId,
  });

  // -------------------------
  // ADMIN DASHBOARD API CALL
  // -------------------------

  const fetchAdminDashboard = async () => {
    try {
      const res = await api.get("/orders/admin/dashboard", {
        headers: { Authorization: `Bearer ${adminUser?.token}` },
      });
      // console.log("SUCCESS:", res);
      return res.data.data;
    } catch (err) {
      // console.log("ERROR RESPONSE:", err.response);
      // console.log("TOKEN SENDING:", adminUser?.token);
      throw err; // important for React Query error handling
    }
  };

  // --- ALL ORDER API CALL ---
  const fetchAllLeads = async ({queryKey}) => {
    const [, page] = queryKey;
    const res = await api.get(`/leads/daily?page=${page}&limit=10`, {
      headers: {
        Authorization: `Bearer ${adminUser?.token}`, // use client token if needed
      },
    });
    return res.data; // array of users
  };

  const fetchAdminOrder = async ({ queryKey }) => {
    const [, page] = queryKey;
    const res = await api.get(`/orders/admin/all?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${adminUser?.token}` },
    });
    return res.data;
  };

  // --- USERS API CALL FORM ---
  const fetchUsers = async () => {
    const res = await api.get("/user", {
      headers: {
        Authorization: `Bearer ${adminUser?.token}`, // use client token if needed
      },
    });
    return res.data.data; // array of users
  };

    // --- ALL ORDER API CALL ---
  const fetchAllCustomers = async ({queryKey}) => {
    const [, page] = queryKey;
    const res = await api.get(`/user/admin/customers?page=${page}&limit=10`, {
      headers: {
        Authorization: `Bearer ${adminUser?.token}`, // use client token if needed
      },
    });
    return res.data; // array of users
  };

  // -------------------------
  // ADMIN DASHBOARD REACT QUERY
  // -------------------------

  const {
    data: adminDashboardData,
    isLoading: adminDashboardLoading,
    error: adminDashboardError,
    refetch: refetchAdminDashboard,
  } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: fetchAdminDashboard,
    enabled: !!adminUser?.token,
    refetchOnWindowFocus: false,
  });

  const {
    data: allLeadsData,
    isLoading: allLeadsLoading,
    error: allLeadsError,
    refetch: refetchAllLeads,
  } = useQuery({
    queryKey: ["allLeads", page],
    queryFn: fetchAllLeads,
    enabled: !!adminUser?.token,
    refetchOnWindowFocus: false,
  });


  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["usersData"],
    queryFn: fetchUsers,
    enabled: !!adminUser?.token,
    refetchOnWindowFocus: false,
  });

  const {
    data: adminOrderData,
    isLoading: adminOrderLoading,
    error: adminOrderError,
    refetch: refetchadminOrder,
  } = useQuery({
    queryKey: ["adminOrder", page],
    queryFn: fetchAdminOrder,
    enabled:!!adminUser?.token,
    refetchOnWindowFocus: false,
  });

  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ["allCustomers", page],
    queryFn: fetchAllCustomers,
    enabled:  !!adminUser?.token,
    refetchOnWindowFocus: false,
  });

  // -------------------------
  // PROVIDER
  // -------------------------

  return (
    <DashboardContext.Provider
      value={{
        // Client Dashboard
        dashboardData,
        dashboardLoading,
        dashboardError,
        refetchDashboard,

        // Client Orders
        allOrdersData,
        allOrdersLoading,
        allOrdersError,
        refetchAllOrders,

        // Order Details
        OrderDetailsData,
        OrderDetailsLoading,
        OrderDetailsError,
        refetchOrderDetails,
        page,
        setPage,

        // Admin Dashboard
        adminDashboardData,
        adminDashboardLoading,
        adminDashboardError,
        refetchAdminDashboard,

        // Create Order
        usersData,
        usersLoading,
        usersError,
        refetchUsers,

        // All Leads
        allLeadsData,
        allLeadsLoading,
        allLeadsError,
        refetchAllLeads,

        // Admin Order
        adminOrderData,
        adminOrderLoading,
        adminOrderError,
        refetchadminOrder,

        // Admin Order
        customersData,
        customersLoading,
        customersError,
        refetchCustomers
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
