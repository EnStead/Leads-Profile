import { useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCw, Download } from "lucide-react";
import api from "../../utility/axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import Pagination from "../../utility/Pagination";
import { useQueryClient } from "@tanstack/react-query";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("p")) || 1;

  const [sort, setSort] = useState("newest"); // newest | oldest | az

  const handlePageChange = (newPage) => {
    setSearchParams({ p: newPage });
  };

  const queryClient = useQueryClient();

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
    enabled: !!orderId,
  });

  // --- Refresh button handler ---
  const refreshData = () => {
    queryClient.invalidateQueries({
      queryKey: ["orderDetails", orderId],
    });
    console.log("Fetching order details...");
  };

    const sortedLeads = () => {
  if (!OrderDetailsData?.data) return [];

  const data = [...OrderDetailsData.data];

  switch (sort) {
    case "oldest":
      return data.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

    case "az":
      return data.sort((a, b) =>
        (a.firstName || "").localeCompare(b.firstName || "")
      );

    case "newest":
    default:
      return data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  }
};

    const CSV_FIELDS = [
  { key: "dateTime", label: "Date & Time" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zipCode", label: "Zip" },
  { key: "bankName", label: "Bank" },
  { key: "incomeSource", label: "Source" },
  { key: "monthlyNetIncome", label: "Monthly Income" },
  { key: "subId", label: "SubId" },
  { key: "subId2", label: "SubId2" },
  { key: "birthday	", label: "Birthday	" },
  { key: "timeEmployed", label: "Time Employed" },
  { key: "rentOrOwn", label: "Rent Or Own" },
];

  // --- Last updated time ---
  const lastUpdated = OrderDetailsData?.[0]?.updatedAt
    ? new Date(OrderDetailsData[0].updatedAt).toLocaleString()
    : "N/A";

  const [downloadingDay, setDownloadingDay] = useState(null); // stores the dayKey being downloaded

  const downloadCSV = async (dayKey) => {
    try {
      setDownloadingDay(dayKey);

      // Determine total leads from pagination
      const totalLeads = OrderDetailsData?.pagination?.total || 1000; // fallback if unknown

      const res = await api.get(
        `/leads/order/${orderId}?page=1&limit=${totalLeads}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const leads = res.data.data;

      if (!leads.length) {
        alert("No leads available for this day");
        setDownloadingDay(null);
        return;
      }

const headers = CSV_FIELDS.map((f) => f.label);

const csvRows = [
  headers.join(","),
  ...leads.map((lead) =>
    CSV_FIELDS.map((f) => `"${lead[f.key] ?? ""}"`).join(",")
  ),
];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-${orderId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download failed", err);
      alert("Failed to download CSV. Make sure you are logged in.");
    } finally {
      setDownloadingDay(null);
    }
  };

  const getNextMonday = (fromDate = new Date()) => {
    const date = new Date(fromDate);
    const day = date.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat

    const daysUntilMonday = day === 1 ? 0 : (8 - day) % 7;
    date.setDate(date.getDate() + daysUntilMonday);

    return date;
  };

  const formatFullDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatSource = (value) => {
    if (!value) return "-";
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0"; // show zero if null
    return Number(value).toLocaleString();
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = (now - past) / 1000; // seconds

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);
    const weeks = Math.floor(diff / 604800);

    if (diff < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${weeks}w ago`;
  };

  // --- Progress bar calculation ---
  const totalLeads = OrderDetailsData?.quantity;
  const filledLeads = OrderDetailsData?.filled;
  const progressPercent = totalLeads
    ? Math.round((filledLeads / totalLeads) * 100)
    : 0;

  const noLeads =
    !OrderDetailsLoading &&
    (filledLeads === 0 || OrderDetailsData?.data?.length === 0);

  const nextMonday = getNextMonday();

  const disableDownload = downloadingDay === orderId || noLeads;

  if (OrderDetailsError) {
    return (
      <p className="text-brand-red">Failed to load leads for this order.</p>
    );
  }

  return (
    <section>
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-black mb-4 font-medium"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* HEADER */}
      <div className=" lg:flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold font-park text-brand-primary">
            Leads for Order: {OrderDetailsData?.customId}
          </h1>
          <p className="text-sm text-brand-subtext flex items-center gap-3 mt-1">
            Last Updated: {timeAgo(OrderDetailsData?.lastUpdated)}
            <button
              onClick={refreshData}
              className="flex items-center font-park font-semibold gap-1 text-brand-blue hover:underline"
            >
              <RotateCw size={14} /> Refresh Data
            </button>
          </p>
        </div>

        {/* PROGRESS BAR + DOWNLOAD CSV */}
        <div className="flex gap-4 items-center lg:mt-0 mt-4">
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

          <button
            onClick={() => downloadCSV(orderId)}
            disabled={disableDownload}
            className={`flex w-48 items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              ${
                disableDownload
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brand-black text-white"
              }
            `}
          >
            <Download size={16} />
            {downloadingDay === orderId ? "Downloading..." : "Download CSV"}
          </button>

                    <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-brand-stroke rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">New → Old</option>
              <option value="oldest">Old → New</option>
              <option value="az">A → Z</option>
            </select>
          </div>
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
                  className="p-3 font-medium text-sm text-brand-muted text-left"
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
            ) : noLeads ? (
              <tr>
                <td
                  colSpan={12}
                  className="text-center py-12 font-medium text-brand-subtext text-sm"
                >
                  Leads will start loading from{" "}
                  <span className="font-semibold text-brand-primary">
                    {formatFullDate(nextMonday)} at 09 AM EST.
                  </span>
                </td>
              </tr>
            ) : (
              sortedLeads().map((lead, i) => (
                <tr key={i} className="border-b border-brand-stroke ">
                  <td className="p-3 font-light text-brand-subtext capitalize text-sm">
                    {lead.firstName}
                  </td>
                  <td className="p-3 font-light text-brand-subtext capitalize text-sm">
                    {lead.lastName}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.email}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.phone}
                  </td>
                  <td className="p-3 font-light text-brand-subtext capitalize text-sm">
                    {lead.city}
                  </td>
                  <td className="p-3 font-light text-brand-subtext capitalize text-sm">
                    {lead.state}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {lead.zipCode}
                  </td>
                  <td className="p-3 font-light text-brand-subtext capitalize text-sm">
                    {lead.bankName}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {formatSource(lead.incomeSource)}
                  </td>
                  <td className="p-3 font-light text-brand-subtext text-sm">
                    {formatNumber(lead.monthlyNetIncome)}
                  </td>
                  <td className="p-3 font-light text-brand-subtext capitalize text-sm">
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
        onPageChange={handlePageChange}
      />
    </section>
  );
};

export default OrderDetails;
