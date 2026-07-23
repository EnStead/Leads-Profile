import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { BANK_CRITERIA } from "./constants";

const StepBankCriteria = ({
  bankCriteria,
  onChangeCriteria,
  selectedBanks,
  onToggleBank,
  banks,
  banksLoading,
  premiumBanks,
  onNext,
  canGoNext,
}) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [dropdownAbove, setDropdownAbove] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const showBankSelector =
    bankCriteria === "filtered" || bankCriteria === "premium_bank";

  const banksList = useMemo(() => {
    let list = [];

    if (bankCriteria === "filtered") {
      list = banks.filter((bank) =>
        bank.name.toLowerCase().includes(bankSearch.toLowerCase()),
      );
    } else if (bankCriteria === "premium_bank") {
      list = premiumBanks
        .filter((bankName) =>
          bankName.toLowerCase().includes(bankSearch.toLowerCase()),
        )
        .map((name) => ({ name }));
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [bankCriteria, bankSearch, banks, premiumBanks]);

  useEffect(() => {
    if (!isSelectOpen) return undefined;

    const onPointerDown = (event) => {
      if (!dropdownRef.current || dropdownRef.current.contains(event.target)) {
        return;
      }
      setIsSelectOpen(false);
      setBankSearch("");
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isSelectOpen]);

  useEffect(() => {
    if (isSelectOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSelectOpen]);

  useEffect(() => {
    if (!isSelectOpen || !dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropdownAbove(spaceBelow < 256);
  }, [isSelectOpen]);

  const groupedBanks = useMemo(() => {
    return banksList.reduce((acc, bank) => {
      const letter = (bank.name.charAt(0) || "#").toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(bank);
      return acc;
    }, {});
  }, [banksList]);

  return (
    <div className="flex flex-1 flex-col space-y-8">
      <div>
        <h3 className="text-lg font-park font-semibold text-brand-blackish">
          What kind of leads do you need?
        </h3>
        <p className="mt-2 text-sm text-brand-body">
          Choose the bank criteria and how many leads you want.
        </p>
      </div>

      <div className="space-y-3">
        {BANK_CRITERIA.map((option) => {
          const isSelected = bankCriteria === option.id;
          return (
            <div
              key={option.id}
              className={`rounded-xl border px-4 py-3 transition ${
                isSelected
                  ? "border-2 border-brand-blue bg-brand-white"
                  : "border-brand-stroke bg-brand-white"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsSelectOpen(false);
                  setBankSearch("");
                  onChangeCriteria(option.id);
                }}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-park font-semibold text-brand-blackish">
                      {option.label}
                    </h4>
                    <p className="mt-1 text-xs text-brand-label">
                      {option.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-brand-blue" : "border-brand-label/70"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSelected ? "bg-brand-blue" : "bg-transparent"
                      }`}
                    />
                  </span>
                </div>
              </button>

              {isSelected && showBankSelector && (
                <div className="mt-4 space-y-3">
                  <label className="text-sm font-medium text-brand-label">
                    Search For Banks
                  </label>

                  <div className="relative z-[80]" ref={dropdownRef}>
                    <div
                      onMouseDown={(event) => {
                        event.stopPropagation();
                        setIsSelectOpen((prev) => !prev);
                      }}
                      className={`flex gap-2 w-full cursor-text items-center rounded-xl border border-brand-label/60 bg-brand-white px-4 py-3 text-sm ${
                        isSelectOpen ? "ring-2 ring-brand-lightblue" : ""
                      }`}
                    >
                      {isSelectOpen ? (
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={bankSearch}
                          onChange={(event) => setBankSearch(event.target.value)}
                          onMouseDown={(event) => event.stopPropagation()}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") return;
                            event.preventDefault();
                          }}
                          placeholder="Search banks..."
                          className="flex-1 bg-transparent text-sm text-brand-blackish outline-none"
                        />
                      ) : (
                        <span className="flex-1 truncate text-brand-placeholder">
                          {selectedBanks.length
                            ? `${selectedBanks.length} bank(s) selected`
                            : "Choose the bank you need for this order..."}
                        </span>
                      )}

                      <ChevronDown
                        className={`h-5 w-5 text-brand-label transition-transform cursor-pointer ${
                          isSelectOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {isSelectOpen && (
                      <div
                        onMouseDown={(event) => event.stopPropagation()}
                        className="absolute left-0 right-0 z-[90] max-h-64 overflow-y-auto rounded-xl border border-brand-stroke bg-white shadow-lg pointer-events-auto"
                        style={{
                          top: dropdownAbove ? "auto" : "100%",
                          bottom: dropdownAbove ? "100%" : "auto",
                          marginTop: dropdownAbove ? 0 : "0.5rem",
                          marginBottom: dropdownAbove ? "0.5rem" : 0,
                        }}
                      >
                        {banksLoading ? (
                          <p className="p-4 text-sm text-brand-label">
                            Loading banks...
                          </p>
                        ) : banksList.length === 0 ? (
                          <p className="p-4 text-sm text-brand-label">
                            No banks found
                          </p>
                        ) : (
                          Object.keys(groupedBanks)
                            .sort()
                            .map((letter) => (
                              <div key={letter} className="bg-brand-white">
                                {/* <div className="sticky top-0 border-y border-brand-stroke bg-brand-offwhite px-4 py-1 text-xs font-semibold text-brand-label">
                                  {letter}
                                </div> */}
                                {groupedBanks[letter].map((bank) => {
                                  const selected = selectedBanks.includes(
                                    bank.name,
                                  );
                                  return (
                                    <button
                                      key={bank.name}
                                      type="button"
                                      onClick={() => onToggleBank(bank.name)}
                                      onMouseDown={(event) => event.stopPropagation()}
                                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-brand-offwhite ${
                                        selected ? "bg-brand-lightblue" : ""
                                      }`}
                                    >
                                      <div>
                                        <p className="text-sm text-brand-body">
                                          {bank.name}
                                        </p>
                                        {/* {bank.count ? (
                                          <p className="text-xs text-brand-label">
                                            {bank.count} leads available
                                          </p>
                                        ) : null} */}
                                      </div>
                                      {selected ? (
                                        <span className="text-sm text-brand-blue">
                                          <Check size={14} />
                                        </span>
                                      ) : null}
                                    </button>
                                  );
                                })}
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>


                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="mt-auto w-full max-w-[260px] rounded-xl bg-brand-blackish px-6 py-2 font-semibold text-brand-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Next
      </button>
    </div>
  );
};

export default StepBankCriteria;
