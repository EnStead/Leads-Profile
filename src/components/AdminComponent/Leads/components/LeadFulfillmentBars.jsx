import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";

const LeadFulfillmentBars = ({ current = 0, total = 0 }) => {
  const totalSegments = 32;
  const ratio = total > 0 ? Math.min(current / total, 1) : 0;
  const activeSegments = Math.round(ratio * totalSegments);
  const barRefs = useRef([]);

  const segmentStates = useMemo(
    () =>
      Array.from({ length: totalSegments }).map((_, index) => ({
        index,
        active: index < activeSegments,
      })),
    [activeSegments],
  );

  useLayoutEffect(() => {
    const activeBars = barRefs.current.slice(0, activeSegments).filter(Boolean);
    if (!activeBars.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        activeBars,
        {
          scaleY: 0,
          opacity: 0.45,
          transformOrigin: "bottom center",
        },
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.15,
          ease: "power2.out",
          stagger: 0.02,
          clearProps: "transform",
        },
      );
    });

    return () => ctx.revert();
  }, [activeSegments]);

  return (
    <div className="mt-4 flex items-center gap-x-1.5">
      {segmentStates.map(({ index, active }) => (
        <span
          key={index}
          ref={(node) => {
            barRefs.current[index] = node;
          }}
          className={`h-12 w-2 rounded-full transition-colors duration-300 ${
            active ? "bg-brand-skyblue" : "bg-brand-offwhite"
          }`}
        />
      ))}
    </div>
  );
};

export default LeadFulfillmentBars;
