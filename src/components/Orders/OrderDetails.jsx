import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCw, Download } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import api from "../../utility/Axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import Pagination from "../../utility/Pagination";

const OrderDetails = () => {
  const navigate = useNavigate();
 const { id: orderId } = useParams();
 const { user } = useAuth();
 const [page, setPage] = useState(1);


  const fetchOrderDetails = async ({ queryKey }) => {
    const [, orderId, page] = queryKey;

    const res = await api.get(`/leads/order/${orderId}?page=${page}&limit=10`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    // console.log(res.data) 
    return res.data;
  };


  const {
    data: OrderDetailsData,
    isLoading: OrderDetailsLoading,
    error: OrderDetailsError,
    refetch: refetchOrderDetails,
  } = useQuery({
    queryKey: ["orderDetails", orderId, page],
    queryFn: fetchOrderDetails,
    enabled: !!orderId
  });

  // Automatically refetch when orderId changes
  useEffect(() => {
    if (orderId) refetchOrderDetails();
  }, [orderId]);

  // --- Refresh button handler ---
  const refreshData = () => {
    refetchOrderDetails();
  };

  // --- Last updated time ---
  const lastUpdated = OrderDetailsData?.[0]?.updatedAt
    ? new Date(OrderDetailsData[0].updatedAt).toLocaleString()
    : "N/A";

  // --- Progress bar calculation ---
  const totalLeads = OrderDetailsData?.quantity;
  const filledLeads = OrderDetailsData?.filled;
  const progressPercent = totalLeads ? Math.round((filledLeads / totalLeads) * 100) : 0;

  if (OrderDetailsError) {
    return (
      <p className="text-brand-red">Failed to load leads for this order.</p>
    );
  }

  return (
    <section className="p-10">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-black mb-4 font-medium"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold font-park text-brand-primary">
            Leads for Order: {orderId}
          </h1>
          <p className="text-sm text-brand-subtext flex items-center gap-3 mt-1">
            Last Updated: {lastUpdated}
            <button
              onClick={refreshData}
              className="flex items-center font-park font-semibold gap-1 text-brand-blue hover:underline"
            >
              <RotateCw size={14} /> Refresh Data
            </button>
          </p>
        </div>

        {/* PROGRESS BAR + DOWNLOAD CSV */}
        <div className="flex gap-4 items-center">
          <div className="mt-2 w-40">
            <p className="font-medium text-brand-subtext">
              {filledLeads} / {totalLeads}
            </p>
            <div className="w-full bg-brand-lightblue h-2 rounded-full mt-1">
              <div
                className="bg-brand-royalblue h-2 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button className="flex w-48 items-center justify-center gap-2 bg-brand-black text-brand-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Download size={16} /> Download CSV
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-offwhite rounded-2xl">
            <tr>
              {[
                "First Name",
                "Last Name",
                "Email",
                "Phone",
                "City",
                "State",
                "Zip",
                "Bank",
                "Source",
                "Monthly Income",
                "Rent/Own",
                "Birthday",
              ].map((header) => (
                <th
                  key={header}
                  className="p-3 font-medium text-sm text-brand-muted"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {OrderDetailsLoading ? (
              <tr>
                <td
                  colSpan={12}
                  className="text-center py-10 font-medium text-brand-subtext text-sm"
                >
                  Loading leads…
                </td>
              </tr>
            ) : totalLeads === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="text-center py-10 font-medium text-brand-subtext text-sm"
                >
                  No leads found.
                </td>
              </tr>
            ) : (
              OrderDetailsData.data.map((lead, i) => (
                <tr key={i} className="border-b border-brand-stroke">
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.firstName}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.lastName}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.email}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.phone}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.city}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.state}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.zipCode}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.bankName}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.incomeSource}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.monthlyNetIncome.toLocaleString()}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.rentOrOwn}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {new Date(lead.birthday).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={OrderDetailsData?.pagination?.pages}
        onPageChange={setPage}
      />


    </section>
  );
};

export default OrderDetails;
