import { useEffect, useState } from "react";
import { useAdminAuth } from "../../../context/AdminContext";

const Header = ({ actions }) => {
  const { user } = useAdminAuth();
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
          title: `Good Morning 👋, ${firstName}`,
          subtitle: "Let's get the lead-ing started",
        };
      case "evening":
        return {
          title: `Good Evening 🌙, ${firstName}`,
          subtitle: "Here's how your leads performed today.",
        };
      case "midnight":
        return {
          title: `Late Night Session 🌚, ${firstName}`,
          subtitle: "Always prepared for you; things are still moving here.",
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
    <header className="flex flex-col gap-4 rounded-[28px] bg-transparent py-1 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        <h2 className="font-park text-2xl font-bold tracking-tight text-brand-blackish lg:text-3xl">
          {title}
        </h2>
        <p className="max-w-xl text-sm text-brand-body lg:text-base">
          {subtitle}
        </p>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
};

export default Header;
