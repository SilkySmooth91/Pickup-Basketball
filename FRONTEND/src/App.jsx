import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProfilePageComp from './components/ProfilePageComp'
import { AuthProvider, useAuth } from './context/AuthContext'

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePageComp />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
