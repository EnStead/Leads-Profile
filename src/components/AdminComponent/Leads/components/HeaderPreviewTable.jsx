import {
  DEFAULT_HEADER_SETTINGS,
  HEADER_FIELDS,
} from "../uploadHelpers";
import BlueUserIcon from '../../../../assets/BlueUserIcon.svg'

const PREVIEW_ROWS = [
  {
    dateTime: "2026-03-21",
    firstName: "Amelia",
    lastName: "Jones",
    zipCode: "32819",
    city: "Orlando",
    state: "FL",
    address: "202 E Robison st",
    phone: "5727496251",
    bankName: "Truist Bank",
    loanAmount: "25,000",
    birthday: "7/21/04",
    email: "amelia.jones.test0@gmail.com",
  },
  {
    dateTime: "2026-03-21",
    firstName: "Liam",
    lastName: "Brown",
    zipCode: "92108",
    city: "San Diego",
    state: "CA",
    address: "7007 Friars Rd",
    phone: "5104129189",
    bankName: "Navy Federal",
    loanAmount: "10,000",
    birthday: "11/11/75",
    email: "liam.brown.test2@gmail.com",
  },
  {
    dateTime: "2026-03-21",
    firstName: "Taylor",
    lastName: "Martin",
    zipCode: "60611",
    city: "Chicago",
    state: "IL",
    address: "879 N Michigan Ave",
    phone: "3492895857",
    bankName: "Capital One",
    loanAmount: "18,250",
    birthday: "12/8/89",
    email: "taylor.martin.test0@gmail.com",
  },
  {
    dateTime: "2026-03-21",
    firstName: "Sophia",
    lastName: "Garcia",
    zipCode: "33101",
    city: "Miami",
    state: "FL",
    address: "450 NW 3rd St",
    phone: "7865551234",
    bankName: "Wells Fargo",
    loanAmount: "22,500",
    birthday: "5/14/90",
    email: "sophia.garcia.test4@gmail.com",
  },
  {
    dateTime: "2026-03-21",
    firstName: "Ethan",
    lastName: "Nguyen",
    zipCode: "98101",
    city: "Seattle",
    state: "WA",
    address: "120 Pine St",
    phone: "2067778899",
    bankName: "Chase Bank",
    loanAmount: "30,000",
    birthday: "8/22/83",
    email: "ethan.nguyen.test5@gmail.com",
  },
  {
    dateTime: "2026-03-21",
    firstName: "Isabella",
    lastName: "Smith",
    zipCode: "10001",
    city: "New York",
    state: "NY",
    address: "200 W 42nd St",
    phone: "2125553344",
    bankName: "Bank of America",
    loanAmount: "27,750",
    birthday: "3/30/86",
    email: "isabella.smith.test6@gmail.com",
  },
  {
    dateTime: "2026-03-21",
    firstName: "Mason",
    lastName: "Lopez",
    zipCode: "75201",
    city: "Dallas",
    state: "TX",
    address: "1515 Elm St",
    phone: "2145556677",
    bankName: "PNC Bank",
    loanAmount: "15,000",
    birthday: "9/5/88",
    email: "mason.lopez.test7@gmail.com",
  },
  {
    dateTime: "2026-03-21",
    firstName: "Olivia",
    lastName: "Kim",
    zipCode: "94102",
    city: "San Francisco",
    state: "CA",
    address: "600 Market St",
    phone: "4155558890",
    bankName: "Citibank",
    loanAmount: "19,500",
    birthday: "1/17/92",
    email: "olivia.kim.test8@gmail.com",
  },
];

const getVisibleFields = (activeFieldKey) => {
  const activeIndex = Math.max(
    HEADER_FIELDS.findIndex((field) => field.key === activeFieldKey),
    0,
  );
  const startIndex = Math.min(
    Math.max(activeIndex - 1, 0),
    Math.max(HEADER_FIELDS.length - 3, 0),
  );

  return {
    startIndex,
    visibleFields: HEADER_FIELDS.slice(startIndex, startIndex + 3),
  };
};

const HeaderPreviewTable = ({ settings, activeFieldKey }) => {
  const { startIndex, visibleFields } = getVisibleFields(activeFieldKey);
  const isAtFirstWindow = startIndex === 0;
  const isAtLastWindow = startIndex >= HEADER_FIELDS.length - 3;

  return (
    <div className="relative overflow-hidden rounded-xl bg-brand-lightblue px-6 py-6">
      <img
        src={BlueUserIcon}
        alt=""
        className="pointer-events-none absolute bottom-0 z-[3] -left-3 h-44 w-44 object-contain"
      />

        {!isAtFirstWindow ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-26 bg-gradient-to-r from-brand-lightblue via-brand-lightblue/90 to-transparent" />
        ) : null}

        {!isAtLastWindow ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-26 bg-gradient-to-l from-brand-lightblue via-brand-lightblue/90 to-transparent" />
        ) : null}
      <div className="relative mt-12 overflow-hidden rounded-2xl bg-brand-white shadow-[0_20px_36px_rgba(116,138,186,0.14)]">

        <div className="overflow-x-auto hide-scrollbar">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-brand-stroke bg-brand-offwhite">
                <th className="w-12 px-4 py-3 text-sm font-medium text-brand-label" />
                {visibleFields.map((field) => {
                  const isActive = field.key === activeFieldKey;
                  const headerLabel =
                    settings?.[field.key]?.trim() || DEFAULT_HEADER_SETTINGS[field.key];

                  return (
                    <th
                      key={field.key}
                      className={`px-4 py-3 text-sm font-semibold ${
                        isActive ? "bg-brand-inprogress/20 text-brand-blue" : "text-brand-body"
                      }`}
                    >
                      {headerLabel}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PREVIEW_ROWS.map((row, index) => (
                <tr key={index} className="border-b border-brand-stroke last:border-b-0">
                  <td className="px-4 py-3 text-center text-sm text-brand-label">{index + 1}</td>
                  {visibleFields.map((field) => {
                    const isActive = field.key === activeFieldKey;
                    return (
                      <td
                        key={field.key}
                        className={`px-4 py-3 text-sm ${
                          isActive ? "bg-brand-inprogress/20 font-semibold text-brand-blackish" : "text-brand-body"
                        }`}
                      >
                        {row[field.key]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HeaderPreviewTable;
