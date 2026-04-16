"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { useAccentColor } from "@/hooks/use-accent-color";
import { cn } from "@/lib/utils";

export function AccentPicker() {
  const [open, setOpen] = useState(false);
  const { accent, setAccent, colors } = useAccentColor();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors"
        aria-label="Choose accent color"
      >
        <Palette size={18} style={{ color: accent }} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-card border border-card-border rounded-lg p-3 shadow-lg z-50">
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setAccent(color);
                  setOpen(false);
                }}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                  accent === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}