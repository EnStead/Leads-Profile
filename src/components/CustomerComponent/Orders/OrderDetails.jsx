import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Dot, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import Pagination from "../../../utility/Pagination";
import { useClientDashboard } from "../../../context/DashboardContext";
import {
  buildOrderDayFiles,
  getOrderFileByDay,
  getOrderFileRows,
  normalizeWeekday,
} from "./orderSchedule";
import {
  fetchCustomerOrderLeadsByDay,
  fetchOrderDetails,
} from "../../../context/dashboardApi";

const WEEKDAY_MAP = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const CSV_FIELDS = [
  { key: "dateTime", label: "Date & Time" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "state", label: "State" },
  { key: "zipCode", label: "Zip" },
  { key: "bankName", label: "Bank" },
  { key: "loanAmount", label: "Loan Amount" },
  { key: "birthday", label: "Birthday" },
];

const formatTime = (hour, minute) => {
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${String(minute).padStart(2, "0")} ${period}`;
};

const timeAgo = (dateString) => {
  if (!dateString) return "N/A";

  const now = new Date();
  const past = new Date(dateString);
  if (Number.isNaN(past.getTime())) return "N/A";

  const diff = (now - past) / 1000;
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

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString();
};

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("newest");
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const page = Number(searchParams.get("p")) || 1;
  const selectedDay = normalizeWeekday(searchParams.get("day"));
  const selectedDayId = searchParams.get("dayId") || null;

  const {
    deadlineData,
    deadlineLoading,
    deadlineError,
    recordOrderOpen,
    recordOrderDownload,
  } = useClientDashboard();
  const cutoff = deadlineData?.data ?? deadlineData;
  const cutoffText = (() => {
    if (deadlineLoading) return "Loading cut-off...";
    if (deadlineError || !cutoff) return "Not set";

    return `Every ${WEEKDAY_MAP[cutoff.weekday]}, ${formatTime(
      cutoff.hour,
      cutoff.minute,
    )}`;
  })();

  const {
    data: orderSummaryData,
    isLoading: orderSummaryLoading,
    error: orderSummaryError,
  } = useQuery({
    queryKey: ["orderDetails", orderId, user?.token],
    queryFn: () => fetchOrderDetails(user?.token, orderId),
    enabled: !!orderId && !!user?.token,
  });

  const {
    data: dayLeadsData,
    isLoading: dayLeadsLoading,
    error: dayLeadsError,
  } = useQuery({
    queryKey: ["orderLeadsByDay", orderId, selectedDayId, page],
    queryFn: () =>
      fetchCustomerOrderLeadsByDay(user?.token, orderId, selectedDayId, page, 10),
    enabled: !!orderId && !!selectedDayId && !!user?.token,
  });

  const order = orderSummaryData || null;

  const orderFiles = useMemo(
    () => (order ? buildOrderDayFiles(order) : []),
    [order],
  );

  const selectedFile = useMemo(() => {
    if (!order) return null;

    if (selectedDayId) {
      const byId =
        orderFiles.find(
          (file) =>
            String(file?.id ?? file?.publicId ?? "").trim() ===
            String(selectedDayId).trim(),
        ) || null;
      if (byId) return byId;
    }

    const preferredDay = selectedDay || orderFiles[0]?.day || null;
    if (!preferredDay) return null;

    return (
      getOrderFileByDay(order, preferredDay) ||
      orderFiles.find((file) => file.day === preferredDay) ||
      null
    );
  }, [order, orderFiles, selectedDay, selectedDayId]);

  useEffect(() => {
    if (!orderId || !selectedFile?.id) return;

    void recordOrderOpen?.({
      orderId,
      fileId: selectedFile.id,
      day: selectedFile.day || selectedDay || null,
    });
  }, [orderId, recordOrderOpen, selectedDay, selectedFile?.day, selectedFile?.id]);

  const fileRows = useMemo(() => {
    if (Array.isArray(dayLeadsData?.data) && dayLeadsData.data.length) {
      return dayLeadsData.data.filter((row) => row && typeof row === "object");
    }

    const dayForRows = selectedFile?.day || selectedDay;
    const rows = getOrderFileRows(order, dayForRows);
    if (rows.length) return rows;

    return [];
  }, [dayLeadsData?.data, order, selectedDay, selectedFile]);

  const leadsForTable = useMemo(() => {
    const data = [...fileRows];

    switch (sort) {
      case "oldest":
        return data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      case "az":
        return data.sort((a, b) =>
          (a.firstName || "").localeCompare(b.firstName || ""),
        );
      case "newest":
      default:
        return data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    }
  }, [fileRows, sort]);

  const totalLeads = Number(
    selectedFile?.target ?? order?.quantity ?? leadsForTable.length ?? 0,
  );
  const filledLeads = Number(
    selectedFile?.filled ?? order?.filled ?? leadsForTable.length ?? 0,
  );
  const noLeads = !dayLeadsLoading && leadsForTable.length === 0;
  const disableDownload = downloadingCsv || noLeads;
  const totalPages = dayLeadsData?.pagination?.pages || 1;
  const visibleLeads = leadsForTable;

  const handlePageChange = (newPage) => {
    const nextParams = {};
    if (selectedDay) nextParams.day = selectedDay;
    if (selectedDayId) nextParams.dayId = selectedDayId;
    nextParams.p = newPage;
    setSearchParams(nextParams);
  };

  const downloadCSV = async () => {
    try {
      setDownloadingCsv(true);
      if (!leadsForTable.length) {
        alert(
          selectedDay
            ? `No leads available for ${selectedDay}.`
            : "No leads available for this order.",
        );
        return;
      }

      const headers = CSV_FIELDS.map((field) => field.label);
      const csvRows = [
        headers.join(","),
        ...leadsForTable.map((lead) =>
          CSV_FIELDS.map((field) => `"${lead[field.key] ?? ""}"`).join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedDay
        ? `orders-${orderId}-${selectedDay.toLowerCase()}.csv`
        : `orders-${orderId}.csv`;
      link.click();
      await recordOrderDownload?.({
        orderId,
        fileId: selectedFile?.id || null,
        day: selectedFile?.day || selectedDay || null,
      });
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV download failed", error);
      alert("Failed to download CSV. Make sure you are logged in.");
    } finally {
      setDownloadingCsv(false);
    }
  };

  if (orderSummaryError || dayLeadsError) {
    return <p className="text-brand-red">Failed to load leads for this order.</p>;
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

      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex font-sans items-center gap-2 font-medium text-brand-blackish"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-6 justify-between lg:flex lg:items-center">
        <div>
          <h1 className="text-2xl font-bold font-park text-brand-blackish">
            Leads for Order: {order?.customId || order?.publicId || orderId}
          </h1>

          <div className="mt-1 flex items-center gap-2 text-sm text-brand-body">
            <div className="bg-brand-white px-2 py-1 flex items-center gap-1 border border-brand-stroke rounded-lg text-brand-label text-xs">
              Leads:             
              <p className="font-medium text-sm text-brand-blackish">
                {filledLeads.toLocaleString()} / {totalLeads.toLocaleString()}
              </p>
            </div>
            <Dot className="text-brand-body" />
            <p>
              Last Updated:{" "}
              {timeAgo(
                order?.lastUpdated || order?.updatedAt || order?.createdAt,
              )}
            </p>
          </div>

        </div>

        <div className="mt-4 flex items-center gap-4 lg:mt-0">


          <button
            onClick={downloadCSV}
            disabled={disableDownload}
            className={`flex w-52 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
              disableDownload
                ? "cursor-not-allowed bg-brand-placeholder"
                : "bg-brand-blackish text-brand-white"
            }`}
          >
            <Download size={16} />
            {downloadingCsv ? "Downloading..." : "Download CSV"}
          </button>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-lg text-brand-blackish bg-brand-white border border-brand-label px-3 py-2 text-sm"
            >
              <option value="newest">New - Old</option>
              <option value="oldest">Old - New</option>
              <option value="az">A - Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="rounded-2xl">
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
                  className="p-3 text-left text-sm font-medium text-brand-placeholder uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {orderSummaryLoading || dayLeadsLoading ? (
              <tr>
                <td
                  colSpan={12}
                  className="py-10 text-center text-sm font-medium text-brand-body"
                >
                  Loading leads...
                </td>
              </tr>
            ) : noLeads ? (
              <tr>
                <td
                  colSpan={12}
                  className="py-12 text-center text-sm font-medium text-brand-body"
                >
                  {selectedDay ? (
                    <p>No leads are available for {selectedDay} yet.</p>
                  ) : (
                    <p className="text-[10px] text-brand-muted">
                      Leads will start loading from{" "}
                      <span className="font-medium text-brand-royalblue">
                        {cutoffText}
                      </span>
                    </p>
                  )}
                </td>
              </tr>
            ) : ( 
              visibleLeads.map((lead, index) => (
                <tr
                  key={lead._id || `${lead.email}-${index}`}
                  className="row-animate border-b border-brand-stroke text-brand-body transition-colors duration-200 hover:bg-brand-offwhite"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-4 text-sm font-light capitalize text-brand-subtext">
                    {lead.firstName}
                  </td>
                  <td className="p-4 text-sm font-light capitalize text-brand-subtext">
                    {lead.lastName}
                  </td>
                  <td className="p-4 text-sm font-light text-brand-subtext">
                    <a
                      href={`mailto:${lead.email}`}
                      className="transition-colors hover:text-brand-blue hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="p-4 text-sm font-light text-brand-subtext">
                    <a
                      href={`tel:${lead.phone}`}
                      className="transition-colors hover:text-brand-blue hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </td>
                  <td className="p-4 text-sm font-light capitalize text-brand-subtext">
                    {lead.city}
                  </td>
                  <td className="p-4 text-sm font-light capitalize text-brand-subtext">
                    {lead.state}
                  </td>
                  <td className="p-4 text-sm font-light capitalize text-brand-subtext">
                    {lead.address}
                  </td>
                  <td className="p-4 text-sm font-light text-brand-subtext">
                    {lead.zipCode}
                  </td>
                  <td className="p-4 text-sm font-light capitalize text-brand-subtext">
                    {lead.bankName}
                  </td>
                  <td className="p-4 text-sm font-light text-brand-subtext">
                    {formatNumber(lead.loanAmount)}
                  </td>
                  <td className="p-4 text-sm font-light text-brand-subtext">
                    {lead.birthday
                      ? new Date(lead.birthday).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </section>
  );
};

export default OrderDetails;
