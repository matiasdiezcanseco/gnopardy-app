"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "classic-jeopardy" | "ocean" | "sunset";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("jeopardy-theme") as Theme;
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove(
      "light",
      "dark",
      "classic-jeopardy",
      "ocean",
      "sunset"
    );

    // Add current theme class
    root.classList.add(theme);

    // Save to localStorage
    localStorage.setItem("jeopardy-theme", theme);

    // Apply theme-specific CSS variables
    applyThemeVariables(theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function applyThemeVariables(theme: Theme) {
  const root = document.documentElement;

  switch (theme) {
    case "light":
      root.style.setProperty("--background", "0 0% 100%");
      root.style.setProperty("--foreground", "222.2 84% 4.9%");
      root.style.setProperty("--primary", "221.2 83.2% 53.3%");
      root.style.setProperty("--primary-foreground", "210 40% 98%");
      break;

    case "dark":
      root.style.setProperty("--background", "222.2 84% 4.9%");
      root.style.setProperty("--foreground", "210 40% 98%");
      root.style.setProperty("--primary", "217.2 91.2% 59.8%");
      root.style.setProperty("--primary-foreground", "222.2 47.4% 11.2%");
      break;

    case "classic-jeopardy":
      // Classic Jeopardy blue
      root.style.setProperty("--background", "220 100% 10%");
      root.style.setProperty("--foreground", "45 100% 70%");
      root.style.setProperty("--primary", "212 100% 48%");
      root.style.setProperty("--primary-foreground", "45 100% 70%");
      root.style.setProperty("--accent", "45 100% 51%");
      root.style.setProperty("--accent-foreground", "220 100% 10%");
      break;

    case "ocean":
      // Ocean theme - teal/cyan
      root.style.setProperty("--background", "197 71% 8%");
      root.style.setProperty("--foreground", "180 100% 90%");
      root.style.setProperty("--primary", "187 85% 53%");
      root.style.setProperty("--primary-foreground", "197 71% 8%");
      root.style.setProperty("--accent", "172 66% 50%");
      root.style.setProperty("--accent-foreground", "197 71% 8%");
      break;

    case "sunset":
      // Sunset theme - orange/purple
      root.style.setProperty("--background", "280 60% 8%");
      root.style.setProperty("--foreground", "30 100% 90%");
      root.style.setProperty("--primary", "24 100% 50%");
      root.style.setProperty("--primary-foreground", "280 60% 8%");
      root.style.setProperty("--accent", "330 81% 60%");
      root.style.setProperty("--accent-foreground", "280 60% 8%");
      break;
  }
}

