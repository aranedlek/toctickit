import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      login(data.user);
      
      if (data.user.requiresPasswordChange) {
        navigate('/change-password');
      } else if (data.user.role === 'REQUESTER') {
        navigate('/my-tickets');
      } else {
        navigate('/staff/tickets');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        border: '1px solid #eaeaea'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', backgroundColor: '#2e7d32', borderRadius: '12px',
            color: 'white', fontWeight: 800, fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.5px',
            margin: '0 auto 16px auto'
          }}>
            TT
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111', margin: '0 0 8px 0' }}>Sign in to your account</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Welcome back to TokTickIT</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#2e7d32'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {error && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '12px', fontSize: '15px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '8px', opacity: isLoading ? 0.7 : 1, transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#1b5e20')}
            onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#2e7d32')}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
