"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const ACCENT_COLORS = [
  "#00ff00", // Neon Green
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#f97316", // Orange
  "#ec4899", // Pink
  "#eab308", // Yellow
] as const;

const STORAGE_KEY = "figlet-accent-color";

export type AccentColor = typeof ACCENT_COLORS[number];

interface AccentColorContextValue {
  accent: AccentColor;
  setAccent: (color: AccentColor) => void;
  colors: readonly AccentColor[];
}

const AccentColorContext = createContext<AccentColorContextValue | null>(null);

function useAccentColorState() {
  const [accent, setAccentState] = useState<AccentColor>("#00ff00");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ACCENT_COLORS.includes(stored as AccentColor)) {
      setAccentState(stored as AccentColor);
      document.documentElement.style.setProperty("--accent", stored);
    }
  }, []);

  const setAccent = (color: AccentColor) => {
    setAccentState(color);
    localStorage.setItem(STORAGE_KEY, color);
    document.documentElement.style.setProperty("--accent", color);
  };

  return { accent, setAccent, colors: ACCENT_COLORS };
}

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const value = useAccentColorState();
  return (
    <AccentColorContext.Provider value={value}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  const context = useContext(AccentColorContext);
  if (!context) {
    throw new Error("useAccentColor must be used within AccentColorProvider");
  }
  return context;
}