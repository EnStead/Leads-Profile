import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "theme";
const THEME_MODE_KEY = "themeMode";

const getTimeTheme = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "midnight";
};

const applyTheme = (nextTheme) => {
  document.documentElement.setAttribute("data-theme", nextTheme);
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem(THEME_MODE_KEY) || "auto";
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || getTimeTheme();
  });

  useEffect(() => {
    localStorage.setItem(THEME_MODE_KEY, mode);
  }, [mode]);

  useLayoutEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (mode !== "auto") return undefined;

    const updateTheme = () => {
      setTheme(getTimeTheme());
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [mode]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      setThemeManually: (nextTheme) => {
        const applyManualTheme = () => {
          setMode("manual");
          setTheme(nextTheme);
        };

        if (mode === "manual" && nextTheme === theme) {
          return;
        }

        if (!document.startViewTransition) {
          applyManualTheme();
          return;
        }

        document.startViewTransition(() => {
          flushSync(() => {
            applyManualTheme();
          });
        });
      },
      setAutoMode: () => setMode("auto"),
    }),
    [theme, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};
