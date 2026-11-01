import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StaffDashboard from '../../pages/staff/StaffDashboard';
import type { StaffDashboardData } from '../../types';

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

const { mockFetchApi } = vi.hoisted(() => ({ mockFetchApi: vi.fn() }));
vi.mock('../../lib/api', () => ({
  fetchApi: mockFetchApi,
}));

describe('StaffDashboard Component (Lab 04 - Issue 5 / UI-04)', () => {
  const sampleDashboardData: StaffDashboardData = {
    metrics: {
      unassignedCount: 14,
      openCount: 23,
      inProgressCount: 18,
      waitingForRequesterCount: 7,
      assignedToMeCount: 16,
      totalActiveTickets: 62,
    },
    priorityBreakdown: {
      URGENT: 4,
      HIGH: 12,
      MEDIUM: 31,
      LOW: 15,
    },
    recentTickets: [
      {
        id: 14,
        number: 'TKT-2026-00014',
        title: 'Laptop battery drains quickly',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        itPriority: 'URGENT',
        ticketOwner: { id: 2, name: 'Michael IT' },
        requester: { id: 10, name: 'Alice' },
        updatedAt: '2026-05-12T09:14:00.000Z',
      },
      {
        id: 15,
        number: 'TKT-2026-00015',
        title: 'VPN cannot connect from remote',
        status: 'OPEN',
        priority: 'MEDIUM',
        itPriority: 'MEDIUM',
        ticketOwner: null,
        requester: { id: 11, name: 'Bob' },
        updatedAt: '2026-05-12T10:00:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders greeting, 5 operational metric cards, priority breakdown, and recent tickets', async () => {
    mockFetchApi.mockResolvedValue(sampleDashboardData);

    render(
      <MemoryRouter initialEntries={['/staff/dashboard']}>
        <Routes>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify Greeting
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Michael IT!/i)).toBeInTheDocument();
    });

    // Verify 5 metric cards and authoritative values
    const unassignedCard = screen.getByTestId('metric-card-unassigned');
    expect(unassignedCard).toHaveTextContent('14');
    expect(unassignedCard).toHaveTextContent('Unassigned');

    const openCard = screen.getByTestId('metric-card-open');
    expect(openCard).toHaveTextContent('23');
    expect(openCard).toHaveTextContent('Open');

    const inProgressCard = screen.getByTestId('metric-card-in-progress');
    expect(inProgressCard).toHaveTextContent('18');
    expect(inProgressCard).toHaveTextContent('In Progress');

    const waitingCard = screen.getByTestId('metric-card-waiting');
    expect(waitingCard).toHaveTextContent('7');
    expect(waitingCard).toHaveTextContent('Waiting on User');

    const assignedToMeCard = screen.getByTestId('metric-card-assigned-to-me');
    expect(assignedToMeCard).toHaveTextContent('16');
    expect(assignedToMeCard).toHaveTextContent('My Assigned');

    // Verify drill-down links
    expect(screen.getByTestId('drilldown-unassigned')).toHaveAttribute('href', '/staff/tickets?assigned=unassigned');
    expect(screen.getByTestId('drilldown-open')).toHaveAttribute('href', '/staff/tickets?status=OPEN');
    expect(screen.getByTestId('drilldown-in-progress')).toHaveAttribute('href', '/staff/tickets?status=IN_PROGRESS');
    expect(screen.getByTestId('drilldown-waiting')).toHaveAttribute('href', '/staff/tickets?status=WAITING_FOR_REQUESTER');
    expect(screen.getByTestId('drilldown-assigned-to-me')).toHaveAttribute('href', '/staff/tickets?assigned=me');

    // Verify recent tickets table
    expect(screen.getByText('Laptop battery drains quickly')).toBeInTheDocument();
    expect(screen.getByText('VPN cannot connect from remote')).toBeInTheDocument();
    expect(screen.getAllByText('Unassigned').length).toBeGreaterThanOrEqual(2);

    // Verify Priority breakdown
    expect(screen.getByText('Active Priority Breakdown')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // URGENT
  });

  it('refresh button triggers dashboard re-fetch', async () => {
    mockFetchApi.mockResolvedValue(sampleDashboardData);

    render(
      <MemoryRouter initialEntries={['/staff/dashboard']}>
        <Routes>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('refresh-dashboard-btn')).toBeInTheDocument();
    });

    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    const refreshBtn = screen.getByTestId('refresh-dashboard-btn');
    await userEvent.click(refreshBtn);

    expect(mockFetchApi).toHaveBeenCalledTimes(2);
  });

  it('renders graceful empty state card when 0 recent tickets exist (BR-13)', async () => {
    mockFetchApi.mockResolvedValue({
      metrics: {
        unassignedCount: 0,
        openCount: 0,
        inProgressCount: 0,
        waitingForRequesterCount: 0,
        assignedToMeCount: 0,
        totalActiveTickets: 0,
      },
      priorityBreakdown: { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      recentTickets: [],
    });

    render(
      <MemoryRouter initialEntries={['/staff/dashboard']}>
        <Routes>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('staff-recent-tickets-empty')).toBeInTheDocument();
    });

    expect(screen.getByText('No tickets found matching your queue.')).toBeInTheDocument();
  });
});
