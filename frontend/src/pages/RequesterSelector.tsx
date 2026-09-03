import { useEffect, useState } from 'react';
import { api } from '../api';
import { storeRequester, avatarColor, initials } from '../utils';
import type { Requester } from '../types';

interface Props {
  onSelect: (r: Requester) => void;
}

export default function RequesterSelector({ onSelect }: Props) {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getRequesters()
      .then(setRequesters)
      .catch(() => setError('Could not load requesters. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(r: Requester) {
    storeRequester(r);
    onSelect(r);
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>
        👋 Who are you today?
      </h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>
        Select your requester profile to continue
      </p>

      {loading && (
        <div className="requester-grid" aria-busy="true">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="requester-card" style={{ cursor: 'default' }}>
              <div className="skeleton avatar avatar-lg" />
              <div className="skeleton" style={{ height: 16, width: '70%' }} />
              <div className="skeleton" style={{ height: 12, width: '50%' }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--color-error)',
            marginTop: 40,
            fontSize: 14,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <div className="requester-grid">
          {requesters.map((r) => (
            <button
              key={r.id}
              id={`requester-card-${r.id}`}
              className="requester-card"
              style={{ background: 'none', border: '2px solid var(--color-border)' }}
              onClick={() => handleSelect(r)}
              aria-label={`Select ${r.name}`}
            >
              <div
                className="avatar avatar-lg"
                style={{ background: avatarColor(r.name) }}
                aria-hidden="true"
              >
                {initials(r.name)}
              </div>
              <p className="requester-name">{r.name}</p>
              <p className="requester-email">{r.email}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
