import { createContext, useContext, useState } from "react";
import api from "../utility/Axios";
import { useAuth } from "./AuthContext";
import { useQuery } from "@tanstack/react-query";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children,orderId }) => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  // --- DASHBOARD API CALL ---
  const fetchDashboard = async () => {
    const res = await api.get("/orders/dashboard", {
      headers: {
        Authorization: `Bearer ${user?.token}`, // ⬅ correct token
      },
    });
    return res.data.data;
  };

  // --- DASHBOARD REACT QUERY ---
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled: !!user?.token, // ⬅ prevents 401 errors
    refetchOnWindowFocus: false,
  });

  // --- OERDERS CLIENT API CALL ---
  const fetchAllOrders = async ({queryKey}) => {

    const [,page] = queryKey;

    const res = await api.get(`/orders?page=${page}&limit=10`, {
      headers: {
        Authorization: `Bearer ${user?.token}`, // ⬅ correct token
      },
    });
    // console.log(res.data.data)
    return res.data;
  };

  // --- OERDERS CLIENT  REACT QUERY ---
  const {
    data: allOrdersData,
    isLoading: allOrdersLoading,
    error: allOrdersError,
    refetch: refetchAllOrders,
  } = useQuery({
    queryKey: ["allOrders", page],
    queryFn: fetchAllOrders,
    enabled: !!user?.token, // ⬅ prevents 401 errors
    refetchOnWindowFocus: false,
  });

  // --- OERDERS DETAILS CLIENT API CALL ---
  const fetchOrderDetails = async () => {
    const res = await api.get(`/leads/order/${orderId}`);
    return res.data.data;
  };

  // --- OERDERS DETAILS CLIENT REACT QUERY ---
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

  return (
    <DashboardContext.Provider
      value={{
        // DASHBOARD
        dashboardData,
        dashboardLoading,
        dashboardError,
        refetchDashboard,
        // ALL ORDERS CLIENT SIDE
        allOrdersData,
        allOrdersLoading,
        allOrdersError,
        refetchAllOrders,
        // ALL ORDERS DETAILS CLIENT SIDE
        OrderDetailsData,
        OrderDetailsLoading,
        OrderDetailsError,
        refetchOrderDetails,
        setPage,
        page
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
