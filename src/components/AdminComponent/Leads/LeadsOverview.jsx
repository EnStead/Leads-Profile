import { useState } from "react";
import api from "../../../utility/axios";
import EmptyState from "../../../utility/EmptyState";
import { useAdminDashboard } from "../../../context/DashboardContext";
import { useAdminAuth } from "../../../context/AdminContext";
import LeadDayCard from "./components/LeadDayCard";
import LeadsOverviewSidebar from "./components/LeadsOverviewSidebar";

const toNumber = (...values) => {
  for (const value of values) {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) return numericValue;
  }

  return 0;
};

const getLeadMetrics = (lead) => ({
  used: toNumber(
    lead?.fulfillment?.used,
    lead?.used,
    lead?.fulfilled,
    lead?.filled,
    lead?.assigned,
    lead?.givenOut,
    lead?.distributed,
    0,
  ),
  total: toNumber(
    lead?.fulfillment?.total,
    lead?.total,
    lead?.target,
    lead?.uploaded,
    lead?.uploadedCount,
    lead?.totalUploaded,
  ),
  progressPct: toNumber(
    lead?.fulfillment?.progressPct,
    lead?.progressPct,
    lead?.percentage,
    lead?.pct,
  ),
  uploaded: toNumber(
    lead?.fulfillment?.total,
    lead?.total,
    lead?.uploaded,
    lead?.uploadedCount,
    lead?.totalUploaded,
  ),
  fulfilled: toNumber(
    lead?.fulfillment?.used,
    lead?.used,
    lead?.fulfilled,
    lead?.filled,
    lead?.assigned,
    lead?.givenOut,
    lead?.distributed,
    0,
  ),
  duplicates: toNumber(
    lead?.duplicates?.displayCount,
    lead?.duplicates?.totalDuplicateRows,
    lead?.duplicates?.rolling24hCount,
    lead?.duplicates?.historicalCount,
    lead?.duplicates?.duplicateRate,
    lead?.duplicates,
    lead?.duplicateCount,
    lead?.totalDuplicates,
    lead?.duplicateLeads,
  ),
});

const CSV_FIELDS = [
  { key: "dateTime", label: "Date & Time" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "address", label: "Address" },
  { key: "zipCode", label: "Zip" },
  { key: "bankName", label: "Bank" },
  { key: "loanAmount", label: "Loan Amount" },
  { key: "birthday", label: "Birthday" },
];

const LeadsOverview = ({ onUploadOpen, onManageHeadersOpen }) => {
  const { user } = useAdminAuth();
  const [downloadingDay, setDownloadingDay] = useState(null);
  const {
    allLeadsData,
    allLeadsLoading,
    allLeadsError,
    adminImportBatchesOverviewData,
  } = useAdminDashboard();
  
  const downloadCSV = async (dayKey, totalLeads) => {
    try {
      setDownloadingDay(dayKey);

      const res = await api.get(`/api/v1/leads/daily/${dayKey}?page=1&limit=${totalLeads}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const leads = res.data?.data || [];
      if (!leads.length) {
        alert("No leads available for this day");
        return;
      }

      const headers = CSV_FIELDS.map((field) => field.label);
      const csvRows = [
        headers.join(","),
        ...leads.map((lead) =>
          CSV_FIELDS.map((field) => `"${lead[field.key] ?? ""}"`).join(","),
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
    } catch (error) {
      console.error("CSV download failed", error);
      alert("Failed to download CSV. Make sure you are logged in.");
    } finally {
      setDownloadingDay(null);
    }
  };

  if (allLeadsError) {
    return <p className="text-brand-red">Failed to load dashboard data.</p>;
  }

  return (
    <div className="pt-8">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.92fr]">
        <div className="grid gap-5 md:grid-cols-2">
          {allLeadsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[258px] animate-pulse rounded-[1.75rem] border border-[#d8e2f0] bg-white"
              />
            ))
          ) : !allLeadsData?.data?.length ? (
            <div className="md:col-span-2">
              <EmptyState />
            </div>
          ) : (
            allLeadsData.data.map((lead) => {
              const metrics = getLeadMetrics(lead);
              return (
                <LeadDayCard
                  key={lead.dayKey}
                  lead={lead}
                  metrics={metrics}
                  isDownloading={downloadingDay === lead.dayKey}
                  onDownload={downloadCSV}
                />
              );
            })
          )}
        </div>

        <LeadsOverviewSidebar
          overview={adminImportBatchesOverviewData}
          onUpload={onUploadOpen}
          onManageHeaders={onManageHeadersOpen}
        />
      </div>
    </div>
  );
};

export default LeadsOverview;
