// src/components/font-wall.tsx

"use client";

import React, { useRef, useState, useEffect } from "react";
import { FontCard } from "@/components/font-card";
import type { FontMeta } from "@/lib/figlet/fonts-meta";

interface FontWallProps {
  fonts: FontMeta[];
  text: string;
}

const COLS = 3;

export function FontWall({ fonts, text }: FontWallProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-card-border rounded-lg h-[120px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Group fonts into rows
  const rows: FontMeta[][] = [];
  for (let i = 0; i < fonts.length; i += COLS) {
    rows.push(fonts.slice(i, i + COLS));
  }

  return (
    <div className="w-full">
      {rows.map((rowFonts, rowIdx) => (
        <div
          key={rowIdx}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 px-0 mb-5"
        >
          {rowFonts.map(font => (
            <FontCard
              key={font.id}
              font={font}
              text={text}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
