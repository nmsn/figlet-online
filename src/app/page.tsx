"use client";

import React, { useState, useCallback } from "react";
import { TextInput } from "@/components/text-input";
import { FontWall } from "@/components/font-wall";
import { allFontsMeta } from "@/lib/figlet/fonts-meta";
import Shuffle from "@/components/Shuffle";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccentPicker } from "@/components/accent-picker";
import { useAccentColor } from "@/hooks/use-accent-color";

const ASCII_CHARS = "█▓▒░▄▀■□▪▫★☆●○◆◇░▒▓";

export default function HomePage() {
  const [text, setText] = useState("Hello World");
  const { accent } = useAccentColor();

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-card-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Shuffle
              text="Figlet Fonts"
              tag="h1"
              className="text-xl font-bold"
              colorFrom={accent}
              colorTo={accent}
              shuffleDirection="right"
              scrambleCharset={ASCII_CHARS}
              duration={0.4}
              stagger={0.02}
              triggerOnHover={true}
              triggerOnce={false}
              respectReducedMotion={true}
            />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccentPicker />
            </div>
          </div>
          <TextInput value={text} onChange={handleTextChange} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <FontWall fonts={allFontsMeta} text={text} />
      </div>
    </main>
  );
}