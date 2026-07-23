import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useAdminAuth } from "./AdminContext";
import { useLocation, useSearchParams } from "react-router";
import {
  useAdminDashboardQueries,
  useClientDashboardQueries,
  useDeadlineQuery,
} from "./useDashboardQueries";

export const ClientDashboardContext = createContext();
export const AdminDashboardContext = createContext();

export const ClientDashboardProvider = ({ children, orderId }) => {
  const { user } = useAuth(); // Client user
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("p")) || 1;
  const [searchTerm, setSearchTerm] = useState("");
  const [dayKey, setDayKey] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [tranSearch, setTranSearch] = useState("");
  const [dashboardRange, setDashboardRange] = useState("this_month");
  const [dashboardBreakdown, setDashboardBreakdown] = useState("types");
  const [dashboardRecentLimit, setDashboardRecentLimit] = useState(6);
  const [selectedOrderHistoryId, setSelectedOrderHistoryId] = useState("");
  const recordedOrderOpenIdsRef = useRef(new Set());
  const didMountRef = useRef(false);

  const clientToken = user?.token;

  const {
    dashboardQuery,
    allOrdersQuery,
    orderDetailsQuery,
    transactionHistoryQuery,
    orderHistoryQuery,
    recordOrderOpenMutation,
    recordOrderDownloadMutation,
  } = useClientDashboardQueries({
    token: clientToken,
    page,
    searchTerm,
    orderId,
    orderHistoryId: selectedOrderHistoryId,
    dashboardRange,
    dashboardBreakdown,
    dashboardRecentLimit,
  });

  const deadlineQuery = useDeadlineQuery({ token: clientToken });

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = dashboardQuery;

  const {
    data: allOrdersData,
    isLoading: allOrdersLoading,
    error: allOrdersError,
    refetch: refetchAllOrders,
  } = allOrdersQuery;

  const {
    data: transactionHistoryData,
    isLoading: transactionHistoryLoading,
    error: transactionHistoryError,
    refetch: refetchTransactionHistory,
  } = transactionHistoryQuery;

  const {
    data: orderHistoryData,
    isLoading: orderHistoryLoading,
    error: orderHistoryError,
    refetch: refetchOrderHistory,
  } = orderHistoryQuery;

  const recordOrderOpen = async ({ orderId: targetOrderId, fileId, day }) => {
    const recordId = String(fileId || targetOrderId || "").trim();
    if (!recordId || !targetOrderId) return null;
    if (recordedOrderOpenIdsRef.current.has(recordId)) return null;

    recordedOrderOpenIdsRef.current.add(recordId);

    try {
      return await recordOrderOpenMutation.mutateAsync({
        orderId: targetOrderId,
        payload: {
          fileId: recordId,
          day: day || null,
        },
      });
    } catch {
      recordedOrderOpenIdsRef.current.delete(recordId);
      return null;
    }
  };

  const recordOrderDownload = async ({ orderId: targetOrderId, fileId, day }) => {
    if (!targetOrderId) return null;

    try {
      return await recordOrderDownloadMutation.mutateAsync({
        orderId: targetOrderId,
        payload: {
          ...(fileId ? { fileId: String(fileId).trim() } : {}),
          ...(day ? { day } : {}),
        },
      });
    } catch {
      return null;
    }
  };

  const {
    data: OrderDetailsData,
    isLoading: OrderDetailsLoading,
    error: OrderDetailsError,
    refetch: refetchOrderDetails,
  } = orderDetailsQuery;

  const {
    data: deadlineData,
    isLoading: deadlineLoading,
    error: deadlineError,
    refetch: refetchDeadline,
  } = deadlineQuery;

  useEffect(() => {
    if (!clientToken) return;
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    Promise.allSettled([
      refetchDashboard?.(),
      refetchAllOrders?.(),
      refetchTransactionHistory?.(),
      selectedOrderHistoryId ? refetchOrderHistory?.() : null,
      orderId ? refetchOrderDetails?.() : null,
      refetchDeadline?.(),
    ].filter(Boolean));
  }, [
    location.key,
    clientToken,
    orderId,
    selectedOrderHistoryId,
    refetchDashboard,
    refetchAllOrders,
    refetchTransactionHistory,
    refetchOrderHistory,
    refetchOrderDetails,
    refetchDeadline,
  ]);

  return (
    <ClientDashboardContext.Provider
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
        transactionHistoryData,
        transactionHistoryLoading,
        transactionHistoryError,
        refetchTransactionHistory,
        orderHistoryData,
        orderHistoryLoading,
        orderHistoryError,
        refetchOrderHistory,
        selectedOrderHistoryId,
        setSelectedOrderHistoryId,
        recordOrderOpen,
        recordOrderDownload,

        // Order Details
        OrderDetailsData,
        OrderDetailsLoading,
        OrderDetailsError,
        refetchOrderDetails,

        // Deadline
        deadlineData,
        deadlineLoading,
        deadlineError,
        refetchDeadline,

        searchParams,
        setSearchParams,
        page,
        searchTerm,
        setSearchTerm,
        dayKey,
        setDayKey,
        customerSearch,
        setCustomerSearch,
        orderSearch,
        setOrderSearch,
        tranSearch,
        setTranSearch,
        dashboardRange,
        setDashboardRange,
        dashboardBreakdown,
        setDashboardBreakdown,
        dashboardRecentLimit,
        setDashboardRecentLimit,
      }}
    >
      {children}
    </ClientDashboardContext.Provider>
  );
};

export const AdminDashboardProvider = ({ children }) => {
  const { user: adminUser } = useAdminAuth(); // Admin user
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("p")) || 1;
  const [searchTerm, setSearchTerm] = useState("");
  const [dayKey, setDayKey] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [tranSearch, setTranSearch] = useState("");
  const [selectedCustomerHistoryId, setSelectedCustomerHistoryId] = useState("");
  const [selectedAdminOrderHistoryId, setSelectedAdminOrderHistoryId] = useState("");
  const [selectedAdminTransactionId, setSelectedAdminTransactionId] = useState("");
  const didMountRef = useRef(false);

  const adminToken = adminUser?.token;

  const {
    adminDashboardQuery,
    allLeadsQuery,
    adminImportBatchesOverviewQuery,
    usersQuery,
    allCustomersForOrderQuery,
    adminOrderQuery,
    adminTransactionsQuery,
    adminTransactionDetailQuery,
    customersQuery,
    customerHistoryQuery,
    adminOrderHistoryQuery,
    deadlineQuery,
  } = useAdminDashboardQueries({
    token: adminToken,
    page,
    searchTerm,
    tranSearch,
    adminTransactionId: selectedAdminTransactionId,
    dayKey,
    customerHistoryId: selectedCustomerHistoryId,
    adminOrderHistoryId: selectedAdminOrderHistoryId,
    deadlineToken: adminToken,
  });

  const {
    data: adminDashboardData,
    isLoading: adminDashboardLoading,
    error: adminDashboardError,
    refetch: refetchAdminDashboard,
  } = adminDashboardQuery;

  const {
    data: allLeadsData,
    isLoading: allLeadsLoading,
    error: allLeadsError,
    refetch: refetchAllLeads,
  } = allLeadsQuery;

  const {
    data: adminImportBatchesOverviewData,
    isLoading: adminImportBatchesOverviewLoading,
    error: adminImportBatchesOverviewError,
    refetch: refetchAdminImportBatchesOverview,
  } = adminImportBatchesOverviewQuery;

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = usersQuery;

  const {
    data: allCustomersForOrderData,
    isLoading: allCustomersForOrderLoading,
    error: allCustomersForOrderError,
    refetch: refetchAllCustomersForOrder,
  } = allCustomersForOrderQuery;

  const {
    data: adminOrderData,
    isLoading: adminOrderLoading,
    error: adminOrderError,
    refetch: refetchadminOrder,
  } = adminOrderQuery;

  const {
    data: adminTransactionData,
    isLoading: adminTransactionLoading,
    error: adminTransactionError,
    refetch: refetchAdminTransactions,
  } = adminTransactionsQuery;

  const {
    data: adminTransactionDetailData,
    isLoading: adminTransactionDetailLoading,
    error: adminTransactionDetailError,
    refetch: refetchAdminTransactionDetail,
  } = adminTransactionDetailQuery;

  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
    refetch: refetchCustomers,
  } = customersQuery;

  const {
    data: customerHistoryData,
    isLoading: customerHistoryLoading,
    error: customerHistoryError,
    refetch: refetchCustomerHistory,
  } = customerHistoryQuery;

  const {
    data: adminOrderHistoryData,
    isLoading: adminOrderHistoryLoading,
    error: adminOrderHistoryError,
    refetch: refetchAdminOrderHistory,
  } = adminOrderHistoryQuery;

  const {
    data: deadlineData,
    isLoading: deadlineLoading,
    error: deadlineError,
    refetch: refetchDeadline,
  } = deadlineQuery;

  useEffect(() => {
    if (!adminToken) return;
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    Promise.allSettled([
      refetchAdminDashboard?.(),
      refetchAllLeads?.(),
      refetchAdminImportBatchesOverview?.(),
      refetchUsers?.(),
      refetchAllCustomersForOrder?.(),
      refetchadminOrder?.(),
      refetchAdminTransactions?.(),
      selectedAdminTransactionId ? refetchAdminTransactionDetail?.() : null,
      refetchCustomers?.(),
      selectedCustomerHistoryId ? refetchCustomerHistory?.() : null,
      selectedAdminOrderHistoryId ? refetchAdminOrderHistory?.() : null,
      refetchDeadline?.(),
    ].filter(Boolean));
  }, [
    location.key,
    adminToken,
    selectedAdminTransactionId,
    selectedCustomerHistoryId,
    selectedAdminOrderHistoryId,
    refetchAdminDashboard,
    refetchAllLeads,
    refetchAdminImportBatchesOverview,
    refetchUsers,
    refetchAllCustomersForOrder,
    refetchadminOrder,
    refetchAdminTransactions,
    refetchAdminTransactionDetail,
    refetchCustomers,
    refetchCustomerHistory,
    refetchAdminOrderHistory,
    refetchDeadline,
  ]);

  return (
    <AdminDashboardContext.Provider
      value={{
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
        allCustomersForOrderData,
        allCustomersForOrderLoading,
        allCustomersForOrderError,
        refetchAllCustomersForOrder,

        // All Leads
        allLeadsData,
        allLeadsLoading,
        allLeadsError,
        refetchAllLeads,
        adminImportBatchesOverviewData,
        adminImportBatchesOverviewLoading,
        adminImportBatchesOverviewError,
        refetchAdminImportBatchesOverview,

        // Admin Order
        adminOrderData,
        adminOrderLoading,
        adminOrderError,
        refetchadminOrder,

        // Admin Transactions
        adminTransactionData,
        adminTransactionLoading,
        adminTransactionError,
        refetchAdminTransactions,
        adminTransactionDetailData,
        adminTransactionDetailLoading,
        adminTransactionDetailError,
        refetchAdminTransactionDetail,
        selectedAdminTransactionId,
        setSelectedAdminTransactionId,

        // Admin Customers
        customersData,
        customersLoading,
        customersError,
        refetchCustomers,
        customerHistoryData,
        customerHistoryLoading,
        customerHistoryError,
        refetchCustomerHistory,
        selectedCustomerHistoryId,
        setSelectedCustomerHistoryId,
        adminOrderHistoryData,
        adminOrderHistoryLoading,
        adminOrderHistoryError,
        refetchAdminOrderHistory,
        selectedAdminOrderHistoryId,
        setSelectedAdminOrderHistoryId,
        searchParams,
        setSearchParams,
        page,

        // Deadline
        deadlineData,
        deadlineLoading,
        deadlineError,
        refetchDeadline,

        searchTerm,
        setSearchTerm,
        dayKey,
        setDayKey,
        customerSearch,
        setCustomerSearch,
        orderSearch,
        setOrderSearch,
        tranSearch,
        setTranSearch,
      }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
};

export const useClientDashboard = () => useContext(ClientDashboardContext);
export const useAdminDashboard = () => useContext(AdminDashboardContext);
