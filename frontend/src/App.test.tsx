import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('Frontend UI Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('UI-01: Shows TokTickIT in the navbar', () => {
    // Keep fetch pending so page stays in loading state
    (fetch as any).mockImplementation(() => new Promise(() => {}));
    render(<App />);
    // The app brand appears as a link in the Navbar
    expect(screen.getByText('TokTickIT')).toBeInTheDocument();
  });

  it('UI-02: RequesterSelector shows skeleton while loading requesters', () => {
    (fetch as any).mockImplementation(() => new Promise(() => {}));
    render(<App />);
    // While fetch is pending, the skeleton div should be shown
    const skeleton = document.querySelector('.skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('UI-03: RequesterSelector shows error when API fails', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load requesters/i)).toBeInTheDocument();
    });
  });
});
