

const Pagination = ({ page, totalPages, onPageChange, loading }) => {
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
        className="px-3 py-2 text-brand-label border border-brand-body rounded-lg disabled:opacity-50 transition-colors duration-200 hover:bg-brand-white hover:text-brand-blackish disabled:hover:bg-transparent disabled:hover:text-brand-label"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || loading}
      >
        Previous
      </button>

      {/* PAGE NUMBERS */}
      {pages.map((num, index) =>
        num === "..." ? (
          <span
            key={`dots-${index}`}
            className="px-3 py-2 text-brand-body"
          >
            …
          </span>
        ) : (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
              num === page
                ? "bg-brand-blackish text-brand-white"
                : "bg-brand-white text-brand-body hover:bg-brand-gray/20 hover:text-brand-primary"
            }`}
          >
            {num}
          </button>
        )
      )}

      {/* NEXT */}
      <button
        className="px-3 py-2 text-brand-label border border-brand-body rounded-lg disabled:opacity-50 transition-colors duration-200 hover:bg-gray-50 hover:text-brand-primary disabled:hover:bg-transparent disabled:hover:text-inherit"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || loading}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
