# Font Preview Dialog Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add click-to-open full-screen modal for font preview, solving the issue where tall ASCII art is truncated in cards.

**Architecture:** Use shadcn Dialog component. Dialog renders full ASCII art without truncation. Double-click to copy.

**Tech Stack:** shadcn Dialog, figlet, sonner for toast

---

## File Map

| File | Purpose |
|------|---------|
| `src/components/font-preview-dialog.tsx` | Dialog for full-screen preview |
| `src/components/font-card.tsx` | Modify to open dialog on click |
| `src/lib/figlet/fonts-meta.ts` | Check existing types |

---

## Prerequisites

```bash
npx shadcn@latest add dialog
```

---

## Task 1: Install shadcn Dialog

- [ ] **Step 1: Add Dialog component**

```bash
npx shadcn@latest add dialog
```

- [ ] **Step 2: Verify files created**

```bash
ls src/components/ui/dialog.tsx
```

---

## Task 2: Create FontPreviewDialog Component

**Files:**
- Create: `src/components/font-preview-dialog.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/font-preview-dialog.test.tsx
import { render, screen } from '@testing-library/react';
import { FontPreviewDialog } from './font-preview-dialog';
import type { FontMeta } from '@/lib/figlet/fonts-meta';

describe('FontPreviewDialog', () => {
  const mockFont: FontMeta = { id: 'Standard', name: 'Standard', style: 'classic', heightLevel: 1 };

  it('renders dialog when open', () => {
    render(<FontPreviewDialog open={true} font={mockFont} text="Test" onClose={() => {}} />);
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });

  it('displays full ASCII art without truncation', () => {
    render(<FontPreviewDialog open={true} font={mockFont} text="Hello World" onClose={() => {}} />);
    const pre = screen.getByText(/H/); // Should render full text
    expect(pre.tagName).toBe('PRE');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/font-preview-dialog.test.tsx
```

- [ ] **Step 3: Implement FontPreviewDialog**

```tsx
// src/components/font-preview-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@/components/ui/dialog";
import type { FontMeta } from "@/lib/figlet/fonts-meta";
import figlet from "figlet";
import { toast } from "sonner";
import { X, Copy } from "lucide-react";

interface FontPreviewDialogProps {
  open: boolean;
  font: FontMeta | null;
  text: string;
  onClose: () => void;
}

export function FontPreviewDialog({ open, font, text, onClose }: FontPreviewDialogProps) {
  const [ascii, setAscii] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !font) return;

    figlet.text(text || " ", { font: font.id }, (err, data) => {
      if (err) {
        setAscii("Error rendering font");
        return;
      }
      setAscii(data ?? "");
    });
  }, [open, font, text]);

  const handleCopy = async () => {
    if (!ascii) return;
    await navigator.clipboard.writeText(ascii);
    setCopied(true);
    toast.success(`Copied ${font?.name}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-auto bg-background border-card-border">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle className="text-xl font-bold text-accent">
            {font?.name}
          </Dialog.DialogTitle>
          <Dialog.DialogDescription className="text-muted">
            Double-click to copy • Press ESC to close
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div
          className="relative cursor-pointer"
          onDoubleClick={handleCopy}
        >
          <pre className="ascii-text text-accent text-sm leading-tight overflow-auto whitespace-pre font-mono">
            {ascii || "Loading..."}
          </pre>

          {copied && (
            <div className="absolute top-2 right-2 bg-accent text-background px-2 py-1 rounded text-xs">
              Copied!
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            <Copy size={16} />
            Copy ASCII Art
          </button>
        </div>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/components/font-preview-dialog.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/font-preview-dialog.tsx
git commit -m "feat: add FontPreviewDialog component"
```

---

## Task 3: Modify FontCard to Open Dialog

**Files:**
- Modify: `src/components/font-card.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/font-card.test.tsx (add new tests)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FontCard } from './font-card';

describe('FontCard', () => {
  it('opens dialog on click when rendered', async () => {
    const onOpenPreview = vi.fn();
    render(<FontCard font={mockFont} text="Test" onOpenPreview={onOpenPreview} />);
    // Wait for card to load and render
    await waitFor(() => expect(screen.getByText('dblclick to copy')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button'));
    expect(onOpenPreview).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/font-card.test.tsx
```

- [ ] **Step 3: Modify FontCard to support dialog opening**

```tsx
// Add to FontCardProps interface
interface FontCardProps {
  font: FontMeta;
  text: string;
  onVisible?: () => void;
  onOpenPreview?: (font: FontMeta, text: string) => void; // NEW
}

// In the card onClick handler:
const handleClick = useCallback(() => {
  if (state === "idle") {
    loadAndRender();
  } else if (state === "rendered" && onOpenPreview) {
    onOpenPreview(font, text);
  }
}, [loadAndRender, state, onOpenPreview, font, text]);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/components/font-card.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/font-card.tsx
git commit -m "feat: FontCard opens preview dialog on click"
```

---

## Task 4: Integrate into FontWall with State

**Files:**
- Modify: `src/components/font-wall.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/font-wall.test.tsx
import { render, screen } from '@testing-library/react';
import { FontWall } from './font-wall';

describe('FontWall', () => {
  it('renders FontPreviewDialog', () => {
    render(<FontWall fonts={[mockFont]} text="Test" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/font-wall.test.tsx
```

- [ ] **Step 3: Update FontWall to manage dialog state**

```tsx
// src/components/font-wall.tsx
import { useState } from "react";
import type { FontMeta } from "@/lib/figlet/fonts-meta";
import { FontCard } from "@/components/font-card";
import { FontPreviewDialog } from "@/components/font-preview-dialog";

// Add state
const [previewFont, setPreviewFont] = useState<FontMeta | null>(null);
const [previewText, setPreviewText] = useState("");

// Handler
const handleOpenPreview = (font: FontMeta, text: string) => {
  setPreviewFont(font);
  setPreviewText(text);
};

// In JSX, pass to FontCard and add Dialog
<FontCard
  font={font}
  text={text}
  onOpenPreview={handleOpenPreview}
/>

<FontPreviewDialog
  open={!!previewFont}
  font={previewFont}
  text={previewText}
  onClose={() => setPreviewFont(null)}
/>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/components/font-wall.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/font-wall.tsx
git commit -m "feat: integrate FontPreviewDialog in FontWall"
```

---

## Task 5: Add Dialog Styles (if needed)

- [ ] **Step 1: Check dialog styling**

The shadcn Dialog should auto-style. But add to globals.css if needed:

```css
/* Ensure ascii-text works in dialogs */
.dialog-content pre.ascii-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: pre;
  overflow-x: auto;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add dialog ASCII text styles"
```
