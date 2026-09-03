import { useEffect, useState } from 'react';
import { api } from '../api';
import { formatDateTime, formatBytes } from '../utils';
import type { TicketDetail, TicketStatus, Priority } from '../types';

function statusClass(s: TicketStatus) {
  return s === 'OPEN' ? 'badge-open'
    : s === 'IN_PROGRESS' ? 'badge-in-progress'
    : s === 'RESOLVED' ? 'badge-resolved'
    : 'badge-closed';
}
function priorityClass(p: Priority) {
  return p === 'LOW' ? 'badge-low'
    : p === 'MEDIUM' ? 'badge-medium'
    : p === 'HIGH' ? 'badge-high'
    : 'badge-urgent';
}

interface Props {
  ticketId: number;
  onBack: () => void;
}

export default function TicketDetailPage({ ticketId, onBack }: Props) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTicket(ticketId)
      .then(setTicket)
      .catch(() => setError('Ticket not found or could not be loaded.'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (loading) {
    return (
      <div className="page" style={{ maxWidth: 720 }}>
        <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 24 }} />
        <div className="card card-body">
          {[80, 120, 60, 60].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, marginBottom: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="page" style={{ maxWidth: 720 }}>
        <button className="btn btn-secondary btn-sm mb-4" onClick={onBack}>← Back</button>
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">{error ?? 'Something went wrong'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          id="back-to-tickets-btn"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          aria-label="Back to My Tickets"
        >
          ← My Tickets
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {/* Ticket Title + badges */}
          <div style={{ marginBottom: 20 }}>
            <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <span className="ticket-card-id">#{ticket.id}</span>
              <span className={`badge ${statusClass(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`badge ${priorityClass(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <h2
              id="ticket-title"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {ticket.title}
            </h2>
          </div>

          {/* Description */}
          <div className="detail-section">
            <p className="detail-section-title">Description</p>
            <p
              id="ticket-description"
              style={{
                fontSize: 14,
                color: 'var(--color-text-primary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {ticket.description}
            </p>
          </div>

          {/* Details */}
          <div className="detail-section">
            <p className="detail-section-title">Details</p>
            <div>
              <div className="detail-field">
                <span className="detail-field-label">Category</span>
                <span className="detail-field-value">{ticket.category.name}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Related System</span>
                <span className="detail-field-value">
                  {ticket.relatedSystem ? ticket.relatedSystem.name : '—'}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Created</span>
                <span className="detail-field-value">{formatDateTime(ticket.createdAt)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Last Updated</span>
                <span className="detail-field-value">{formatDateTime(ticket.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="detail-section" style={{ marginBottom: 0 }}>
            <p className="detail-section-title">
              Attachments ({ticket.attachments.length})
            </p>
            {ticket.attachments.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-disabled)' }}>
                No attachments
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ticket.attachments.map((att) => (
                  <div key={att.id} className="attachment-item" id={`attachment-${att.id}`}>
                    <span style={{ fontSize: 18 }}>
                      {att.mimeType === 'application/pdf' ? '📄' : '🖼️'}
                    </span>
                    <span className="attachment-item-name">{att.filename}</span>
                    <span className="attachment-item-size">{formatBytes(att.sizeBytes)}</span>
                    <a
                      href={`/api/attachments/${att.id}/download`}
                      className="btn btn-secondary btn-sm"
                      download={att.filename}
                      aria-label={`Download ${att.filename}`}
                    >
                      ↓ Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
