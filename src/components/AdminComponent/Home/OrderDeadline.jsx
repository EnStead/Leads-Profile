import { useEffect, useState } from "react";
import { useAdminAuth } from "../../../context/AdminContext";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import Picker from "react-mobile-picker";
import { ChevronDown } from "lucide-react";
import api from "../../../utility/axios";
import { useAdminDashboard } from "../../../context/DashboardContext";
import { useAppToast } from "../../../utility/appToastContext";

/* ================= CONSTANTS ================= */

const WEEKDAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 7 },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/* ================= COMPONENT ================= */

const OrderDeadline = ({ open, onOpenChange }) => {
  const { user } = useAdminAuth();
  const { deadlineData, deadlineLoading, deadlineError, refetchDeadline } =
    useAdminDashboard();

  const [weekday, setWeekday] = useState(null);
  const [time, setTime] = useState({ hour: 0, minute: 0 });
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { showToast } = useAppToast();

  useEffect(() => {
    if (!open) {
      setShowTimePicker(false);
      return;
    }

    if (!deadlineData?.data) return;

    const { weekday, hour, minute } = deadlineData.data;

    setWeekday(weekday);
    setTime({ hour, minute });
  }, [open, deadlineData]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      weekday,
      hour: time.hour,
      minute: time.minute,
    };

    try {
      setLoading(true);
      const res = await api.put("/api/v1/orders/admin/cutoff", payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      // console.log("Customer created:", res.data);

      showToast({
        type: "success",
        title: "Deadline Updated",
        subtitle: res.data.message || "Changes saved successfully",
      });
      refetchDeadline();
      onOpenChange(false);
    } catch (err) {
      // console.log(err)
      showToast({
        type: "error",
        title: "Update Failed",
        subtitle: err?.response?.data?.message || "Failed to update deadline",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay fixed inset-0 bg-black/30 z-50 backdrop-blur-[2px] " />

          <Dialog.Content
            onAnimationEnd={(e) => {
              if (e.animationName === "modalShrink") {
                // optional: any cleanup
              }
            }}
            className="modal-content fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[520px] bg-white rounded-2xl p-8 shadow-xl focus:outline-none "
          >
            <Dialog.Close className="absolute top-4 right-6 text-2xl cursor-pointer">
              ×
            </Dialog.Close>

            <Dialog.Title className="text-2xl font-bold text-center mb-2">
              Order Cutoff Time
            </Dialog.Title>
            <Dialog.Description className="text-center text-brand-subtext mb-6">
              Set the day and time when orders stop.
            </Dialog.Description>

            {deadlineLoading || !deadlineData ? (
              <p className="text-center py-10">Loading deadline...</p>
            ) : deadlineError ? (
              <p className="text-center text-red-500">
                Failed to load deadline
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* WEEKDAY SELECT */}
                <div>
                  <label className="block mb-2 font-medium">
                    Day of the week
                  </label>

                  <Select.Root
                    value={weekday ? String(weekday) : undefined}
                    onValueChange={(value) => setWeekday(Number(value))}
                  >
                    <Select.Trigger className="w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-gray">
                      <Select.Value placeholder="Select a day" />
                      <Select.Icon>
                        <ChevronDown size={16} />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content
                        position="popper"
                        sideOffset={6}
                        className="z-[9999] bg-white shadow-lg rounded-xl border select-content-animate"
                      >
                        <Select.Viewport className="p-1">
                          {WEEKDAYS.map((d) => (
                            <Select.Item
                              key={d.value}
                              value={String(d.value)}
                              className="relative flex items-center px-4 py-2 text-sm rounded cursor-pointer select-none outline-none focus:bg-gray-100 data-[state=checked]:bg-brand-primary/10"
                            >
                              <Select.ItemText>{d.label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* TIME PICKER */}
                <div>
                  <label className="block mb-2 font-medium">
                    Time to stop orders
                  </label>

                  {/* INPUT FIELD */}
                  <input
                    type="text"
                    readOnly
                    value={
                      time
                        ? `${String(time.hour).padStart(2, "0")}:${String(
                            time.minute,
                          ).padStart(2, "0")}`
                        : ""
                    }
                    onClick={() => setShowTimePicker(true)}
                    placeholder="Select time"
                    className="w-full px-4 py-3 border rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-gray"
                  />

                  {/* PICKER MODAL */}
                  {showTimePicker && (
                    <div className="relative mt-4 border rounded-2xl bg-white shadow-lg p-4">
                      <div className="flex justify-center gap-12">
                        <Picker
                          value={time}
                          onChange={setTime}
                          wheelMode="natural"
                          className="gap-10"
                        >
                          <Picker.Column
                            name="hour"
                            className="cursor-pointer w-20 "
                          >
                            {HOURS.map((h) => (
                              <Picker.Item key={h} value={h} className="">
                                {String(h).padStart(2, "0")}
                              </Picker.Item>
                            ))}
                          </Picker.Column>

                          <Picker.Column
                            name="minute"
                            className="cursor-pointer w-20"
                          >
                            {MINUTES.map((m) => (
                              <Picker.Item key={m} value={m} className="">
                                {String(m).padStart(2, "0")}
                              </Picker.Item>
                            ))}
                          </Picker.Column>
                        </Picker>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowTimePicker(false)}
                          className="px-4 py-2 text-sm rounded-lg border"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowTimePicker(false)}
                          className="px-4 py-2 text-sm rounded-lg bg-brand-blue text-white"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-blue text-white py-3 rounded-xl font-semibold transition-colors duration-200 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Deadline"}
                </button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </>
  );
};

export default OrderDeadline;
