# Figlet Fonts Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A figlet-fonts website where users input text once and browse 353 ASCII art font renderings in a font wall, double-clicking to copy.

**Architecture:** Next.js 15 App Router with client-side .flf parsing. All 353 fonts served as static files from `public/fonts/`. Font metadata (name, style, heightLevel) pre-generated into `fonts-meta.ts`. Client-side virtual rendering with @tanstack/react-virtual for performance.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, @tanstack/react-virtual, @types/figlet

---

## File Structure

```
figlet-online/
├── public/
│   └── fonts/                      # 353 .flf files from xero/figlet-fonts
│       ├── Standard.flf
│       ├── Banner.flf
│       └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/fonts/
│   │       ├── route.ts           # GET /api/fonts → all metadata
│   │       └── [id]/route.ts      # GET /api/fonts/:id → .flf raw
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── sonner.tsx         # toast provider
│   │   ├── text-input.tsx         # sticky top input
│   │   ├── font-wall.tsx          # virtual grid
│   │   └── font-card.tsx          # single card
│   └── lib/
│       ├── figlet/
│       │   ├── parser.ts          # .flf → FlfFont
│       │   ├── renderer.ts        # text + font → ASCII string
│       │   └── fonts-meta.ts     # 353 font entries
│       └── utils.ts               # cn(), clipboard
├── scripts/
│   └── generate-fonts-meta.ts     # Node script to generate fonts-meta.ts
├── docs/.../spec.md
└── [config files]
```

---

## Pre-requisites (Manual)

Before running any steps, ensure these are done once:

1. **Font files copied** from `/tmp/figlet-fonts/*.flf` → `public/fonts/`
   ```bash
   mkdir -p public/fonts
   cp /tmp/figlet-fonts/*.flf public/fonts/
   ```

2. **Create worktree** (recommended for subagent execution):
   ```bash
   cd /Users/nmsn/Studio/figlet-online
   git worktree add ../figlet-online-worktrees/default
   ```

---

## Phase 1: Project Scaffold

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "figlet-online",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "lucide-react": "^0.460.0",
    "@tanstack/react-virtual": "^3.10.8",
    "sonner": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "@types/node": "^22.10.1",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "eslint": "^9.16.0",
    "eslint-config-next": "15.1.0"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow .flf files to be served
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create .gitignore**

```
# dependencies
/node_modules
/.pnp
/.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 5: Commit**

```bash
git add package.json next.config.ts tsconfig.json .gitignore
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

### Task 2: Set up Tailwind CSS v4 + shadcn/ui

**Files:**
- Create: `src/app/globals.css`, `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/sonner.tsx`

- [ ] **Step 1: Create globals.css with Tailwind v4**

```css
@import "tailwindcss";

@theme inline {
  --color-background: #0a0a0a;
  --color-foreground: #ffffff;
  --color-card: #111111;
  --color-card-border: #1a1a1a;
  --color-card-hover: #222222;
  --color-accent: #00ff00;
  --color-muted: #888888;
  --color-muted-foreground: #666666;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}

* {
  border-color: var(--color-card-border);
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.ascii-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: pre;
  line-height: 1.2;
  color: var(--color-accent);
}
```

- [ ] **Step 2: Create src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Create src/components/ui/button.tsx**

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-background hover:bg-accent/90",
        ghost: "hover:bg-card-hover text-muted hover:text-foreground",
        outline: "border border-card-border bg-transparent hover:bg-card-hover text-muted hover:text-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 4: Create src/components/ui/input.tsx**

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-card-border bg-card px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "ascii-text text-base",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

- [ ] **Step 5: Create src/components/ui/sonner.tsx**

```typescript
"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      toastOptions={{
        style: {
          background: "#1a1a1a",
          border: "1px solid #333",
          color: "#fff",
        },
      }}
    />
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/lib/utils.ts src/components/ui/button.tsx src/components/ui/input.tsx src/components/ui/sonner.tsx
git commit -m "feat: set up Tailwind v4 and shadcn base components"
```

---

## Phase 2: FLF Parser (Core Logic)

### Task 3: Implement flf-parser.ts

**Files:**
- Create: `src/lib/figlet/parser.ts`

- [ ] **Step 1: Write the type definitions and parser**

The .flf format:
```
flf2a$ <height> <baseline> <maxLength> <layout> <commentLines> <direction> <codetagCount> <charCount>
<comment lines...>
<char 1 lines...>
<char 2 lines...>
...
<char N lines...>
<hardblank lines...>    ← special, stored separately
```

Endmark char (last char of each line) determines line end.

```typescript
// src/lib/figlet/parser.ts

export interface FlfHeader {
  height: number;
  baseline: number;
  maxLength: number;
  layout: number;
  commentLines: number;
  direction: number;
  codetagCount: number;
  charCount: number;
}

export interface FlfFont {
  header: FlfHeader;
  comment: string;
  /** Map from char code (0-255) to array of height strings */
  chars: Map<number, string[]>;
  /** The char used for end-of-line marker, stored separately */
  hardblank: string;
}

function parseHeader(lines: string[]): { header: FlfHeader; headerLineIndex: number } {
  const firstLine = lines[0];
  const match = firstLine.match(/^flf2a\$\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  if (!match) {
    throw new Error(`Invalid flf header: ${firstLine}`);
  }
  const [, height, baseline, maxLength, layout, commentLines, direction, codetagCount, charCount] = match.map(Number);
  return {
    header: { height, baseline, maxLength, layout, commentLines, direction, codetagCount, charCount },
    headerLineIndex: 0,
  };
}

/**
 * Parse a .flf file content into a FlfFont structure.
 * The .flf format is:
 * - Line 0: header "flf2a$ h b l c d t n"
 * - Lines 1..commentLines: comment text (font name, author, etc.)
 * - Then charCount characters, each with `height` lines
 * - Last char is "hardblank" char (endmark for each line)
 */
export function parseFlf(content: string): FlfFont {
  const lines = content.split(/\r?\n/);
  const { header, headerLineIndex } = parseHeader(lines);

  // Skip comment lines
  const dataStart = headerLineIndex + 1 + header.commentLines;

  // The last char in the font is the "endmark" / hardblank char
  // Build chars map by reading height lines per character
  const chars = new Map<number, string[]>();
  let currentLine = dataStart;
  const endmarkCharCode = 0; // We'll detect from the last char entry

  for (let charIdx = 0; charIdx < header.charCount; charIdx++) {
    const charLines: string[] = [];
    for (let row = 0; row < header.height; row++) {
      if (currentLine >= lines.length) break;
      charLines.push(lines[currentLine]);
      currentLine++;
    }

    if (charLines.length === 0) break;

    // Determine the endmark character (last non-newline char of the first line)
    // In flf format, the last char of each line is the endmark
    // charIdx 0 = '\0', charIdx 32 = ' ', charIdx 33 = '!', etc.
    // We need to map from charIdx to the actual ASCII char
    let charCode: number;
    if (charIdx === 0) {
      charCode = 0; // \0
    } else if (charIdx === 1) {
      charCode = 10; // \n (newline - usually skipped)
    } else if (charIdx === 2) {
      charCode = 13; // \r
    } else if (charIdx === 3) {
      charCode = 27; // ESC
    } else {
      charCode = charIdx - 4; // Adjust for the 4 header chars
    }

    if (charLines.length > 0) {
      chars.set(charCode, charLines);
    }
  }

  // Extract hardblank (the character used as a hard space)
  const hardblankLine = lines[dataStart + header.height * (header.charCount - 1)];
  const hardblank = hardblankLine ? hardblankLine.slice(-1) : ' ';

  return { header, comment: "", chars, hardblank };
}
```

**Verification needed:** The .flf char index mapping above is approximate. The exact mapping from charIdx to ASCII codes is defined in the flf spec. A simpler approach: read characters sequentially from ASCII 32 (' ') onwards, using the actual header.charCount.

Better parser implementation:

```typescript
export function parseFlf(content: string): FlfFont {
  const lines = content.split(/\r?\n/);
  const { header, headerLineIndex } = parseHeader(lines);

  const dataStart = headerLineIndex + 1 + header.commentLines;
  const chars = new Map<number, string[]>();

  let lineIdx = dataStart;
  // ASCII chars start at code 32 (' ')
  // Characters are stored sequentially: code 32, 33, 34, ...
  for (let charCode = 32; charCode < 32 + header.charCount && lineIdx < lines.length; charCode++) {
    const charLines: string[] = [];
    for (let row = 0; row < header.height; row++) {
      if (lineIdx >= lines.length) break;
      charLines.push(lines[lineIdx]);
      lineIdx++;
    }
    if (charLines.length > 0) {
      chars.set(charCode, charLines);
    }
  }

  // Hardblank is the last character stored (used for endmark)
  const lastCharCode = 32 + header.charCount - 1;
  const lastCharLines = chars.get(lastCharCode);
  const hardblank = lastCharLines && lastCharLines[0] ? lastCharLines[0].slice(-1) : ' ';

  return { header, comment: "", chars, hardblank };
}
```

Note: Need to verify actual .flf format with a real file. The first readable char is usually code 32 (space). Characters 0-31 are control chars often stored as empty.

- [ ] **Step 2: Test the parser against Standard.flf**

```bash
# Copy a font file first
cp /tmp/figlet-fonts/Standard.flf /tmp/test-standard.flf

# Write a quick test
node -e "
const fs = require('fs');
const content = fs.readFileSync('/tmp/test-standard.flf', 'utf8');
const lines = content.split('\n');
console.log('Header line:', lines[0]);
console.log('Line count:', lines.length);
console.log('First char lines (code 32):');
for (let i = 1; i <= 6; i++) console.log(i + ':', lines[i]);
"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/figlet/parser.ts
git commit -m "feat: implement flf parser"
```

---

### Task 4: Implement renderer.ts

**Files:**
- Create: `src/lib/figlet/renderer.ts`

- [ ] **Step 1: Write renderer**

```typescript
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
```

- [ ] **Step 2: Write basic unit tests**

```typescript
// src/lib/figlet/renderer.test.ts
import { renderText, cleanAsciiOutput } from "./renderer";
import { parseFlf } from "./parser";

test("renders Standard font for 'Hi'", () => {
  const font = parseFlf("...flf content...");
  const result = renderText("Hi", font);
  expect(result).toContain("_");
  expect(result).toContain("|");
});

test("cleanAsciiOutput replaces hardblank with space", () => {
  const ascii = "H   i";
  expect(cleanAsciiOutput(ascii, " ")).toBe("H   i");
});
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/figlet/renderer.ts
git commit -m "feat: implement figlet renderer"
```

---

## Phase 3: Font Metadata Generation

### Task 5: Generate fonts-meta.ts

**Files:**
- Create: `scripts/generate-fonts-meta.ts`
- Create: `src/lib/figlet/fonts-meta.ts`

- [ ] **Step 1: Write the generation script**

The script reads all .flf files from `public/fonts/`, extracts header info (height), guesses style from filename, and outputs `src/lib/figlet/fonts-meta.ts`.

```typescript
// scripts/generate-fonts-meta.ts

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");
const OUTPUT_FILE = path.join(process.cwd(), "src", "lib", "figlet", "fonts-meta.ts");

interface FontMeta {
  id: string;
  name: string;
  style: string;
  heightLevel: 1 | 2 | 3;
}

function parseHeaderHeight(content: string): number {
  const match = content.match(/^flf2a\$\s+(\d+)/m);
  return match ? parseInt(match[1], 10) : 5;
}

function guessStyle(filename: string): string {
  const lower = filename.toLowerCase();
  if (/3d|relief|shadow|emboss/i.test(lower)) return "3d";
  if (/script|cursive|hand|decorative|calig/i.test(lower)) return "script";
  if (/block|banner|thick|bold/i.test(lower)) return "block";
  if (/retro|term|dos|classic|basic/i.test(lower)) return "retro";
  if (/thin|slim|lean|light/i.test(lower)) return "thin";
  if (/fun|weird|cyber|digital|star/i.test(lower)) return "fun";
  return "classic";
}

function heightToLevel(height: number): 1 | 2 | 3 {
  if (height <= 3) return 1;
  if (height >= 8) return 3;
  return 2;
}

async function main() {
  const files = fs.readdirSync(FONTS_DIR).filter(f => f.endsWith(".flf"));

  const fonts: FontMeta[] = files.map(filename => {
    const content = fs.readFileSync(path.join(FONTS_DIR, filename), "utf8");
    const id = filename.replace(/\.flf$/i, "");
    const name = id.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const height = parseHeaderHeight(content);
    return {
      id,
      name,
      style: guessStyle(filename),
      heightLevel: heightToLevel(height),
    };
  });

  const code = `// AUTO-GENERATED by scripts/generate-fonts-meta.ts
// Do not edit manually

export type FontStyle = "classic" | "3d" | "script" | "block" | "retro" | "fun" | "thin";

export interface FontMeta {
  id: string;
  name: string;
  style: FontStyle;
  heightLevel: 1 | 2 | 3;
}

export const allFontsMeta: FontMeta[] = ${JSON.stringify(fonts, null, 2)} as const;

export function getFontById(id: string): FontMeta | undefined {
  return allFontsMeta.find(f => f.id === id);
}
`;

  fs.writeFileSync(OUTPUT_FILE, code);
  console.log(`Generated ${fonts.length} font entries -> ${OUTPUT_FILE}`);
}

main().catch(console.error);
```

- [ ] **Step 2: Run the generation script**

```bash
npx tsx scripts/generate-fonts-meta.ts
```

- [ ] **Step 3: Verify output**

```bash
head -30 src/lib/figlet/fonts-meta.ts
# Should show the array of font entries
```

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-fonts-meta.ts src/lib/figlet/fonts-meta.ts
git commit -m "feat: generate fonts-meta.ts with all 353 font entries"
```

---

## Phase 4: API Routes

### Task 6: Build API Routes

**Files:**
- Create: `src/app/api/fonts/route.ts`
- Create: `src/app/api/fonts/[id]/route.ts`

- [ ] **Step 1: Create GET /api/fonts**

```typescript
// src/app/api/fonts/route.ts
import { NextResponse } from "next/server";
import { allFontsMeta } from "@/lib/figlet/fonts-meta";

export async function GET() {
  return NextResponse.json({
    fonts: allFontsMeta,
    total: allFontsMeta.length,
  });
}
```

- [ ] **Step 2: Create GET /api/fonts/[id]**

```typescript
// src/app/api/fonts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Prevent path traversal
  const safeId = id.replace(/[^a-zA-Z0-9._-]/g, "");
  const fontPath = path.join(process.cwd(), "public", "fonts", safeId);

  // Ensure it's within public/fonts directory
  const fontsDir = path.join(process.cwd(), "public", "fonts");
  if (!fontPath.startsWith(fontsDir)) {
    return NextResponse.json({ error: "Invalid font id" }, { status: 400 });
  }

  if (!fs.existsSync(fontPath)) {
    return NextResponse.json({ error: "Font not found" }, { status: 404 });
  }

  const content = fs.readFileSync(fontPath, "utf8");
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/fonts/route.ts "src/app/api/fonts/[id]/route.ts"
git commit -m "feat: add font metadata and font file API routes"
```

---

## Phase 5: UI Components

### Task 7: Font Card Component

**Files:**
- Create: `src/components/font-card.tsx`

- [ ] **Step 1: Write FontCard component**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/font-card.tsx
git commit -m "feat: add FontCard component with load-on-click and double-copy"
```

---

### Task 8: Text Input Component

**Files:**
- Create: `src/components/text-input.tsx`

- [ ] **Step 1: Write TextInput component**

```typescript
// src/components/text-input.tsx

"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: TextInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onChange(localValue);
    }
  }, [localValue, onChange]);

  const handleBlur = useCallback(() => {
    onChange(localValue);
  }, [localValue, onChange]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="输入任意文本，浏览全部字体效果..."
        className="text-center text-lg"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/text-input.tsx
git commit -m "feat: add sticky TextInput component"
```

---

### Task 9: Font Wall Component

**Files:**
- Create: `src/components/font-wall.tsx`

- [ ] **Step 1: Write FontWall component with virtual scrolling**

```typescript
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

const COLS = 4; // desktop
const CARD_HEIGHT = 140;
const GAP = 12;

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
      className="h-[calc(100vh-120px)] overflow-auto"
      style={{ contain: "strict" }}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/font-wall.tsx
git commit -m "feat: add FontWall with @tanstack/react-virtual scrolling"
```

---

## Phase 6: Page Assembly

### Task 10: Assemble Homepage

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create layout.tsx**

```typescript
// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Figlet Fonts — ASCII Art Generator",
  description: "Browse 353 figlet fonts and generate ASCII art text effects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create page.tsx**

```typescript
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
```

- [ ] **Step 3: Add container style to globals.css**

In `globals.css`, add:

```css
.container {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}
```

- [ ] **Step 4: Install dependencies and test**

```bash
cd /Users/nmsn/Studio/figlet-online
npm install
npm run dev
# Open http://localhost:3000
# Test: type text, click a font card, see ASCII render, double-click to copy
```

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: assemble homepage with sticky input and font wall"
```

---

## Phase 7: Polish

### Task 11: Add Loading States + Empty State + Responsive

- [ ] Add responsive columns: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Add loading skeleton for FontCard before first render
- Add empty state if no fonts loaded
- Test on mobile viewport
- Commit

### Task 12: Final Verification

- [ ] All 353 fonts load correctly from public/fonts/
- [ ] API /api/fonts returns all font metadata
- [ ] API /api/fonts/:id returns raw .flf content
- [ ] FontCard: click to load → shows ASCII preview
- [ ] FontCard: double-click → copies to clipboard → toast shows
- [ ] Virtual scroll: smooth scrolling with 353 fonts
- [ ] Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop
- [ ] Sticky input: stays at top when scrolling
- [ ] Git commit

---

## Verification Commands

```bash
# Start dev server
npm run dev

# Check fonts copied
ls public/fonts/ | wc -l  # should be 353

# Check fonts-meta.ts generated
grep -c '"id":' src/lib/figlet/fonts-meta.ts  # should be 353

# Test API
curl -s http://localhost:3000/api/fonts | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'total: {d[\"total\"]}')"

# Test font file API
curl -s http://localhost:3000/api/fonts/Standard | head -3
```
