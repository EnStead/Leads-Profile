import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { ChevronDown, X } from "lucide-react";
import { useDashboard } from "../../../context/DashboardContext";
import api from "../../../utility/axios";
import { useAdminAuth } from "../../../context/AdminContext";
import ToastPop from "../../../utility/ToastPop";

const PREMIUM_BANKS = [
  "JP Morgan Chase",
  "USAA Federal Savings Bank",
  "Truist Bank",
  "TD Bank",
];


const CreateOrder = ({ open, onOpenChange }) => {
  const { usersData, usersLoading, usersError, refetchadminOrder, refetchAdminDashboard } = useDashboard();
  const { user } = useAdminAuth(); // Admin user

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    leadQuantity: "",
    bankPreference: "mixed",
  });



  const [selectedBanks, setSelectedBanks] = useState([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const searchInputRef = useRef(null);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSelectOpen(false);
      }
    };

    if (isSelectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectOpen]);

  useEffect(() => {
  if (isSelectOpen && searchInputRef.current) {
    searchInputRef.current.focus();
  }
}, [isSelectOpen]);


useEffect(() => {
  if (form.bankPreference !== "filtered") return;

  const fetchBanks = async () => {
    try {
      setBanksLoading(true);

      const res = await api.get("/leads/banks", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setBanks(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch banks", err);
    } finally {
      setBanksLoading(false);
    }
  };

  fetchBanks();
}, [form.bankPreference, user?.token]);


  const resetForm = () => {
    setForm({
      customerName: undefined,
      leadQuantity: "",
      bankPreference: "mixed",
    });
    setSelectedBanks([]);
    setIsSelectOpen(false);
  };

  const addCustomBank = (name) => {
  const trimmed = name.trim();

  if (!trimmed) return;

  // Prevent duplicates
  if (selectedBanks.includes(trimmed)) return;

  setSelectedBanks((prev) => [...prev, trimmed]);
  setBankSearch("");
};


  const handleSubmit = async () => {
    if (!form.customerName) {
    setToastType("error");
    setToastMsg("Please select a customer");
    return;
  }

    if (!form.leadQuantity) {
      setToastType("error");
      setToastMsg("Please enter lead quantity");
      return;
    }

    try {
      setLoading(true); // ✅ start loading BEFORE request

      const response = await api.post(
        "/orders",
        {
          clientUserId: form.customerName,
          quantity: Number(form.leadQuantity),
          orderType: form.bankPreference,
          banks: showBankSelector ? selectedBanks : [],
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      setToastType("success");
      setToastMsg("Order created successfully!");

      resetForm();
      refetchadminOrder();
      refetchAdminDashboard();
      onOpenChange(false);
    } catch (error) {
      setToastType("error");
      setToastMsg(error.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false); // ✅ always stop loading
    }
  };

  const handleBankPreferenceChange = (value) => {
    setForm({ ...form, bankPreference: value });
    setSelectedBanks([]); // Clear selected banks when preference changes
  };

  const toggleBank = (bank) => {
    if (selectedBanks.includes(bank)) {
      setSelectedBanks(selectedBanks.filter((b) => b !== bank));
    } else {
      setSelectedBanks([...selectedBanks, bank]);
    }
  };

  const removeBank = (bank) => {
    setSelectedBanks(selectedBanks.filter((b) => b !== bank));
  };

const getBanksList = () => {
  if (form.bankPreference === "filtered") {
    return banks.filter((bank) =>
      bank.name.toLowerCase().includes(bankSearch.toLowerCase())
    );
  }

  if (form.bankPreference === "premium_bank") {
    return PREMIUM_BANKS.filter((bank) =>
      bank.toLowerCase().includes(bankSearch.toLowerCase())
    ).map((name) => ({ name })); // normalize shape
  }

  return [];
};


  const showBankSelector =
    form.bankPreference === "filtered" ||
    form.bankPreference === "premium_bank";

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          {/* BACKDROP */}
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50 backdrop-blur-[2px]" />

          {/* MODAL */}
          <Dialog.Content
            className="  fixed left-1/2 top-1/2 z-50
              w-[420px] xsm:w-[520px]
              max-h-[90vh]
              overflow-y-auto 
              -translate-x-1/2 -translate-y-1/2
              bg-white rounded-2xl p-4 sxm:p-8 shadow-xl  
            "
          >
            {/* CLOSE BUTTON */}
            <Dialog.Close className="absolute top-4 right-6 text-brand-black hover:text-gray-600 text-2xl font-light cursor-pointer">
              ×
            </Dialog.Close>

            {/* HEADER */}
            <Dialog.Title className="text-2xl font-bold mb-2 font-park text-center text-gray-900">
              Create a New Order
            </Dialog.Title>
            <Dialog.Description className="text-brand-subtext mb-6 text-center">
              Set up your customer order, criteria, and lead quantity.
            </Dialog.Description>

            {/* FORM */}
            <div>
              {/* Customer Name & Lead Quantity Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Customer Name */}
                <div className="flex flex-col">
                  <label
                    className={`mb-2 font-medium text-sm  ${
                      form.customerName?.trim() !== ""
                        ? "text-brand-primary"
                        : "text-brand-muted"
                    }`}
                  >
                    Customer Name
                  </label>
                  {usersLoading ? (
                    <p className="text-sm text-gray-500">Loading users...</p>
                  ) : usersError ? (
                    <p className="text-sm text-red-500">Failed to load users</p>
                  ) : (
                    <Select.Root
                      value={form.customerName}
                      onValueChange={(value) =>
                        setForm({ ...form, customerName: value })
                      }
                    >
                      <Select.Trigger className="w-full relative truncate text-xs flex items-center justify-between px-4 py-3 border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gray">
                        <Select.Value
                          className="block flex-1 min-w-0"
                          placeholder="Who needs this order?"
                        />
                        <Select.Icon className="relative z-100">
                          <ChevronDown className="w-4 h-4 z-40 relative" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 z-60">
                          <Select.Viewport className="p-1">
                            {usersData
                              .filter((u) => u.role === "client") // only show clients
                              .map((user) => (
                                <Select.Item
                                  key={user._id}
                                  value={user._id}
                                  className="px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none "
                                >
                                  <Select.ItemText>{user.name}</Select.ItemText>
                                </Select.Item>
                              ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  )}
                </div>

                {/* Lead Quantity */}
                <div className="flex flex-col">
                  <label
                    className={`mb-2 font-medium text-sm  ${
                      form.leadQuantity?.trim() !== ""
                        ? "text-brand-primary"
                        : "text-brand-muted"
                    }`}
                  >
                    Lead Quantity
                  </label>

                  <input
                    type="number"
                    placeholder="Number of leads"
                    value={form.leadQuantity}
                    onChange={(e) =>
                      setForm({ ...form, leadQuantity: e.target.value })
                    }
                    className="w-full px-4 py-3 text-sm border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gray"
                  />
                </div>
              </div>

              {/* Bank Preferences */}
              <div className="mb-6">
                <label className="block mb-3 font-medium text-sm text-brand-muted">
                  Bank Preferences
                </label>
                <RadioGroup.Root
                  value={form.bankPreference}
                  onValueChange={handleBankPreferenceChange}
                  className="flex flex-col gap-3"
                >
                  {/* Mixed Banks */}
                  <RadioGroup.Item value="mixed" asChild>
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        form.bankPreference === "mixed"
                          ? "bg-brand-sky border border-brand-blue"
                          : ""
                      }`}
                    >
                      <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2.5 h-2.5 bg-brand-blue rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm font-park">Mixed Banks</p>
                        <p className="text-xs text-brand-muted">
                          Includes leads from all banks. No filtering applied.
                        </p>
                      </div>
                    </div>
                  </RadioGroup.Item>

                  {/* Filter Banks */}
                  <RadioGroup.Item value="filtered" asChild>
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        form.bankPreference === "filtered"
                          ? "bg-brand-sky border border-brand-blue"
                          : ""
                      }`}
                    >
                      <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2.5 h-2.5 bg-brand-blue rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm font-park">Filter Banks</p>
                        <p className="text-xs text-brand-muted">
                          Only leads from the banks selected will be included in the order.
                        </p>
                      </div>
                    </div>
                  </RadioGroup.Item>

                  {/* Premium Banks */}
                  <RadioGroup.Item value="premium_bank" asChild>
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        form.bankPreference === "premium_bank"
                          ? "bg-brand-sky border border-brand-blue"
                          : ""
                      }`}
                    >
                      <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2.5 h-2.5 bg-brand-blue rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm font-park">Premium Banks</p>
                        <p className="text-xs text-brand-muted">
                          Leads from premium banks are prioritized in the order.
                        </p>
                      </div>
                    </div>
                  </RadioGroup.Item>


                  {/* Credit Unions */}
                  <RadioGroup.Item value="credit_unions" asChild>
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        form.bankPreference === "credit_unions"
                          ? "bg-brand-sky border border-brand-blue"
                          : ""
                      }`}
                    >
                      <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2.5 h-2.5 bg-brand-blue rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm font-park">Credit Unions</p>
                        <p className="text-xs text-brand-muted">
                          The order will exclusively include leads from local credit unions.
                        </p>
                      </div>
                    </div>
                  </RadioGroup.Item>
                </RadioGroup.Root>
              </div>

              {/* Bank Selector - Shows when Filter or Premium is selected */}
              {showBankSelector && (
                <div className="mb-6">
                  <label className="block mb-2 font-medium text-sm text-brand-primary">
                    Search For Banks
                  </label>

                  {/* Custom Multi-Select Dropdown */}
                  <div className="relative " ref={dropdownRef}>
                    <div
                      onClick={() => !isSelectOpen && setIsSelectOpen(true)}
                      className={`w-full flex items-center px-4 py-3 border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl text-sm cursor-text
                        ${isSelectOpen ? "ring-2 ring-brand-gray" : ""}
                      `}
                    >
                      {isSelectOpen ? (
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={bankSearch}
                          onChange={(e) => setBankSearch(e.target.value)}
                          placeholder="Search banks..."
                          className="flex-1 outline-none text-sm bg-transparent"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();

                              const matches = getBanksList();

                              // Only allow adding if nothing matches
                              if (matches.length === 0) {
                                addCustomBank(bankSearch);
                              }
                            }
                          }}
                        />

                      ) : (
                        <span className="flex-1 text-gray-500 truncate cursor-pointer">
                          {selectedBanks.length
                            ? `${selectedBanks.length} bank(s) selected`
                            : "Choose the bank you need for this order..."}
                        </span>
                      )}

                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isSelectOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>


                    {/* Dropdown Menu */}
                    {isSelectOpen && (
                      <div 
                         className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto z-50"
                        style={{ maxHeight: "16rem" }} // optional inline style
                      
                      >

                       
                        {/* BANK LIST */}
                        {banksLoading ? (
                          <p className="p-4 text-sm text-gray-500">
                            Loading banks...
                          </p>
                        ) : getBanksList().length === 0 ? (
                          <p className="p-4 text-sm text-gray-500">
                            Press “Enter” to add bank
                          </p>
                        ) : (
<Select.Root
  value={selectedBanks[0] || ""} // for single select, adapt for multi-select logic
  onValueChange={(value) => toggleBank(value)}
>
  <Select.Trigger className="...">
    <Select.Value placeholder="Choose a bank..." />
    <Select.Icon>
      <ChevronDown />
    </Select.Icon>
  </Select.Trigger>

  <Select.Portal>
    <Select.Content className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto z-50 bg-white border border-gray-200 rounded-xl shadow-lg">
      <Select.Viewport>
        {getBanksList().map((bank) => (
          <Select.Item
            key={bank.name}
            value={bank.name}
            className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
          >
            <Select.ItemText>{bank.name}</Select.ItemText>
            {selectedBanks.includes(bank.name) && <span>✓</span>}
          </Select.Item>
        ))}
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>


                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Banks Tags */}
                  {selectedBanks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedBanks.map((bank) => (
                        <div
                          key={bank}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-brand-royalblue rounded-lg text-sm"
                        >
                          <span>{bank}</span>
                          <button
                            type="button"
                            onClick={() => removeBank(bank)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3 text-brand-red" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-base transition-colors
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-brand-blue hover:bg-blue-700 text-white"
                  }
                  ${showBankSelector ? "" : "mt-12"}
                `}
              >
                {loading ? "Creating order..." : "Start Loading Leads"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className={"z-[9999]"}>
        <ToastPop
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg("")}
        />
      </div>
    </>
  );
};

export default CreateOrder;
