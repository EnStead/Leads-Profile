import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCw , Download } from "lucide-react";

const LeadsDetails = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  // Dummy API fetch simulation
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(dummyLeads); // replace with API fetch later
      setLoading(false);
      setLastUpdated("5 mins ago");
    }, 1000);
  }, [id]);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastUpdated("Just now");
    }, 1200);
  };

  // Progress bar data
  const current = 4579;
  const total = 5000;
  const progressPercent = Math.round((current / total) * 100);

  return (
    <section>
        {/* ---- BACK BUTTON ---- */}
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-brand-black mb-4 font-medium"
        >
            <ArrowLeft size={18} />
            Back
        </button>
                
        {/* ---- HEADER ---- */}
        <div className="flex justify-between items-end mb-4">
            <div>
            <h1 className="text-2xl font-bold font-park text-brand-primary">
                Leads: PNC Bank – {id}
            </h1>

            <p className="text-sm text-brand-subtext flex items-center gap-3 mt-1">
                Last Updated: {lastUpdated}

                <button
                onClick={refreshData}
                className="flex items-center font-park font-semibold gap-1 text-brand-blue hover:underline"
                >
                    <RotateCw  size={14} className="font-bold" /> Refresh Data
                </button>
            </p>
            </div>

            {/* ---- DOWNLOAD CSV WITH PROGRESS ---- */}
            <div className=" flex gap-4">
                <div className="mt-2 w-fit bg-brand-white border border-brand-stroke p-3 rounded-xl">
                    <p className=" font-medium text-sm text-brand-muted">
                       Total Leads Generated: <span className="font-park text-brand-primary font-semibold text-base " >{total}</span> 
                    </p>
                </div>

                <button className="flex w-48 items-center justify-center gap-2 bg-brand-black text-brand-white px-4 py-2 rounded-xl text-sm font-semibold">
                    Download CSV
                </button>

            </div>
        </div>

        {/* ---- TABLE ---- */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-brand-white rounded-2xl">
                    <tr>
                    {[
                        "First Name",
                        "Last Name",
                        "Email",
                        "Phone",
                        "City",
                        "State",
                        "Zip",
                        "Bank",
                        "Source",
                        "Monthly Income",
                        "Rent/Own",
                        "Birthday",
                    ].map((header) => (
                        <th key={header} className="p-3 font-medium text-sm text-brand-muted rounded-l-lg">
                        {header}
                        </th>
                    ))}
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                    <tr>
                        <td colSpan={12} className="text-center py-10 font-medium text-brand-subtext text-sm">
                            Loading leads…
                        </td>
                    </tr>
                    ) : data.length === 0 ? (
                    <tr>
                        <td colSpan={12} className="text-center py-10  font-medium text-brand-subtext text-sm">
                            No leads found.
                        </td>
                    </tr>
                    ) : (
                    data.map((lead, i) => (
                        <tr key={i} className="border-b border-brand-stroke">
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.firstName}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.lastName}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.email}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.phone}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.city}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.state}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.zip}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.bank}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.source}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.income}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.residence}</td>
                            <td className="p-3 font-light text-brand-subtext text-sm">{lead.birthday}</td>
                        </tr>
                    ))
                    )}
                </tbody>
            </table>
        </div>

    </section>
  )
}

export default LeadsDetails


/* ---------- DUMMY DATA FOR NOW ---------- */
const dummyLeads = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@demo.com",
    phone: "555-2121",
    city: "New York",
    state: "NY",
    zip: "10001",
    bank: "PNC Bank",
    source: "Google Ads",
    income: "$4,500",
    residence: "Rent",
    birthday: "1993-04-17",
  },
  {
    firstName: "Sarah",
    lastName: "Lee",
    email: "sarah@demo.com",
    phone: "555-9077",
    city: "Chicago",
    state: "IL",
    zip: "60610",
    bank: "Chase",
    source: "Meta Ads",
    income: "$5,200",
    residence: "Own",
    birthday: "1991-12-10",
  },
];