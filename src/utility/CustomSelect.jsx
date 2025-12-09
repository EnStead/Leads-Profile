import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Vector from '../assets/Vector.svg'

const CustomSelect = ({ label, options, value, onChange,classNameLabel, classNameSelect,classNameInput }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null);
  const listRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (toggleRef.current && !toggleRef.current.contains(e.target) &&
          listRef.current && !listRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // compute position for portal
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  useEffect(() => {
    if (isOpen && toggleRef.current) {
      const rect = toggleRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <label className={`mb-1 font-medium ${classNameLabel} block`}>{label}</label>
      <div
        ref={toggleRef}
        className={`border ${classNameInput} ${classNameSelect} rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || "Select"}</span>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <img src={Vector} alt="Vector" className="object-contain"  />
        </span>
      </div>

      {isOpen &&
        createPortal(
          <ul
            ref={listRef}
            className="bg-white border border-brand-planoff rounded-xl shadow-lg max-h-60 overflow-y-auto z-[9999] p-1"
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              minWidth: pos.width,
              WebkitOverflowScrolling: "touch"
            }}
          >
            {options.map((option) => {
              const [title, example] = option.split("Eg:");
              
              return (
                <li
                  key={option}
                  className="px-4 py-3 hover:bg-brand-blue hover:text-white cursor-pointer rounded-md"
                  onClick={() => handleSelect(option)}
                >
                  <span className="font-medium block">{title.trim()}</span>

                  {example && (
                    <span className="block text-xs text-gray-500 mt-1">
                      Eg: {example.trim()}
                    </span>
                  )}
                </li>
              );
            })}

          </ul>,
          document.body
        )}
    </div>
  );
};

export default CustomSelect;
