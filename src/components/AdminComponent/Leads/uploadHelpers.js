import Papa from "papaparse";
import * as XLSX from "xlsx";

export const normalizeHeader = (header = "") =>
  header
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

export const HEADER_SETTINGS_STORAGE_KEY = "admin_lead_header_settings_v2";
const LEGACY_HEADER_SETTINGS_STORAGE_KEY = "admin_lead_header_settings_v1";

export const HEADER_FIELDS = [
  {
    key: "dateTime",
    label: "Date",
    placeholder: "Date Time",
    sample: "2026-03-21",
  },
  {
    key: "firstName",
    label: "First Name",
    placeholder: "First Name",
    sample: "Amelia",
  },
  {
    key: "lastName",
    label: "Last Name",
    placeholder: "Last Name",
    sample: "Jones",
  },
  {
    key: "zipCode",
    label: "Postal Code",
    placeholder: "Zipcode",
    sample: "32819",
  },
  {
    key: "city",
    label: "City/Region",
    placeholder: "City",
    sample: "Orlando",
  },
  {
    key: "state",
    label: "State",
    placeholder: "State",
    sample: "FL",
  },
  {
    key: "address",
    label: "Address",
    placeholder: "Address",
    sample: "202 E Robison st",
  },
  {
    key: "phone",
    label: "Phone Number",
    placeholder: "Phone",
    sample: "5727496251",
  },
  {
    key: "bankName",
    label: "Bank",
    placeholder: "Bank Name",
    sample: "Truist Bank",
  },
  {
    key: "loanAmount",
    label: "Loan",
    placeholder: "Loan Amount",
    sample: "25,000",
  },
  {
    key: "birthday",
    label: "Birthday",
    placeholder: "Birthday",
    sample: "7/21/04",
  }, 
  {
    key: "email",
    label: "Email Address",
    placeholder: "Email",
    sample: "amelia.jones.test0@gmail.com",
  },
];

const DEFAULT_HEADER_ALIASES = {
  dateTime: ["date_time", "datetime", "dateandtime", "date", "date_and_time", "lead_date"],
  firstName: ["first_name", "firstname", "fname"],
  lastName: ["last_name", "lastname", "lname"],
  zipCode: ["zip_code", "zipcode", "postal_code", "zip"],
  city: ["city"],
  state: ["state"],
  address: ["address"],
  phone: ["phone", "phone_number", "mobile"],
  bankName: ["bank_name", "bank", "bankname"],
  loanAmount: ["loan_amount", "loanamount", "loan"],
  birthday: ["birthday", "dob", "date_of_birth"],
  email: ["email", "email_address"],
};

const CANONICAL_UPLOAD_KEYS = {
  dateTime: "Lead_Date",
  firstName: "Fname",
  lastName: "Lname",
  zipCode: "Zip",
  city: "City",
  state: "State",
  address: "Address",
  phone: "Phone",
  bankName: "Bank Name",
  loanAmount: "Loan Amount",
  birthday: "Birthday",
  email: "Email",
};

export const buildDefaultHeaderSettings = () =>
  HEADER_FIELDS.reduce((accumulator, field) => {
    accumulator[field.key] =
      DEFAULT_HEADER_ALIASES[field.key]?.[0] || field.placeholder;
    return accumulator;
  }, {});

export const DEFAULT_HEADER_SETTINGS = buildDefaultHeaderSettings();

export const getStoredHeaderSettings = () => {
  if (typeof window === "undefined") {
    return DEFAULT_HEADER_SETTINGS;
  }

  try {
    const rawValue =
      window.localStorage.getItem(HEADER_SETTINGS_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_HEADER_SETTINGS_STORAGE_KEY);
    if (!rawValue) return DEFAULT_HEADER_SETTINGS;

    const parsedValue = JSON.parse(rawValue);
    return HEADER_FIELDS.reduce((accumulator, field) => {
      accumulator[field.key] =
        parsedValue?.[field.key] || DEFAULT_HEADER_SETTINGS[field.key];
      return accumulator;
    }, {});
  } catch (error) {
    console.error("Failed to read saved header settings", error);
    return DEFAULT_HEADER_SETTINGS;
  }
};

export const saveHeaderSettings = (settings) => {
  if (typeof window === "undefined") return;

  const normalizedSettings = HEADER_FIELDS.reduce((accumulator, field) => {
    accumulator[field.key] =
      settings?.[field.key]?.trim() || DEFAULT_HEADER_SETTINGS[field.key];
    return accumulator;
  }, {});

  window.localStorage.setItem(
    HEADER_SETTINGS_STORAGE_KEY,
    JSON.stringify(normalizedSettings),
  );
};

const buildRawLeadRow = (lead) => ({
  [CANONICAL_UPLOAD_KEYS.dateTime]: lead?.dateTime ?? null,
  [CANONICAL_UPLOAD_KEYS.firstName]: lead?.firstName ?? null,
  [CANONICAL_UPLOAD_KEYS.lastName]: lead?.lastName ?? null,
  [CANONICAL_UPLOAD_KEYS.zipCode]: lead?.zipCode ?? null,
  [CANONICAL_UPLOAD_KEYS.city]: lead?.city ?? null,
  [CANONICAL_UPLOAD_KEYS.state]: lead?.state ?? null,
  [CANONICAL_UPLOAD_KEYS.address]: lead?.address ?? null,
  [CANONICAL_UPLOAD_KEYS.phone]: lead?.phone ?? null,
  [CANONICAL_UPLOAD_KEYS.bankName]: lead?.bankName ?? null,
  [CANONICAL_UPLOAD_KEYS.loanAmount]: lead?.loanAmount ?? null,
  [CANONICAL_UPLOAD_KEYS.birthday]: lead?.birthday ?? null,
  [CANONICAL_UPLOAD_KEYS.email]: lead?.email ?? null,
});

export const buildRawLeadsUploadPayload = (
  leads = [],
) => ({
  leads: Array.isArray(leads)
    ? leads.map((lead) => buildRawLeadRow(lead))
    : [],
});

const REQUIRED_FIELDS = ["dateTime", "firstName", "lastName", "email", "city"];
const ENFORCED_MAPPED_FIELDS = HEADER_FIELDS.map((field) => field.key);

const clean = (value) => (value === "" || value === undefined ? null : value);

const getValue = (row, field, settings) => {
  if (row[field] !== undefined) return row[field];

  const configuredHeader = normalizeHeader(settings?.[field] || "");
  if (!configuredHeader) return undefined;

  for (const key of Object.keys(row)) {
    if (normalizeHeader(key) === configuredHeader) {
      return row[key];
    }
  }

  return undefined;
};

const parseDateString = (value, rowIndex, rowIdentifier) => {
  if (!value) {
    throw new Error(`Row ${rowIndex + 1} (${rowIdentifier}): Missing date`);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      throw new Error(`Row ${rowIndex + 1} (${rowIdentifier}): Invalid Excel date`);
    }

    return new Date(
      Date.UTC(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S),
    ).toISOString();
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(/\s+/, " ");
    const isoLikeMatch = normalized.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    );
    const match = normalized.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})(?::(\d{2}))?$/,
    );

    if (isoLikeMatch) {
      const [, y, m, d, h = "0", min = "0", s = "0"] = isoLikeMatch;
      return new Date(
        Date.UTC(
          Number(y),
          Number(m) - 1,
          Number(d),
          Number(h),
          Number(min),
          Number(s),
        ),
      ).toISOString();
    }

    if (match) {
      const [, d, m, y, h, min, s] = match;
      return new Date(Date.UTC(y, m - 1, d, h, min, s || 0)).toISOString();
    }

    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  throw new Error(`Row ${rowIndex + 1} (${rowIdentifier}): Invalid date "${value}"`);
};

const normalizeLead = (row, index, settings) => {
  const rowIdentifier =
    getValue(row, "email", settings) ||
    getValue(row, "firstName", settings) ||
    `#${index + 1}`;

  for (const field of ENFORCED_MAPPED_FIELDS) {
    const rawValue = clean(getValue(row, field, settings));
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      const fieldLabel =
        HEADER_FIELDS.find((entry) => entry.key === field)?.label || field;
      throw new Error(
        `Row ${index + 1} (${rowIdentifier}): Missing required field "${fieldLabel}"`,
      );
    }
  }

  const birthdayValue = clean(getValue(row, "birthday", settings));
  const rawLoanAmount = clean(getValue(row, "loanAmount", settings));

  const dateTime = parseDateString(
    clean(getValue(row, "dateTime", settings)),
    index,
    rowIdentifier,
  );

  if (new Date(dateTime) > new Date()) {
    throw new Error(`Row ${index + 1} (${rowIdentifier}): Date cannot be in the future`);
  }

  const lead = {
    dateTime,
    firstName: clean(getValue(row, "firstName", settings)),
    lastName: clean(getValue(row, "lastName", settings)),
    email: clean(getValue(row, "email", settings)),
    phone: clean(getValue(row, "phone", settings)),
    city: clean(getValue(row, "city", settings)),
    state: clean(getValue(row, "state", settings)),
    address: clean(getValue(row, "address", settings)),
    bankName: clean(getValue(row, "bankName", settings)),
    zipCode: clean(getValue(row, "zipCode", settings)),
    loanAmount:
      rawLoanAmount === null || rawLoanAmount === undefined || rawLoanAmount === ""
        ? 0
        : Number(rawLoanAmount) || 0,
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
        `Row ${index + 1} (${rowIdentifier}): Missing required field "${field}"`,
      );
    }
  }

  return {
    ...lead,
    __rawRow: row,
  };
};

export const parseLeadFile = async (file) => {
  const headerSettings = getStoredHeaderSettings();
  let rows = [];

  if (file.name.endsWith(".csv")) {
    const text = await file.text();
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    rows = parsed.data;
  } else {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    rows = XLSX.utils.sheet_to_json(sheet);
  }

  return rows.map((row, index) => normalizeLead(row, index, headerSettings));
};

export const countDuplicateLeads = (leads = []) => {
  const seen = new Set();
  let duplicates = 0;

  leads.forEach((lead) => {
    const key = [
      lead.email || "",
      lead.phone || "",
      lead.firstName || "",
      lead.lastName || "",
    ]
      .join("|")
      .toLowerCase();

    if (seen.has(key)) {
      duplicates += 1;
      return;
    }

    seen.add(key);
  });

  return duplicates;
};

export const formatFileSize = (bytes = 0) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};
