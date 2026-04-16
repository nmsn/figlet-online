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
});