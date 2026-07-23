import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchAdminDashboard,
  fetchAdminCustomerHistory,
  fetchAdminImportBatchesOverview,
  fetchAdminTopCustomers,
  fetchAdminOrderHistory,
  fetchAdminOrder,
  fetchAllCustomersForOrder,
  fetchAllCustomers,
  fetchAllLeads,
  fetchAllOrders,
  fetchAdminTransactions,
  fetchAdminTransactionDetail,
  fetchCustomerTransactionHistory,
  fetchCustomerOrderHistory,
  fetchDashboard,
  fetchDeadline,
  fetchOrderDetails,
  recordCustomerOrderDownload,
  recordCustomerOrderOpen,
} from "./dashboardApi";

export const useDeadlineQuery = ({ token }) =>
  useQuery({
    queryKey: ["deadline"],
    queryFn: () => fetchDeadline(token),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

export const useClientDashboardQueries = ({
  token,
  page,
  searchTerm,
  orderId,
  orderHistoryId,
  dashboardRange,
  dashboardBreakdown,
  dashboardRecentLimit,
}) => {
  const dashboardQuery = useQuery({
    queryKey: [
      "dashboard",
      dashboardRange,
      dashboardBreakdown,
      dashboardRecentLimit,
    ],
    queryFn: () =>
      fetchDashboard(token, {
        range: dashboardRange,
        breakdown: dashboardBreakdown,
        recentLimit: dashboardRecentLimit,
      }),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const allOrdersQuery = useQuery({
    queryKey: ["allOrders", page, searchTerm],
    queryFn: () => fetchAllOrders(token, page, searchTerm),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const orderDetailsQuery = useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: () => fetchOrderDetails(token, orderId),
    enabled: !!orderId,
  });

  const transactionHistoryQuery = useQuery({
    queryKey: ["transactionHistory"],
    queryFn: () => fetchCustomerTransactionHistory(token),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const orderHistoryQuery = useQuery({
    queryKey: ["orderHistory", orderHistoryId],
    queryFn: () => fetchCustomerOrderHistory(token, orderHistoryId),
    enabled: !!token && !!orderHistoryId,
    refetchOnWindowFocus: false,
  });

  const recordOrderOpenMutation = useMutation({
    mutationFn: ({ orderId: targetOrderId, payload }) =>
      recordCustomerOrderOpen(token, targetOrderId, payload),
  });

  const recordOrderDownloadMutation = useMutation({
    mutationFn: ({ orderId: targetOrderId, payload }) =>
      recordCustomerOrderDownload(token, targetOrderId, payload),
  });

  return {
    dashboardQuery,
    allOrdersQuery,
    orderDetailsQuery,
    transactionHistoryQuery,
    orderHistoryQuery,
    recordOrderOpenMutation,
    recordOrderDownloadMutation,
  };
};

export const useAdminDashboardQueries = ({
  token,
  page,
  searchTerm,
  tranSearch,
  adminTransactionId,
  dayKey,
  customerHistoryId,
  adminOrderHistoryId,
  deadlineToken,
}) => {
  const adminDashboardQuery = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => fetchAdminDashboard(token),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const allLeadsQuery = useQuery({
    queryKey: ["allLeads", dayKey],
    queryFn: () => fetchAllLeads(token, dayKey),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const adminImportBatchesOverviewQuery = useQuery({
    queryKey: ["adminImportBatchesOverview"],
    queryFn: () => fetchAdminImportBatchesOverview(token),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const usersQuery = useQuery({
    queryKey: ["usersData"],
    queryFn: () => fetchAdminTopCustomers(token),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const allCustomersForOrderQuery = useQuery({
    queryKey: ["allCustomersForOrder"],
    queryFn: () => fetchAllCustomersForOrder(token),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const adminOrderQuery = useQuery({
    queryKey: ["adminOrder", page, searchTerm],
    queryFn: () => fetchAdminOrder(token, page, searchTerm),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const adminTransactionsQuery = useQuery({
    queryKey: ["adminTransactions", page, tranSearch],
    queryFn: () => fetchAdminTransactions(token, page, tranSearch),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const adminTransactionDetailQuery = useQuery({
    queryKey: ["adminTransactionDetail", adminTransactionId],
    queryFn: () => fetchAdminTransactionDetail(token, adminTransactionId),
    enabled: !!token && !!adminTransactionId,
    refetchOnWindowFocus: false,
  });

  const customersQuery = useQuery({
    queryKey: ["allCustomers", page, searchTerm],
    queryFn: () => fetchAllCustomers(token, page, searchTerm),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const customerHistoryQuery = useQuery({
    queryKey: ["adminCustomerHistory", customerHistoryId],
    queryFn: () => fetchAdminCustomerHistory(token, customerHistoryId),
    enabled: !!token && !!customerHistoryId,
    refetchOnWindowFocus: false,
  });

  const adminOrderHistoryQuery = useQuery({
    queryKey: ["adminOrderHistory", adminOrderHistoryId],
    queryFn: () => fetchAdminOrderHistory(token, adminOrderHistoryId),
    enabled: !!token && !!adminOrderHistoryId,
    refetchOnWindowFocus: false,
  });

  const deadlineQuery = useDeadlineQuery({ token: deadlineToken });

  return {
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
  };
};
