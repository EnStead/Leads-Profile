// src/components/ui/Pagination.jsx
import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages === 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 1; // pages before & after current

    const rangeStart = Math.max(2, page - delta);
    const rangeEnd = Math.min(totalPages - 1, page + delta);

    // Always include first page
    pages.push(1);

    // Left ellipsis
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Middle pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    // Always include last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

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
      {pages.map((num, index) =>
        num === "..." ? (
          <span
            key={`dots-${index}`}
            className="px-3 py-2 text-brand-subtext"
          >
            …
          </span>
        ) : (
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
        )
      )}

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
