import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronsRight, Minus, Plus } from "lucide-react";
import {
  DAYS,
  DELIVERY_TYPES,
  SUGGESTED_QUANTITIES,
  WEEKS,
  getAllowedEndDays,
} from "./constants";

const StepDelivery = ({
  deliveryType,
  onChangeDeliveryType,
  quantity,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onSetQuantity,
  selectedDay,
  onSetSelectedDay,
  selectedEndDay,
  onSetSelectedEndDay,
  selectedWeek,
  onSetSelectedWeek,
  onSubmit,
  isSubmitting = false,
  submitError = "",
}) => {
  const [isStartDayOpen, setIsStartDayOpen] = useState(false);
  const [isEndDayOpen, setIsEndDayOpen] = useState(false);
  const [startDayPosition, setStartDayPosition] = useState("bottom");
  const [endDayPosition, setEndDayPosition] = useState("bottom");
  const startDayRef = useRef(null);
  const endDayRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startDayRef.current && !startDayRef.current.contains(event.target)) {
        setIsStartDayOpen(false);
      }
      if (endDayRef.current && !endDayRef.current.contains(event.target)) {
        setIsEndDayOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const DROPDOWN_HEIGHT_ESTIMATE = 250; // max-h-60 is 240px, give a little buffer

    const checkPosition = (ref, setPosition) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Only open upwards if there's not enough space below AND there's enough space above
      if (spaceBelow < DROPDOWN_HEIGHT_ESTIMATE && rect.top > DROPDOWN_HEIGHT_ESTIMATE) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    };

    if (isStartDayOpen) checkPosition(startDayRef, setStartDayPosition);
    if (isEndDayOpen) checkPosition(endDayRef, setEndDayPosition);
  }, [isStartDayOpen, isEndDayOpen]);

  const endDayOptions = getAllowedEndDays(selectedDay).filter((day) => day !== selectedDay);
  const showDurationDropdowns = deliveryType === "staggered";

  return (
    <div className="flex flex-1 flex-col space-y-7">
      <div>
        <h3 className="text-lg font-park font-semibold text-brand-blackish">
          How should your leads be delivered?
        </h3>
        <p className="mt-2 text-sm text-brand-body">
          Choose when and how your order should be fulfilled.
        </p>
      </div>

      <div className="inline-flex w-full items-center justify-between rounded-full bg-brand-white p-1 mx-auto">
        {DELIVERY_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChangeDeliveryType(type.id)}
            className={`font-sans rounded-full px-8 py-2 text-sm transition ${
              deliveryType === type.id
                ? "bg-brand-royalblue font-medium text-brand-white"
                : "text-brand-body font-light hover:bg-brand-lightblue/30"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-brand-skyblue bg-brand-white px-4 py-4">
        <h4 className="text-center font-park font-semibold text-brand-blackish">
          {deliveryType === "scheduled"
            ? "How many leads per Week do you need?"
            : deliveryType === "staggered"
              ? "How many leads per Day do you need?"
              : "How many leads do you need?"}
        </h4>

        <div className="mt-3 flex items-center justify-center gap-12">
          <button
            type="button"
            onClick={onDecreaseQuantity}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-stroke text-brand-blackish"
            aria-label="Decrease quantity"
          >
            <Minus size={18} />
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              onSetQuantity(val === "" ? "" : Number(val));
            }}
            onBlur={() => {
              if (!quantity) onSetQuantity(500);
            }}
            className="w-40 bg-transparent text-center font-park text-4xl font-bold text-brand-blue outline-none"
          />
          <button
            type="button"
            onClick={onIncreaseQuantity}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-stroke text-brand-blackish"
            aria-label="Increase quantity"
          >
            <Plus size={18} />
          </button>
        </div>

        <p className="mt-2 text-center text-xs font-medium text-brand-body">
          Suggested Leads Amount:
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {SUGGESTED_QUANTITIES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onSetQuantity(value)}
              className={`rounded-lg border px-4 py-1 text-xs transition ${
                quantity === value
                  ? "border-brand-blue bg-brand-lightblue/50 text-brand-royalblue"
                  : "border-brand-stroke text-brand-label hover:border-brand-blue/40"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {deliveryType === "scheduled" ? (
        <div>
          <h4 className="font-park text-lg font-semibold text-brand-blackish">
            How long should the delivery run?
          </h4>
          <p className="mt-1 text-xs font-light text-brand-label">
            Distribute your order across multiple weeks.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {WEEKS.map((week) => (
              <button
                key={week}
                type="button"
                onClick={() => onSetSelectedWeek(week)}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  selectedWeek === week
                    ? "bg-brand-purple text-brand-offwhite"
                    : "bg-brand-white text-brand-blackish hover:bg-brand-lightblue/30"
                }`}
              >
                {week} Week{week > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showDurationDropdowns ? (
        <div>
          <h4 className="font-park text-lg font-semibold text-brand-blackish">
            Choose the duration for your order.
          </h4>
          <p className="mt-1 text-xs font-light text-brand-label">
            Spread your leads over several days, from your start day to an end day.
          </p>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
            <div className="relative block" ref={startDayRef}>
              <span className="pointer-events-none absolute left-5 top-4 z-10 text-xs font-medium text-brand-label">
                Starts Delivery on
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsStartDayOpen((prev) => !prev);
                  setIsEndDayOpen(false);
                }}
                className={`block h-[72px] w-full appearance-none rounded-lg bg-brand-white px-5 pb-1 pt-7 text-left text-sm font-light text-brand-blackish outline-none transition focus:ring-2 focus:ring-brand-blue/20 ${
                  isStartDayOpen ? "ring-2 ring-brand-blue/20" : ""
                }`}
              >
                {selectedDay || "Select day"}
              </button>
              <ChevronDown
                size={22}
                className={`pointer-events-none absolute bottom-3 right-5 text-brand-blackish transition-transform ${
                  isStartDayOpen ? "rotate-180" : ""
                }`}
              />

              {isStartDayOpen && (
                <div
                  className={`absolute left-0 z-[100] w-full max-h-60 overflow-y-auto rounded-xl border border-brand-stroke bg-brand-white p-2 shadow-lg ${
                    startDayPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
                  }`}
                >
                  {DAYS.map((day) => {
                    const isSelected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          onSetSelectedDay(day);
                          setIsStartDayOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 text-left text-base outline-none transition-colors hover:bg-brand-sky hover:text-brand-blackish focus:bg-brand-sky focus:text-brand-blackish ${
                          isSelected ? "bg-brand-sky text-brand-blackish" : "text-brand-body"
                        }`}
                      >
                        <span>{day}</span>
                        {isSelected && <Check size={16} className="text-brand-blue" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center text-brand-label">
              <ChevronsRight size={32} strokeWidth={2.4} />
            </div>

            <div className="relative block" ref={endDayRef}>
              <span className="pointer-events-none absolute left-5 top-4 z-10 text-xs font-medium text-brand-label">
                End Delivery on
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsEndDayOpen((prev) => !prev);
                  setIsStartDayOpen(false);
                }}
                className={`block h-[72px] w-full appearance-none rounded-lg bg-brand-white px-5 pb-1 pt-7 text-left text-sm font-light text-brand-blackish outline-none transition focus:ring-2 focus:ring-brand-blue/20 ${
                  isEndDayOpen ? "ring-2 ring-brand-blue/20" : ""
                }`}
              >
                {selectedEndDay || "Select day"}
              </button>
              <ChevronDown
                size={22}
                className={`pointer-events-none absolute bottom-3 right-5 text-brand-blackish transition-transform ${
                  isEndDayOpen ? "rotate-180" : ""
                }`}
              />

              {isEndDayOpen && (
                <div
                  className={`absolute left-0 z-[100] w-full max-h-60 overflow-y-auto rounded-xl border border-brand-stroke bg-brand-white p-2 shadow-lg ${
                    endDayPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
                  }`}
                >
                  {endDayOptions.map((day) => {
                    const isSelected = selectedEndDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          onSetSelectedEndDay(day);
                          setIsEndDayOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-2.5 text-left text-base outline-none transition-colors hover:bg-brand-sky hover:text-brand-blackish focus:bg-brand-sky focus:text-brand-blackish ${
                          isSelected ? "bg-brand-sky text-brand-blackish" : "text-brand-body"
                        }`}
                      >
                        <span>{day}</span>
                        {isSelected && <Check size={16} className="text-brand-blue" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : deliveryType === "standard" ? (
        <div>
          <h4 className="font-park text-lg font-semibold text-brand-blackish">
            What day do you want it delivered?
          </h4>
          <p className="mt-1 text-xs font-light text-brand-label">
            Get your full order on your selected day next week.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => onSetSelectedDay(day)}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  selectedDay === day
                    ? "bg-brand-purple text-brand-offwhite"
                    : "bg-brand-white text-brand-body hover:bg-brand-lightblue/30"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="mt-auto w-full max-w-[260px] rounded-xl bg-brand-blackish px-6 py-2 font-semibold text-brand-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Order"}
      </button>
      {submitError ? (
        <p className="max-w-[320px] text-sm text-brand-red">{submitError}</p>
      ) : null}
    </div>
  );
};

export default StepDelivery;
