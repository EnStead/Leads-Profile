import { useState } from "react";

const ExpandableText = ({ text, maxLength = 50 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return "-";

  const isLong = text.length > maxLength;

  return (
    <span className="inline">
      <span>
        {expanded || !isLong ? text : text.slice(0, maxLength) + "..."}
      </span>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-2 text-brand-blue text-xs font-medium hover:underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </span>
  );
};

export default ExpandableText;
