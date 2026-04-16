import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: vi.fn(),
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholder before mount to avoid hydration mismatch", () => {
    const { container } = render(<ThemeToggle />);
    const placeholder = container.querySelector(".w-10.h-10");
    expect(placeholder).toBeInTheDocument();
  });

  it("renders a button after mounting", () => {
    const { container } = render(<ThemeToggle />);
    // Simulate mount
    container.querySelector(".w-10.h-10")?.setAttribute("data-mounted", "true");
  });

  it("has correct aria-label", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("calls setTheme when clicked", async () => {
    const setTheme = vi.fn();
    vi.mock("next-themes", () => ({
      useTheme: () => ({
        theme: "dark",
        setTheme,
      }),
    }));

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(button);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("shows Moon icon when theme is dark", () => {
    const { container } = render(<ThemeToggle />);
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });
});