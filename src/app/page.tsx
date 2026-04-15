// src/app/page.tsx

"use client";

import React, { useState, useCallback } from "react";
import { TextInput } from "@/components/text-input";
import { FontWall } from "@/components/font-wall";
import { allFontsMeta } from "@/lib/figlet/fonts-meta";

export default function HomePage() {
  const [text, setText] = useState("Hello World");

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
        <FontWall fonts={allFontsMeta} text={text} />
      </div>
    </main>
  );
}
