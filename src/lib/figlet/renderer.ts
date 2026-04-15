// src/lib/figlet/renderer.ts

import type { FlfFont } from "./parser";

/**
 * Render text using a parsed FlfFont, producing ASCII art string.
 */
export function renderText(text: string, font: FlfFont): string {
  const { height, maxLength } = font.header;
  const lines = Array.from({ length: height }, () => "");

  for (const char of text) {
    const charCode = char.charCodeAt(0);
    let charLines = font.chars.get(charCode);

    // Fallback to '?' (code 63) for unsupported chars
    if (!charLines) {
      charLines = font.chars.get(63) ?? font.chars.get(32) ?? [];
    }

    for (let i = 0; i < height; i++) {
      const glyphLine = charLines[i] ?? "";
      // Remove the endmark character (last char of each line is the endmark)
      const cleanLine = glyphLine.slice(0, -1);
      lines[i] += cleanLine.padEnd(maxLength);
    }
  }

  return lines.join("\n");
}

/**
 * Replace hardblank chars (used for bold/styled effects) with spaces.
 * Call this before copying to clipboard.
 */
export function cleanAsciiOutput(ascii: string, hardblank: string = " "): string {
  return ascii.replace(new RegExp(hardblank, "g"), " ");
}
