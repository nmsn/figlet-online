// src/app/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TextInput } from "@/components/text-input";
import { FontWall } from "@/components/font-wall";
import type { FontMeta } from "@/lib/figlet/fonts-meta";

export default function HomePage() {
  const [text, setText] = useState("Hello World");
  const [fonts, setFonts] = useState<FontMeta[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load font metadata on mount
  useEffect(() => {
    fetch("/api/fonts")
      .then(r => r.json())
      .then(data => {
        setFonts(data.fonts);
        setIsLoaded(true);
      })
      .catch(console.error);
  }, []);

  // Debounced text change
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-card-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-accent">🔤 Figlet Fonts</h1>
          </div>
          <TextInput value={text} onChange={handleTextChange} />
        </div>
      </header>

      {/* Font wall */}
      <div className="container mx-auto px-4 py-6">
        {isLoaded ? (
          <FontWall fonts={fonts} text={text} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-card-border rounded-lg h-[120px] animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
