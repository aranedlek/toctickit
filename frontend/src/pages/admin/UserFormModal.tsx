import { useState, useEffect } from 'react';
import type { User } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  user: User | null;
  currentAdminId?: number;
}

export default function UserFormModal({ isOpen, onClose, onSave, user, currentAdminId }: UserFormModalProps) {
  const isEditing = !!user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('REQUESTER');
  const [isActive, setIsActive] = useState(true);
  const [initialPassword, setInitialPassword] = useState('');
  const [setNewPassword, setSetNewPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setIsActive(user.isActive);
        setInitialPassword('');
        setSetNewPassword(false);
      } else {
        setName('');
        setEmail('');
        setRole('REQUESTER');
        setIsActive(true);
        setInitialPassword('');
        setSetNewPassword(true);
      }
      setError('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (setNewPassword && !initialPassword) {
      setError('Initial password is required');
      return;
    }

    if (isEditing && user.id === currentAdminId && !isActive) {
      setError('You cannot deactivate your own account.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload: any = { name, email, role, isActive };
      if (setNewPassword && initialPassword) {
        payload.initialPassword = initialPassword;
      }
      
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px',
        padding: '32px', boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Full Name</label>
            <input 
              type="text" required value={name} onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d0d0d0', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Email Address</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d0d0d0', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Role</label>
              <select 
                value={role} onChange={e => setRole(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d0d0d0', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="REQUESTER">Requester</option>
                <option value="IT_STAFF">IT Staff</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Status</label>
              <div style={{ display: 'flex', alignItems: 'center', height: '42px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={e => setIsActive(e.target.checked)}
                    disabled={isEditing && user?.id === currentAdminId}
                    style={{ width: '18px', height: '18px', accentColor: '#2e7d32', cursor: (isEditing && user?.id === currentAdminId) ? 'not-allowed' : 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>Account Active</span>
                </label>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', marginTop: '8px', border: '1px solid #eaeaea' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: setNewPassword ? '12px' : 0 }}>
              <input 
                type="checkbox" 
                checked={setNewPassword} 
                onChange={e => setSetNewPassword(e.target.checked)}
                disabled={!isEditing} // Must always set password for new users
                style={{ width: '16px', height: '16px', accentColor: '#2e7d32' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
                {isEditing ? 'Set new initial password' : 'Set initial password (Required)'}
              </span>
            </label>
            
            {setNewPassword && (
              <div>
                <input 
                  type="text" 
                  value={initialPassword} 
                  onChange={e => setInitialPassword(e.target.value)}
                  placeholder="TempPassword123!"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d0d0d0', fontSize: '14px', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                  The user will be required to change this password on their next login.
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#333', border: '1px solid #d0d0d0', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
