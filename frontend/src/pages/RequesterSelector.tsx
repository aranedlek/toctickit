import { useEffect, useState } from 'react';
import type { Requester } from '../types';

export default function RequesterSelector() {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/requesters')
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Main Card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#e53935',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          fontSize: '22px',
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-1px'
        }}>
          TT
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#2e7d32',
          margin: '0 0 4px 0'
        }}>
          TokTickIT Service Desk
        </h1>
        <p style={{
          fontSize: '13px',
          color: '#888',
          margin: '0 0 24px 0'
        }}>
          Lab 2 Testing Environment
        </p>

        {/* Info Box */}
        <div style={{
          backgroundColor: '#e8f5e9',
          border: '1px solid #a5d6a7',
          borderRadius: '8px',
          padding: '12px 16px',
          textAlign: 'left',
          marginBottom: '24px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '16px', marginTop: '1px' }}>ℹ️</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#2e7d32', marginBottom: '4px' }}>
              Development Requester Selection
            </div>
            <div style={{ fontSize: '12px', color: '#388e3c', lineHeight: '1.5' }}>
              Select a Development Requester to test requester-specific ticket behaviour. This is not a login screen. Authentication and role-based access will be introduced in Lab 3.
            </div>
          </div>
        </div>

        {/* Dropdown */}
        <div style={{ textAlign: 'left', marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#333',
            marginBottom: '6px'
          }}>
            Select Active Development Requester *
          </label>
          {loading ? (
            <div style={{ height: '40px', backgroundColor: '#f5f5f5', borderRadius: '8px' }} />
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
                color: selectedId ? '#111' : '#888',
                backgroundColor: '#fff',
                appearance: 'auto',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Choose a Development Requester --</option>
              {requesters.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedId}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: selectedId ? '#fff' : '#fff',
            color: selectedId ? '#2e7d32' : '#aaa',
            border: `1px solid ${selectedId ? '#2e7d32' : '#d0d0d0'}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: selectedId ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (selectedId) e.currentTarget.style.backgroundColor = '#e8f5e9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          Continue to Application →
        </button>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '32px',
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '16px 24px',
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>
          TokTickIT IT Service Desk
        </div>
        <div style={{
          height: '6px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: '70%',
            backgroundColor: '#a5d6a7',
            borderRadius: '4px'
          }} />
        </div>
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>Check System</div>
      </div>
    </div>
  );
}
