import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { ChevronDown, X } from "lucide-react";
import { useDashboard } from "../../../context/DashboardContext";
import api from "../../../utility/axios";
import { useAdminAuth } from "../../../context/AdminContext";
import ToastPop from "../../../utility/ToastPop";

const FILTER_BANKS = [
  "Wells Fargo Bank",
  "CitiBank",
  "Bank of America",
  "Capital One",
  "PNC Bank",
  "Chase Bank",
  "TD Bank"
];

const PREMIUM_BANKS = [
  "Goldman Sachs",
  "Morgan Stanley",
  "J.P. Morgan Private Bank",
  "Citi Private Bank",
  "Bank of America Private Bank",
  "UBS",
  "Credit Suisse"
];

const CreateOrder = ({ open, onOpenChange }) => {

  const { usersData, usersLoading, usersError,} = useDashboard();
  const { user } = useAdminAuth(); // Admin user

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("");



  const [form, setForm] = useState({
    customerName: "",
    leadQuantity: "",
    bankPreference: "mixed"
  });
  
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
   const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSelectOpen(false);
      }
    };

    if (isSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelectOpen]);

  const resetForm = () => {
    setForm({
      customerName: "",
      leadQuantity: "",
      bankPreference: "mixed",
    });
    setSelectedBanks([]);
    setIsSelectOpen(false);
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
        banks: showBankSelector ? selectedBanks : []
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
    onOpenChange(false);

  } catch (error) {
    setToastType("error");
    setToastMsg(
      error.response?.data?.message || "Failed to create order"
    );
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
      setSelectedBanks(selectedBanks.filter(b => b !== bank));
    } else {
      setSelectedBanks([...selectedBanks, bank]);
    }
  };

  const removeBank = (bank) => {
    setSelectedBanks(selectedBanks.filter(b => b !== bank));
  };

  const getBanksList = () => {
    if (form.bankPreference === "filtered") return FILTER_BANKS;
    if (form.bankPreference === "premium_bank") return PREMIUM_BANKS;
    return [];
  };

  

  const showBankSelector = form.bankPreference === "filtered" || form.bankPreference === "premium_bank";

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
              hide-scrollbar
              -translate-x-1/2 -translate-y-1/2
              bg-white rounded-2xl p-8 shadow-xl  
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
                  <label className={`mb-2 font-medium text-sm  ${form.customerName?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}>
                    Customer Name
                  </label>
                  {usersLoading ? (
                      <p className="text-sm text-gray-500">Loading users...</p>
                    ) : usersError ? (
                      <p className="text-sm text-red-500">Failed to load users</p>
                    ) : (
                      <Select.Root
                        value={form.customerName}
                        onValueChange={(value) => setForm({ ...form, customerName: value })}
                      >
                        <Select.Trigger className="w-full text-sm flex items-center justify-between px-4 py-3 border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gray">
                          <Select.Value placeholder="Who needs this order?" />
                          <Select.Icon>
                            <ChevronDown className="w-4 h-4" />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 z-60">
                            <Select.Viewport className="p-1">
                              {usersData
                                .filter(u => u.role === "client") // only show clients
                                .map(user => (
                                  <Select.Item
                                    key={user._id}
                                    value={user._id}
                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                                  >
                                    <Select.ItemText>{user.name}</Select.ItemText>
                                  </Select.Item>
                                ))
                              }
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                  )}
                </div>

                {/* Lead Quantity */}
                <div className="flex flex-col">
                  <label className={`mb-2 font-medium text-sm  ${form.leadQuantity?.trim() !== "" ? "text-brand-primary" : "text-brand-muted"}`}>
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
                  <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 ${form.bankPreference === 'mixed' ? 'bg-brand-sky border border-brand-blue' : ''}`}>
                    <RadioGroup.Item
                      value="mixed"
                      id="mixed"
                      className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer data-[state=checked]:border-brand-blue data-[state=checked]:border-[6px]"
                    />
                    <div className="flex-1">
                      <label htmlFor="mixed" className="block font-semibold text-brand-primary text-sm cursor-pointer">
                        Mixed Banks
                      </label>
                      <p className="text-brand-muted text-xs mt-0.5">
                        Includes leads from all banks. No filtering applied.
                      </p>
                    </div>
                  </div>

                  {/* Filter Banks */}
                  <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 ${form.bankPreference === 'filter' ? 'bg-brand-sky border border-brand-blue' : ''}`}>
                    <RadioGroup.Item
                      value="filtered"
                      id="filtered"
                      className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer data-[state=checked]:border-brand-blue data-[state=checked]:border-[6px]"
                    />
                    <div className="flex-1">
                      <label htmlFor="filtered" className="block font-semibold text-brand-primary text-sm cursor-pointer">
                        Filter Banks
                      </label>
                      <p className="text-brand-muted text-xs mt-0.5">
                        Only leads from the banks selected will be included in the order.
                      </p>
                    </div>
                  </div>

                  {/* Premium Banks */}
                  <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 ${form.bankPreference === 'premium' ? 'bg-brand-sky border border-brand-blue' : ''}`}>
                    <RadioGroup.Item
                      value="premium_bank"
                      id="premium_bank"
                      className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer data-[state=checked]:border-brand-blue  data-[state=checked]:border-[6px]"
                    />
                    <div className="flex-1">
                      <label htmlFor="premium_bank" className="block font-semibold text-brand-primary text-sm cursor-pointer">
                        Premium Banks
                      </label>
                      <p className="text-brand-muted text-xs mt-0.5">
                        Leads from premium banks are prioritized in the order.
                      </p>
                    </div>
                  </div>

                  {/* Credit Unions */}
                  <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 ${form.bankPreference === 'credit' ? 'bg-brand-sky border border-brand-blue' : ''}`}>
                    <RadioGroup.Item
                      value="credit_unions"
                      id="credit_unions"
                      className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer data-[state=checked]:border-brand-blue data-[state=checked]:border-[6px]"
                    />
                      <div className="flex-1" >
                          <label htmlFor="credit_unions" className="block font-semibold text-brand-primary text-sm cursor-pointer">
                          Credit Unions
                          </label>
                          <p className="text-brand-muted text-xs mt-0.5">
                          The order will exclusively include leads from local credit unions.
                          </p>
                      </div>
                  </div>
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
                    <button
                      type="button"
                      onClick={() => setIsSelectOpen(!isSelectOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-b-brand-gray bg-brand-white border-t-0 border-x-0 rounded-xl text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gray"
                    >
                      <span>Choose the bank you need for this order...</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isSelectOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                        {getBanksList().map((bank) => (
                          <div
                            key={bank}
                            onClick={() => toggleBank(bank)}
                            className={`px-4 py-2.5 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                              selectedBanks.includes(bank) ? 'bg-blue-50' : ''
                            }`}
                          >
                            <span className="text-sm text-gray-700">{bank}</span>
                            {selectedBanks.includes(bank) && (
                              <span className="text-brand-blue text-sm">✓</span>
                            )}
                          </div>
                        ))}
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
                  ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-brand-blue hover:bg-blue-700 text-white"}
                  ${showBankSelector ? "" : "mt-12"}
                `}
              >
                {loading ? "Creating order..." : "Start Loading Leads"}
              </button>

            </div>
            
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      <div className={'z-[9999]'}>
        <ToastPop
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg("")}
        />
      </div>

    </>


  );
};

export default CreateOrder