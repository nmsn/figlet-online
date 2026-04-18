import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FontPreviewDialog } from "@/components/font-preview-dialog";
import * as DialogModule from "@/components/ui/dialog";

// Mock figlet with async callback to properly test loading state
vi.mock("figlet", () => ({
  default: {
    text: vi.fn((text, options, callback) => {
      // Delay callback to simulate async rendering
      setTimeout(() => {
        callback(null, `ASCII for ${options.font}`);
      }, 50);
    }),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
};
Object.assign(navigator, { clipboard: mockClipboard });

const mockFont = {
  id: "Standard",
  name: "Standard",
  style: "classic" as const,
  heightLevel: 2 as const,
};

describe("FontPreviewDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when open is false", () => {
    render(
      <FontPreviewDialog
        open={false}
        font={null}
        text="Hi"
        onClose={vi.fn()}
      />
    );
    // Dialog should not be visible
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog content when open is true", () => {
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text="Hi"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows font name in dialog title", () => {
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text="Hi"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Standard")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text="Hi"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders ASCII art after loading", async () => {
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text="Hi"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/ASCII for/)).toBeInTheDocument();
    });
  });

  it("calls onClose when ESC is pressed", async () => {
    const onClose = vi.fn();
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text="Hi"
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByRole("dialog"), {
      key: "Escape",
      keyCode: 27,
    });

    expect(onClose).toHaveBeenCalled();
  });

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
    // The preview container is the div wrapping the <pre> element (its parent)
    const previewContainer = dialog.querySelector('pre.ascii-text')?.parentElement;
    expect(previewContainer).toBeInTheDocument();

    // The preview container itself should be scrollable (overflow auto)
    // Check that it has overflow style that allows scrolling
    const styles = window.getComputedStyle(previewContainer!);
    expect(styles.overflow).toMatch(/(auto|scroll)/);

    // Verify scrollHeight > clientHeight to confirm it's actually scrollable
    expect(previewContainer!.scrollHeight).toBeGreaterThan(previewContainer!.clientHeight);
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
    // Footer is the button container div (not using Dialog.DialogFooter)
    const footer = dialog.querySelector('.flex.justify-end');

    // Header and footer should exist
    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();

    // Header and footer should NOT have overflow: auto styles
    const headerStyles = window.getComputedStyle(header!);
    const footerStyles = window.getComputedStyle(footer!);
    expect(headerStyles.overflow).not.toBe("auto");
    expect(footerStyles.overflow).not.toBe("auto");

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
    // The preview container is the div wrapping the <pre> element (its parent)
    const previewContainer = dialog.querySelector('pre.ascii-text')?.parentElement;

    // Dialog itself should NOT need to scroll (only the preview area scrolls)
    expect(dialog.scrollHeight).toBeLessThanOrEqual(dialog.clientHeight);
    // Preview area should be scrollable independently
    expect(previewContainer!.scrollHeight).toBeGreaterThan(previewContainer!.clientHeight);
  });

  it("normal text doesn't cause scroll", async () => {
    const shortText = "Hello";
    render(
      <FontPreviewDialog
        open={true}
        font={mockFont}
        text={shortText}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const dialog = screen.getByRole("dialog");
    // The preview container
    const previewContainer = dialog.querySelector('pre.ascii-text')?.parentElement;

    // Neither dialog nor preview container should need scrolling for short text
    expect(dialog.scrollHeight).toBeLessThanOrEqual(dialog.clientHeight);
    expect(previewContainer!.scrollHeight).toBeLessThanOrEqual(previewContainer!.clientHeight);
  });
});