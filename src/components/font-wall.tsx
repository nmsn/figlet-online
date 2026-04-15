// src/components/font-wall.tsx

"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FontCard } from "@/components/font-card";
import type { FontMeta } from "@/lib/figlet/fonts-meta";

interface FontWallProps {
  fonts: FontMeta[];
  text: string;
}

const COLS = 3; // desktop
const CARD_HEIGHT = 180;
const GAP = 20;

export function FontWall({ fonts, text }: FontWallProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rowCount = Math.ceil(fonts.length / COLS);

  const rowVirtualizer = useVirtualizer({
    count: mounted ? rowCount : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  if (!mounted) {
    // SSR / initial skeleton
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

  return (
    <div
      ref={parentRef}
      className="w-full"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map(virtualRow => {
          const startIdx = virtualRow.index * COLS;
          const rowFonts = fonts.slice(startIdx, startIdx + COLS);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1"
            >
              {rowFonts.map(font => (
                <FontCard
                  key={font.id}
                  font={font}
                  text={text}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
