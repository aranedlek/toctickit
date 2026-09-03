import { useEffect, useState } from 'react';
import './index.css';
import { getStoredRequester, clearRequester, avatarColor, initials } from './utils';
import RequesterSelector from './pages/RequesterSelector';
import MyTickets from './pages/MyTickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import type { Requester } from './types';

type Route =
  | { name: 'select' }
  | { name: 'my-tickets' }
  | { name: 'new-ticket' }
  | { name: 'ticket-detail'; id: number };

export default function App() {
  const [requester, setRequester] = useState<Requester | null>(getStoredRequester());
  const [route, setRoute] = useState<Route>(
    requester ? { name: 'my-tickets' } : { name: 'select' }
  );

  // Sync route when requester changes
  useEffect(() => {
    if (!requester) setRoute({ name: 'select' });
    else if (route.name === 'select') setRoute({ name: 'my-tickets' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requester]);

  function handleSelectRequester(r: Requester) {
    setRequester(r);
    setRoute({ name: 'my-tickets' });
  }

  function handleSignOut() {
    clearRequester();
    setRequester(null);
    setRoute({ name: 'select' });
  }

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar" role="banner">
        <span className="navbar-brand">🎫 TokTickIT</span>
        {requester && (
          <div className="navbar-right">
            <div
              className="avatar"
              style={{ background: avatarColor(requester.name), width: 32, height: 32, fontSize: 12 }}
              aria-hidden="true"
            >
              {initials(requester.name)}
            </div>
            <span className="navbar-user">{requester.name}</span>
            <button
              id="sign-out-btn"
              className="btn btn-secondary btn-sm"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              Switch User
            </button>
          </div>
        )}
      </nav>

      {/* ── Pages ── */}
      <main>
        {route.name === 'select' && (
          <RequesterSelector onSelect={handleSelectRequester} />
        )}

        {route.name === 'my-tickets' && requester && (
          <MyTickets
            requesterId={requester.id}
            onNewTicket={() => setRoute({ name: 'new-ticket' })}
            onViewTicket={(id) => setRoute({ name: 'ticket-detail', id })}
          />
        )}

        {route.name === 'new-ticket' && requester && (
          <CreateTicket
            requesterId={requester.id}
            onSuccess={(id) => setRoute({ name: 'ticket-detail', id })}
            onBack={() => setRoute({ name: 'my-tickets' })}
          />
        )}

        {route.name === 'ticket-detail' && (
          <TicketDetail
            ticketId={(route as { name: 'ticket-detail'; id: number }).id}
            onBack={() => setRoute({ name: 'my-tickets' })}
          />
        )}
      </main>
    </>
  );
}
