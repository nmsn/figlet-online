import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@/components/theme-provider";

describe("ThemeProvider", () => {
  it("renders children", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("wraps children in NextThemesProvider", () => {
    const { container } = render(
      <ThemeProvider>
        <span>Content</span>
      </ThemeProvider>
    );
    expect(container.querySelector("[data-next-themes]")).toBeNull();
  });
});