"use client";

import { LucideGithub, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAccentColor } from "@/hooks/use-accent-color";
import { cn } from "@/lib/utils";

export function AccentPicker() {
  const { accent, setAccent, colors } = useAccentColor();

  return (
    <>
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors"
          aria-label="Choose accent color"
        >
          <Palette size={18} style={{ color: accent }} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 mr-2" align="end">
        <div className="grid grid-cols-3 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setAccent(color)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                accent === color ? "border-white scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select ${color}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
    <a
      href="https://github.com/nmsn/figlet-online"
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors"
      aria-label="View on GitHub"
    >
      <LucideGithub size={18} />
    </a>
    </>
  );
}