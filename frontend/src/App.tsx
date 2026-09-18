import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateTicket from './pages/CreateTicket';
import MyTickets from './pages/MyTickets';
import TicketDetail from './pages/TicketDetail';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import TicketQueue from './pages/staff/TicketQueue';
import StaffTicketDetail from './pages/staff/StaffTicketDetail';
import Settings from './pages/staff/Settings';
import UserManagement from './pages/admin/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Custom root redirect based on role
const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'REQUESTER') return <Navigate to="/my-tickets" replace />;
  if (user.role === 'IT_STAFF' || user.role === 'ADMINISTRATOR') return <Navigate to="/staff/tickets" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            
            <Route path="/login" element={<Login />} />
            
            {/* Must be logged in, handles its own requiresPasswordChange logic */}
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Requester Routes */}
            <Route element={<ProtectedRoute allowedRoles={['REQUESTER']} />}>
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="/tickets/new" element={<CreateTicket />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
            </Route>

            {/* IT Staff & Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['IT_STAFF', 'ADMINISTRATOR']} />}>
              <Route path="/staff/tickets" element={<TicketQueue />} />
              <Route path="/staff/tickets/:id" element={<StaffTicketDetail />} />
              <Route path="/staff/settings" element={<Settings />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']} />}>
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
