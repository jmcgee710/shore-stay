import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import RenterHub from './features/renter/RenterHub';
import { GuestProvider } from './features/renter/GuestContext';
import Dashboard from './features/homeowner/Dashboard';
import CreatePropertyPage from './features/homeowner/CreatePropertyPage';
import PropertyDetail from './features/homeowner/PropertyDetail';
import WatcherAcceptPage from './features/watcher/WatcherAcceptPage';
import TeamDashboard from './features/team/TeamDashboard';
import TeamPropertyView from './features/team/TeamPropertyView';
import HomePage from './features/listing/HomePage';
import SearchResultsPage from './features/listing/SearchResultsPage';
import PropertyPage from './features/listing/PropertyPage';
import TownshipPage from './features/listing/TownshipPage';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-sand p-6 text-ocean">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white/90 p-8 shadow-lg shadow-ocean/10">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <Link className="mt-6 inline-block rounded-full bg-ocean px-5 py-3 text-white" to="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Side A — Public listing browser */}
      <Route path="/" element={<HomePage />} />
      <Route path="/browse" element={<SearchResultsPage />} />
      <Route path="/properties/:id" element={<PropertyPage />} />
      <Route path="/lbi/:town" element={<TownshipPage />} />

      {/* Auth */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'HOME_WATCHER' || user.role === 'PROPERTY_MANAGER' ? '/team' : '/homeowner'} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/homeowner" replace /> : <RegisterPage />} />

      {/* Homeowner */}
      <Route path="/homeowner" element={<ProtectedRoute roles={['HOMEOWNER']}><Dashboard /></ProtectedRoute>} />
      <Route path="/homeowner/properties/new" element={<ProtectedRoute roles={['HOMEOWNER']}><CreatePropertyPage /></ProtectedRoute>} />
      <Route path="/homeowner/properties/:id" element={<ProtectedRoute roles={['HOMEOWNER']}><PropertyDetail /></ProtectedRoute>} />

      {/* Unified team dashboard — watchers + property managers */}
      <Route path="/team" element={<ProtectedRoute roles={['HOME_WATCHER', 'PROPERTY_MANAGER']}><TeamDashboard /></ProtectedRoute>} />
      <Route path="/team/properties/:id" element={<ProtectedRoute roles={['HOME_WATCHER', 'PROPERTY_MANAGER']}><TeamPropertyView /></ProtectedRoute>} />
      {/* Legacy watcher routes kept for invite accept flow */}
      <Route path="/watcher/accept/:inviteToken" element={<WatcherAcceptPage />} />
      <Route path="/watcher" element={<Navigate to="/team" replace />} />
      <Route path="/manager" element={<Navigate to="/team" replace />} />

      {/* Renter — public via QR / share link */}
      <Route path="/stay/:token" element={<GuestProvider><RenterHub /></GuestProvider>} />

      <Route path="*" element={<Placeholder title="Page Not Found" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
