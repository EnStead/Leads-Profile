import { useNavigate, useParams, useSearchParams } from "react-router";
import { useState } from "react";
import { ArrowLeft, RotateCw, Download } from "lucide-react";
import { useAdminAuth } from "../../../context/AdminContext";
import { useQuery } from "@tanstack/react-query";
import Pagination from "../../../utility/Pagination";
import { fetchAdminImportBatchLeads } from "../../../context/dashboardApi";

const LeadsDetails = () => {
  const navigate = useNavigate();
  const { id: batchId } = useParams();
  const { user } = useAdminAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("p")) || 1;
  const usage = searchParams.get("usage") || "all";
  const search = searchParams.get("q") || "";

  const [sort, setSort] = useState("newest"); // newest | oldest | az

  const handlePageChange = (newPage) => {
    const nextParams = { p: String(newPage) };
    if (usage && usage !== "all") nextParams.usage = usage;
    if (search) nextParams.q = search;
    setSearchParams(nextParams);
  };

  const {
    data: leadsDetailsData,
    isLoading: leadsDetailsLoading,
    error: leadsDetailsError,
    refetch: refetchLeadsDetails,
  } = useQuery({
    queryKey: ["adminImportBatchLeads", batchId, page, usage, search],
    queryFn: () =>
      fetchAdminImportBatchLeads(user?.token, batchId, {
        page,
        limit: 20,
        usage,
        search,
      }),
    enabled: !!batchId && !!user?.token,
  });

  // --- Refresh button handler ---
  const refreshData = () => {
    refetchLeadsDetails();
  };

  const sortedLeads = () => {
    if (!leadsDetailsData?.leads) return [];

    const data = [...leadsDetailsData.leads];

    switch (sort) {
      case "oldest":
        return data.sort(
          (a, b) =>
            new Date(a.createdAt || a.updatedAt || 0) -
            new Date(b.createdAt || b.updatedAt || 0)
        );

      case "az":
        return data.sort((a, b) =>
          (a.firstName || "").localeCompare(b.firstName || "")
        );

      case "newest":
      default:
        return data.sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt || 0) -
            new Date(a.createdAt || a.updatedAt || 0)
        );
    }
  };

  // --- Last updated time ---
  const lastUpdatedAt = leadsDetailsData?.leads?.reduce((latest, lead) => {
    const current = lead?.updatedAt || lead?.createdAt;
    if (!current) return latest;
    if (!latest) return current;
    return new Date(current) > new Date(latest) ? current : latest;
  }, null);

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
    { key: "loanAmount", label: "Loan Amount" },
    { key: "birthday", label: "Birthday" },
    { key: "address", label: "Address" },
  ];

  const [downloadingDay, setDownloadingDay] = useState(null); // stores the dayKey being downloaded

  // --- FORMATTERS ---

  // 1. Date & Time formatter (for CSV)
  const formatDateTimeForCSV = (isoString) => {
    if (!isoString) return "";
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(isoString).toLocaleString("en-US", options);
  };

  // 2. Birthday formatter (date only)
  const formatBirthdayForCSV = (isoString) => {
    if (!isoString) return "";
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return new Date(isoString).toLocaleDateString("en-US", options);
  };

  const downloadCSV = async (dayKey) => {
    try {
      setDownloadingDay(dayKey);

      const totalLeads = leadsDetailsData?.pagination?.total || 1000;
      const res = await fetchAdminImportBatchLeads(user?.token, dayKey, {
        page: 1,
        limit: totalLeads,
        usage,
        search,
      });

      const leads = res?.leads || [];

      if (!leads.length) {
        alert("No leads available for this day");
        setDownloadingDay(null);
        return;
      }

      const headers = CSV_FIELDS.map((f) => f.label);

      const csvRows = [
        headers.join(","),
        ...leads.map((lead) =>
          CSV_FIELDS.map((f) => {
            // Apply formatting
            if (f.key === "dateTime")
              return `"${formatDateTimeForCSV(lead[f.key])}"`;
            if (f.key === "birthday")
              return `"${formatBirthdayForCSV(lead[f.key])}"`;
            return `"${lead[f.key] ?? ""}"`;
          }).join(",")
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

  const timeAgo = (dateString) => {
    if (!dateString) return "N/A";
    const now = new Date();
    const past = new Date(dateString);
    if (Number.isNaN(past.getTime())) return "N/A";
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
      <style>{`
        @keyframes rowFadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .row-animate {
          animation: rowFadeInUp 300ms ease-out both;
        }
      `}</style>
      {/* ---- BACK BUTTON ---- */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-blackish mb-4 font-medium"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* ---- HEADER ---- */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-bold font-park text-brand-blackish">
            Leads: {leadsDetailsData?.batch?.title || "Import Batch"} 
          </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-brand-body ">
            Last Updated: {timeAgo(lastUpdatedAt)}
          </p>
          <div className="w-fit bg-brand-white border border-brand-stroke px-3 py-2 rounded-xl">
            <p className=" font-medium text-sm text-brand-body">
              Total Leads Generated:{" "}
              <span className="font-park text-brand-blackish font-semibold text-base ">
                {leadsDetailsData?.batch?.fulfillment?.total ??
                  0}
              </span>
            </p>
          </div>
        </div>
        </div>

        {/* ---- DOWNLOAD CSV WITH PROGRESS ---- */}
        <div className=" flex gap-4">


          <button
            onClick={() => downloadCSV(batchId)}
            disabled={downloadingDay === batchId}
            className={`flex w-48 items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
              downloadingDay === batchId
                ? "bg-brand-body text-brand-white cursor-not-allowed"
                : "bg-brand-blackish text-brand-white hover:bg-gray-800"
            }`}
          >
            {downloadingDay === batchId ? "Downloading..." : "Download CSV"}
          </button>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border bg-brand-white text-brand-blackish border-brand-stroke rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-blue"
            >
              <option value="newest" className="bg-brand-white text-brand-blackish">New → Old</option>
              <option value="oldest" className="bg-brand-white text-brand-blackish">Old → New</option>
              <option value="az" className="bg-brand-white text-brand-blackish">A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---- TABLE ---- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead >
            <tr>
              {[
                "First Name",
                "Last Name",
                "Email",
                "Phone",
                "City",
                "State",
                "Address",
                "Zip",
                "Bank",
                "Loan Amount",
                "Birthday",
              ].map((header) => (
                <th
                  key={header}
                  className="p-3 font-medium text-sm text-brand-body text-left rounded-l-lg"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {leadsDetailsLoading ? (
              <tr>
                <td
                  colSpan={12}
                  className="text-center py-10 font-medium text-brand-body text-sm"
                >
                  Loading leads…
                </td>
              </tr>
            ) : (leadsDetailsData?.leads?.length || 0) === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="text-center py-10  font-medium text-brand-body text-sm"
                >
                  No leads found.
                </td>
              </tr>
            ) : (
              sortedLeads().map((lead, i) => (
                <tr
                  key={i}
                  className="group border-b border-brand-stroke row-animate hover:bg-brand-white focus-within:bg-brand-offwhite/50 transition-colors duration-200"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="p-3 font-light text-brand-body capitalize text-sm group-hover:text-brand-primary transition-colors duration-200">
                    {lead.firstName}
                  </td>
                  <td className="p-3 font-light text-brand-body capitalize text-sm">
                    {lead.lastName}
                  </td>
                  <td className="p-3 font-light text-brand-body text-sm">
                    <a
                      href={`mailto:${lead.email}`}
                      title={lead.email}
                      className="inline-block truncate max-w-[150px] rounded-sm transition-colors duration-150 hover:text-brand-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-white"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="p-3 font-light text-brand-body text-sm">
                    <a
                      href={`tel:${lead.phone}`}
                      title={lead.phone}
                      className="inline-block truncate max-w-[120px] rounded-sm transition-colors duration-150 hover:text-brand-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-white"
                    >
                      {lead.phone}
                    </a>
                  </td>
                  <td className="p-3 font-light text-brand-body capitalize text-sm">
                    {lead.city}
                  </td>
                  <td className="p-3 font-light text-brand-body capitalize text-sm">
                    {lead.state}
                  </td>
                  <td className="p-3 font-light text-brand-body capitalize text-sm">
                    <span className="inline-block truncate max-w-[150px]" title={lead.address}>
                      {lead.address}
                    </span>
                  </td>
                  <td className="p-3 font-light text-brand-body text-sm">
                    {lead.zipCode}
                  </td>
                  <td className="p-3 font-light text-brand-body capitalize text-sm">
                    <span className="inline-block truncate max-w-[120px]" title={lead.bankName}>
                      {lead.bankName}
                    </span>
                  </td>
                  <td className="p-3 font-light text-brand-body text-sm">
                    {formatNumber(lead.loanAmount)}
                  </td>
                  <td className="p-3 font-light text-brand-body text-sm">
                    {formatDate(lead.birthday)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={leadsDetailsData?.pagination?.pages}
        onPageChange={handlePageChange}
        loading={leadsDetailsLoading}
      />
    </section>
  );
};

export default LeadsDetails;
