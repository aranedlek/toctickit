import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Ticket } from '../types';
import Badge from '../components/Badge';
import AttachmentItem from '../components/AttachmentItem';
import { fetchApi } from '../lib/api';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteReasons, setDeleteReasons] = useState<Record<number, string>>({});
  
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchApi(`/tickets/${id}`)
      .then(data => {
        setTicket(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Ticket not found');
        setLoading(false);
      });
  }, [id]);

  const handleRemoveAttachment = async (attachmentId: number) => {
    const reason = prompt('Please provide a reason for removing this attachment:');
    if (!reason) return;
    
    setDeletingId(attachmentId);
    try {
      await fetchApi(`/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
      
      setDeleteReasons(prev => ({ ...prev, [attachmentId]: reason }));
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

  const handleResolve = async () => {
    if (!confirm('Are you sure you want to mark this ticket as resolved?')) return;
    
    setResolving(true);
    try {
      const updated = await fetchApi(`/tickets/${id}/resolve`, { method: 'PATCH' });
      setTicket(prev => prev ? { ...prev, status: updated.status } : null);
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
    } finally {
      setResolving(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const comment = await fetchApi(`/tickets/${id}/public-comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText })
      });
      
      setTicket(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          publicComments: [...(prev.publicComments || []), comment]
        };
      });
      setCommentText('');
    } catch (err: any) {
      alert(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '500px' }} />;
  if (error) return <div className="card" style={{ color: 'var(--color-error)' }}>{error}</div>;
  if (!ticket) return null;

  const canResolve = ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={() => navigate('/my-tickets')} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
          ← Back to My Tickets
        </button>
        {canResolve && (
          <button 
            onClick={handleResolve} 
            disabled={resolving}
            style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', fontWeight: 600, opacity: resolving ? 0.7 : 1 }}
          >
            {resolving ? 'Resolving...' : '✓ Mark as Resolved'}
          </button>
        )}
      </div>

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
            Attachments ({ticket.attachments?.length || 0})
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
                  deleteReason={deleteReasons[att.id]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Communication Area */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>Activity</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {(!ticket.publicComments || ticket.publicComments.length === 0) ? (
            <div style={{ fontSize: '14px', color: 'var(--color-text-disabled)', textAlign: 'center', padding: '24px 0' }}>No activity yet.</div>
          ) : (
            ticket.publicComments.map(comment => (
              <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: comment.author?.role === 'REQUESTER' ? '#e8f5e9' : '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: comment.author?.role === 'REQUESTER' ? '#2e7d32' : '#1565c0', fontWeight: 600, fontSize: '12px' }}>
                  {comment.author?.name?.substring(0, 2).toUpperCase() || '??'}
                </div>
                <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '12px 16px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{comment.author?.name}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {comment.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Type a message to the IT team..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d0d0d0', minHeight: '80px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleAddComment} 
              disabled={submittingComment || !commentText.trim()}
              style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', fontWeight: 600, opacity: (submittingComment || !commentText.trim()) ? 0.7 : 1 }}
            >
              {submittingComment ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
