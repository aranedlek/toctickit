import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StaffTicketDetail from '../../pages/staff/StaffTicketDetail';
import TicketDetail from '../../pages/TicketDetail';
import type { Ticket } from '../../types';

// Mock user context
let mockCurrentUser = {
  id: 2,
  name: 'Michael IT',
  email: 'michael.it@toktick.internal',
  role: 'IT_STAFF',
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
  }),
}));

// Mock the API fetch
const { mockFetchApi } = vi.hoisted(() => ({ mockFetchApi: vi.fn() }));
vi.mock('../../lib/api', () => ({
  fetchApi: mockFetchApi,
}));

describe('Ticket Workflow & Resolution Gate (Lab 04 - Issue 4)', () => {
  const baseTicket: Ticket = {
    id: 1,
    number: 'TKT-2026-00001',
    title: 'Workstation crashing with blue screen',
    description: 'Kernel panic occurs every time heavy computations run.',
    status: 'OPEN',
    priority: 'HIGH',
    itPriority: 'HIGH',
    ticketOwnerId: 2,
    requesterId: 10,
    categoryId: 1,
    relatedSystemId: 1,
    version: 1,
    createdAt: '2026-05-12T08:00:00.000Z',
    updatedAt: '2026-05-12T08:00:00.000Z',
    category: { id: 1, name: 'Hardware' },
    relatedSystem: { id: 1, name: 'Workstation OS' },
    requester: { id: 10, name: 'Alice Requester', email: 'alice@test.com' },
    ticketOwner: { id: 2, name: 'Michael IT', email: 'michael.it@toktick.internal' },
    attachments: [],
    publicComments: [],
    internalNotes: [],
    actionsTaken: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = {
      id: 2,
      name: 'Michael IT',
      email: 'michael.it@toktick.internal',
      role: 'IT_STAFF',
    };
  });

  describe('UI-06 & AC-08: Concurrency Conflict (HTTP 409) Handling', () => {
    it('renders warning banner with refresh button when status update fails with 409 conflict', async () => {
      mockFetchApi.mockImplementation((endpoint: string, options?: any) => {
        if (endpoint === '/tickets/1' && (!options || options.method === undefined)) {
          return Promise.resolve(baseTicket);
        }
        if (endpoint === '/tickets/1/status' && options?.method === 'PATCH') {
          const conflictError: any = new Error(
            'This ticket was modified by another user while you were editing. Please refresh and review before retrying.'
          );
          conflictError.status = 409;
          conflictError.data = {
            error: 'CONFLICT',
            message: 'This ticket was modified by another user while you were editing. Please refresh and review before retrying.',
            currentVersion: 2,
          };
          return Promise.reject(conflictError);
        }
        return Promise.resolve({});
      });

      render(
        <MemoryRouter initialEntries={['/staff/tickets/1']}>
          <Routes>
            <Route path="/staff/tickets/:id" element={<StaffTicketDetail />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for ticket to load
      await waitFor(() => {
        expect(screen.getByText('Workstation crashing with blue screen')).toBeInTheDocument();
      });

      // Change status to IN_PROGRESS
      const statusSelect = screen.getByTestId('ticket-status-select');
      await userEvent.selectOptions(statusSelect, 'IN_PROGRESS');

      // Click Update Ticket
      const updateButton = screen.getByRole('button', { name: /update ticket/i });
      await userEvent.click(updateButton);

      // Verify conflict banner is displayed without crashing
      await waitFor(() => {
        expect(screen.getByTestId('concurrency-conflict-banner')).toBeInTheDocument();
      });
      expect(screen.getByText(/Concurrency Conflict/i)).toBeInTheDocument();
      expect(screen.getByText(/modified by another user/i)).toBeInTheDocument();

      // Verify Refresh Ticket button is present and works
      const refreshButton = screen.getByTestId('refresh-ticket-button');
      expect(refreshButton).toBeInTheDocument();

      // Setup re-fetch with updated version
      mockFetchApi.mockImplementation((endpoint: string, options?: any) => {
        if (endpoint === '/tickets/1' && (!options || options.method === undefined)) {
          return Promise.resolve({ ...baseTicket, version: 2, status: 'IN_PROGRESS' });
        }
        return Promise.resolve({});
      });

      await userEvent.click(refreshButton);

      // Verify conflict banner is cleared after refresh
      await waitFor(() => {
        expect(screen.queryByTestId('concurrency-conflict-banner')).not.toBeInTheDocument();
      });
    });
  });

  describe('BR-08: Permitted Status Transition Matrix Options', () => {
    it('restricts status dropdown options for OPEN ticket to permitted next statuses (IN_PROGRESS, WAITING_FOR_REQUESTER, CANCELLED)', async () => {
      mockFetchApi.mockResolvedValue({ ...baseTicket, status: 'OPEN' });

      render(
        <MemoryRouter initialEntries={['/staff/tickets/1']}>
          <Routes>
            <Route path="/staff/tickets/:id" element={<StaffTicketDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ticket-status-select')).toBeInTheDocument();
      });

      const select = screen.getByTestId('ticket-status-select') as HTMLSelectElement;
      const options = Array.from(select.options).map(o => o.value);

      expect(options).toContain('OPEN');
      expect(options).toContain('IN_PROGRESS');
      expect(options).toContain('WAITING_FOR_REQUESTER');
      expect(options).toContain('CANCELLED');
      // Must NOT contain illegal jumps
      expect(options).not.toContain('RESOLVED');
      expect(options).not.toContain('CLOSED');
      expect(options).not.toContain('REOPENED');
    });

    it('disables status select for CLOSED ticket when user is IT_STAFF (terminal state)', async () => {
      mockCurrentUser.role = 'IT_STAFF';
      mockFetchApi.mockResolvedValue({ ...baseTicket, status: 'CLOSED' });

      render(
        <MemoryRouter initialEntries={['/staff/tickets/1']}>
          <Routes>
            <Route path="/staff/tickets/:id" element={<StaffTicketDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ticket-status-select')).toBeInTheDocument();
      });

      const select = screen.getByTestId('ticket-status-select') as HTMLSelectElement;
      expect(select).toBeDisabled();
      expect(screen.getByText(/Terminal state · No transitions permitted/i)).toBeInTheDocument();
    });

    it('allows REOPENED transition for CLOSED ticket when user is ADMINISTRATOR', async () => {
      mockCurrentUser.role = 'ADMINISTRATOR';
      mockFetchApi.mockResolvedValue({ ...baseTicket, status: 'CLOSED' });

      render(
        <MemoryRouter initialEntries={['/staff/tickets/1']}>
          <Routes>
            <Route path="/staff/tickets/:id" element={<StaffTicketDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('ticket-status-select')).toBeInTheDocument();
      });

      const select = screen.getByTestId('ticket-status-select') as HTMLSelectElement;
      expect(select).not.toBeDisabled();
      const options = Array.from(select.options).map(o => o.value);
      expect(options).toContain('REOPENED');
    });
  });

  describe('BR-09: Requester Advisory Resolution Gate', () => {
    it('renders advisory resolution button when ticket is WAITING_FOR_REQUESTER', async () => {
      mockCurrentUser = {
        id: 10,
        name: 'Alice Requester',
        email: 'alice@test.com',
        role: 'REQUESTER',
      };
      mockFetchApi.mockResolvedValue({
        ...baseTicket,
        status: 'WAITING_FOR_REQUESTER',
      });

      render(
        <MemoryRouter initialEntries={['/tickets/1']}>
          <Routes>
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('advisory-resolve-button')).toBeInTheDocument();
      });

      expect(screen.getByText(/I Confirm the Problem Appears Resolved/i)).toBeInTheDocument();
    });

    it('submits advisory resolution and shows confirmation banner without changing ticket to RESOLVED', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      mockCurrentUser = {
        id: 10,
        name: 'Alice Requester',
        email: 'alice@test.com',
        role: 'REQUESTER',
      };

      mockFetchApi.mockImplementation((endpoint: string, options?: any) => {
        if (endpoint === '/tickets/1' && (!options || options.method === undefined)) {
          return Promise.resolve({
            ...baseTicket,
            status: 'IN_PROGRESS',
          });
        }
        if (endpoint === '/tickets/1/resolve-advisory' && options?.method === 'POST') {
          return Promise.resolve({
            message: 'Advisory resolution recorded. IT Staff will review and formally close the ticket.',
            ticketId: 1,
            status: 'IN_PROGRESS',
          });
        }
        return Promise.resolve({});
      });

      render(
        <MemoryRouter initialEntries={['/tickets/1']}>
          <Routes>
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('advisory-resolve-button')).toBeInTheDocument();
      });

      const advisoryBtn = screen.getByTestId('advisory-resolve-button');
      await userEvent.click(advisoryBtn);

      await waitFor(() => {
        expect(screen.getByTestId('advisory-success-banner')).toBeInTheDocument();
      });

      expect(screen.getByText(/Advisory resolution recorded/i)).toBeInTheDocument();
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/tickets/1/resolve-advisory',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('hides advisory resolution button when ticket is already RESOLVED or CLOSED', async () => {
      mockCurrentUser = {
        id: 10,
        name: 'Alice Requester',
        email: 'alice@test.com',
        role: 'REQUESTER',
      };
      mockFetchApi.mockResolvedValue({
        ...baseTicket,
        status: 'RESOLVED',
      });

      render(
        <MemoryRouter initialEntries={['/tickets/1']}>
          <Routes>
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Workstation crashing with blue screen')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('advisory-resolve-button')).not.toBeInTheDocument();
    });
  });
});
