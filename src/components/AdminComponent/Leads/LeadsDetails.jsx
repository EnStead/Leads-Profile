import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCw , Download } from "lucide-react";
import { useAdminAuth } from "../../../context/AdminContext";
import { useQuery } from "@tanstack/react-query";
import api from "../../../utility/axios";
import Pagination from "../../../utility/Pagination";

const LeadsDetails = () => {

  const navigate = useNavigate();
 const { id: orderId } = useParams();
 const { user } = useAdminAuth();
 const [page, setPage] = useState(1);


  const fetchLeadsDetails = async ({ queryKey }) => {
    const [, orderId, page] = queryKey;

    const res = await api.get(`/leads/daily/${orderId}?page=${page}&limit=20`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    // console.log(res.data) 
    return res.data;
  };


  const {
    data: leadsDetailsData,
    isLoading: leadsDetailsLoading,
    error: leadsDetailsError,
    refetch: refetchLeadsDetails,
  } = useQuery({
    queryKey: ["leadsDetails", orderId, page],
    queryFn: fetchLeadsDetails,
    enabled: !!orderId,
  });

  // --- Refresh button handler ---
  const refreshData = () => {
    refetchLeadsDetails();
  };

  // --- Last updated time ---
  const lastUpdated = leadsDetailsData?.[0]?.updatedAt
    ? new Date(leadsDetailsData[0].updatedAt).toLocaleString()
  : "N/A";

    const [downloadingDay, setDownloadingDay] = useState(null); // stores the dayKey being downloaded    
    
  const downloadCSV = async (dayKey) => {
    try {
      setDownloadingDay(dayKey);

      // Determine total leads from pagination
      const totalLeads = leadsDetailsData?.pagination?.total || 1000; // fallback if unknown

      const res = await api.get(
        `/leads/daily/${dayKey}?page=1&limit=${totalLeads}`,
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

      const headers = Object.keys(leads[0]);
      const csvRows = [
        headers.join(","),
        ...leads.map((lead) =>
          headers.map((field) => `"${lead[field] ?? ""}"`).join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-${dayKey}.csv`;
      link.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("CSV download failed", err);
      alert("Failed to download CSV. Make sure you are logged in.");
    } finally {
      setDownloadingDay(null);
    }
  };

  // ---- FORMATTERS ----

// 1. Number with commas (e.g. 1400000 → 1,400,000)
const formatNumber = (value) => {
  if (value === null || value === undefined) return "0"; // show zero if null
  return Number(value).toLocaleString();
};

// 2. Date formatter (1962-01-16T23:00:00.000Z → Jan 16, 1962)
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

// 3. Source formatter (job_income → Job Income)
const formatSource = (value) => {
  if (!value) return "-";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
  



  if (leadsDetailsError) {
    return (
      <p className="text-brand-red">Failed to load leads for this order.</p>
    );
  }


  return (
    <section>
        {/* ---- BACK BUTTON ---- */}
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-brand-black mb-4 font-medium"
        >
            <ArrowLeft size={18} />
            Back
        </button>
                
        {/* ---- HEADER ---- */}
        <div className="flex justify-between items-end mb-4">
            <div>
            <h1 className="text-2xl font-bold font-park text-brand-primary">
                Leads: PNC Bank – {leadsDetailsData?.customId}
            </h1>

            <p className="text-sm text-brand-subtext flex items-center gap-3 mt-1">
                Last Updated: {timeAgo(leadsDetailsData?.lastUpdated)}

                <button
                onClick={refreshData}
                className="flex items-center font-park font-semibold gap-1 text-brand-blue hover:underline"
                >
                    <RotateCw  size={14} className="font-bold" /> Refresh Data
                </button>
            </p>
            </div>

            {/* ---- DOWNLOAD CSV WITH PROGRESS ---- */}
            <div className=" flex gap-4">
                <div className="mt-2 w-fit bg-brand-white border border-brand-stroke p-3 rounded-xl">
                    <p className=" font-medium text-sm text-brand-muted">
                       Total Leads Generated: <span className="font-park text-brand-primary font-semibold text-base " >{leadsDetailsData?.pagination.total}</span> 
                    </p>
                </div>

                <button
                  onClick={() => downloadCSV(orderId)}
                  disabled={downloadingDay === orderId}
                  className={`flex w-48 items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                    downloadingDay === orderId ? "bg-gray-400 cursor-not-allowed" : "bg-brand-black text-white"
                  }`}
                >
                  {downloadingDay === orderId ? "Downloading..." : "Download CSV"}
                </button>



            </div>
        </div>

        {/* ---- TABLE ---- */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-brand-white rounded-2xl">
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
                        <th key={header} className="p-3 font-medium text-sm text-brand-muted text-left rounded-l-lg">
                        {header}
                        </th>
                    ))}
                    </tr>
                </thead>

                <tbody>
                    {leadsDetailsLoading ? (
                    <tr>
                        <td colSpan={12} className="text-center py-10 font-medium text-brand-subtext text-sm">
                            Loading leads…
                        </td>
                    </tr>
                    ) : leadsDetailsData.data.length === 0 ? (
                    <tr>
                        <td colSpan={12} className="text-center py-10  font-medium text-brand-subtext text-sm">
                            No leads found.
                        </td>
                    </tr>
                    ) : (
                    leadsDetailsData.data.map((lead, i) => (
                        <tr key={i} className="border-b border-brand-stroke">
                            <td className="p-3 font-light text-brand-subtext capitalize text-sm">{lead.firstName}</td>
                            <td className="p-3 font-light text-brand-subtext capitalize text-sm">{lead.lastName}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.email}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.phone}</td>
                            <td className="p-3 font-light text-brand-subtext capitalize text-sm">{lead.city}</td>
                            <td className="p-3 font-light text-brand-subtext capitalize text-sm">{lead.state}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.zipCode}</td>
                            <td className="p-3 font-light text-brand-subtext capitalize text-sm">{lead.bankName}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{formatSource(lead.incomeSource)}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{formatNumber(lead.monthlyNetIncome)}</td>
                            <td className="p-3 font-light text-brand-subtext capitalize text-sm">{lead.rentOrOwn}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{formatDate(lead.birthday)}</td>
                        </tr>
                    ))
                    )}
                </tbody>
            </table>
        </div>

      <Pagination
        page={page}
        totalPages={leadsDetailsData?.pagination?.pages}
        onPageChange={setPage}
      />

    </section>
  )
}

export default LeadsDetails

