import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

interface Category {
  id: number;
  name: string;
}

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSystem();
  }, []);

  const checkSystem = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('System Status: Offline (load failed)');
      }
      const data = await response.json();
      setCategories(data.categories || []);
      setSystemStatus('online');
    } catch {
      setSystemStatus('offline');
      setError('System Status: Offline (load failed)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div
        className="card shadow-sm border p-4 bg-white"
        style={{ maxWidth: '450px', width: '100%', borderRadius: '12px' }}
      >
        <div className="text-center mb-4">
          <h1 className="h4 fw-bold mb-1 text-dark">TokTickIT IT Service Desk</h1>
          <p className="text-muted small mb-0">Internal Service Desk Portal for IT Support Requests</p>
        </div>

        <button
          type="button"
          className="btn btn-primary w-100 py-2 fw-medium mb-3 shadow-none"
          onClick={checkSystem}
          disabled={loading}
          style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd', borderRadius: '6px' }}
        >
          {loading ? 'Checking...' : 'Check System'}
        </button>

        {loading && (
          <div className="text-center py-2 text-muted small" role="status">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading categories...
          </div>
        )}

        {!loading && systemStatus === 'offline' && (
          <div>
            <div
              className="alert alert-danger py-2 mb-3 text-center border-0"
              role="alert"
              style={{ backgroundColor: '#f8d7da', color: '#842029', borderRadius: '6px' }}
            >
              <div className="fw-bold small mb-0">System Error</div>
              <div className="small">{error}</div>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-2 text-start small">
              <span className="fw-semibold text-dark">System Status:</span>
              <span className="badge bg-danger px-3 py-1 fw-normal" style={{ borderRadius: '4px' }}>Offline</span>
            </div>
          </div>
        )}

        {!loading && systemStatus === 'online' && (
          <div>
            <div className="d-flex justify-content-between align-items-center py-2 text-start small">
              <span className="fw-semibold text-dark">System Status:</span>
              <span className="badge bg-success px-3 py-1 fw-normal" style={{ borderRadius: '4px' }}>Online</span>
            </div>

            <div className="text-center text-muted small my-2" style={{ fontSize: '0.8rem' }}>
              Service: TokTickIT API
            </div>

            <div className="mt-4 text-center">
              <h6 className="fw-bold mb-3 text-dark small">Supported Request Categories</h6>
              <div className="border rounded-2 overflow-hidden text-start" aria-label="Category list">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className={`d-flex justify-content-between align-items-center py-2 px-3 small ${
                      idx !== categories.length - 1 ? 'border-bottom' : ''
                    }`}
                  >
                    <span className="text-secondary fw-normal">{cat.name}</span>
                    <span
                      className="badge bg-dark rounded-pill px-2 py-1"
                      style={{ fontSize: '0.7rem', minWidth: '24px' }}
                    >
                      {String(cat.id).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
