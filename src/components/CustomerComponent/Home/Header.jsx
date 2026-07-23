import { useEffect, useState } from "react";
import UsaFlag from "../../../assets/usa.webp";
import CanadaFlag from "../../../assets/canada.png";
import { useAuth } from "../../../context/AuthContext";

const Header = () => {
  const { user } = useAuth();
  const firstName =
    user?.user?.firstName || user?.user?.name?.split(" ")[0] || "User";

  const [timeOfDay, setTimeOfDay] = useState("day");

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) setTimeOfDay("dawn");
      else if (hour >= 8 && hour < 17) setTimeOfDay("day");
      else if (hour >= 17 && hour < 21) setTimeOfDay("evening");
      else setTimeOfDay("midnight");
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    switch (timeOfDay) {
      case "dawn":
        return {
          title: `Good Morning ⛅, ${firstName}`,
          subtitle: "Here is what is happening with your leads today.",
        };
      case "evening":
        return {
          title: `Good Evening 🌛, ${firstName}`,
          subtitle: "Here is how your leads performed today.",
        };
      case "midnight":
        return {
          title: `Late Night Session 🌚, ${firstName}`,
          subtitle: "Everything is still moving and ready when you are.",
        };
      case "day":
      default:
        return {
          title: `Welcome Back 👋, ${firstName}`,
          subtitle: "Your leads and orders are all set.",
        };
    }
  };

  const { title, subtitle } = getGreeting();

  return (
    <header className="mb-4 py-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <h2 className="font-park text-2xl font-bold tracking-tight text-brand-blackish sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm text-brand-label sm:text-base">
          {subtitle}
        </p>
      </div>

      <div className="flex w-full items-center justify-start lg:w-auto lg:justify-end">
        <div
          aria-label="Selected Country"
          className="relative inline-flex w-full max-w-[320px] cursor-default rounded-full border border-brand-lightblue bg-brand-sky p-1 sm:w-auto"
        >
          <div className="absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] rounded-full bg-brand-lightblue" />
          <div className="relative z-10 flex w-full gap-1">
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-brand-blackish">
              <img
                src={UsaFlag}
                alt="USA flag"
                className="h-7 w-7 rounded-full"
              />
              USA
            </div>
            <div className="group relative flex min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-brand-placeholder">
              <img
                src={CanadaFlag}
                alt="Canada flag"
                className="h-7 w-7 rounded-full"
              />
              Canada

              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-blackish px-3 py-2 text-xs font-medium text-brand-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Currently unavailable
                <div className="absolute top-full left-1/2 -mt-1.5 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-brand-blackish" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
