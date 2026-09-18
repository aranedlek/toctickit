import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
