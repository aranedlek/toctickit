import type { Attachment } from '../types';

interface AttachmentItemProps {
  attachment: Attachment;
  onRemove?: (id: number) => void;
  isRemoving?: boolean;
  deleteReason?: string;
}

export default function AttachmentItem({ attachment, onRemove, isRemoving, deleteReason }: AttachmentItemProps) {
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
      backgroundColor: isDeleted ? '#fafafa' : '#fff',
      opacity: isDeleted ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        <span style={{ fontSize: '16px', opacity: isDeleted ? 0.5 : 1 }}>📄</span>
        <span style={{ 
          fontSize: '14px', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          textDecoration: isDeleted ? 'line-through' : 'none',
          color: isDeleted ? '#888' : '#333',
          fontWeight: 500
        }}>
          {attachment.filename} 
          <span style={{ color: '#888', fontWeight: 400, marginLeft: '4px' }}>
            ({(attachment.sizeBytes / 1024 / 1024).toFixed(2)} MB)
          </span>
        </span>
      </div>
      
      {isDeleted ? (
        <span style={{ fontSize: '12px', color: '#d32f2f', fontWeight: 500 }} title={`Reason: ${deleteReason || 'No reason provided'}`}>
          {deleteReason ? `Removed: ${deleteReason}` : 'Removed'}
        </span>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => window.open(`http://localhost:3000/uploads/${attachment.filename}`, '_blank')}
            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#fff', color: '#333', border: '1px solid #d0d0d0', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
          >
            Download
          </button>
          
          {onRemove && (
            <button 
              type="button"
              onClick={() => onRemove(attachment.id)}
              disabled={isRemoving}
              style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: isRemoving ? 'not-allowed' : 'pointer', fontWeight: 500 }}
            >
              {isRemoving ? '...' : 'Remove'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
