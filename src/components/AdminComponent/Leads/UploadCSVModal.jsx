import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import api from "../../../utility/axios";
import { useAdminAuth } from "../../../context/AdminContext";
import { useDashboard } from "../../../context/DashboardContext";
import ToastPop from "../../../utility/ToastPop";

/* -------------------- HELPERS -------------------- */

const normalizeHeader = (header = "") =>
  header
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const HEADER_ALIASES = {
  dateTime: ["date_time", "datetime", "dateandtime", "date", "date_and_time", "lead_date"],
  firstName: ["first_name", "firstname","fname"],
  lastName: ["last_name", "lastname", "lname"],
  zipCode: ["zip_code", "zipcode", "postal_code", "zip"],
  city: ["city"],
  state: ["state"],
  address: ["address"],
  phone: ["phone", "phone_number", "mobile"],
  bankName: ["bank_name", "bank", "bankname"],
  loanAmount: ["loan_amount", "loanamount", "loan", "amount_requested"],
  birthday: ["birthday", "dob", "date_of_birth"],
  email: ["email", "email_address"],
  incomeSource: ["income_source", "incomesource"],
  jobTitle: ["job_title", "jobtitle"],
  payFrequency: ["pay_frequency", "payfrequency"],
  rentOrOwn: ["rent_or_own", "rentorown"],
  monthlyNet: ["monthly_net_income", "monthlynetincome"],
  timeEmployed: ["time_employed", "timeemployed"],
};

const getValue = (row, field) => {
  if (row[field] !== undefined) return row[field];
  const aliases = HEADER_ALIASES[field] || [];

  for (const key of Object.keys(row)) {
    if (aliases.includes(normalizeHeader(key))) {
      return row[key];
    }
  }
  return undefined;
};


const parseDateString = (value, rowIndex, rowIdentifier) => {
  if (!value) {
    throw new Error(`Row ${rowIndex + 1} (${rowIdentifier}): Missing date`);
  }

  // If it's already a Date (XLSX often does this)
  if (value instanceof Date) {
    return value.toISOString();
  }

  // If it's an Excel serial number
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      throw new Error(
        `Row ${rowIndex + 1} (${rowIdentifier}): Invalid Excel date`
      );
    }

    return new Date(Date.UTC(
      parsed.y,
      parsed.m - 1,
      parsed.d,
      parsed.H,
      parsed.M,
      parsed.S
    )).toISOString();
  }

  // Otherwise treat as string
  if (typeof value === "string") {
    value = value.trim().replace(/\s+/, " ");

    const match = value.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})(?::(\d{2}))?$/
    );

    if (match) {
      const [, d, m, y, h, min, s] = match;
      return new Date(Date.UTC(y, m - 1, d, h, min, s || 0)).toISOString();
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  throw new Error(
    `Row ${rowIndex + 1} (${rowIdentifier}): Invalid date "${value}"`
  );
};

const clean = (v) => (v === "" || v === undefined ? null : v);

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const cleaned = String(value).replace(/,/g, "").trim();
  const number = Number(cleaned);

  return Number.isNaN(number) ? 0 : number;
};

const REQUIRED_FIELDS = ["dateTime", "firstName", "lastName", "email"];

const normalizeLead = (row, index) => {
  const rowIdentifier =
    getValue(row, "email") || getValue(row, "firstName") || `#${index + 1}`;
  const birthdayValue = clean(getValue(row, "birthday"));
  const rawMonthlyIncome = clean(getValue(row, "loanAmount"));
  const rawMonthlyNet = clean(getValue(row, "monthlyNet"));
  
  const dateTime = parseDateString(
    clean(getValue(row, "dateTime")),
    index,
    rowIdentifier
  );

  if (new Date(dateTime) > new Date()) {
    throw new Error(
      `Row ${index + 1} (${rowIdentifier}): Date cannot be in the future`
    );
  }

  const lead = {
    dateTime,
    firstName: clean(getValue(row, "firstName")),
    lastName: clean(getValue(row, "lastName")),
    email: clean(getValue(row, "email")),
    phone: clean(getValue(row, "phone")),
    city: clean(getValue(row, "city")),
    state: clean(getValue(row, "state")),
    address: clean(getValue(row, "address")),
    bankName: clean(getValue(row, "bankName")),
    zipCode: clean(getValue(row, "zipCode")),
    loanAmount:
      rawMonthlyIncome === null ||
      rawMonthlyIncome === undefined ||
      rawMonthlyIncome === ""
        ? 0
        : Number(rawMonthlyIncome) || 0,
    birthday: birthdayValue
      ? parseDateString(birthdayValue, index, rowIdentifier)
      : null,
    incomeSource: clean(getValue(row, "incomeSource")),
    jobTitle: clean(getValue(row, "jobTitle")),
    payFrequency: clean(getValue(row, "payFrequency")),
    rentOrOwn: clean(getValue(row, "rentOrOwn")),
    monthlyNet: parseNumber(rawMonthlyNet),
    timeEmployed: clean(getValue(row, "timeEmployed")),
  };

  for (const field of REQUIRED_FIELDS) {
    if (
      lead[field] === null ||
      lead[field] === undefined ||
      lead[field] === ""
    ) {
      throw new Error(
        `Row ${index + 1} (${rowIdentifier}): Missing required field "${field}"`
      );
    }
  }

  return lead;
};

/* -------------------- COMPONENT -------------------- */

const UploadCSVModal = ({ open, onOpenChange }) => {
  const { user } = useAdminAuth();
  const { refetchAllLeads } = useDashboard();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [processing, setProcessing] = useState(false);

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFile = async (file) => {
    if (!file) return;

      // 🔴 FILE SIZE CHECK
  if (file.size > MAX_FILE_SIZE) {
    showToast("File size exceeds 5MB. Please upload a smaller file.", "error");
    return;
  }
  
    setProcessing(true); // 🔑 START IMMEDIATELY
    setProgress(0);
    try {
      let rows = [];

      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        });

        rows = parsed.data.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              normalizeHeader(key),
              value,
            ])
          )
        );
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // 1️⃣ Convert sheet → JSON
        rows = XLSX.utils.sheet_to_json(sheet);

        // 2️⃣ 🔑 NORMALIZE HEADERS HERE (this is the fix)
        rows = rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              normalizeHeader(key),
              value,
            ])
          )
        );
      }

      const leads = rows.map((row, index) => normalizeLead(row, index));
      await uploadLeads(leads);
    } catch (err) {
      showToast(err.message || "Invalid file structure", "error");
    } finally {
      setProcessing(false); // 🔑 STOP when upload starts/ends
    }
  };

  const uploadLeads = async (data) => {
    setUploading(true);
    // setProgress(0);
    // console.log(data)
    try {
      await api.post(
        "/leads/raw-leads",
        { leads: data },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        }
      );
      showToast("Leads uploaded successfully");
      refetchAllLeads();
      onOpenChange(false);
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err);
      showToast(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Upload failed",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />

          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-[480px] p-8 shadow-xl z-50">
            <Dialog.Title className="text-xl font-bold text-center mb-2 font-park">
              Upload Leads
            </Dialog.Title>

            <Dialog.Description className="text-center text-sm text-brand-subtext mb-6">
              Upload Excel files
            </Dialog.Description>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer
                ${
                  processing || uploading
                    ? "opacity-50 pointer-events-none"
                    : "hover:bg-gray-50"
                }
              `}
            >
              <Upload className="mb-3 text-brand-muted" />
              <p className="text-sm">
                <span className="font-semibold">Click to upload</span> or drag &
                drop
              </p>
              <p className="text-xs text-brand-muted mt-1 font-bold">
                XLSX files ONLY
              </p>

              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </label>

            {(processing || uploading) && (
              <div className="mt-6">
                {processing && (
                  <p className="text-sm text-center text-brand-muted mb-2">
                    Processing file… Please wait
                  </p>
                )}

                {uploading && (
                  <>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-brand-blue transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center mt-2">
                      Uploading... {progress}%
                    </p>
                  </>
                )}
              </div>
            )}

            <Dialog.Close className="absolute top-4 right-5 text-xl">
              ×
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ToastPop
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg("")}
      />
    </>
  );
};

export default UploadCSVModal;
