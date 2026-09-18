import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangePassword from '../ChangePassword';
import { BrowserRouter } from 'react-router-dom';

// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'REQUESTER', requiresPasswordChange: false },
    refreshUser: vi.fn(),
  })
}));

// Mock the API fetch
const { mockFetchApi } = vi.hoisted(() => ({ mockFetchApi: vi.fn() }));
vi.mock('../../lib/api', () => ({
  fetchApi: mockFetchApi,
}));

describe('ChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );
  };

  it('renders the change password form', () => {
    renderComponent();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save password/i })).toBeInTheDocument();
  });

  it('shows error if new passwords do not match', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/current password/i), 'OldPass123!');
    await user.type(screen.getByLabelText(/^new password$/i), 'NewPass123!');
    await user.type(screen.getByLabelText(/confirm new password/i), 'DiffPass123!');
    
    await user.click(screen.getByRole('button', { name: /save password/i }));

    expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it('shows error if new password is too short', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/current password/i), 'OldPass123!');
    await user.type(screen.getByLabelText(/^new password$/i), 'Shrt1!');
    await user.type(screen.getByLabelText(/confirm new password/i), 'Shrt1!');
    
    const submitButton = screen.getByRole('button', { name: /save password/i });
    expect(submitButton).toBeDisabled();
    
    // We can't click a disabled button in userEvent, so just test it's disabled.
    expect(screen.queryByText('Password does not meet all requirements')).not.toBeInTheDocument(); // Because we can't submit
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it('calls API if all rules met and passwords match', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    mockFetchApi.mockResolvedValueOnce({});

    await user.type(screen.getByLabelText(/current password/i), 'OldPass123!');
    await user.type(screen.getByLabelText(/^new password$/i), 'ValidPass123!');
    await user.type(screen.getByLabelText(/confirm new password/i), 'ValidPass123!');
    
    await user.click(screen.getByRole('button', { name: /save password/i }));

    expect(mockFetchApi).toHaveBeenCalledWith('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: 'OldPass123!', newPassword: 'ValidPass123!' })
    });
  });
});
