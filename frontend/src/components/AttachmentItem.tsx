import type { Attachment } from '../types';

interface AttachmentItemProps {
  attachment: Attachment;
  onRemove?: (id: number) => void;
  isRemoving?: boolean;
}

export default function AttachmentItem({ attachment, onRemove, isRemoving }: AttachmentItemProps) {
  const isDeleted = attachment.deletedAt !== null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      marginBottom: '8px',
      backgroundColor: isDeleted ? 'var(--color-surface)' : 'var(--color-card)',
      opacity: isDeleted ? 0.6 : 1,
      textDecoration: isDeleted ? 'line-through' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        <span style={{ fontSize: '16px' }}>📄</span>
        <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {attachment.filename} ({(attachment.sizeBytes / 1024 / 1024).toFixed(2)} MB)
        </span>
      </div>
      
      {isDeleted ? (
        <span style={{ fontSize: '12px', color: 'var(--color-text-disabled)' }} title="Removed">Removed</span>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Mock download since it's just local files, could map to backend /uploads */}
          <button 
            type="button"
            onClick={() => window.open(`http://localhost:3000/uploads/${attachment.filename}`, '_blank')}
            style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
          >
            Download
          </button>
          
          {onRemove && (
            <button 
              type="button"
              onClick={() => onRemove(attachment.id)}
              disabled={isRemoving}
              style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: 'var(--color-error)' }}
            >
              {isRemoving ? '...' : 'Remove'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
