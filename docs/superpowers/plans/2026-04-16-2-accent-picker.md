# Accent Color Picker Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add accent color picker button in header that allows switching between 6 preset colors.

**Architecture:** Use React state + localStorage to persist accent color. CSS custom property `--accent` is dynamically updated.

**Tech Stack:** React hooks, localStorage, CSS custom properties

---

## File Map

| File | Purpose |
|------|---------|
| `src/components/accent-picker.tsx` | Color picker dropdown component |
| `src/hooks/use-accent-color.ts` | Custom hook for accent color state |
| `src/app/globals.css` | Add accent color CSS |
| `src/app/page.tsx` | Integrate into header |

---

## Task 1: Create useAccentColor Hook

**Files:**
- Create: `src/hooks/use-accent-color.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/hooks/use-accent-color.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAccentColor } from './use-accent-color';

describe('useAccentColor', () => {
  it('returns default accent color', () => {
    const { result } = renderHook(() => useAccentColor());
    expect(result.current.accent).toBe('#00ff00');
  });

  it('updates accent color', () => {
    const { result } = renderHook(() => useAccentColor());
    act(() => result.current.setAccent('#3b82f6'));
    expect(result.current.accent).toBe('#3b82f6');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/hooks/use-accent-color.test.ts
```

- [ ] **Step 3: Implement the hook**

```ts
// src/hooks/use-accent-color.ts
"use client";

import { useState, useEffect } from "react";

const ACCENT_COLORS = [
  "#00ff00", // Neon Green
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#f97316", // Orange
  "#ec4899", // Pink
  "#eab308", // Yellow
] as const;

const STORAGE_KEY = "figlet-accent-color";

export type AccentColor = typeof ACCENT_COLORS[number];

export function useAccentColor() {
  const [accent, setAccentState] = useState<AccentColor>("#00ff00");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ACCENT_COLORS.includes(stored as AccentColor)) {
      setAccentState(stored as AccentColor);
      document.documentElement.style.setProperty("--accent", stored);
    }
  }, []);

  const setAccent = (color: AccentColor) => {
    setAccentState(color);
    localStorage.setItem(STORAGE_KEY, color);
    document.documentElement.style.setProperty("--accent", color);
  };

  return { accent, setAccent, colors: ACCENT_COLORS };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/hooks/use-accent-color.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-accent-color.ts src/hooks/use-accent-color.test.ts
git commit -m "feat: add useAccentColor hook"
```

---

## Task 2: Create AccentPicker Component

**Files:**
- Create: `src/components/accent-picker.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/accent-picker.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccentPicker } from './accent-picker';

describe('AccentPicker', () => {
  it('renders color swatches', () => {
    render(<AccentPicker />);
    const swatches = screen.getAllByRole('button');
    expect(swatches.length).toBe(6);
  });

  it('calls onAccentChange when swatch clicked', async () => {
    const onChange = vi.fn();
    render(<AccentPicker onAccentChange={onChange} />);
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(onChange).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/accent-picker.test.tsx
```

- [ ] **Step 3: Implement AccentPicker**

```tsx
// src/components/accent-picker.tsx
"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { useAccentColor } from "@/hooks/use-accent-color";
import { cn } from "@/lib/utils";

export function AccentPicker() {
  const [open, setOpen] = useState(false);
  const { accent, setAccent, colors } = useAccentColor();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors"
        aria-label="Choose accent color"
      >
        <Palette size={18} style={{ color: accent }} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-card border border-card-border rounded-lg p-3 shadow-lg z-50">
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setAccent(color);
                  setOpen(false);
                }}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                  accent === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/components/accent-picker.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/accent-picker.tsx
git commit -m "feat: add AccentPicker component"
```

---

## Task 3: Integrate into Header

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import AccentPicker**

```tsx
import { AccentPicker } from "@/components/accent-picker";
```

- [ ] **Step 2: Add to header next to ThemeToggle**

```tsx
<div className="flex items-center gap-2">
  <ThemeToggle />
  <AccentPicker />
</div>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add AccentPicker to header"
```
