import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const GsapCounter = ({
  value = 0,
  duration = 1.2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}) => {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const [displayValue, setDisplayValue] = useState(0);
  const proxyRef = useRef({ value: 0 });

  useLayoutEffect(() => {
    gsap.killTweensOf(proxyRef.current);

    const tween = gsap.to(proxyRef.current, {
      value: safeValue,
      duration,
      ease: "power2.out",
      overwrite: "auto",
      onUpdate: () => {
        const nextValue = proxyRef.current.value;
        setDisplayValue(
          decimals > 0
            ? Number(nextValue.toFixed(decimals))
            : Math.round(nextValue),
        );
      },
    });

    return () => tween.kill();
  }, [safeValue, duration, decimals]);

  const formattedValue =
    decimals > 0
      ? displayValue.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : displayValue.toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};

export default GsapCounter;
