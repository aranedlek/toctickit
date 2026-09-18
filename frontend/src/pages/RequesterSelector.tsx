import { useEffect, useState } from 'react';
import type { Requester } from '../types';

export default function RequesterSelector() {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/requesters')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load requesters');
        return res.json();
      })
      .then((data) => {
        setRequesters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleContinue = () => {
    if (!selectedId) return;
    const requester = requesters.find((r) => r.id === parseInt(selectedId));
    if (!requester) return;
    localStorage.setItem('requester', JSON.stringify(requester));
    window.location.href = '/my-tickets';
  };

  const handleCancel = () => {
    setSelectedId('');
  };

  return (
    <div style={{ padding: '0 0 24px 0', fontFamily: "'Inter', sans-serif", width: '100%' }}>
      {/* Header section with Title and State View */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32', fontWeight: 600, fontSize: '14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Development Requester Selection</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
          <span style={{ color: '#888' }}>State View:</span>
          <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '16px', border: '1px solid #c8e6c9', cursor: 'pointer' }}>Active Users</span>
          <span style={{ backgroundColor: '#fff8e1', color: '#f57f17', padding: '4px 10px', borderRadius: '16px', border: '1px solid #ffecb3', cursor: 'pointer' }}>Loading State</span>
          <span style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '16px', border: '1px solid #ffcdd2', cursor: 'pointer' }}>Error State</span>
        </div>
      </div>

      {/* Main Card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
        border: '1px solid #eaeaea',
        padding: '40px',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
      }}>
        {/* Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#e8f5e9',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          color: '#2e7d32'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#111',
          margin: '0 0 8px 0',
          textAlign: 'center'
        }}>
          Select Development Requester
        </h1>
        <p style={{
          fontSize: '13px',
          color: '#666',
          margin: '0 0 32px 0',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          Choose a development requester to simulate the current requester context for Lab 2. This is for testing only and is not a login screen.
        </p>

        {/* Dropdown Section */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#333',
            marginBottom: '8px'
          }}>
            Development Requester <span style={{color: 'red'}}>*</span>
          </label>
          
          {loading ? (
            <div style={{ 
              height: '42px', 
              borderRadius: '8px', 
              border: '1px solid #eaeaea', 
              backgroundColor: '#fafafa',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '10px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
              </svg>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <span style={{ fontSize: '13px', color: '#666' }}>Loading active development requesters from PostgreSQL...</span>
            </div>
          ) : error ? (
            <div style={{ color: 'red', fontSize: '13px' }}>{error}</div>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d0d0d0',
                borderRadius: '8px',
                fontSize: '14px',
                color: selectedId ? '#111' : '#666',
                backgroundColor: '#fff',
                appearance: 'auto',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>-- Choose a Development Requester --</option>
              {requesters.map((r) => (
                <option key={r.id} value={r.id}>{r.name} - HR ({r.email})</option>
              ))}
            </select>
          )}
        </div>

        {/* Alerts */}
        <div style={{
          backgroundColor: '#e8f5e9',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 500 }}>
            Only active development requesters are shown.
          </span>
        </div>

        <div style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div style={{marginTop: '2px', color: '#666'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
              Authentication coming in Lab 3
            </div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
              In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 20px',
              backgroundColor: '#fff',
              color: '#333',
              border: '1px solid #e0e0e0',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedId}
            style={{
              padding: '8px 24px',
              backgroundColor: selectedId ? '#2e7d32' : '#a5d6a7',
              color: '#fff',
              border: 'none',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: selectedId ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>→</span> Continue
          </button>
        </div>
      </div>
    </div>
  );
}
