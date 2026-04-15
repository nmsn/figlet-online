// src/components/font-card.tsx

"use client";

import React, { useState, useCallback } from "react";
import type { FontMeta } from "@/lib/figlet/fonts-meta";
import { parseFlf } from "@/lib/figlet/parser";
import { renderText, cleanAsciiOutput } from "@/lib/figlet/renderer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FontCardProps {
  font: FontMeta;
  text: string;
  onVisible?: () => void;
}

type RenderState = "idle" | "loading" | "rendered" | "error";

export function FontCard({ font, text, onVisible }: FontCardProps) {
  const [state, setState] = useState<RenderState>("idle");
  const [ascii, setAscii] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  const loadAndRender = useCallback(async () => {
    if (state !== "idle") return;
    setState("loading");
    try {
      const res = await fetch(`/api/fonts/${font.id}`);
      if (!res.ok) throw new Error("Failed to load font");
      const content = await res.text();
      const parsed = parseFlf(content);
      const rendered = renderText(text || " ", parsed);
      setAscii(cleanAsciiOutput(rendered, parsed.hardblank));
      setState("rendered");
      onVisible?.();
    } catch {
      setState("error");
    }
  }, [font.id, text, state, onVisible]);

  const handleClick = useCallback(() => {
    if (state === "idle") loadAndRender();
  }, [loadAndRender, state]);

  const handleDoubleClick = useCallback(async () => {
    if (state !== "rendered" || !ascii) return;
    await navigator.clipboard.writeText(ascii);
    setIsCopied(true);
    toast.success(`Copied ${font.name}!`);
    setTimeout(() => setIsCopied(false), 1500);
  }, [ascii, font.name, state]);

  return (
    <div
      className={cn(
        "relative bg-card border border-card-border rounded-lg p-3 cursor-pointer",
        "transition-all duration-150 hover:border-card-hover hover:bg-card-hover",
        "select-none min-h-[120px] flex flex-col",
        isCopied && "border-accent"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* ASCII Preview */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {state === "idle" && (
          <span className="text-muted text-xs">Click to load</span>
        )}
        {state === "loading" && (
          <div className="ascii-text text-accent/50 text-xs animate-pulse">
            Loading...
          </div>
        )}
        {state === "rendered" && ascii && (
          <pre className="ascii-text text-accent text-xs leading-tight overflow-hidden">
            {ascii.slice(0, 200)}
          </pre>
        )}
        {state === "error" && (
          <span className="text-red-500 text-xs">Error</span>
        )}
      </div>

      {/* Font name */}
      <div className="mt-2 text-center">
        <span className="text-muted text-xs font-medium truncate block">
          {font.name}
        </span>
      </div>

      {/* Double-click hint */}
      {state === "rendered" && (
        <div className="absolute bottom-1 right-2">
          <span className="text-[10px] text-muted-foreground">dblclick to copy</span>
        </div>
      )}
    </div>
  );
}
