// src/components/font-card.tsx

"use client";

import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import { motion } from "motion/react";
import type { FontMeta } from "@/lib/figlet/fonts-meta";
import figlet from "figlet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FontCardProps {
  font: FontMeta;
  text: string;
  onVisible?: () => void;
  onOpenPreview?: (font: FontMeta, text: string) => void;
}

type RenderState = "idle" | "loading" | "rendered" | "error" | "unsupported";

export const FontCard = memo(function FontCardInner({ font, text, onVisible, onOpenPreview }: FontCardProps) {
  const [state, setState] = useState<RenderState>("idle");
  const [ascii, setAscii] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const loadAndRender = useCallback(async () => {
    if (state !== "idle") return;
    setState("loading");
    figlet.text(text || " ", { font: font.id }, (err, data) => {
      if (err) {
        setState("error");
        return;
      }
      // 检查空输出 - 表示字体不支持该字符
      if (!data || data.trim() === "") {
        setState("unsupported");
        return;
      }
      setAscii(data ?? "");
      setState("rendered");
      onVisible?.();
    });
  }, [font.id, text, state, onVisible]);

  // 响应 text 变化 - 当 text 变化且当前已渲染时，重置为 idle
  useEffect(() => {
    if (state === "rendered" || state === "unsupported") {
      setState("idle");
      setAscii("");
    }
  }, [text, state]);

  const handleClick = useCallback(() => {
    if (state === "idle") {
      loadAndRender();
    } else if (state === "rendered" && onOpenPreview) {
      onOpenPreview(font, text);
    }
  }, [loadAndRender, state, onOpenPreview, font, text]);

  const handleDoubleClick = useCallback(async () => {
    if (state !== "rendered" || !ascii) return;
    await navigator.clipboard.writeText(ascii);
    setIsCopied(true);
    toast.success(`Copied ${font.name}!`);
    setTimeout(() => setIsCopied(false), 1500);
  }, [ascii, font.name, state]);

  useEffect(() => {
    if (state !== "idle") return;
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadAndRender();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [state, loadAndRender]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative bg-card border border-card-border rounded-lg p-3 cursor-pointer",
        "transition-all duration-150 hover:border-card-hover hover:bg-card-hover",
        "select-none min-h-60 flex flex-col",
        isCopied && "border-accent"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          <pre className="ascii-text text-accent text-[10px] leading-none overflow-hidden">
            {ascii}
          </pre>
        )}
        {state === "error" && (
          <span className="text-red-500 text-xs">Error</span>
        )}
        {state === "unsupported" && (
          <span className="text-muted text-xs text-center px-2">
            此字体不支持该字符
          </span>
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
        <motion.div
          className="absolute bottom-1 right-2"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-[10px] text-muted-foreground">dblclick to copy</span>
        </motion.div>
      )}
    </div>
  );
});
