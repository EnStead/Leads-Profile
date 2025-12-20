import { useState } from "react";
import LeadsOverview from "./LeadsOverview";
import UploadCSVModal from "./UploadCSVModal";

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openUpload, setOpenUpload] = useState(false);

  const handleFileSelect = (file) => {
    console.log("Selected file:", file);
    // later → send to backend
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
          <div className="relative w-full max-w-xs mt-4 xsm:mt-0">
            <input
              type="text"
              placeholder="Search by lead name or source"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-12 border bg-brand-white border-t-0 border-x-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gray"
            />
          </div>

          <button
            onClick={() => setOpenUpload(true)}
            className="cursor-pointer w-67 bg-brand-blue text-brand-white font-park text-sm sm:text-base px-2 sm:px-10 py-2 rounded-xl font-medium hover:opacity-90 transition"
          >
            Upload LEADS
          </button>
        </div>
      </div>

      <LeadsOverview searchTerm={searchTerm} />

      <UploadCSVModal
        open={openUpload}
        onOpenChange={setOpenUpload}
        onFileSelect={handleFileSelect}
      />
    </section>
  );
};

export default Leads;
