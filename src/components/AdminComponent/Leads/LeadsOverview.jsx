import { Link } from "react-router";
import { useDashboard } from "../../../context/DashboardContext";
import Pagination from "../../../utility/Pagination";
import CardSkeleton from "../../../utility/skeletons/CardSkeleton";
import api from "../../../utility/Axios";
import { useAdminAuth } from "../../../context/AdminContext";
import { useState } from "react";



 



const LeadsOverview = ({searchTerm}) => {
    const { user } = useAdminAuth(); // Admin user
    const [downloadingDay, setDownloadingDay] = useState(null); // stores the dayKey being downloaded

    
    
    const downloadCSV = async (dayKey, totalLeads) => {
    try {
        setDownloadingDay(dayKey); // start downloading

        // Use totalLeads from the overview data
        const res = await api.get(`/leads/daily/${dayKey}?page=1&limit=${totalLeads}`, {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
        });

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
        setDownloadingDay(null); // finished downloading
    }
    };



    const { allLeadsData, allLeadsLoading, allLeadsError, page, setPage  } = useDashboard();

    const filteredLeads = allLeadsData?.data.filter((lead) => {
        const term = searchTerm.toLowerCase();

        return (
            lead.dayKey?.toLowerCase().includes(term)
        );
    });

    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true, // AM / PM
        };

        return new Date(dateString).toLocaleString(undefined, options);
    };


    if (allLeadsLoading) {
        return (
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                </div>
            </section>
        );;
    }


    if (allLeadsError) {
      return <p className="text-brand-red">Failed to load dashboard data.</p>;
    }


  return (
    <div className="min-h-screen pt-8">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
            {/* Left Column - Leads List */}
            <div className="lg:col-span-2 space-y-4">
                {
                  !allLeadsData.data.length  ?  <EmptyState /> :
                
                    Array.isArray(filteredLeads) && filteredLeads.map((lead) => (
                    <div
                        key={lead.dayKey}
                        className="bg-brand-white rounded-xl px-6 py-3 border border-brand-stroke"
                    >
                    <div className=" xsm:flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold font-park text-brand-primary">
                                Leads - {lead.dayKey}
                            </h3>
                            <p className="text-sm font-light text-brand-muted mt-1">
                                Total: {lead.total.toLocaleString()} || Last updated {formatDate(lead.lastUpdated)}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 xsm:mt-0">
                            <Link to={`/admin/leads/${lead.dayKey}`} className="text-brand-darkblue font-sans cursor-pointer hover:text-gray-900 font-medium">
                                View
                            </Link>
                            <button
                                disabled={!lead.total || downloadingDay === lead.dayKey}
                                onClick={() => downloadCSV(lead.dayKey, lead.total)}
                                className={`font-medium ${
                                    lead.total
                                    ? "text-brand-blue hover:text-blue-700"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                            >
                            {downloadingDay === lead.dayKey ? "Downloading..." : "Download CSV"}
                            </button>
                        </div>
                    </div>
                    </div>
                ))}
            </div>

            {/* Right Column - Leads Overview */}
            <div className="lg:col-span-1">
                <div className="bg-brand-white rounded-xl p-6 border border-brand-offwhite sticky top-8">
                    <h2 className="font-bold font-park text-brand-primary mb-6">
                        Leads Overview
                    </h2>

                    {/* Stats Grid */}
                    <div className="space-y-6">

                        {/* Row 1 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-brand-offwhite  rounded-lg p-2">
                                <p className="text-xs text-brand-muted mb-1">Days Since Setup</p>
                                <p className="font-bold font-park text-brand-primary">
                                    {allLeadsData.overview.daysSinceSetup} Days
                                </p>
                            </div>
                            <div className="bg-brand-offwhite  rounded-lg p-2">
                                <p className="text-xs text-brand-muted mb-1">Total Leads Generated</p>
                                <p className="font-bold font-park text-brand-primary">
                                    {allLeadsData.overview.totalLeadsGenerated.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-brand-offwhite rounded-lg p-2">
                            <p className="text-xs text-brand-muted mb-1">Today's Leads</p>
                            <p className="font-bold font-park text-brand-primary">
                                {allLeadsData.overview.todaysLeads.toLocaleString()}
                            </p>
                            </div>
                            <div className="bg-brand-offwhite  rounded-lg p-2">
                            <p className="text-xs text-brand-muted mb-1">Average Daily Leads</p>
                            <p className="font-bold font-park text-brand-primary">
                                {allLeadsData.overview.averageDailyLeads.toLocaleString()}
                            </p>
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-brand-offwhite rounded-lg p-2">
                            <p className="text-xs text-brand-muted mb-1">Lead Conversion Rate (%)</p>
                            <p className="font-bold font-park text-brand-primary">
                                {/* {overviewStats.leadConversionRate} */}
                            </p>
                            </div>
                            <div className="bg-brand-offwhite rounded-lg">
                            <p className="text-xs text-brand-muted mb-1">Total Customer</p>
                            <p className="font-bold font-park text-brand-primary">
                                {/* {overviewStats.totalCustomers.toLocaleString()} */}
                            </p>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-brand-offwhite rounded-lg p-2 text-brand-muted">
                            <p className="text-xs text-brand-muted mb-3">System Status</p>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-light text-brand-muted">Ping Tree:</span>
                                    <span className="text-sm font-medium text-brand-green">
                                        {/* {overviewStats.pingTree}  */}
                                    </span> 
                                </div>
                                ||
                                <div className="flex items-center gap-3">
                                    <span className="text-sm  font-light text-brand-muted">API Sync:</span>
                                    <span className="text-sm font-medium text-brand-green">
                                        {/* {overviewStats.apiSync} */}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Pagination
            page={page}
            totalPages={allLeadsData?.pagination.pages}
            onPageChange={setPage}
        />
    </div>
  );
};

export default LeadsOverview;