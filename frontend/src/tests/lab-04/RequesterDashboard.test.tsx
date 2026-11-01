import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequesterDashboard from '../../pages/RequesterDashboard';
import type { RequesterDashboardData } from '../../types';

let mockCurrentUser = {
  id: 10,
  name: 'Alice Requester',
  email: 'alice@test.com',
  role: 'REQUESTER',
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

describe('RequesterDashboard Component (Lab 04 - Issue 5 / UI-05)', () => {
  const sampleRequesterData: RequesterDashboardData = {
    metrics: {
      myOpenTicketsCount: 3,
      inProgressCount: 2,
      waitingForRequesterCount: 1,
      resolvedCount: 5,
      closedCount: 12,
    },
    recentTickets: [
      {
        id: 24,
        number: 'TKT-2026-00024',
        title: 'Monitor flickering at 144Hz',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        updatedAt: '2026-05-12T09:14:00.000Z',
      },
      {
        id: 25,
        number: 'TKT-2026-00025',
        title: 'Need Slack workspace access',
        status: 'WAITING_FOR_REQUESTER',
        priority: 'MEDIUM',
        updatedAt: '2026-05-12T11:20:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders greeting, personalized metric cards, and recent requests', async () => {
    mockFetchApi.mockResolvedValue(sampleRequesterData);

    render(
      <MemoryRouter initialEntries={['/requester/dashboard']}>
        <Routes>
          <Route path="/requester/dashboard" element={<RequesterDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify Greeting
    await waitFor(() => {
      expect(screen.getByText(/Welcome, Alice Requester!/i)).toBeInTheDocument();
    });

    // Verify 4 metric cards
    const myOpenCard = screen.getByTestId('metric-card-my-open');
    expect(myOpenCard).toHaveTextContent('3');
    expect(myOpenCard).toHaveTextContent('My Open Requests');

    const inProgressCard = screen.getByTestId('metric-card-in-progress');
    expect(inProgressCard).toHaveTextContent('2');
    expect(inProgressCard).toHaveTextContent('In Progress');

    const waitingCard = screen.getByTestId('metric-card-waiting-on-me');
    expect(waitingCard).toHaveTextContent('1');
    expect(waitingCard).toHaveTextContent('Waiting on Me');

    const resolvedCard = screen.getByTestId('metric-card-resolved');
    expect(resolvedCard).toHaveTextContent('5');
    expect(resolvedCard).toHaveTextContent('Recently Resolved');

    // Verify drill-down links
    expect(screen.getByTestId('drilldown-my-open')).toHaveAttribute('href', '/my-tickets');
    expect(screen.getByTestId('drilldown-in-progress')).toHaveAttribute('href', '/my-tickets?status=IN_PROGRESS');
    expect(screen.getByTestId('drilldown-waiting-on-me')).toHaveAttribute('href', '/my-tickets?status=WAITING_FOR_REQUESTER');
    expect(screen.getByTestId('drilldown-resolved')).toHaveAttribute('href', '/my-tickets?status=RESOLVED');

    // Verify recent tickets
    expect(screen.getByText('Monitor flickering at 144Hz')).toBeInTheDocument();
    expect(screen.getByText('Need Slack workspace access')).toBeInTheDocument();

    // Verify quick action shortcuts
    expect(screen.getByRole('link', { name: /Submit a New Request/i })).toHaveAttribute('href', '/tickets/new');
  });

  it('refresh button triggers dashboard re-fetch', async () => {
    mockFetchApi.mockResolvedValue(sampleRequesterData);

    render(
      <MemoryRouter initialEntries={['/requester/dashboard']}>
        <Routes>
          <Route path="/requester/dashboard" element={<RequesterDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('refresh-requester-dashboard-btn')).toBeInTheDocument();
    });

    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    const refreshBtn = screen.getByTestId('refresh-requester-dashboard-btn');
    await userEvent.click(refreshBtn);

    expect(mockFetchApi).toHaveBeenCalledTimes(2);
  });

  it('renders graceful empty state card when 0 requests submitted (BR-13)', async () => {
    mockFetchApi.mockResolvedValue({
      metrics: {
        myOpenTicketsCount: 0,
        inProgressCount: 0,
        waitingForRequesterCount: 0,
        resolvedCount: 0,
        closedCount: 0,
      },
      recentTickets: [],
    });

    render(
      <MemoryRouter initialEntries={['/requester/dashboard']}>
        <Routes>
          <Route path="/requester/dashboard" element={<RequesterDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('requester-recent-tickets-empty')).toBeInTheDocument();
    });

    expect(screen.getByText(/You haven't submitted any support requests yet/i)).toBeInTheDocument();
  });
});
