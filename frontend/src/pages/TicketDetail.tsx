import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Ticket } from '../types';
import Badge from '../components/Badge';
import AttachmentItem from '../components/AttachmentItem';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for tracking which attachment is being deleted
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/tickets/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Ticket not found');
        return res.json();
      })
      .then(data => {
        setTicket(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleRemoveAttachment = async (attachmentId: number) => {
    if (!confirm('Are you sure you want to remove this attachment?')) return;
    
    setDeletingId(attachmentId);
    try {
      const res = await fetch(`http://localhost:3000/api/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete attachment');
      
      // Update local state to reflect deletion
      setTicket(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          attachments: prev.attachments?.map(a => 
            a.id === attachmentId ? { ...a, deletedAt: new Date().toISOString() } : a
          )
        };
      });
    } catch (err) {
      alert('Error removing attachment');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '500px' }} />;
  if (error) return <div className="card" style={{ color: 'var(--color-error)' }}>{error}</div>;
  if (!ticket) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/my-tickets')} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
        ← Back to My Tickets
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Ticket #{ticket.id} · Created {new Date(ticket.createdAt).toLocaleString()}
            </div>
            <h1 style={{ margin: '0 0 16px 0' }}>{ticket.title}</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge type="priority" value={ticket.priority} />
              <Badge type="status" value={ticket.status} />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Category</div>
            <div>{ticket.category?.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>Related System</div>
            <div>{ticket.relatedSystem?.name || 'None'}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '24px', paddingTop: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Description</div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{ticket.description}</div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '24px', paddingTop: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px', fontWeight: 600 }}>
            Attachments ({ticket.attachments?.filter(a => !a.deletedAt).length || 0})
          </div>
          
          {(!ticket.attachments || ticket.attachments.length === 0) ? (
            <div style={{ fontSize: '14px', color: 'var(--color-text-disabled)' }}>No attachments found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ticket.attachments.map(att => (
                <AttachmentItem 
                  key={att.id} 
                  attachment={att} 
                  onRemove={handleRemoveAttachment}
                  isRemoving={deletingId === att.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
