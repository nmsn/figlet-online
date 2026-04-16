"use client";

import React, { useState, useCallback } from "react";
import { TextInput } from "@/components/text-input";
import { FontWall } from "@/components/font-wall";
import { allFontsMeta } from "@/lib/figlet/fonts-meta";
import Shuffle from "@/components/Shuffle";

const ASCII_CHARS = "█▓▒░▄▀■□▪▫★☆●○◆◇░▒▓";

export default function HomePage() {
  const [text, setText] = useState("Hello World");

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-card-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Shuffle
              text="🔤 Figlet Fonts"
              tag="h1"
              className="text-xl font-bold"
              colorFrom="#00ff00"
              colorTo="#00ff00"
              shuffleDirection="right"
              scrambleCharset={ASCII_CHARS}
              duration={0.4}
              stagger={0.02}
              triggerOnHover={true}
              respectReducedMotion={true}
            />
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