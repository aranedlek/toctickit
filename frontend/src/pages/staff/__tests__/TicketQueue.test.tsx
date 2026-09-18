import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketQueue from '../TicketQueue';
import { BrowserRouter } from 'react-router-dom';

const { mockUser } = vi.hoisted(() => ({
  mockUser: { id: 1, role: 'IT_STAFF', name: 'Staff', email: 'staff@test.com' }
}));

// Mock the AuthContext
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  })
}));

// Mock the API fetch
const { mockFetchApi } = vi.hoisted(() => ({ mockFetchApi: vi.fn() }));
vi.mock('../../../lib/api', () => ({
  fetchApi: mockFetchApi,
}));

describe('TicketQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchApi.mockResolvedValue({
      data: [
        { 
          id: 1, 
          title: 'Test Ticket 1', 
          requester: { name: 'Requester' }, 
          priority: 'MEDIUM', 
          itPriority: 'MEDIUM', 
          status: 'OPEN', 
          createdAt: new Date().toISOString() 
        },
        { 
          id: 2, 
          title: 'Test Ticket 2', 
          requester: { name: 'Requester' }, 
          priority: 'HIGH', 
          itPriority: 'HIGH', 
          status: 'IN_PROGRESS', 
          createdAt: new Date().toISOString() 
        }
      ],
      total: 20,
      totalPages: 2,
      limit: 15,
      page: 1
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <TicketQueue />
      </BrowserRouter>
    );
  };

  it('renders ticket queue and fetches data', async () => {
    renderComponent();
    
    expect(screen.getByText('IT Staff Ticket Queue')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockFetchApi).toHaveBeenCalledWith('/tickets?page=1&limit=15');
    });

    expect(await screen.findByText('Test Ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument();
  });

  it('emits correct API params when search and filters change', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(mockFetchApi).toHaveBeenCalledTimes(1);
    });

    const searchInput = screen.getByPlaceholderText(/search title/i);
    await user.type(searchInput, 'Server');

    // IT Priority select
    // Need to find by label text or just index them by position, but let's find by text label manually provided in component
    // We can just use getAllByRole('combobox') as there are 3: Assignment, Current Status, IT Priority
    const selects = screen.getAllByRole('combobox');
    const assignmentSelect = selects[0];
    const statusSelect = selects[1];
    const prioritySelect = selects[2];

    await user.selectOptions(statusSelect, 'OPEN');
    await user.selectOptions(prioritySelect, 'HIGH');
    await user.selectOptions(assignmentSelect, 'me');

    // Search is debounced by 300ms
    await waitFor(() => {
      const calls = mockFetchApi.mock.calls;
      const recentCallUrl = calls[calls.length - 1][0];
      expect(recentCallUrl).toContain('search=Server');
      expect(recentCallUrl).toContain('status=OPEN');
      expect(recentCallUrl).toContain('itPriority=HIGH');
      expect(recentCallUrl).toContain('ownerId=1'); // id=1 from mock auth
    }, { timeout: 1000 });
  });

  it('emits correct API params on pagination', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await waitFor(() => {
      expect(mockFetchApi).toHaveBeenCalledTimes(1);
    });
    
    // Total pages = 2, so there should be a "Next" button or button "2"
    const nextButton = await screen.findByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    await waitFor(() => {
      const calls = mockFetchApi.mock.calls;
      const recentCallUrl = calls[calls.length - 1][0];
      expect(recentCallUrl).toContain('page=2');
    }, { timeout: 1000 });
  });
});
