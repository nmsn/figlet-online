# FontPreviewDialog Scroll Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix FontPreviewDialog so that only the ASCII preview area scrolls when text is too long, while header and footer remain fixed.

**Architecture:** Use Flexbox layout to divide DialogContent into three sections: fixed header (flex-shrink-0), scrollable preview area (flex-1 overflow-auto), and fixed footer (flex-shrink-0).

**Tech Stack:** React, Tailwind CSS, Vitest, Testing Library, Radix UI Dialog

---

## File Inventory

| File | Responsibility |
|------|----------------|
| `src/components/font-preview-dialog.tsx` | Main component - needs layout restructure |
| `src/components/font-preview-dialog.test.tsx` | Existing tests - add scroll behavior tests |
| `src/components/ui/dialog.tsx` | Dialog primitives - no changes needed |

---

## Task 1: Add Scroll Behavior Tests

**Files:**
- Modify: `src/components/font-preview-dialog.test.tsx:130-136` (append new tests)

- [ ] **Step 1: Write failing scroll behavior tests**

Add these tests to the existing `font-preview-dialog.test.tsx` file after line 129 (after the ESC test):

```tsx
  it("scrolls only in ASCII preview area when text is long", async () => {
    // Long text that forces scroll
    const longText = "A".repeat(200);
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text={longText}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const dialog = screen.getByRole("dialog");
    // ASCII preview container should be scrollable
    const previewContainer = dialog.querySelector('[class*="flex-1"]');
    expect(previewContainer).toBeInTheDocument();
    // The preview container itself should have overflow that allows scrolling
    // We verify by checking computed styles or scrollHeight vs clientHeight
    if (previewContainer) {
      expect(previewContainer.scrollHeight).toBeGreaterThan(previewContainer.clientHeight);
    }
  });

  it("keeps header and footer fixed when preview area scrolls", async () => {
    const longText = "A".repeat(200);
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text={longText}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const dialog = screen.getByRole("dialog");
    const header = dialog.querySelector('[data-slot="dialog-header"]');
    const footer = dialog.querySelector('[data-slot="dialog-footer"]');

    // Header and footer should exist
    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();

    // Verify header is at the top of dialog
    const dialogRect = dialog.getBoundingClientRect();
    const headerRect = header!.getBoundingClientRect();
    const footerRect = footer!.getBoundingClientRect();

    // Header should be at the very top of dialog
    expect(Math.abs(headerRect.top - dialogRect.top)).toBeLessThan(5);
    // Footer should be at the very bottom of dialog
    expect(Math.abs(footerRect.bottom - dialogRect.bottom)).toBeLessThan(5);
  });

  it("dialog content is vertically scrollable but header/footer stay fixed", async () => {
    const longText = "A".repeat(300);
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text={longText}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const dialog = screen.getByRole("dialog");
    const previewContainer = dialog.querySelector('[class*="flex-1"]');

    // Dialog should be scrollable
    expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
    // Preview area should also be scrollable independently
    expect(previewContainer!.scrollHeight).toBeGreaterThan(previewContainer!.clientHeight);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/nmsn/Studio/figlet-online && pnpm test -- src/components/font-preview-dialog.test.tsx --run`
Expected: FAIL - tests for scroll behavior should fail because the layout isn't implemented yet

- [ ] **Step 3: Commit**

```bash
git add src/components/font-preview-dialog.test.tsx
git commit -m "test: add scroll behavior tests for FontPreviewDialog

- verifies only preview area scrolls with long text
- verifies header and footer stay fixed
- verifies independent scrollability of preview container"
```

---

## Task 2: Implement Scroll Fix in FontPreviewDialog

**Files:**
- Modify: `src/components/font-preview-dialog.tsx:36-71`

- [ ] **Step 1: Restructure DialogContent layout**

Read the current file to understand exact line numbers, then make the following changes:

**Change 1:** Modify `DialogContent` className from:
```tsx
className="max-w-4xl w-[90vw] min-w-125 max-h-[90vh] overflow-auto"
```
to:
```tsx
className="max-w-4xl w-[90vw] min-w-125 max-h-[90vh] flex flex-col"
```

**Change 2:** Modify the ASCII preview container from:
```tsx
<div className="relative flex justify-center cursor-pointer min-h-32">
  <pre className="ascii-text text-accent text-sm leading-tight overflow-auto whitespace-pre font-mono text-center">
```
to:
```tsx
<div className="relative flex-1 flex justify-center cursor-pointer min-h-32 overflow-auto">
  <pre className="ascii-text text-accent text-sm leading-tight whitespace-pre font-mono text-center">
```

**Change 3:** Modify the copy button container from:
```tsx
<div className="flex justify-end">
```
to:
```tsx
<div className="flex-shrink-0 flex justify-end">
```

**Change 4:** Wrap DialogHeader in a flex-shrink-0 div:
```tsx
<div className="flex-shrink-0">
  <Dialog.DialogHeader>
    ...
  </Dialog.DialogHeader>
</div>
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm test -- src/components/font-preview-dialog.test.tsx --run`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/font-preview-dialog.tsx
git commit -m "feat: fix scroll isolation in FontPreviewDialog

- use flex layout with flex-1 preview area that scrolls independently
- keep header and footer fixed with flex-shrink-0
- DialogContent no longer has overflow-auto, preview container does
- only preview area scrolls when ASCII text is long"
```

---

## Task 3: Manual Verification

**Files:** None (manual testing)

- [ ] **Step 1: Start dev server**

Run: `cd /Users/nmsn/Studio/figlet-online && pnpm dev`

- [ ] **Step 2: Test scroll behavior in browser**

1. Open http://localhost:3000
2. Enter a short text like "Hi" - dialog should fit without scroll
3. Enter a very long text (100+ chars) - only preview area should scroll
4. Verify header (title + description) stays fixed at top
5. Verify footer (copy button) stays fixed at bottom
6. Verify ESC still closes the dialog

- [ ] **Step 3: Commit verification**

```bash
git commit --allow-empty -m "chore: verified scroll behavior manually"
```

---

## Verification Checklist

- [ ] Long text: only ASCII preview area shows scrollbar
- [ ] Header (title + description): always visible, doesn't scroll
- [ ] Footer (copy button): always visible, doesn't scroll
- [ ] Normal text: no scrollbar, dialog fits naturally
- [ ] Horizontal overflow: ASCII art with long lines scrolls horizontally
- [ ] ESC key: still closes dialog properly

---

## Self-Review Checklist

**Spec coverage:**
- [x] "长文本时只有 ASCII 预览区显示滚动条" → Task 1 test + Task 2 implementation
- [x] "Header 始终可见" → Task 1 test `keeps header and footer fixed`
- [x] "Footer 始终可见" → Task 1 test `keeps header and footer fixed`
- [x] "ESC 关闭" → existing test + manual verification

**Placeholder scan:** No TBD/TODO in plan. All code is complete.

**Type consistency:** All method names (`FontPreviewDialog`, `open`, `font`, `text`, `onClose`) match existing codebase patterns.
