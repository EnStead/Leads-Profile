import { Link } from "react-router";


const LeadsOverview = () => {
  const leadsData = [
    {
      id: '20251220',
      total: 6300,
      lastUpdated: 'Dec 20, 2025, 07:24 PM'
    },
    {
      id: '20251219',
      total: 6100,
      lastUpdated: 'Dec 19, 2025, 11:59 PM'
    },
    {
      id: '20251218',
      total: 5900,
      lastUpdated: 'Dec 18, 2025, 11:57 PM'
    },
    {
      id: '20251217',
      total: 5700,
      lastUpdated: 'Dec 17, 2025, 11:12 PM'
    },
    {
      id: '20251216',
      total: 5500,
      lastUpdated: 'Dec 16, 2025, 11:32 PM'
    },
    {
      id: '20251215',
      total: 5200,
      lastUpdated: 'Dec 15, 2025, 11:40 PM'
    },
    {
      id: '20251214',
      total: 5000,
      lastUpdated: 'Dec 14, 2025, 11:56 PM'
    },
    {
      id: '20251213',
      total: 4600,
      lastUpdated: 'Dec 13, 2025, 11:48 PM'
    },
    {
      id: '20251212',
      total: 4800,
      lastUpdated: 'Dec 12, 2025, 11:24 PM'
    }
  ];

  const overviewStats = {
    daysSinceSetup: 52,
    totalLeadsGenerated: 82451,
    todaysLeads: 6300,
    averageDailyLeads: 5390,
    leadConversionRate: 15,
    totalCustomers: 1500,
    pingTree: 'Online',
    apiSync: 'Active'
  };

  return (
    <div className="min-h-screen pt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
            {/* Left Column - Leads List */}
            <div className="lg:col-span-2 space-y-4">
            {leadsData.map((lead) => (
                <div
                    key={lead.id}
                    className="bg-brand-white rounded-xl px-6 py-3 border border-brand-stroke"
                >
                <div className="flex items-center justify-between">
                    <div>
                    <h3 className="text-lg font-semibold text-brand-primary">
                        Leads - {lead.id}
                    </h3>
                    <p className="text-sm font-light text-brand-muted mt-1">
                        Total: {lead.total.toLocaleString()} || Last updated {lead.lastUpdated}
                    </p>
                    </div>
                    <div className="flex items-center gap-4">
                    <Link to={`/admin/leads/${lead.id}`} className="text-brand-darkblue font-sans cursor-pointer hover:text-gray-900 font-medium">
                        View
                    </Link>
                    <button className="text-brand-blue font-sans hover:text-blue-700 font-medium">
                        Download CSV
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
                                {overviewStats.daysSinceSetup} Days
                            </p>
                        </div>
                        <div className="bg-brand-offwhite  rounded-lg p-2">
                            <p className="text-xs text-brand-muted mb-1">Total Leads Generated</p>
                            <p className="font-bold font-park text-brand-primary">
                                {overviewStats.totalLeadsGenerated.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-brand-offwhite rounded-lg p-2">
                        <p className="text-xs text-brand-muted mb-1">Today's Leads</p>
                        <p className="font-bold font-park text-brand-primary">
                            {overviewStats.todaysLeads.toLocaleString()}
                        </p>
                        </div>
                        <div className="bg-brand-offwhite  rounded-lg p-2">
                        <p className="text-xs text-brand-muted mb-1">Average Daily Leads</p>
                        <p className="font-bold font-park text-brand-primary">
                            {overviewStats.averageDailyLeads.toLocaleString()}
                        </p>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-brand-offwhite rounded-lg p-2">
                        <p className="text-xs text-brand-muted mb-1">Lead Conversion Rate (%)</p>
                        <p className="font-bold font-park text-brand-primary">
                            {overviewStats.leadConversionRate}
                        </p>
                        </div>
                        <div className="bg-brand-offwhite rounded-lg">
                        <p className="text-xs text-brand-muted mb-1">Total Customer</p>
                        <p className="font-bold font-park text-brand-primary">
                            {overviewStats.totalCustomers.toLocaleString()}
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
                                    {overviewStats.pingTree} 
                                </span> 
                            </div>
                            ||
                            <div className="flex items-center gap-3">
                                <span className="text-sm  font-light text-brand-muted">API Sync:</span>
                                <span className="text-sm font-medium text-brand-green">
                                    {overviewStats.apiSync}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
  );
};

export default LeadsOverview;