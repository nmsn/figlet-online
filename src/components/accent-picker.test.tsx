import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccentPicker } from './accent-picker';

describe('AccentPicker', () => {
  it('renders palette button', () => {
    render(<AccentPicker />);
    expect(screen.getByRole('button', { name: /choose accent color/i })).toBeInTheDocument();
  });

  it('shows color swatches when opened', async () => {
    render(<AccentPicker />);
    await userEvent.click(screen.getByRole('button', { name: /choose accent color/i }));
    const swatches = screen.getAllByRole('button');
    expect(swatches.length).toBe(7); // 1 toggle + 6 color swatches
  });

  it('closes dropdown when swatch is clicked', async () => {
    render(<AccentPicker />);
    await userEvent.click(screen.getByRole('button', { name: /choose accent color/i }));
    await userEvent.click(screen.getAllByRole('button')[1]); // Click first swatch
    // Dropdown should close - only toggle button remains
    expect(screen.getAllByRole('button').length).toBe(1);
  });
});