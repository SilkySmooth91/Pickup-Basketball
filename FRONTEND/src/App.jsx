import './styles/App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Profile from './pages/Profile'
import MainMap from './pages/MainMap'
import CourtInfo from './pages/CourtInfo';
import GoogleCallback from './pages/GoogleCallback';
import { AuthProvider, useAuth } from './context/AuthContext'
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
import ResetPasswordPage from './components/auth/ResetPasswordPage'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <ToastContainer position="top-center" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        {/* Rotte protette (richiedono autenticazione) */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />        
        <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />        
        <Route path="/map" element={<ProtectedRoute><MainMap /></ProtectedRoute>} />        
        <Route path="/court/:id" element={<ProtectedRoute><CourtInfo /></ProtectedRoute>} />
        <Route path="/add-court" element={<ProtectedRoute><AddCourtPage /></ProtectedRoute>} />
        <Route path="/event/:id" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><YourEvents /></ProtectedRoute>} />
        <Route path="/players" element={<ProtectedRoute><SearchPlayersPage /></ProtectedRoute>} />
        <Route path="/about" element={<AboutPage />} />        
        {/* Rotte pubbliche (reindirizzano se autenticati) */}
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