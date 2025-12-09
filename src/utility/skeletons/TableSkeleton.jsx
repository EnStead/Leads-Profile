const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {[...Array(columns)].map((_, idx) => (
              <th
                key={idx}
                className="px-4 py-2 text-left"
              >
                <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIdx) => (
            <tr key={rowIdx} className="border-t border-gray-200">
              {[...Array(columns)].map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-2">
                  <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
