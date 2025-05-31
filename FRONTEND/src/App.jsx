import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Profile from './pages/Profile'
import MainMap from './pages/MainMap'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  const { loading } = useAuth?.() || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-gray-700">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        {/* ToastContainer montato una sola volta, in alto al centro */}
        <ToastContainer position="top-center" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/map" element={<MainMap />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
