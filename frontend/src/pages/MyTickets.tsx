import { useEffect, useState } from 'react';
import { api } from '../api';
import { formatDate } from '../utils';
import type { TicketSummary, TicketStatus, Priority, TicketFilters } from '../types';

const STATUS_OPTIONS: { value: TicketStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

function statusClass(s: TicketStatus) {
  return s === 'OPEN' ? 'badge-open'
    : s === 'IN_PROGRESS' ? 'badge-in-progress'
    : s === 'RESOLVED' ? 'badge-resolved'
    : 'badge-closed';
}
function statusAccent(s: TicketStatus) {
  return s === 'OPEN' ? 'accent-open'
    : s === 'IN_PROGRESS' ? 'accent-in-progress'
    : s === 'RESOLVED' ? 'accent-resolved'
    : 'accent-closed';
}
function priorityClass(p: Priority) {
  return p === 'LOW' ? 'badge-low'
    : p === 'MEDIUM' ? 'badge-medium'
    : p === 'HIGH' ? 'badge-high'
    : 'badge-urgent';
}

interface Props {
  requesterId: number;
  onNewTicket: () => void;
  onViewTicket: (id: number) => void;
}

export default function MyTickets({ requesterId, onNewTicket, onViewTicket }: Props) {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TicketFilters>({
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 10,
  });

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    api
      .getTickets({ requesterId, ...filters })
      .then((res) => {
        setTickets(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, requesterId]);

  function setFilter<K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  return (
    <div className="page">
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">My Tickets</h1>
          <p className="text-muted text-sm">{total} ticket{total !== 1 ? 's' : ''} found</p>
        </div>
        <button id="new-ticket-btn" className="btn btn-primary" onClick={onNewTicket}>
          + New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          id="ticket-search"
          className="form-control"
          type="search"
          placeholder="🔍  Search by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search tickets"
        />
        <select
          id="filter-status"
          className="form-control"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value as TicketStatus | '')}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          id="filter-priority"
          className="form-control"
          value={filters.priority}
          onChange={(e) => setFilter('priority', e.target.value as Priority | '')}
          aria-label="Filter by priority"
        >
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          id="sort-by"
          className="form-control"
          value={`${filters.sortBy}-${filters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split('-') as ['createdAt' | 'priority', 'asc' | 'desc'];
            setFilters((f) => ({ ...f, sortBy, order, page: 1 }));
          }}
          aria-label="Sort tickets"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="priority-desc">Priority (High → Low)</option>
          <option value="priority-asc">Priority (Low → High)</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No tickets found</div>
          <div className="empty-state-desc">
            {filters.search || filters.status || filters.priority
              ? 'Try adjusting your filters'
              : 'Submit your first ticket to get started'}
          </div>
          {(filters.search || filters.status || filters.priority) && (
            <button
              className="btn btn-secondary btn-sm mt-2"
              onClick={() => {
                setSearchInput('');
                setFilters((f) => ({ ...f, search: '', status: '', priority: '', page: 1 }));
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tickets.map((t) => (
            <button
              key={t.id}
              id={`ticket-card-${t.id}`}
              className="ticket-card"
              onClick={() => onViewTicket(t.id)}
              style={{ background: 'none', textAlign: 'left' }}
              aria-label={`View ticket: ${t.title}`}
            >
              <div className={`ticket-card-accent ${statusAccent(t.status)}`} />
              <div className="ticket-card-body">
                <p className="ticket-card-title">{t.title}</p>
                <div className="ticket-card-meta">
                  <span className="ticket-card-id">#{t.id}</span>
                  <span className={`badge ${statusClass(t.status)}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                  <span className={`badge ${priorityClass(t.priority)}`}>{t.priority}</span>
                  <span className="badge" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
                    {t.category.name}
                  </span>
                  <span className="ticket-card-date">{formatDate(t.createdAt)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" role="navigation" aria-label="Ticket pages">
          <button
            className="page-btn"
            disabled={filters.page === 1}
            onClick={() => setFilter('page', (filters.page ?? 1) - 1)}
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${p === filters.page ? 'active' : ''}`}
              onClick={() => setFilter('page', p)}
              aria-current={p === filters.page ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={filters.page === totalPages}
            onClick={() => setFilter('page', (filters.page ?? 1) + 1)}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
