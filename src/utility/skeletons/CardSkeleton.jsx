const CardSkeleton = () => {
  return (
    <div className="bg-brand-white border border-brand-offwhite rounded-2xl p-6 h-50 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="w-28 h-4 bg-gray-200 rounded"></div>
      </div>

      {/* Big number */}
      <div className="w-20 h-8 bg-gray-200 rounded mb-4"></div>

      {/* Subtext */}
      <div className="w-32 h-3 bg-gray-200 rounded"></div>
    </div>
  );
};

export default CardSkeleton;
