import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react"; 
import { ArrowLeft, Check, FileText, Info, X } from "lucide-react";
import api from "../../../utility/axios";
import { useAdminAuth } from "../../../context/AdminContext";
import { useAdminDashboard } from "../../../context/DashboardContext";
import { useAppToast } from "../../../utility/appToastContext";
import usaFlag from "../../../assets/usa.webp";
import canadaFlag from "../../../assets/canada.png";
import Excel from "../../../assets/Excel.svg";
import UploadStatusPanel from "./components/UploadStatusPanel";
import {
  buildRawLeadsUploadPayload,
  countDuplicateLeads,
  formatFileSize,
  parseLeadFile,
} from "./uploadHelpers";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const COUNTRIES = [
  { id: "us", label: "United States", flag: usaFlag },
  { id: "ca", label: "Canada", flag: canadaFlag },
];

const UploadCSVModal = ({ open, onOpenChange }) => {
  const { user } = useAdminAuth();
  const { refetchAllLeads } = useAdminDashboard();
  const { showToast } = useAppToast();

  const [selectedCountry, setSelectedCountry] = useState("us");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);

  useEffect(() => {
    if (open) return;

    setSelectedCountry("us");
    setSelectedFile(null);
    setUploading(false);
    setProcessing(false);
    setProgress(0);
    setDuplicateCount(0);
  }, [open]);

  const setStageProgress = (nextValue) => {
    setProgress((currentValue) => Math.max(currentValue, nextValue));
  };

  const getUploadErrorMessage = (error, fallback = "Upload failed") =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

  const uploadLeads = async (leads) => {
    setUploading(true);
    setStageProgress(85);

    try {
      const payload = buildRawLeadsUploadPayload(leads);

      const response = await api.post(
        "/api/v2/admin/uploads/raw-leads",
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
          onUploadProgress: (event) => {
            if (!event.total) return;

            const ratio = event.loaded / event.total;
            const nextProgress = 85 + Math.round(ratio * 15);
            setStageProgress(nextProgress);
          },
        },
      );

      setStageProgress(100);
      const uploadedCount = response?.data?.data?.count;
      const skippedDuplicates = response?.data?.data?.skippedDuplicates;

      showToast({
        message:
          uploadedCount != null
            ? `Uploaded ${uploadedCount} leads${skippedDuplicates != null ? `, skipped ${skippedDuplicates} duplicates` : ""}`
            : "Leads uploaded successfully",
        type: "success",
        title: "Leads Added",
        subtitle: "Leads have been successfully added to the inventory.",
        actionLabel: "View Leads",
        duration: 0,
      });

      refetchAllLeads();
      setTimeout(() => onOpenChange(false), 350);
    } catch (error) {
      console.error("UPLOAD ERROR:", error.response?.data || error);
      const errorMessage = getUploadErrorMessage(
        error,
        "We couldn’t process this file. Please check the format and try again.",
      );

      showToast({
        message: errorMessage,
        type: "error",
        title: "Import failed",
        subtitle: errorMessage,
        actionLabel: "Retry Upload",
        duration: 0,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = "File size exceeds 10MB. Please upload a smaller file.";
      showToast({
        message: errorMessage,
        type: "error",
        title: "Import failed",
        subtitle: errorMessage,
        actionLabel: "Retry Upload",
        duration: 0,
      });
      return;
    }

    setSelectedFile(file);
    setDuplicateCount(0);
    setProcessing(true);
    setProgress(4);

    try {
      setStageProgress(12);
      const leads = await parseLeadFile(file);

      setStageProgress(58);
      const duplicates = countDuplicateLeads(leads);
      setDuplicateCount(duplicates);
      setStageProgress(78);

      await uploadLeads(leads);
    } catch (error) {
      const errorMessage = error.message || "Invalid file structure";
      showToast({
        message: errorMessage,
        type: "error",
        title: "Import failed",
        subtitle: errorMessage,
        actionLabel: "Retry Upload",
        duration: 0,
      });
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  const activeCountry = COUNTRIES.find((country) => country.id === selectedCountry);
  const isBusy = uploading || processing;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[3px]" />

          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[90vh] w-[min(1100px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-brand-sky p-3 focus:outline-none">
            <Dialog.Title className="sr-only">Upload Leads</Dialog.Title>
            <Dialog.Description className="sr-only">
              Upload leads by country pool and monitor upload progress.
            </Dialog.Description>

            <Dialog.Close className="absolute right-8 top-8 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-white text-brand-blackish">
              <X size={18} />
            </Dialog.Close>

            <div className="grid h-full gap-4 lg:grid-cols-[1fr_1.04fr]">
              <section className="bg-brand-sky px-6 py-6 lg:px-7">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-blackish"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>

                <div className="mt-4">
                  <h2 className="text-lg font-bold text-brand-blackish">
                    Upload Leads
                  </h2>
                  <p className="mt-2 text-sm font-light text-brand-body">
                    Choose your Country Pool & Upload your file.
                  </p>
                </div>

                <div className="mt-8">
                  <p className="font-semibold text-brand-blackish">
                    Select Country Pool
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {COUNTRIES.map((country) => {
                      const isSelected = selectedCountry === country.id;

                      return (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => setSelectedCountry(country.id)}
                          className={`inline-flex min-w-[170px] items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            isSelected
                              ? "border-brand-blue bg-brand-lightblue text-brand-blackish"
                              : "border-brand-stroke bg-brand-white text-brand-blackish"
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <img
                              src={country.flag}
                              alt={country.label}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                            {country.label}
                          </span>

                          {isSelected ? (
                            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#5d85ff] text-white">
                              <Check size={12} />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-semibold text-brand-blackish">
                    Upload File
                  </p>

                  {selectedFile ? (
                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-brand-lightblue bg-brand-white px-4 py-4 transition hover:opacity-95">
                      <span className="inline-flex h-11 w-11 items-center justify-center">
                        <img src={Excel} alt="" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-brand-blackish">
                          {selectedFile.name}
                        </span>
                        <span className="mt-1 block text-xs text-brand-label">
                          {formatFileSize(selectedFile.size)} • {duplicateCount.toLocaleString()} duplicates found
                        </span>
                      </span>

                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(event) => handleFile(event.target.files?.[0])}
                      />
                    </label>
                  ) : (
                    <label
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleFile(event.dataTransfer.files?.[0]);
                      }}
                      className={`mt-4 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand-lightblue bg-brand-white px-6 text-center transition ${
                        isBusy ? "pointer-events-none opacity-60" : "hover:bg-brand-lightblue"
                      }`}
                    >
                      <span className="inline-flex h-14 w-14 items-center justify-center text-brand-label">
                        <FileText size={34} />
                      </span>
                      <p className="mt-5 text-sm font-light text-brand-body">
                        <span className="font-medium text-brand-blue">Click to upload</span> or drag your file here
                      </p>
                      <div className="mt-13 flex items-center justify-center gap-1.5 text-xs text-brand-label">
                        <Info size={14} className="flex-shrink-0" />
                        <span>
                          Accepts `.csv` and `.xlsx` files. Max size <b>10MB</b>
                        </span>
                      </div>

                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(event) => handleFile(event.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
              </section>

              <UploadStatusPanel
                progress={progress}
                hasFile={Boolean(selectedFile)}
                duplicateCount={duplicateCount}
                countryLabel={activeCountry?.label || ""}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default UploadCSVModal;
