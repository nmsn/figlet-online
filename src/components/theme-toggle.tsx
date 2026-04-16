"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  const toggle = () => {
    setAnimating(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors overflow-hidden"
      aria-label="Toggle theme"
    >
      <span className={cn("circle circle-1", animating && "animate-expand")} />
      <span className={cn("circle circle-2", animating && "animate-expand-2")} />
      <span className={cn("circle circle-3", animating && "animate-expand-3")} />
      <span className="relative z-10">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}