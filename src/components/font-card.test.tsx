import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FontCard } from "@/components/font-card";
import figlet from "figlet";

// Mock IntersectionObserver
const mockIntersectionCallback = {
  current: null as ((entries: any) => void) | null,
};
class MockIntersectionObserver {
  constructor(callback: (entries: any) => void) {
    mockIntersectionCallback.current = callback;
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

const mockFont = {
  id: "Standard",
  name: "Standard",
  style: "classic" as const,
  heightLevel: 2 as const,
};

// Mock figlet.text
vi.spyOn(figlet, "text").mockImplementation((_text, _options, callback) => {
  // Simulate empty output for Chinese characters (unsupported chars)
  // Use setTimeout to simulate async behavior of figlet
  setTimeout(() => {
    if (_text === "你好") {
      callback(null, "");
    } else {
      callback(null, "ASCII output");
    }
  }, 0);
  return "";
});

describe("FontCard auto-load", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Click to load' in idle state", () => {
    render(<FontCard font={mockFont} text="Hi" />);
    expect(screen.getByText("Click to load")).toBeInTheDocument();
  });

  it("renders without ASCII content in idle state", () => {
    const { container } = render(<FontCard font={mockFont} text="Hi" />);
    const preElements = container.querySelectorAll("pre");
    expect(preElements.length).toBe(0);
  });

  it("shows font name", () => {
    render(<FontCard font={mockFont} text="Hi" />);
    expect(screen.getByText("Standard")).toBeInTheDocument();
  });

  it("does NOT show 'dblclick to copy' hint in idle state", () => {
    render(<FontCard font={mockFont} text="Hi" />);
    expect(screen.queryByText("dblclick to copy")).not.toBeInTheDocument();
  });

  it("accepts text prop and shows it in rendered state", async () => {
    // First we need to trigger render - we'll test the initial state here
    render(<FontCard font={mockFont} text="Hello" />);
    // The idle state should not render ASCII
    expect(screen.queryByRole("pre")).not.toBeInTheDocument();
  });

  it("resets to idle when text prop changes", async () => {
    const { rerender } = render(<FontCard font={mockFont} text="Hello" />);

    // Trigger visible (IntersectionObserver callback receives array of entries)
    await act(async () => {
      mockIntersectionCallback.current?.([{ isIntersecting: true }] as any);
    });

    // Wait for the rendered state to be reached
    await new Promise((r) => setTimeout(r, 50));

    // Now the state should be "rendered" (figlet processed)
    // Change text prop - should reset to idle
    rerender(<FontCard font={mockFont} text="World" />);

    // Should show "Click to load" again (state reset to idle)
    expect(screen.getByText("Click to load")).toBeInTheDocument();
  });

  it('shows "此字体不支持该字符" when font does not support the text', async () => {
    render(<FontCard font={mockFont} text="你好" />);

    // Trigger visible (IntersectionObserver callback receives array of entries)
    await act(async () => {
      mockIntersectionCallback.current?.([{ isIntersecting: true }] as any);
    });

    await waitFor(() => {
      expect(screen.getByText("此字体不支持该字符")).toBeInTheDocument();
    });
  });
});
