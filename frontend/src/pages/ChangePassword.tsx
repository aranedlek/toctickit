import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const rules = {
    length: newPassword.length >= 8,
    upperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword),
    numSpecial: /(?=.*[0-9])(?=.*[!@#$%^&*])/.test(newPassword),
  };

  const allRulesMet = rules.length && rules.upperLower && rules.numSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (!allRulesMet) {
      setError('Password does not meet all requirements');
      return;
    }

    setIsLoading(true);

    try {
      await fetchApi('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      await refreshUser(); // Update user object to reset requiresPasswordChange
      setSuccess('Password updated successfully! Redirecting...');
      
      setTimeout(() => {
        if (user?.role === 'REQUESTER') {
          navigate('/my-tickets');
        } else {
          navigate('/staff/tickets');
        }
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px', minHeight: '70vh' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        border: '1px solid #eaeaea'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111', margin: '0 0 8px 0' }}>Change Password</h1>
          {user?.requiresPasswordChange ? (
            <p style={{ color: '#d32f2f', fontSize: '14px', margin: 0, fontWeight: 500 }}>You must change your initial password to continue.</p>
          ) : (
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Create a new strong password for your account.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="currentPassword" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Current Password</label>
            <input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div>
            <label htmlFor="newPassword" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>New Password</label>
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Password Rules Checklist */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#555' }}>
            <div style={{ marginBottom: '8px', fontWeight: 600, color: '#333' }}>Password Requirements:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ color: rules.length ? '#2e7d32' : '#999' }}>{rules.length ? '✅' : '⚪'}</span>
              At least 8 characters
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ color: rules.upperLower ? '#2e7d32' : '#999' }}>{rules.upperLower ? '✅' : '⚪'}</span>
              Include upper and lower case letters
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: rules.numSpecial ? '#2e7d32' : '#999' }}>{rules.numSpecial ? '✅' : '⚪'}</span>
              Include a number and a special character
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !allRulesMet || !confirmPassword || success !== ''}
            style={{
              backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '12px', fontSize: '15px', fontWeight: 600, 
              cursor: (isLoading || !allRulesMet || !confirmPassword || success !== '') ? 'not-allowed' : 'pointer',
              marginTop: '8px', opacity: (isLoading || !allRulesMet || !confirmPassword || success !== '') ? 0.6 : 1, 
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? 'Saving...' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
