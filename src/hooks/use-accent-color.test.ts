import { renderHook, act } from '@testing-library/react';
import { useAccentColor } from './use-accent-color';

describe('useAccentColor', () => {
  it('returns default accent color', () => {
    const { result } = renderHook(() => useAccentColor());
    expect(result.current.accent).toBe('#00ff00');
  });

  it('updates accent color', () => {
    const { result } = renderHook(() => useAccentColor());
    act(() => result.current.setAccent('#3b82f6'));
    expect(result.current.accent).toBe('#3b82f6');
  });
});