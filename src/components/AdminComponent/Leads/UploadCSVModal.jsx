import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import api from "../../../utility/Axios";
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
  dateTime: ["date_time", "datetime", "dateandtime", "date"],
  firstName: ["first_name", "firstname"],
  lastName: ["last_name", "lastname"],
  zipCode: ["zip_code", "zipcode", "postal_code"],
  city: ["city"],
  state: ["state"],
  phone: ["phone", "phone_number", "mobile"],
  incomeSource: ["income_source", "source_of_income"],
  bankName: ["bank_name", "bank"],
  monthlyNetIncome: ["monthly_net_income", "monthly_income", "income"],
  subId: ["sub_id", "subid"],
  subId2: ["subid2", "sub_id_2"],
  rentOrOwn: ["rent_or_own", "housing_status"],
  birthday: ["birthday", "dob", "date_of_birth"],
  timeEmployed: ["time_employed", "employment_duration"],
  email: ["email", "email_address"],
};

const getValue = (row, field) => {
  // direct match first
  if (row[field] !== undefined) return row[field];

  const aliases = HEADER_ALIASES[field];
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
      throw new Error(`Row ${rowIndex + 1} (${rowIdentifier}): Invalid Excel date`);
    }

    return new Date(
      parsed.y,
      parsed.m - 1,
      parsed.d,
      parsed.H,
      parsed.M,
      parsed.S
    ).toISOString();
  }

  // Otherwise treat as string
  if (typeof value === "string") {
    value = value.trim().replace(/\s+/, " ");

    const match = value.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})(?::(\d{2}))?$/
    );

    if (match) {
      const [, d, m, y, h, min, s] = match;
      return new Date(y, m - 1, d, h, min, s || 0).toISOString();
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  throw new Error(`Row ${rowIndex + 1} (${rowIdentifier}): Invalid date "${value}"`);
};

const clean = (v) =>
  v === "" || v === undefined ? null : v;

const toNumber = () => {
  if (clean) return null;
  const n = Number(clean);
  return isNaN(n) ? null : n;
};


const REQUIRED_FIELDS = ["dateTime", "firstName", "lastName", "email"];

const normalizeLead = (row, index) => {
    const rowIdentifier = getValue(row, "email") || getValue(row, "subId") || `#${index + 1}`;
const birthdayValue = clean(getValue(row, "birthday"));

  const lead = {
dateTime: parseDateString(
  clean(getValue(row, "dateTime")),
  index,
  rowIdentifier
),
firstName: clean(getValue(row, "firstName")),
lastName: clean(getValue(row, "lastName")),
email: clean(getValue(row, "email")),
phone: clean(getValue(row, "phone")),
city: clean(getValue(row, "city")),
state: clean(getValue(row, "state")),
incomeSource: clean(getValue(row, "incomeSource")),
bankName: clean(getValue(row, "bankName")),
subId: clean(getValue(row, "subId")),
subId2: clean(getValue(row, "subId2")),
rentOrOwn: clean(getValue(row, "rentOrOwn")),
zipCode: clean(getValue(row, "zipCode")),
    monthlyNetIncome: clean(getValue(row, "monthlyNetIncome")) !== null
  ? Number(clean(getValue(row, "monthlyNetIncome")))
  : null,

timeEmployed: clean(getValue(row, "timeEmployed")) !== null
  ? Number(clean(getValue(row, "timeEmployed")))
  : null,

birthday: birthdayValue
  ? parseDateString(birthdayValue, index, rowIdentifier)
  : null,
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

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleFile = async (file) => {
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
    }
  };

  const uploadLeads = async (data) => {
    setUploading(true);
    setProgress(0);

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
              Upload CSV or Excel files
            </Dialog.Description>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer ${
                uploading ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
              }`}
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

            {uploading && (
              <div className="mt-6">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-brand-blue"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-center mt-2">
                  Uploading... {progress}%
                </p>
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
