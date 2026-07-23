import CanadaFlag from "../../../../assets/CanadaFlag.mp4";
import Usaflag from "../../../../assets/Usaflag.webm";
import CanadaImage from "../../../../assets/canada.png";
import UsaImage from "../../../../assets/usa.webp";

const capitalizeFirstLetter = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const COUNTRIES = [
  {
    id: "us",
    name: "United States",
    subtitle: "A high-volume pool with all supported bank types",
    media: Usaflag,
    icon: UsaImage,
    fee: "â‚¦3,400",
  },
  {
    id: "ca",
    name: "Canada",
    subtitle:
      "A pool of Canadian leads along with a variety of banking institutions.",
    media: CanadaFlag,
    icon: CanadaImage,
    fee: "â‚¦3,500",
    disabled: true,
    disabledLabel: "Temporarily unavailable",
  },
];

export const DEFAULT_COUNTRY_ID =
  COUNTRIES.find((country) => !country.disabled)?.id ||
  COUNTRIES[0]?.id ||
  "us";

export const BANK_CRITERIA = [
  {
    id: "mixed",
    label: "Mixed Banks",
    description: "Includes leads from all banks. No filtering applied.",
  },
  {
    id: "filtered",
    label: "Filter Banks",
    description: "Only select specific banks you want to include in the order.",
  },
  {
    id: "premium_bank",
    label: "Premium Banks",
    description: "Leads from high-value bank customers are prioritized.",
  },
  {
    id: "credit_unions",
    label: "Credit Unions",
    description: "Leads from credit union customers only.",
  },
];

export const DELIVERY_TYPES = [
  { id: "standard", label: "Standard" },
  { id: "staggered", label: "Staggered" },
  { id: "scheduled", label: "Scheduled Spread" },
];

export const PREMIUM_BANKS = [
  "JP Morgan Chase",
  "USAA Federal Savings Bank",
  "Truist Bank",
  "TD Bank",
];

export const PREVIEW_BANKS = {
  mixed: [
    capitalizeFirstLetter("BBVA USA"),
    capitalizeFirstLetter("PNC Bank"),
    capitalizeFirstLetter("M&T Bank"),
    capitalizeFirstLetter("SunTrust Bank"),
    capitalizeFirstLetter("Zions Bancorporation"),
    capitalizeFirstLetter("Citizens Bank"),
    capitalizeFirstLetter("Ally Bank"),
    capitalizeFirstLetter("American Express Bank"),
    capitalizeFirstLetter("KeyBank"),
    capitalizeFirstLetter("Comerica Bank"),
    capitalizeFirstLetter("Capital One"),
    capitalizeFirstLetter("Navy Federal Credit Union"),
    capitalizeFirstLetter("Abound Federal Credit Union"),
    capitalizeFirstLetter("ACME CONTINENTAL CREDIT  UNION"),
    capitalizeFirstLetter("Adams Bank and Trust"),
    capitalizeFirstLetter("Bonneville bank"),
    capitalizeFirstLetter("Bonvenu Bank NA"),
    capitalizeFirstLetter("Bossier Federal Credit Union"),
    capitalizeFirstLetter("Bravera"),
    capitalizeFirstLetter("Brannen Bank"),
    capitalizeFirstLetter("BrightStar Credit Union"),
    capitalizeFirstLetter("BUCKEYE COMMUNITY FED CREDIT UNION"),
    capitalizeFirstLetter("Campus Federal Credit Union"),
    capitalizeFirstLetter("ELKTON BANK AND TRUST CO"),
    capitalizeFirstLetter("First National Bank and Trust"),
    capitalizeFirstLetter("GUADALUPE CREDIT UN"),
    capitalizeFirstLetter("ABBEVILLE FIRST BANK"),
    capitalizeFirstLetter("ACNB Bank"),
    capitalizeFirstLetter("AFBandT"),
    capitalizeFirstLetter("Alamosa State Bank"),
    capitalizeFirstLetter("Alerus Financial National Association"),
    capitalizeFirstLetter("All America Bank"),
    capitalizeFirstLetter("E TRADE BANK"),
    capitalizeFirstLetter("EAST ALLEN FCU"),
    capitalizeFirstLetter("FIRST NATIONAL BANK DUMAS"),
    capitalizeFirstLetter("First National Bank in New Bremen"),
    capitalizeFirstLetter("Kish Bank"),
    capitalizeFirstLetter("Kish Bank"),
    capitalizeFirstLetter("KITSAP CREDIT UNION"),
    capitalizeFirstLetter("Penn Community Bank"),
    capitalizeFirstLetter("PEOPLES BANK"),
    capitalizeFirstLetter("PEOPLES BANK"),
    capitalizeFirstLetter("PeoplesSouth Bank"),
  ],
  premium_bank: [
    "JP Morgan Chase",
    "USAA Federal Savings Bank",
    "Truist Bank",
    "TD Bank",
  ],
  credit_unions: [
    capitalizeFirstLetter("Navy Federal Credit Union"),
    capitalizeFirstLetter("Abound Federal Credit Union"),
    capitalizeFirstLetter("ACME CONTINENTAL CREDIT  UNION"),
    capitalizeFirstLetter("Bossier Federal Credit Union"),
    capitalizeFirstLetter("Vectra Bank Colorado"),
    capitalizeFirstLetter("Valley One Community Federal Credit Union"),
    capitalizeFirstLetter("Wildfire Credit Union"),
    capitalizeFirstLetter("WHITE EAGLE CREDIT UNION"),
    capitalizeFirstLetter("Tidemark Federal Credit Union"),
    capitalizeFirstLetter("Thrive Federal Credit Union"),
    capitalizeFirstLetter("TLC Community Credit Union"),
    capitalizeFirstLetter("TEN Credit Union"),
    capitalizeFirstLetter("TELHIO CREDIT UNION"),
    capitalizeFirstLetter("South Jersey Federal Credit Union"),
    capitalizeFirstLetter("Ripco Credit Union"),
    capitalizeFirstLetter("Rally Credit Union"),
    capitalizeFirstLetter("ProFed Federal Credit Union"),
    capitalizeFirstLetter("Piedmont Credit Union"),
    capitalizeFirstLetter("PCM Credit Union"),
    capitalizeFirstLetter("GUADALUPE CREDIT UN"),
    capitalizeFirstLetter("Wright Patt Credit Union Inc"),
    capitalizeFirstLetter("WS FEDERAL CREDIT UNION"),
    capitalizeFirstLetter("WVU EMPLOYEES FEDERAL CREDIT UNION"),
    capitalizeFirstLetter("WYCHEM FEDERAL CREDIT UNION"),
    capitalizeFirstLetter("Y-12 Federal Credit Union"),
    capitalizeFirstLetter("Y12 FEDERAL CREDIT UNION"),
    capitalizeFirstLetter("Yampa Valley Bank"),
    capitalizeFirstLetter("Yolo Federal Credit Union"),
    capitalizeFirstLetter("YORKVILLE COMMUNITY   FEDERAL CREDIT UNION"),
    capitalizeFirstLetter("YOUR HOMETOWN FEDERAL CREDIT UNION"),
    capitalizeFirstLetter("Zeal Credit Union"),
    capitalizeFirstLetter("ZIA Credit Union"),
    capitalizeFirstLetter("360 FEDERAL CREDIT UNION"),
    capitalizeFirstLetter("4Front Credit Union"),
    capitalizeFirstLetter("4U Federal Credit Union"),
    capitalizeFirstLetter("66 FEDERAL CREDIT UNION"),
    capitalizeFirstLetter("802 Credit Union"),
  ],
};

export const SUGGESTED_QUANTITIES = [250, 1000, 2000, 2500, 3000, 5000];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const WEEKS = [2, 3, 4];

export const getDayIndex = (day) =>
  DAYS.findIndex(
    (entry) =>
      String(entry).toLowerCase() ===
      String(day || "")
        .trim()
        .toLowerCase(),
  );

export const getAllowedEndDays = (startDay) => {
  const startIndex = getDayIndex(startDay);
  return startIndex >= 0 ? DAYS.slice(startIndex) : DAYS;
};

export const getDeliveryWindowDays = (startDay, endDay) => {
  const startIndex = getDayIndex(startDay);
  const endIndex = getDayIndex(endDay);

  if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
    return 1;
  }

  return endIndex - startIndex + 1;
};

export const findCountry = (countryId) =>
  COUNTRIES.find((country) => country.id === countryId) ||
  COUNTRIES.find((country) => !country.disabled) ||
  COUNTRIES[0];

export const criteriaLabel = (criteriaId) =>
  BANK_CRITERIA.find((option) => option.id === criteriaId)?.label ||
  "Mixed Banks";

export const deliveryLabel = (deliveryId) =>
  DELIVERY_TYPES.find((option) => option.id === deliveryId)?.label ||
  "Standard";
