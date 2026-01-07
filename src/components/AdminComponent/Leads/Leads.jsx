import { useEffect, useState } from "react";
import LeadsOverview from "./LeadsOverview";
import UploadCSVModal from "./UploadCSVModal";
import { useDashboard } from "../../../context/DashboardContext";
import { Search } from "lucide-react";
import ToastPop from "../../../utility/ToastPop";

const Leads = () => {
  const [openUpload, setOpenUpload] = useState(false);

  const { searchTerm, setSearchTerm, setDayKey } = useDashboard();
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error");

    const showToast = (msg, type = "error") => {
    setToastMsg(msg);
    setToastType(type);
  };

  const isValidDayKey = (value) => /^\d{8}$/.test(value);

  useEffect(() => {
  if (searchTerm === "") {
    setDayKey(""); // show all data automatically
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

  return (
    <section>
      <div className="xsm:flex justify-between items-center">
        <div>
          <h2 className="text-brand-primary font-park font-bold text-xl mb-2">
            Daily Leads Page
          </h2>
          <p className="text-brand-subtext">
            Track and download leads generated each day.
          </p>
        </div>

        <div className="mt-8 flex justify-between items-center gap-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search by date (20260107)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-12 border bg-brand-white border-t-0 border-x-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gray"
            />

            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary"
            >
              <Search/>
            </button>
          </div>

          <button
            onClick={() => setOpenUpload(true)}
            className="cursor-pointer w-67 bg-brand-blue text-brand-white font-park text-sm sm:text-base px-2 sm:px-10 py-2 rounded-xl font-medium hover:opacity-90 transition"
          >
            Upload LEADS
          </button>
        </div>
      </div>

      <LeadsOverview />

      <UploadCSVModal open={openUpload} onOpenChange={setOpenUpload} />

      
      <ToastPop
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg("")}
      />
    </section>
  );
};

export default Leads;
