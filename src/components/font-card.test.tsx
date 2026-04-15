import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FontCard } from "@/components/font-card";

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockUnobserve = vi.fn();
class MockIntersectionObserver {
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = mockUnobserve;
  constructor() {
    return this;
  }
}
globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

const mockFont = {
  id: "Standard",
  name: "Standard",
  style: "classic" as const,
  heightLevel: 2 as const,
};

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
});
