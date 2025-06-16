// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import './styles/App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import Profile from './pages/Profile'
import MainMap from './pages/MainMap'
import CourtInfo from './pages/CourtInfo';
import GoogleCallback from './pages/GoogleCallback';
import { AuthProvider, useAuth } from './context/AuthContext'
import { FriendRequestProvider } from './context/FriendRequestContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import EventDetailsPage from './pages/EventDetailsPage'
import SearchPlayersPage from './pages/SearchPlayersPage'
import YourEvents from './pages/YourEvents'
import AddCourtPage from './pages/AddCourtPage'
import { ProtectedRoute, PublicRoute } from './components/auth/RouteGuards'
import LoadingSpinner from './components/utils/LoadingSpinner'
import NotFound from './pages/NotFound'
import AboutPage from './pages/AboutPage'
import WhatsNewPage from './pages/WhatsNewPage'
import ResetPasswordPage from './components/auth/ResetPasswordPage'
import ChangelogModal from './components/utils/ChangelogModal'
import { useChangelog } from './hooks/useChangelog'

export default function App() {
  return (
    <AuthProvider>
      <FriendRequestProvider>
        <Router>
          <AppRoutes />
        </Router>
      </FriendRequestProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { loading } = useAuth();
  const [forceRender, setForceRender] = useState(false);
  const { showChangelog, closeChangelog } = useChangelog();
  
  // Timeout di sicurezza per prevenire spinner infinito
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.warn("Timeout di sicurezza attivato nell'AppRoutes - Forzando il rendering");
        setForceRender(true);
      }, 6000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);
  
  if (loading && !forceRender) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <ToastContainer position="top-center" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <ChangelogModal isOpen={showChangelog} onClose={closeChangelog} />
      <Routes>
        {/* Rotte protette (richiedono autenticazione) */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />        
        <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />        
        <Route path="/map" element={<ProtectedRoute><MainMap /></ProtectedRoute>} />          <Route path="/court/:id" element={<ProtectedRoute><CourtInfo /></ProtectedRoute>} />
        <Route path="/add-court" element={<ProtectedRoute><AddCourtPage /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><YourEvents /></ProtectedRoute>} />
        <Route path="/players" element={<ProtectedRoute><SearchPlayersPage /></ProtectedRoute>} />        <Route path="/whats-new" element={<ProtectedRoute><WhatsNewPage /></ProtectedRoute>} />
        <Route path="/event/:id" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
        <Route path="/about" element={<AboutPage />} />        {/* Rotte pubbliche (reindirizzano se autenticati) */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />        
        <Route path="/google-callback" element={<GoogleCallback />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        {/* Pagina 404 per rotte sconosciute */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}