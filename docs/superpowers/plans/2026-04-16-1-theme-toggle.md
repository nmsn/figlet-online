# Theme Toggle Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add dark/light theme toggle button with concentric circle spread animation in header.

**Architecture:** Use `next-themes` for theme state management with CSS variables. Concentric circle animation via CSS keyframes.

**Tech Stack:** next-themes, CSS custom properties, CSS animations

---

## File Map

| File | Purpose |
|------|---------|
| `src/components/theme-toggle.tsx` | Toggle button component with animation |
| `src/app/globals.css` | Add theme CSS variables |
| `src/app/layout.tsx` | Wrap with ThemeProvider |
| `src/components/theme-provider.tsx` | Create ThemeProvider wrapper |
| `src/components/theme-toggle.test.tsx` | Unit tests |

---

## Dependencies

```bash
npm install next-themes
```

---

## Task 1: Install next-themes

- [ ] **Step 1: Install next-themes package**

```bash
npm install next-themes
```

- [ ] **Step 2: Verify installation**

```bash
npm list next-themes
```

---

## Task 2: Create ThemeProvider

**Files:**
- Create: `src/components/theme-provider.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/theme-toggle.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(<ThemeProvider>Hello</ThemeProvider>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/theme-toggle.test.tsx
```

- [ ] **Step 3: Create minimal ThemeProvider**

```tsx
// src/components/theme-provider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemesProvider attribute="class" defaultTheme="dark">{children}</NextThemesProvider>;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/components/theme-toggle.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/theme-provider.tsx src/components/theme-toggle.test.tsx package.json
git commit -m "feat: add ThemeProvider with next-themes"
```

---

## Task 3: Add Light Theme CSS Variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing test**

```tsx
// Test that light theme variables are defined
// (CSS variable existence is tested via computed styles)
```

- [ ] **Step 2: Verify test runs**

```bash
npm test -- --run src/components/theme-toggle.test.tsx
```

- [ ] **Step 3: Add light theme CSS variables**

```css
/* In globals.css, add after :root section */

.light {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #f5f5f5;
  --card-border: #e5e5e5;
  --card-hover: #ebebeb;
  --accent: #22c55e;  /* Green for light mode */
  --muted: #737373;
  --muted-foreground: #525252;
}
```

- [ ] **Step 4: Verify**

```bash
npm test -- --run src/components/theme-toggle.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add light theme CSS variables"
```

---

## Task 4: Create ThemeToggle Component with Animation

**Files:**
- Create: `src/components/theme-toggle.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/theme-toggle.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows sun icon for dark mode toggle', () => {
    render(<ThemeToggle />);
    // Button should contain sun/moon indication
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/theme-toggle.test.tsx
```

- [ ] **Step 3: Create ThemeToggle with concentric circle animation**

```tsx
// src/components/theme-toggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  const toggle = () => {
    setAnimating(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Concentric circles animation */}
      <span className={cn("circle circle-1", animating && "animate-expand")} />
      <span className={cn("circle circle-2", animating && "animate-expand-2")} />
      <span className={cn("circle circle-3", animating && "animate-expand-3")} />

      {/* Icon */}
      <span className="relative z-10">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}
```

- [ ] **Step 4: Add CSS animation styles**

```css
/* Add to globals.css */
.circle {
  position: absolute;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0;
  pointer-events: none;
}

.circle-1 { width: 8px; height: 8px; }
.circle-2 { width: 16px; height: 16px; }
.circle-3 { width: 24px; height: 24px; }

.circle-1.animate-expand { animation: circle-expand 0.6s ease-out forwards; }
.circle-2.animate-expand-2 { animation: circle-expand-2 0.6s ease-out 0.1s forwards; }
.circle-3.animate-expand-3 { animation: circle-expand-3 0.6s ease-out 0.2s forwards; }

@keyframes circle-expand {
  0% { opacity: 0.8; transform: scale(1); }
  100% { opacity: 0; transform: scale(8); }
}
```

- [ ] **Step 5: Run tests and verify**

```bash
npm test -- --run src/components/theme-toggle.test.tsx
```

- [ ] **Step 6: Commit**

```bash
git add src/components/theme-toggle.tsx src/app/globals.css
git commit -m "feat: add ThemeToggle with concentric circle animation"
```

---

## Task 5: Integrate into Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Wrap body with ThemeProvider**

```tsx
// Add import
import { ThemeProvider } from "@/components/theme-provider";

// Wrap body
<body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
  <ThemeProvider>
    {children}
    <Toaster />
  </ThemeProvider>
</body>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: integrate ThemeProvider into layout"
```

---

## Task 6: Integrate into Header

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import ThemeToggle**

```tsx
import { ThemeToggle } from "@/components/theme-toggle";
```

- [ ] **Step 2: Add to header**

```tsx
<header>
  <div className="flex items-center justify-between">
    <Shuffle text="Figlet Fonts" ... />
    <ThemeToggle />
  </div>
  <TextInput ... />
</header>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add ThemeToggle to header"
```
