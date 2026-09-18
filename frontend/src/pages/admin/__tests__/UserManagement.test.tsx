import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserManagement from '../UserManagement';
import { BrowserRouter } from 'react-router-dom';

// Mock the AuthContext
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'ADMINISTRATOR', name: 'Admin', email: 'admin@test.com' },
  })
}));

// Mock the API fetch
const { mockFetchApi } = vi.hoisted(() => ({ mockFetchApi: vi.fn() }));
vi.mock('../../../lib/api', () => ({
  fetchApi: mockFetchApi,
}));

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchApi.mockResolvedValue({
      data: [
        { id: 2, name: 'John Doe', email: 'john@test.com', role: 'REQUESTER', isActive: true }
      ],
      total: 1,
      totalPages: 1
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>
    );
  };

  it('renders the user table and fetches initial data', async () => {
    renderComponent();
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockFetchApi).toHaveBeenCalledWith('/users?page=1&limit=10');
    });

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
  });

  it('triggers search when typing in the search input', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockFetchApi).toHaveBeenCalledTimes(1);
    });

    const searchInput = screen.getByPlaceholderText(/search name or email/i);
    
    // Type in search box
    await user.type(searchInput, 'Jane');
    
    // Check if fetch was called with search param
    // There is a 300ms debounce (setTimeout in useEffect), so we use waitFor
    await waitFor(() => {
      // The exact call might be index 1 or later depending on how many letters were typed
      const calls = mockFetchApi.mock.calls;
      const hasSearchCall = calls.some(call => call[0].includes('search=Jane'));
      expect(hasSearchCall).toBe(true);
    }, { timeout: 1000 });
  });

  it('filters by role when role select changes', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockFetchApi).toHaveBeenCalledTimes(1);
    });

    const roleSelect = screen.getByRole('combobox');
    
    await user.selectOptions(roleSelect, 'IT_STAFF');
    
    await waitFor(() => {
      const calls = mockFetchApi.mock.calls;
      const hasRoleCall = calls.some(call => call[0].includes('role=IT_STAFF'));
      expect(hasRoleCall).toBe(true);
    });
  });
});
