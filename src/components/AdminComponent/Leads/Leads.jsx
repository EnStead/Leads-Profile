import { useEffect, useState } from "react";
import LeadsOverview from "./LeadsOverview";
import UploadCSVModal from "./UploadCSVModal";
import ManageHeadersModal from "./ManageHeadersModal";
import { useAdminDashboard } from "../../../context/DashboardContext";
import { Search } from "lucide-react";
import ToastPop from "../../../utility/ToastPop";

const Leads = () => {
  const [openUpload, setOpenUpload] = useState(false);
  const [openManageHeaders, setOpenManageHeaders] = useState(false);

  const { searchTerm, setSearchTerm, setDayKey } = useAdminDashboard();
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error");

    const showToast = (msg, type = "error") => {
    setToastMsg(msg);
    setToastType(type);
  };

  const isValidDayKey = (value) => /^\d{8}$/.test(value);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed === "") {
      setDayKey(""); // show all data automatically
    } else if (isValidDayKey(trimmed)) {
      setDayKey(trimmed); // automatically search when a valid 8-digit date is entered
    }
  }, [searchTerm, setDayKey]);

  const handleSearch = () => {
    if (!searchTerm) {
      setDayKey(""); // reset filter
      return;
    }

    if (!isValidDayKey(searchTerm)) {
      showToast('Please enter a valid date in 20260107 format', "error")
      return;
    }

    setDayKey(searchTerm); // 🔥 this triggers refetch
  };

          const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
};

  return (
    <section className="relative overflow-x-clip">
      <div className="xsm:flex justify-between items-center">
        <div>
          <h2 className="text-brand-blackish font-park font-bold text-xl mb-2">
            Daily Leads Page
          </h2>
          <p className="text-brand-body">
            Track and download leads generated each day.
          </p>
        </div>

        <div className="mt-8 flex justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by date (20260107)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 pr-12 text-brand-body border bg-brand-white border-brand-placeholder rounded-xl focus:outline-none "
            />

            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary"
            >
              <Search/>
            </button>
          </div>
        </div>
      </div>

      <div>
        <LeadsOverview
          onUploadOpen={() => setOpenUpload(true)}
          onManageHeadersOpen={() => setOpenManageHeaders(true)}
        />
      </div>

      <UploadCSVModal open={openUpload} onOpenChange={setOpenUpload} />
      <ManageHeadersModal
        open={openManageHeaders}
        onOpenChange={setOpenManageHeaders}
      />

      
      <ToastPop
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg("")}
      />
    </section>
  );
};

export default Leads;
