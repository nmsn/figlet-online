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
});