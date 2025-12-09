// src/components/ui/Pagination.jsx
import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages) return null;

  const visiblePages = 5; // how many numbers to show max
  const start = Math.max(1, page - Math.floor(visiblePages / 2));
  const end = Math.min(totalPages, start + visiblePages - 1);

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">

      {/* PREVIOUS */}
      <button
        className="px-3 py-2 border rounded-lg disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>

      {/* PAGE NUMBERS */}
      {pages.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-2 rounded-lg border ${
            num === page
              ? "bg-brand-primary text-white"
              : "bg-white text-brand-subtext"
          }`}
        >
          {num}
        </button>
      ))}

      {/* NEXT */}
      <button
        className="px-3 py-2 border rounded-lg disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>

    </div>
  );
};

export default Pagination;
