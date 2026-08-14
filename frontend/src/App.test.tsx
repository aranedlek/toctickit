import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('Frontend UI Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('UI-01: TokTickIT heading renders', () => {
    (fetch as any).mockImplementation(() => new Promise(() => {})); // pending promise
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain('TokTickIT');
  });

  it('UI-02: Loading state changes to category list', async () => {
    const mockCategories = [
      { id: 1, name: 'Account and Access' },
      { id: 2, name: 'Hardware' },
      { id: 3, name: 'Software' },
      { id: 4, name: 'Network' },
    ];

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ categories: mockCategories }),
    });

    render(<App />);

    // Initially displays loading state
    expect(screen.getByText(/Loading categories.../i)).toBeInTheDocument();

    // Changes to category list after fetch finishes
    await waitFor(() => {
      expect(screen.getByText('Account and Access')).toBeInTheDocument();
      expect(screen.getByText('Hardware')).toBeInTheDocument();
      expect(screen.getByText('Software')).toBeInTheDocument();
      expect(screen.getByText('Network')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Loading categories.../i)).not.toBeInTheDocument();
  });

  it('UI-03: API failure displays a useful error message', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/System Status: Offline \(load failed\)/i)).toBeInTheDocument();
    });
  });
});
