import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TextInput } from "@/components/text-input";

describe("TextInput debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onChange after 300ms debounce", async () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello" } });

    // onChange should NOT be called immediately
    expect(onChange).not.toHaveBeenCalledWith("Hello");

    // After 300ms, onChange should be called
    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledWith("Hello");
  });

  it("does not call onChange if user keeps typing within 300ms", async () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "H" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "He" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "Hel" } });

    // Should not have called onChange yet (debounce pending)
    expect(onChange).not.toHaveBeenCalled();

    // After 300ms from last keystroke, onChange should be called with final value
    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledWith("Hel");
  });

  it("renders with initial value", () => {
    const onChange = vi.fn();
    render(<TextInput value="Test" onChange={onChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("Test");
  });
});